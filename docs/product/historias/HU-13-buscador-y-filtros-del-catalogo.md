# HU-13: Buscador y filtros del catálogo

- **Épica:** [EP-01](../epicas/EP-01-catalogo.md)
- **Estado:** En revisión (implementada y verificada en local)
- **Prioridad:** Alta

**Como** ingeniero o comprador, **quiero** encontrar un producto por su código de referencia, su nombre o su categoría, **para** llegar a la ficha o cotizarlo sin recorrer todo el catálogo.

## Alcance

- Campo de búsqueda y filtro de categoría en `/productos/`, con resultados de productos y de referencias.
- Buscador en el inicio que lleva a `/productos/?q=`.
- Índice estático `/productos/search-index.json` generado en el build y descargado solo al empezar a buscar.
- Decisión: [ADR-0014](../../adr/0014-lista-de-cotizacion-y-buscador-en-el-navegador.md).

## Criterios de aceptación

```gherkin
Característica: Buscador del catálogo

  Escenario: Buscar por código de referencia
    Cuando el visitante escribe "bp0101" en "/productos/"
    Entonces ve "1 producto y 1 referencia."
    Y la fila "BP0101" aparece en la tabla de referencias

  Escenario: Cada referencia publicada es encontrable
    Dado cualquiera de las referencias del catálogo
    Cuando se busca por su propio código
    Entonces aparece en los resultados

  Escenario: Sin distinguir tildes ni mayúsculas
    Cuando busca "reduccion"
    Entonces encuentra "Reducción simétrica" y "Reducción asimétrica"

  Escenario: Varios términos
    Cuando busca "bandeja 10*5"
    Entonces solo se muestran las referencias que cumplen ambos términos

  Escenario: Filtrar por categoría
    Cuando elige "Canaletas" en el filtro
    Entonces solo se muestran productos de esa categoría

  Escenario: Sin resultados
    Cuando busca un texto que no existe
    Entonces ve "No encontramos coincidencias." con la opción de fabricación a medida

  Escenario: Llegar desde el inicio
    Cuando busca "rack" en la portada
    Entonces llega a "/productos/?q=rack" con los resultados ya mostrados

  Escenario: Sin JavaScript
    Dado que el navegador no ejecuta JavaScript
    Entonces "/productos/" muestra el catálogo completo por categorías

  Escenario: Peso
    Entonces el JavaScript de "/productos/" pesa 20 KB o menos comprimido
    Y el índice se descarga solo al enfocar el buscador
```

## Definición de terminada específica

- Pruebas de `packages/shared/search.test.ts` (incluida la búsqueda de las 369 referencias) y del tamaño del índice (hecho).
- Recorrido en navegador (hecho en local). Pendiente: prueba con lector de pantalla y en celulares reales.
