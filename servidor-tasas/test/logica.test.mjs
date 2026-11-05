import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  estadoInicial, leerRespuestaElToque, procesarTasas, construirTasa,
  registrarConsulta, actualizarHistorial, historialDias, fechaCuba, CONFIG,
} from '../src/logica.mjs';

const resp = (usd, ecu, mlc) => ({ tasas: { USD: usd, ECU: ecu, MLC: mlc, BTC: 1 } });
const t = (s) => new Date(s);

test('lee la respuesta de El Toque (ECU = euro)', () => {
  assert.deepEqual(leerRespuestaElToque(resp(455, 500, 280)), { usd: 455, eur: 500, mlc: 280 });
  assert.deepEqual(leerRespuestaElToque(resp('455,5', '500', 280)), { usd: 455.5, eur: 500, mlc: 280 });
});

test('rechaza respuestas vacías, raras o fuera de rango', () => {
  for (const malo of [null, {}, { tasas: null }, resp(null, 500, 280), resp(0, 500, 280),
    resp(-5, 500, 280), resp(455, 'abc', 280), resp(455, 500, 1e9), resp(NaN, 500, 280)]) {
    assert.throws(() => leerRespuestaElToque(malo));
  }
});

test('primera tasa se publica', () => {
  const r = procesarTasas(estadoInicial(), { usd: 455, eur: 500, mlc: 280 }, t('2026-11-02T14:00:00Z'));
  assert.equal(r.accion, 'publicada');
  assert.equal(r.estado.publicada.usd, 455);
});

test('cambio > 15 % espera confirmación y luego se publica', () => {
  let e = procesarTasas(estadoInicial(), { usd: 400, eur: 450, mlc: 250 }, t('2026-11-02T10:00:00Z')).estado;
  const r1 = procesarTasas(e, { usd: 480, eur: 450, mlc: 250 }, t('2026-11-02T11:00:00Z'));
  assert.equal(r1.accion, 'pendiente');
  assert.equal(r1.estado.publicada.usd, 400, 'sigue la tasa anterior');
  assert.equal(construirTasa(r1.estado, t('2026-11-02T11:00:00Z')).desactualizada, true);
  const r2 = procesarTasas(r1.estado, { usd: 482, eur: 451, mlc: 250 }, t('2026-11-02T12:00:00Z'));
  assert.equal(r2.accion, 'confirmada');
  assert.equal(r2.estado.publicada.usd, 482);
  assert.equal(r2.estado.pendiente, null);
});

test('un salto que no se repite nunca se publica', () => {
  let e = procesarTasas(estadoInicial(), { usd: 400, eur: 450, mlc: 250 }, t('2026-11-02T10:00:00Z')).estado;
  e = procesarTasas(e, { usd: 4000, eur: 450, mlc: 250 }, t('2026-11-02T11:00:00Z')).estado; // error de tecleo
  const r = procesarTasas(e, { usd: 405, eur: 452, mlc: 251 }, t('2026-11-02T12:00:00Z'));
  assert.equal(r.accion, 'publicada');
  assert.equal(r.estado.publicada.usd, 405);
  assert.equal(r.estado.pendiente, null);
});

test('cambio pequeño se publica directo (15 % justo no cuenta como salto)', () => {
  const e = procesarTasas(estadoInicial(), { usd: 400, eur: 400, mlc: 200 }, t('2026-11-02T10:00:00Z')).estado;
  assert.equal(procesarTasas(e, { usd: 460, eur: 400, mlc: 200 }, t('2026-11-02T11:00:00Z')).accion, 'publicada');
});

test('marca desactualizada después de 3 horas y nunca devuelve vacío', () => {
  assert.equal(construirTasa(estadoInicial(), new Date()), null);
  const e = procesarTasas(estadoInicial(), { usd: 455, eur: 500, mlc: 280 }, t('2026-11-02T10:00:00Z')).estado;
  assert.equal(construirTasa(e, t('2026-11-02T12:59:00Z')).desactualizada, false);
  const tarde = construirTasa(e, t('2026-11-02T13:01:00Z'));
  assert.equal(tarde.desactualizada, true);
  assert.equal(tarde.usd, 455);
  assert.match(tarde.aviso, /no es la tasa oficial/i);
});

test('tope diario de consultas se reinicia al día siguiente (hora de Cuba)', () => {
  let e = estadoInicial();
  for (let i = 0; i < CONFIG.maxConsultasDia; i++) {
    const r = registrarConsulta(e, t('2026-11-02T15:00:00Z'));
    assert.equal(r.permitido, true);
    e = r.estado;
  }
  assert.equal(registrarConsulta(e, t('2026-11-02T16:00:00Z')).permitido, false);
  assert.equal(registrarConsulta(e, t('2026-11-03T15:00:00Z')).permitido, true);
});

test('fecha en hora de Cuba (UTC-5/-4)', () => {
  assert.equal(fechaCuba(t('2026-11-03T03:00:00Z')), '2026-11-02');
});

test('historial guarda un valor por día, el más reciente primero, y recorta', () => {
  let h = [];
  let e = procesarTasas(estadoInicial(), { usd: 400, eur: 450, mlc: 250 }, t('2026-11-01T15:00:00Z')).estado;
  h = actualizarHistorial(h, e);
  e = procesarTasas(e, { usd: 410, eur: 450, mlc: 250 }, t('2026-11-02T15:00:00Z')).estado;
  h = actualizarHistorial(h, e);
  e = procesarTasas(e, { usd: 412, eur: 450, mlc: 250 }, t('2026-11-02T18:00:00Z')).estado;
  h = actualizarHistorial(h, e);
  assert.deepEqual(h.map((d) => [d.fecha, d.usd]), [['2026-11-02', 412], ['2026-11-01', 400]]);
  assert.equal(historialDias(h, 1).datos.length, 1);
  assert.equal(historialDias(h, 'basura').dias, 30);
  assert.equal(historialDias(h, 99999).dias, 365);
});

test('ejecución completa: escribe archivos, sobrevive a fallos y a datos dañados', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tasas-'));
  process.env.DIR_DATOS = join(dir, 'datos');
  process.env.DIR_PUBLICO = join(dir, 'publico');
  const { ejecutar } = await import('../src/actualizar.mjs');

  await ejecutar({ token: 'x', ahora: t('2026-11-02T14:00:00Z'), consultar: async () => resp(455, 500, 280) });
  let tasa = JSON.parse(await readFile(join(dir, 'publico', 'tasa.json'), 'utf8'));
  assert.equal(tasa.usd, 455);

  // El Toque falla: se sigue sirviendo la última buena, marcada como desactualizada luego.
  const r = await ejecutar({ token: 'x', ahora: t('2026-11-02T18:00:00Z'), consultar: async () => { throw new Error('caído'); } });
  assert.equal(r.resultado, 'error');
  tasa = JSON.parse(await readFile(join(dir, 'publico', 'tasa.json'), 'utf8'));
  assert.equal(tasa.usd, 455);
  assert.equal(tasa.desactualizada, true);

  // Sin token: no rompe nada.
  assert.equal((await ejecutar({ token: '', ahora: t('2026-11-02T19:00:00Z') })).resultado, 'sin_token');

  // Estado dañado: se aparta y se continúa.
  await mkdir(join(dir, 'datos'), { recursive: true });
  await writeFile(join(dir, 'datos', 'estado.json'), '{roto');
  const r2 = await ejecutar({ token: 'x', ahora: t('2026-11-02T20:00:00Z'), consultar: async () => resp(460, 505, 282) });
  assert.equal(r2.resultado, 'publicada');

  const h30 = JSON.parse(await readFile(join(dir, 'publico', 'historial-30.json'), 'utf8'));
  assert.equal(h30.datos[0].usd, 460);
});
