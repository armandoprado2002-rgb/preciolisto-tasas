# PrecioListo — Tasas de referencia

Tasas del mercado informal cubano (USD, EUR, MLC) usadas por PrecioListo.

**Fuente: [elTOQUE](https://eltoque.com).** Son valores de **referencia**, no la tasa oficial.

## Archivos

- `servidor-tasas/publico/tasa.json` — última tasa válida: `usd`, `eur`, `mlc`, `fuente`, `actualizado_en`, `desactualizada`.
- `servidor-tasas/publico/historial-7.json`, `historial-30.json`, `historial-365.json` — historial diario (hora de Cuba).

Se actualizan cada hora con GitHub Actions. Si una tasa cambia más de un 15 % de golpe,
no se publica hasta confirmarla en la consulta siguiente.

© 2026 PrecioListo. Todos los derechos reservados. Los datos de tasas pertenecen a elTOQUE
y se usan según sus [términos de la API](https://eltoque.com/api-tasas-de-eltoque-terminos-y-condiciones-de-uso).
