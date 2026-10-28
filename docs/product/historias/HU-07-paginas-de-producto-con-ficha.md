# HU-07: Páginas de producto con ficha técnica y datos estructurados

- **Épica:** [EP-01](../epicas/EP-01-catalogo.md)
- **Estado:** Pendiente (depende de contenido del negocio)
- **Prioridad:** Media

**Como** ingeniero o comprador, **quiero** ver la página de cada producto con especificaciones y descargar su ficha técnica, **para** validar que cumple mi proyecto.

## Alcance

- Colecciones de contenido de Astro con esquema validado (Zod) para productos.
- Una página estática por producto con un único `<h1>`, meta description y JSON-LD `Product`.
- Ficha técnica en `public/fichas/` con caché de un día.
- Mapa del sitio (`sitemap`) con las páginas de producto.

## Criterios de aceptación

```gherkin
Característica: Páginas de producto

  Escenario: Página indexable
    Dado un producto en la colección de contenido
    Cuando se construye el sitio
    Entonces existe su página con un único <h1>, meta description de 70 a 160 caracteres y JSON-LD "Product"

  Escenario: Contenido inválido rompe el build
    Dado un producto sin el campo "categoria"
    Cuando se ejecuta "astro build"
    Entonces el build falla indicando el archivo y el campo faltante

  Escenario: Ficha técnica descargable
    Dado un producto con ficha
    Cuando el usuario pulsa "Descargar ficha técnica"
    Entonces recibe el PDF con estado 200

  Escenario: Mapa del sitio
    Cuando se construye el sitio
    Entonces "sitemap" lista las páginas de producto
```

## Dependencia del negocio

Fotos, descripciones y fichas por producto; certificaciones que se puedan documentar. Los datos técnicos no se infieren ni se inventan.
