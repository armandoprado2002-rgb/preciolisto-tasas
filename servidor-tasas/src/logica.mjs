// PrecioListo — Servidor de tasas: lógica pura (sin red ni archivos).
// Todo lo que decide qué tasa se publica vive aquí para poder probarlo.
//
// © 2026 PrecioListo. Todos los derechos reservados.

/** Monedas que publicamos. En El Toque el euro se llama "ECU". */
export const MONEDAS = ['usd', 'eur', 'mlc'];
const CLAVE_ELTOQUE = { usd: 'USD', eur: 'ECU', mlc: 'MLC' };

/** Configuración por defecto (se puede cambiar con variables de entorno). */
export const CONFIG = {
  saltoMaximo: 0.15,          // >15 % de golpe => esperar confirmación
  toleranciaConfirmacion: 0.03, // la siguiente consulta debe estar a ±3 % del valor pendiente
  horasDesactualizada: 3,     // sin consulta buena en 3 h => "desactualizada"
  minimoValido: 1,            // límites de cordura para descartar basura
  maximoValido: 100000,
  maxConsultasDia: 60,        // tope diario de llamadas a El Toque
  diasHistorial: 400,
};

export const AVISO = 'Tasa de referencia del mercado informal. No es la tasa oficial.';

/** Fecha (AAAA-MM-DD) en hora de Cuba. */
export function fechaCuba(fecha) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Havana', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(fecha);
}

/** Estado vacío para el primer arranque. */
export function estadoInicial() {
  return {
    publicada: null,      // { usd, eur, mlc, actualizado_en }
    pendiente: null,      // { usd, eur, mlc, visto_en } esperando confirmación
    consultas: { dia: null, n: 0 },
    ultimo_error: null,
    ultimo_intento: null,
  };
}

/**
 * Convierte la respuesta de El Toque en { usd, eur, mlc } con números válidos.
 * Lanza un Error con mensaje en español si algo no cuadra.
 */
export function leerRespuestaElToque(json, config = CONFIG) {
  const tasas = json && typeof json === 'object' ? json.tasas : null;
  if (!tasas || typeof tasas !== 'object') {
    throw new Error('Respuesta de El Toque sin el campo "tasas".');
  }
  const salida = {};
  for (const m of MONEDAS) {
    const bruto = tasas[CLAVE_ELTOQUE[m]];
    const valor = typeof bruto === 'string' ? Number(bruto.replace(',', '.')) : bruto;
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      throw new Error(`Tasa ${m.toUpperCase()} ausente o no numérica.`);
    }
    if (valor < config.minimoValido || valor > config.maximoValido) {
      throw new Error(`Tasa ${m.toUpperCase()} fuera de rango (${valor}).`);
    }
    salida[m] = Math.round(valor * 100) / 100;
  }
  return salida;
}

function cambioRelativo(anterior, nuevo) {
  return Math.abs(nuevo - anterior) / anterior;
}

/** ¿Alguna moneda saltó más del máximo permitido? */
export function hayGranSalto(anterior, nuevas, config = CONFIG) {
  if (!anterior) return false;
  return MONEDAS.some((m) => cambioRelativo(anterior[m], nuevas[m]) > config.saltoMaximo);
}

function confirmaPendiente(pendiente, nuevas, config) {
  if (!pendiente) return false;
  return MONEDAS.every((m) => cambioRelativo(pendiente[m], nuevas[m]) <= config.toleranciaConfirmacion);
}

/** Cuenta una consulta y dice si todavía se puede consultar hoy. */
export function registrarConsulta(estado, ahora, config = CONFIG) {
  const hoy = fechaCuba(ahora);
  const consultas = estado.consultas?.dia === hoy ? { ...estado.consultas } : { dia: hoy, n: 0 };
  if (consultas.n >= config.maxConsultasDia) {
    return { permitido: false, estado: { ...estado, consultas } };
  }
  consultas.n += 1;
  return { permitido: true, estado: { ...estado, consultas } };
}

/**
 * Decide qué hacer con unas tasas recién leídas.
 * Devuelve { estado, accion } donde accion es 'publicada' | 'pendiente' | 'confirmada'.
 */
export function procesarTasas(estado, nuevas, ahora, config = CONFIG) {
  const iso = ahora.toISOString();
  const base = { ...estado, ultimo_error: null, ultimo_intento: iso };

  if (hayGranSalto(estado.publicada, nuevas, config)) {
    if (confirmaPendiente(estado.pendiente, nuevas, config)) {
      return {
        accion: 'confirmada',
        estado: { ...base, publicada: { ...nuevas, actualizado_en: iso }, pendiente: null },
      };
    }
    return {
      accion: 'pendiente',
      estado: { ...base, pendiente: { ...nuevas, visto_en: iso } },
    };
  }
  return {
    accion: 'publicada',
    estado: { ...base, publicada: { ...nuevas, actualizado_en: iso }, pendiente: null },
  };
}

/** Registra un fallo sin tocar la última tasa buena. */
export function registrarFallo(estado, mensaje, ahora) {
  return { ...estado, ultimo_error: mensaje, ultimo_intento: ahora.toISOString() };
}

/** Construye el JSON pequeño de /tasa. Nunca devuelve valores vacíos. */
export function construirTasa(estado, ahora, config = CONFIG) {
  const p = estado.publicada;
  if (!p) return null; // sin una primera tasa buena no se publica nada
  const horas = (ahora - new Date(p.actualizado_en)) / 3.6e6;
  return {
    usd: p.usd,
    eur: p.eur,
    mlc: p.mlc,
    fuente: 'elTOQUE (referencia)',
    actualizado_en: p.actualizado_en,
    desactualizada: horas > config.horasDesactualizada || Boolean(estado.pendiente),
    aviso: AVISO,
  };
}

/** Guarda en el historial el último valor publicado de cada día (hora de Cuba). */
export function actualizarHistorial(historial, estado, config = CONFIG) {
  const p = estado.publicada;
  if (!p) return historial;
  const dia = fechaCuba(new Date(p.actualizado_en));
  const resto = historial.filter((d) => d.fecha !== dia);
  const nuevo = [{ fecha: dia, usd: p.usd, eur: p.eur, mlc: p.mlc }, ...resto];
  nuevo.sort((a, b) => (a.fecha < b.fecha ? 1 : -1)); // más reciente primero
  return nuevo.slice(0, config.diasHistorial);
}

/** Recorta el historial a los últimos N días (equivale a /historial?dias=N). */
export function historialDias(historial, dias) {
  const n = Math.max(1, Math.min(365, Math.floor(Number(dias)) || 30));
  return { dias: n, aviso: AVISO, datos: historial.slice(0, n) };
}
