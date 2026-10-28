# HU-01: Catálogo por categorías con enlace a cotización

- **Épica:** [EP-01](../epicas/EP-01-catalogo.md)
- **Estado:** Hecha (listado); el detalle por producto está en HU-07
- **Prioridad:** Alta

**Como** comprador o ingeniero, **quiero** ver los productos agrupados por categoría y poder pedir cotización de uno con un clic, **para** decidir rápido a quién solicitar precio.

## Alcance

- Página `/productos/` con las categorías de `packages/shared/catalog.ts` y sus productos (tarjeta con foto, número de referencias, enlace a la página del producto y a cotizar; el detalle está en HU-07).
- Cada producto enlaza a `/cotizador/?producto=<slug>`.
- El contenido proviene de una única fuente (`catalog.ts`), compartida con el cotizador.

## Criterios de aceptación

```gherkin
Característica: Catálogo por categorías

  Escenario: Listado agrupado
    Cuando el usuario abre "/productos/"
    Entonces ve las categorías definidas en el catálogo
    Y cada categoría muestra sus productos
    Y la página tiene un único <h1>

  Escenario: Cotizar un producto
    Dado que el usuario está en "/productos/"
    Cuando pulsa "Cotizar este producto" en "bandeja-cruz"
    Entonces llega a "/cotizador/?producto=bandeja-cruz"
    Y el cotizador tiene preseleccionada su categoría y el producto

  Escenario: Sin JavaScript de framework
    Cuando se audita "/productos/"
    Entonces la página no carga el paquete de React
```

## Definición de terminado específica

- Revisado el contraste y el orden de encabezados.
- Los nombres y descripciones de producto son los aprobados por el negocio (no se inventan datos técnicos).
