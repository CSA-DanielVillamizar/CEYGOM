# HU-02: Cotizador multipasos con resumen JSON

- **Épica:** [EP-02](../epicas/EP-02-cotizador.md)
- **Estado:** Hecha (verificada en local; falta prueba en dispositivos reales)
- **Prioridad:** Alta

**Como** cliente potencial, **quiero** describir lo que necesito en pasos cortos y revisar un resumen antes de enviarlo, **para** pedir cotización sin llamar.

## Alcance

Componente `src/components/QuoteWizard.tsx`, una sola isla (`client:load`) en `/cotizador/`. Cuatro pasos: Productos, Proyecto, Contacto y Resumen. Validación con los esquemas compartidos (ADR-0004). No calcula precios (ADR-0009).

## Criterios de aceptación

```gherkin
Característica: Cotizador multipasos

  Escenario: Recorrido completo
    Dado que el usuario abre "/cotizador/"
    Cuando elige categoría y cantidad, indica la ciudad y completa sus datos de contacto
    Y acepta la política de tratamiento de datos
    Entonces ve un resumen con sus productos, la ciudad y su contacto
    Y puede enviar la solicitud

  Escenario: No avanza con datos inválidos
    Dado que el usuario está en el paso "Productos" sin elegir categoría
    Cuando pulsa "Siguiente"
    Entonces permanece en el paso
    Y ve el aviso "Revisa los campos marcados antes de continuar."

  Escenario: Varios productos
    Cuando el usuario pulsa "Agregar otro producto"
    Entonces puede añadir hasta 20 productos

  Escenario: Consentimiento obligatorio
    Dado que el usuario está en el paso "Contacto" con datos válidos
    Cuando no marca la política de tratamiento de datos
    Entonces no puede continuar al resumen

  Escenario: Precarga desde un producto
    Dado que el usuario abre "/cotizador/?producto=bandeja-cruz"
    Entonces la categoría "Bandejas portacables" y el producto "bandeja-cruz" aparecen seleccionados

  Escenario: Recuperación al recargar
    Dado que el usuario completó pasos previos
    Cuando recarga la página
    Entonces conserva los datos ya ingresados
    Y la casilla de consentimiento aparece sin marcar

  Escenario: Resumen en JSON
    Cuando el usuario abre "Ver resumen en JSON"
    Entonces ve un objeto que cumple "QuoteRequestSchema"

  Escenario: Fallo de red
    Dado que la API no responde
    Cuando el usuario envía la solicitud
    Entonces ve un aviso de error
    Y se le ofrece un enlace de WhatsApp con el resumen
```

## Definición de terminado específica

- Recorrido completo con teclado, sin ratón.
- JavaScript transferido en `/cotizador/` de 200 KB o menos.
- Prueba manual en al menos un celular Android y uno iOS (pendiente).
