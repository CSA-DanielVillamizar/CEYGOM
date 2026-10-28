# HU-14: Identidad visual, imágenes en el inicio y SEO local

- **Épica:** [EP-04](../epicas/EP-04-seo-y-migracion.md)
- **Estado:** En revisión (implementada; falta el logo en alta resolución y fotos reales)
- **Prioridad:** Alta

**Como** visitante, **quiero** reconocer a la empresa y ver sus productos desde la primera pantalla, y **como** buscador, **quiero** datos claros del negocio, **para** confiar en el sitio y encontrarlo al buscar fabricantes en Medellín.

## Alcance

- Logo de la empresa en el encabezado (recorte del monograma "EMC" de su web actual), favicon y `apple-touch-icon`.
- Imagen para compartir (`og:image`, 1200×630) en todas las páginas, con la de cada producto cuando es del producto exacto.
- Inicio con fotos de producto, tarjetas de categoría con foto, buscador y cifras calculadas desde los datos (369 referencias, 49 productos, 44 fichas técnicas).
- Datos estructurados `LocalBusiness` en el inicio con nombre, dirección en Medellín, teléfono y mapa; nada que la web actual no publique.
- Pie de página sin solape con el botón flotante de WhatsApp en ningún tamaño de pantalla.

## Criterios de aceptación

```gherkin
Característica: Identidad y SEO local

  Escenario: Cifras reales
    Cuando se abre el inicio
    Entonces muestra "369" referencias, "49" productos y "44" fichas técnicas
    Y las referencias por categoría suman 369
    Y ninguna cifra está escrita a mano

  Escenario: Pie accesible
    Dado cualquier página
    Cuando se llega al final del desplazamiento
    Entonces el enlace de la política de datos queda por encima del botón de WhatsApp

  Escenario: Identidad
    Entonces cada página muestra el logo en el encabezado y declara su favicon

  Escenario: Compartir
    Cuando se comparte cualquier página
    Entonces "og:image" apunta a una imagen de 1200×630
    Y la imagen de un producto solo se usa si es del producto exacto

  Escenario: Negocio local
    Cuando se abre el inicio
    Entonces incluye JSON-LD "LocalBusiness" con nombre, dirección en Medellín y teléfono

  Escenario: Imágenes honestas
    Cuando una categoría usa la foto de un producto relacionado
    Entonces se muestra "Imagen ilustrativa"
```

## Pendiente con la empresa

Logo vectorial o en alta resolución (hoy es un recorte de 186×146 px de su banner), fotos reales, correo y horario para completar los datos del negocio. La razón social y el NIT ya están cargados.
