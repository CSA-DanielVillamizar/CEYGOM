# ADR-0013: Catálogo generado desde un manifiesto, con fichas y fotos optimizadas

- **Estado:** Aceptada
- **Fecha:** 2026-10-28
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-01, EP-04, EP-05

## Contexto

El catálogo actual de la empresa son 44 fichas técnicas en PDF (versiones de 2009 a 2011) y 24 fotos publicadas en una sola página, sin URL propia por producto. Para el posicionamiento se necesita una página indexable por producto con referencias, ficha y foto; para la operación, que la empresa pueda revisar y corregir el contenido sin tocar código; y para el costo, mantenerse dentro del plan Free de Static Web Apps (250 MB por entorno, 100 GB de transferencia al mes).

## Alternativas consideradas

1. **Manifiesto editable + script de importación que genera datos y archivos estáticos.** Las referencias se leen de las propias fichas; las fotos se optimizan una vez.
2. Colecciones de contenido de Astro con un archivo Markdown por producto. Cómodo para editar texto, pero habría que escribir a mano 369 referencias y sus descripciones, con riesgo de errores.
3. Un CMS o una base de datos. Costo y operación que el volumen no justifica.

## Decisión

- `scripts/catalog/manifest.json` es la fuente editable (49 productos). `import-catalog.mjs` copia las fichas a `public/fichas/<categoria>/<slug>.pdf`, optimiza las fotos a WebP de hasta 800 px en `src/assets/productos/`, lee las referencias de cada ficha con `pdftotext` y genera `catalog-index.ts` (ligero, lo usa el cotizador), `catalog-details.ts` (solo páginas) y `docs/catalogo/pendientes.md`.
- Una página estática por producto en `/productos/<categoria>/<slug>/`, con foto, referencias, ficha descargable, enlace de cotización, datos estructurados `Product` y `BreadcrumbList`. El índice `/productos/` lista las categorías. `sitemap-index.xml` y `robots.txt` se generan con el sitio.
- No se inventa ningún dato técnico. Cada producto lleva una lista de pendientes: foto ilustrativa (marcada como tal en la página y en las tarjetas), asignación de foto por confirmar, ficha ausente (el enlace de la ficha del "Rack abierto de pared" da 404 en la web actual) y descripción comercial.
- La foto solo se ofrece a buscadores y redes (`og:image`, JSON-LD) cuando es del producto exacto.
- El peso se controla en el CI con `npm run budget` (sitio, número de archivos, archivo más grande y JavaScript del cotizador).

## Actualización (2026-10-28): datos técnicos de las fichas

El importador también lee de cada ficha el material, los acabados, la tabla de colores y, cuando la tabla se alinea con certeza, las medidas por referencia (`scripts/catalog/sheet-specs.mjs`). Las medidas solo se publican si cubren al menos el 80 % de las referencias del producto; el resto queda en `docs/catalogo/pendientes.md` y manda el PDF. Nada se completa por estimación.

## Consecuencias

- Positivas: 49 URLs indexables, contenido revisable por la empresa, 7 MB en total (frente al límite de 250 MB), el cotizador sigue en 90 KB de JavaScript y la regeneración es reproducible.
- Negativas: la descripción de cada referencia es el texto de la ficha (a veces escueto); las medidas completas solo están en el PDF; 35 productos usan una foto ilustrativa hasta que la empresa entregue la suya. Las fichas conservan versiones antiguas (2009–2011).
- Cambiar un `slug` rompe URLs y enlaces del cotizador: requiere una redirección.
- Dos fichas distintas comparten el código `FT-MYV-42` en los PDF de origen; es un dato de la empresa.

## Verificación

`packages/shared/catalog.test.ts` comprueba slugs únicos, categorías válidas, que cada ficha y cada foto exista, referencias bien formadas y sin repetir, y que todo lo no respaldado por datos figure como pendiente. El build genera 49 páginas de producto con una descripción de 70 a 160 caracteres.
