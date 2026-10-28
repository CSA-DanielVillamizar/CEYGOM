# EP-01: Catálogo de productos

- **Estado:** En curso
- **Prioridad:** Alta
- **Historias:** [HU-01](../historias/HU-01-catalogo-por-categorias.md) (hecha), [HU-07](../historias/HU-07-paginas-de-producto-con-ficha.md) (pendiente)

## Objetivo

Que un comprador o ingeniero encuentre los productos de Electro Metálicas Ceygom (gabinetes, racks, bandejas portacables, canaletas, celdas) por categoría, con información clara y ficha técnica, desde cualquier dispositivo.

## Valor de negocio

El catálogo es la puerta de entrada al cotizador. Las páginas indexables por producto captan búsquedas específicas que hoy no se capturan.

## Alcance

- Listado por categorías con enlace "Cotizar este producto".
- Una página por producto con descripción, especificaciones, fotos y ficha técnica descargable.
- Datos estructurados `Product` para buscadores.

## Fuera de alcance

- Precios y carrito de compra (ver ADR-0009).

## Dependencias y datos pendientes del negocio

Fotos, descripciones y fichas PDF por producto; certificaciones aplicables (por ejemplo RETIE o NTC), que solo se publican si están documentadas.

## Indicadores de éxito

- Rendimiento, Accesibilidad, Buenas prácticas y SEO en móvil: 90 o más (Lighthouse).
- Proporción de visitas al catálogo que llegan al cotizador.
