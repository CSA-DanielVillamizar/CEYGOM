# ADR-0016: Anexo técnico en la lista impresa y modo sin conexión

- **Estado:** Aceptada
- **Fecha:** 2026-10-28
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-01, EP-02, EP-05

## Contexto

Dos necesidades de quien compra o supervisa una obra: llevar a su área de compras o a la interventoría una lista con lo que dicen las fichas técnicas (no solo códigos y cantidades), y poder consultar el sitio donde la señal móvil es débil. Ambas tienen que funcionar en el plan Free de Azure Static Web Apps, sin servicios nuevos, sin código de terceros y sin inventar datos: las maquetas de "dossier de licitación" y "calculadora de campo" traían certificaciones, existencias y cálculos que la empresa no ha entregado.

## Alternativas consideradas

1. **Anexo generado en el navegador a partir de un índice estático y entregado como PDF por el diálogo de impresión; modo sin conexión con un service worker propio y pequeño.**
2. Librería de PDF en el cliente (por ejemplo `pdf-lib`): cientos de KB de JavaScript para un documento que el navegador ya sabe producir.
3. PDF generado en el servidor (función de Azure): costo de ejecución y datos de la lista enviados al servidor sin necesidad.
4. Aplicación instalable completa (manifiesto, iconos, sincronización en segundo plano): más superficie y mantenimiento de la necesaria.
5. Librería de service worker (Workbox): dependencia nueva para cuatro estrategias de caché.

## Decisión

- **Anexo técnico** (`packages/shared/annex.ts`): por cada producto de la lista, material, acabados, colores, código de ficha (FT-MYV-nn) con su enlace y, por cada referencia pedida, su descripción y medidas. Solo con lo que la ficha dice con certeza; lo demás se omite. El índice se genera en el build (`/productos/anexo-index.json`, 4 KB comprimido) y solo lo descarga "Mi cotización" cuando la lista tiene líneas. Se imprime con la lista (membrete de la empresa, sin precios ni datos personales); en pantalla queda oculto.
- **Modo sin conexión** (`public/sw.js`): páginas con red primero (espera 4 s y cae a la copia guardada y luego a `/sin-conexion/`), archivos con hash en `/_astro/` desde la caché, fichas PDF e índices con "caché mientras se actualiza". Nunca toca `POST /api/quote`, otros orígenes ni peticiones parciales, y no guarda redirecciones ni errores. Una constante de versión permite descartar todo en el siguiente despliegue.
- Aviso al perder la conexión (toast del script del sitio) y página `/sin-conexion/` (`noindex`, fuera del mapa del sitio).
- Presupuesto en el CI: índice del anexo de 15 KB comprimidos como máximo.

## Consecuencias

- Positivas: la lista se comparte con respaldo técnico, sin costo y sin librerías; lo visitado sigue disponible en obra; las fichas abiertas una vez quedan en el equipo.
- Negativas: el PDF depende del diálogo de impresión ("Guardar como PDF"), con un paso más que un botón de descarga directa; solo está disponible lo que el visitante ya abrió (no se descarga el catálogo completo); enviar una solicitud sigue necesitando conexión; las fichas de origen son de 2009 a 2011 y el anexo las reproduce tal cual.
- Pendiente (decisiones de la empresa, no de software): certificaciones y dictámenes para un dossier de licitación (solo con documentos reales), calculadora de llenado de bandejas (norma y criterios de su ingeniería), existencias y trazabilidad por lote (requieren un sistema de planta).

## Verificación

Pruebas de la lógica del anexo (datos de una ficha real, orden, productos y referencias desconocidos, referencias sin medidas) y del service worker en una máquina virtual de Node con simulaciones de la API de caché (qué atiende y qué no, red primero con respaldo, tiempo de espera, lo que nunca se guarda, activación y limpieza de versiones). En Chrome: registro y activación, páginas, ficha PDF e índices guardados, y página guardada abierta con el servidor apagado; una página no visitada muestra "Sin conexión".
