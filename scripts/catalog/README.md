# Herramientas del catálogo

El catálogo se genera desde un manifiesto editable, con las fichas técnicas y las fotos de la web actual de la empresa. Decisión: [ADR-0013](../../docs/adr/0013-catalogo-generado-desde-manifiesto.md).

| Archivo | Para qué sirve |
|---|---|
| `manifest.json` | Fuente editable: productos, categoría, ficha de origen, fotos (`illustrative` si la foto no es del producto exacto, `confirm` si hay que confirmarla con la empresa) |
| `download-source.mjs` | Descarga fichas y fotos de `productos.html` a una carpeta nueva y vacía, validando tipo y tamaño |
| `sheet-specs.mjs` | Lee de cada ficha el material, los acabados, la tabla de colores y las columnas de medidas (`sheet-specs.test.mjs` lo prueba). Solo publica medidas cuando la tabla cubre al menos el 80 % de las referencias; si no, queda como pendiente y manda el PDF |
| `import-catalog.mjs` | Copia las fichas a `public/fichas/`, optimiza las fotos a WebP en `src/assets/productos/`, lee las referencias de cada ficha y genera `packages/shared/catalog-index.ts`, `catalog-details.ts` y `docs/catalogo/pendientes.md` |

## Cuando la empresa entregue cambios

1. **Foto nueva de un producto:** guárdala como PNG o JPG en la carpeta de descarga (`<carpeta>/img/`), cambia en `manifest.json` el `file` del producto y quita `illustrative`/`confirm`.
2. **Ficha nueva o corregida:** copia el PDF a `<carpeta>/fichas/` y pon su nombre en `ficha` del producto.
3. **Producto nuevo o renombrado:** añade o edita la entrada (el `slug` es parte de la URL y del enlace del cotizador; si cambia, hay que redirigir el anterior).
4. Regenera y revisa el resultado:

   ```bash
   npm run catalog:import -- <carpeta>
   npm test && npm run build && npm run budget
   ```

Requiere `pdftotext` (poppler) para leer las referencias. Los archivos generados se versionan; el script nunca inventa datos: lo que falta queda en `docs/catalogo/pendientes.md`.

Las fichas de origen llevan versiones de 2009 a 2011 (códigos `FT-MYV-nn`). Hay que confirmar con la empresa que siguen vigentes antes de publicar.
