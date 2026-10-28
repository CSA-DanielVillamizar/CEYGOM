# FinOps: costos y límites

Objetivo: operar el sitio, la API y el almacenamiento de leads con costo cercano a cero, y que un exceso se detecte antes de convertirse en una factura. Última revisión: octubre de 2026. Los precios y cuotas cambian: verifica en las páginas oficiales antes de decidir.

## Costo recurrente actual

| Componente | Plan | Costo | Límite que importa |
|---|---|---|---|
| Azure Static Web Apps (sitio + función administrada) | Free | 0 | 100 GB de ancho de banda al mes, 250 MB por entorno, 15 000 archivos, 3 entornos de vista previa, sin SLA ([cuotas](https://learn.microsoft.com/azure/static-web-apps/quotas)) |
| Función `POST /api/quote` | Incluida en el plan Free | 0 | Solo HTTP, 45 s por ejecución, 30 MB por petición |
| Google Apps Script, Sheets y Drive (cuenta de la empresa) | Gratuito | 0 | 15 GB de Drive, 6 min por ejecución, cuota diaria de correo de la cuenta |
| GitHub (repositorio privado) | Plan actual de la cuenta | 0 | Minutos de Actions del plan; cada ejecución de CI usa cerca de 2 minutos |
| Dominio propio | Pendiente | Lo que cobre el registrador | Lo administra hoy un tercero (Drivemarketing); ver EP-04 |

No hay recursos facturables en Azure más allá del plan Free. El grupo `rg-ceygom-prd` está en la suscripción "Demos" y lleva las etiquetas `proyecto=ceygom-web` y `entorno=prd`.

## Presupuesto técnico (se verifica en el CI)

`npm run budget` falla el build si se supera cualquiera de estos topes:

| Medida | Hoy | Tope del CI | Límite del plan |
|---|---|---|---|
| Tamaño del sitio | 7,3 MB | 150 MB | 250 MB por entorno |
| Archivos | 169 | 10 000 | 15 000 |
| Archivo más grande | 0,38 MB | 15 MB | n/a |
| JavaScript de `/cotizador/` (gzip) | 93,5 KB | 200 KB | n/a |
| JavaScript del inicio y de las páginas de producto (gzip) | 1,8 KB | 15 KB | n/a |
| JavaScript de `/productos/` (gzip) | 4,1 KB | 20 KB | n/a |
| JavaScript de `/cotizacion/` (gzip) | 2,8 KB | 15 KB | n/a |
| Índice del buscador, solo al buscar (gzip) | 3,1 KB | 15 KB | n/a |

Cada pull request crea un entorno de vista previa con una copia completa del sitio; con 3 entornos más producción, el sitio completo no debería pasar de unos 40 MB en uso total.

## Decisiones que ahorran costo

- **Imágenes.** Las fotos de producto se guardan una sola vez como WebP optimizado (344 KB las 24) y Astro genera en el build los tamaños servidos, con caché inmutable de un año. Las originales PNG pesaban unos 6 MB.
- **Fichas técnicas.** 44 PDF (5,8 MB) servidos como archivos estáticos con caché de un día; no pasan por la función.
- **JavaScript.** Solo el cotizador usa React. Los datos pesados del catálogo (referencias, fotos) no entran en su paquete: el cotizador usa un índice ligero.
- **Webhook.** Un solo envío por solicitud y sin colas ni bases de datos: Sheets y Drive hacen de almacén.
- **Sin servicios adicionales.** No hay Application Insights, Key Vault, CDN ni base de datos. La observabilidad es el registro de la función.

## Riesgos de costo y cómo se controlan

| Riesgo | Control actual | Si ocurre |
|---|---|---|
| Abuso del endpoint (archivos de 5 MB repetidos) llena los 15 GB de Drive | `Origin` obligatorio, tope diario de archivos en el receptor (`MAX_RUT_PER_DAY`) | Activar Turnstile (HU-10); limpiar archivos de prueba |
| Tráfico por encima de 100 GB al mes | Sitio de 7 MB y caché; el plan Free **no** permite excedentes | Pasar a Standard (cobra excedentes y ofrece SLA) |
| Crecimiento del catálogo (fotos reales) | `npm run budget` en cada PR | Optimizar con `npm run catalog:import` (WebP a 800 px) |
| Cuota diaria de correo de la cuenta | Un aviso por cotización; se registra si se agota | Cambiar a una cuenta de Google Workspace |
| Vista previa por PR olvidada | Se eliminan al cerrar el PR (workflow `close_pull_request`) | Revisar los 3 entornos del plan |

## Cuándo reconsiderar el plan

Pasar a **Static Web Apps Standard** si se necesita SLA, más de 3 entornos de vista previa, más de 100 GB mensuales, otros disparadores además de HTTP (colas, temporizadores) o una Function App propia con identidad administrada. Es un cambio de plan en el portal, sin rehacer el sitio, con costo mensual fijo según la tarifa vigente.

## Buenas prácticas pendientes

- **Alerta de presupuesto** en la suscripción de Azure (un umbral bajo, por ejemplo unos pocos dólares) para detectar recursos creados por error. Requiere permisos de costos sobre la suscripción.
- **Etiquetas de costo** adicionales en el grupo de recursos (`propietario`, `centro-de-costo`) cuando la empresa los defina.
- **Revisión trimestral** de este documento y de la cuota de Drive.
