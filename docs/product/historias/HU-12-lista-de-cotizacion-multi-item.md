# HU-12: Lista de cotización con productos y referencias específicas

- **Épica:** [EP-02](../epicas/EP-02-cotizador.md)
- **Estado:** En revisión (implementada y verificada en local)
- **Prioridad:** Alta

**Como** comprador, **quiero** ir reuniendo productos y referencias concretas (por ejemplo BP0101) mientras recorro el catálogo, **para** pedir una sola cotización sin repetir el proceso por cada producto.

## Alcance

- Botón "Agregar a mi cotización" en cada tarjeta y página de producto, y "Agregar" con cantidad en cada fila de referencias (ficha de producto y resultados de búsqueda).
- Enlace "Mi cotización" con contador en el encabezado y aviso accesible al agregar.
- Página `/cotizacion/` para editar cantidades, quitar líneas y vaciar la lista.
- `/cotizador/?lista=1` precarga los productos, referencias y cantidades; el cotizador valida cada referencia y vacía la lista al enviar con éxito.
- Decisión: [ADR-0014](../../adr/0014-lista-de-cotizacion-y-buscador-en-el-navegador.md).

## Criterios de aceptación

```gherkin
Característica: Lista de cotización

  Escenario: Agregar una referencia con cantidad
    Dado que el visitante está en la ficha de "Bandejas porta cables"
    Cuando escribe 5 en la fila "BP0101" y pulsa "Agregar"
    Entonces el contador del encabezado muestra 1
    Y ve el aviso "Bandejas porta cables (BP0101) agregado a tu cotización."

  Escenario: Misma referencia, cantidades sumadas
    Dado que la lista tiene "BP0101" con cantidad 5
    Cuando agrega 2 unidades más de "BP0101"
    Entonces la lista tiene una sola línea con cantidad 7

  Escenario: Producto general y referencia son líneas distintas
    Cuando agrega "Bandejas porta cables" sin referencia y también "BP0101"
    Entonces la lista tiene dos líneas

  Escenario: Límite de la lista
    Dado que la lista ya tiene 20 líneas
    Cuando intenta agregar un producto nuevo
    Entonces ve un aviso y la lista no cambia

  Escenario: Editar la lista
    Dado que está en "/cotizacion/"
    Cuando cambia una cantidad o pulsa "Quitar"
    Entonces el resumen y el contador se actualizan

  Escenario: Vaciar la lista
    Cuando pulsa "Vaciar lista" y confirma pulsando de nuevo
    Entonces la lista queda vacía y se muestra el estado vacío

  Escenario: Continuar con la solicitud
    Cuando pulsa "Continuar con la solicitud"
    Entonces el cotizador muestra sus productos con referencia y cantidad
    Y indica "Cargamos 1 producto de tu lista"

  Escenario: Referencia inválida
    Cuando escribe una referencia como "bandeja 1" en el cotizador
    Entonces no avanza y ve "La referencia no es válida. Ej.: BP0101"

  Escenario: La solicitud lleva la referencia
    Cuando envía la solicitud
    Entonces la API y el webhook reciben "reference": "BP0101" normalizada
    Y la lista se vacía

  Escenario: Navegador sin almacenamiento
    Dado que el navegador bloquea el almacenamiento local
    Cuando pulsa "Agregar"
    Entonces ve un aviso y puede usar "Cotizar solo este producto"

  Escenario: Datos manipulados
    Dado que la lista guardada contiene valores inválidos
    Cuando se abre cualquier página
    Entonces se descartan las líneas inválidas y no se ejecuta ningún contenido guardado
```

## Definición de terminada específica

- Pruebas de `packages/shared/cart.test.ts`, de contrato y de la API (hecho).
- Recorrido en navegador (hecho en local). Pendiente: prueba en celulares reales y con la API desplegada.
- Nota de privacidad en `/privacidad/` (hecho; sujeta a la revisión legal de HU-06).
