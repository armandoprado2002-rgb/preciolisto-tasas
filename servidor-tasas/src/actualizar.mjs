// PrecioListo — Servidor de tasas: consulta a El Toque y publica los archivos.
// Lo ejecuta GitHub Actions cada hora. El token viene SOLO de la variable de
// entorno ELTOQUE_TOKEN (un "secret" de GitHub); nunca se escribe en archivos ni en el registro.
//
// © 2026 PrecioListo. Todos los derechos reservados.

import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONFIG, estadoInicial, leerRespuestaElToque, registrarConsulta, procesarTasas,
  registrarFallo, construirTasa, actualizarHistorial, historialDias, tocaConsultar,
} from './logica.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATOS = process.env.DIR_DATOS || join(RAIZ, 'datos');
const PUBLICO = process.env.DIR_PUBLICO || join(RAIZ, 'publico');
const URL_ELTOQUE = process.env.ELTOQUE_URL || 'https://tasas.eltoque.com/v1/trmi';

async function leerJSON(ruta, porDefecto) {
  try {
    return JSON.parse(await readFile(ruta, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return porDefecto;
    // Archivo dañado: no lo sobrescribimos a ciegas, lo guardamos aparte.
    await rename(ruta, `${ruta}.danado-${Date.now()}`).catch(() => {});
    console.error(`Aviso: ${ruta} estaba dañado; se apartó y se empieza de nuevo.`);
    return porDefecto;
  }
}

// Escritura atómica: primero a un archivo temporal y luego se renombra,
// así un corte a mitad nunca deja un archivo a medias.
async function escribirJSON(ruta, datos) {
  await mkdir(dirname(ruta), { recursive: true });
  const tmp = `${ruta}.tmp`;
  await writeFile(tmp, JSON.stringify(datos, null, 0) + '\n');
  await rename(tmp, ruta);
}

async function consultarElToque(token) {
  let ultimoError;
  for (let intento = 1; intento <= 3; intento++) {
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), 20000);
    try {
      const r = await fetch(URL_ELTOQUE, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: control.signal,
      });
      if (!r.ok) throw new Error(`El Toque respondió con código ${r.status}.`);
      return await r.json();
    } catch (e) {
      // Nunca incluimos el token en el mensaje.
      ultimoError = new Error(e.name === 'AbortError' ? 'El Toque tardó demasiado.' : e.message);
      if (intento < 3) await new Promise((ok) => setTimeout(ok, 2000 * intento));
    } finally {
      clearTimeout(reloj);
    }
  }
  throw ultimoError;
}

export async function ejecutar({ token = process.env.ELTOQUE_TOKEN, ahora = new Date(), consultar = consultarElToque } = {}) {
  const rutaEstado = join(DATOS, 'estado.json');
  const rutaHist = join(DATOS, 'historial.json');
  let estado = await leerJSON(rutaEstado, estadoInicial());
  let historial = await leerJSON(rutaHist, []);
  let resultado;

  if (!tocaConsultar(estado, ahora, CONFIG, process.env.FORZAR === '1')) {
    console.log('Resultado: espera (la última consulta es reciente)');
    return { resultado: 'espera', estado, tasa: construirTasa(estado, ahora, CONFIG) };
  }

  if (!token) {
    estado = registrarFallo(estado, 'Falta el token de El Toque (ELTOQUE_TOKEN).', ahora);
    resultado = 'sin_token';
  } else {
    const permiso = registrarConsulta(estado, ahora, CONFIG);
    estado = permiso.estado;
    if (!permiso.permitido) {
      estado = registrarFallo(estado, 'Tope diario de consultas alcanzado.', ahora);
      resultado = 'tope_diario';
    } else {
      try {
        const nuevas = leerRespuestaElToque(await consultar(token), CONFIG);
        const r = procesarTasas(estado, nuevas, ahora, CONFIG);
        estado = r.estado;
        resultado = r.accion;
      } catch (e) {
        estado = registrarFallo(estado, e.message, ahora);
        resultado = 'error';
      }
    }
  }

  historial = actualizarHistorial(historial, estado, CONFIG);
  await escribirJSON(rutaEstado, estado);
  await escribirJSON(rutaHist, historial);

  // Archivos públicos (los "endpoints").
  const tasa = construirTasa(estado, ahora, CONFIG);
  if (tasa) await escribirJSON(join(PUBLICO, 'tasa.json'), tasa);
  for (const n of [7, 30, 365]) {
    await escribirJSON(join(PUBLICO, `historial-${n}.json`), historialDias(historial, n));
  }

  console.log(`Resultado: ${resultado}${estado.ultimo_error ? ` — ${estado.ultimo_error}` : ''}`);
  return { resultado, estado, tasa };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ejecutar().catch((e) => {
    console.error('Error inesperado:', e.message);
    process.exitCode = 1;
  });
}
