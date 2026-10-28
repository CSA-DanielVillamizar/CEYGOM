# HU-07: Páginas de producto con ficha técnica y datos estructurados

- **Épica:** [EP-01](../epicas/EP-01-catalogo.md)
- **Estado:** En revisión (49 páginas implementadas con las fichas y fotos de la web actual; falta que la empresa revise y complete el contenido: ver `docs/catalogo/pendientes.md`)
- **Prioridad:** Media

**Como** ingeniero o comprador, **quiero** ver la página de cada producto con especificaciones y descargar su ficha técnica, **para** validar que cumple mi proyecto.

## Alcance

- Catálogo generado desde un manifiesto editable (`scripts/catalog/manifest.json`), con las fichas y fotos de la web actual (ADR-0013). En lugar de colecciones de contenido de Astro, las pruebas de `catalog.test.ts` validan la integridad de los datos.
- Una página estática por producto en `/productos/<categoria>/<slug>/` con un único `<h1>`, meta description de 70 a 160 caracteres, referencias leídas de la ficha, foto y JSON-LD `Product`.
- Ficha técnica en `public/fichas/` con caché de un día.
- Mapa del sitio (`sitemap-index.xml`) con las páginas de producto y `robots.txt` que lo declara.
- Las fotos que no son del producto exacto se marcan como "Imagen ilustrativa" y solo las reales se ofrecen a buscadores y redes.

## Criterios de aceptación

```gherkin
Característica: Páginas de producto

  Escenario: Página indexable
    Dado un producto en la colección de contenido
    Cuando se construye el sitio
    Entonces existe su página con un único <h1>, meta description de 70 a 160 caracteres y JSON-LD "Product"

  Escenario: Datos inconsistentes del catálogo rompen las pruebas
    Dado un producto cuya ficha no existe en "public/fichas"
    Cuando se ejecuta "npm test"
    Entonces la prueba de integridad del catálogo falla indicando el producto

  Escenario: Foto ilustrativa señalada
    Dado un producto cuya foto no es del producto exacto
    Cuando se abre su página o su tarjeta en "/productos/"
    Entonces se muestra la nota "Imagen ilustrativa"
    Y la foto no se ofrece como imagen para compartir ni en los datos estructurados

  Escenario: Producto sin ficha
    Dado un producto cuya ficha aún no existe
    Cuando se abre su página
    Entonces se informa que la ficha está en preparación y se ofrece cotizar o llamar

  Escenario: Ficha técnica descargable
    Dado un producto con ficha
    Cuando el usuario pulsa "Descargar ficha técnica"
    Entonces recibe el PDF con estado 200

  Escenario: Mapa del sitio
    Cuando se construye el sitio
    Entonces "sitemap" lista las páginas de producto
```

## Dependencia del negocio

Revisar y completar con la empresa (lista por producto en [`docs/catalogo/pendientes.md`](../../catalogo/pendientes.md)):

- Fotos reales de los 35 productos que hoy muestran una foto ilustrativa, y confirmar las asignaciones marcadas.
- La ficha del "Rack abierto de pared" (el enlace de la web actual da 404) y las de los productos que solo tienen foto (multitoma grado hospitalario, bandeja para fibra óptica, gabinetes de gas y de incendio).
- Confirmar que las fichas siguen vigentes (los PDF son versiones de 2009 a 2011) y revisar los productos cuya ficha no se puede leer como texto (curva horizontal 45°, reducciones simétrica y asimétrica, cruz de ductos).
- Descripción comercial por producto y certificaciones que se puedan documentar.

Los datos técnicos no se infieren ni se inventan.
