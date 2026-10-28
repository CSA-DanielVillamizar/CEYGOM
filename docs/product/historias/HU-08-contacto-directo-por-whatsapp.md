# HU-08: Contacto directo por WhatsApp

- **Épica:** [EP-03](../epicas/EP-03-leads-y-whatsapp.md)
- **Estado:** Hecha (pendiente del número real y de prueba en celulares)
- **Prioridad:** Media

**Como** visitante, **quiero** escribir por WhatsApp desde cualquier página, **para** resolver una duda sin llenar el cotizador.

## Alcance

Botón flotante en `Layout.astro` con el número de `PUBLIC_WHATSAPP_NUMBER`. Si la variable no está definida, el botón dirige al cotizador.

## Criterios de aceptación

```gherkin
Característica: Contacto por WhatsApp

  Escenario: Número configurado
    Dado PUBLIC_WHATSAPP_NUMBER con un número válido
    Cuando el usuario pulsa el botón flotante
    Entonces se abre "https://wa.me/<número en dígitos>"

  Escenario: Número no configurado
    Dado que PUBLIC_WHATSAPP_NUMBER no está definida
    Cuando el usuario pulsa el botón flotante
    Entonces llega a "/cotizador/"

  Escenario: Accesibilidad
    Cuando un usuario navega con teclado
    Entonces el botón recibe foco visible y tiene un nombre accesible
```

## Dependencia del negocio

Número de WhatsApp Business y horario de atención. Verificar el comportamiento en iOS y Android.
