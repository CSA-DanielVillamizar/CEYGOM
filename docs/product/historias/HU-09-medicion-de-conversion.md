# HU-09: Medición de conversiones del cotizador y de WhatsApp

- **Épica:** [EP-04](../epicas/EP-04-seo-y-migracion.md)
- **Estado:** Pendiente
- **Prioridad:** Media

**Como** responsable de marketing, **quiero** medir cuántas visitas inician y completan el cotizador y cuántas pulsan WhatsApp, **para** decidir dónde mejorar.

## Alcance

- Eventos: inicio del cotizador, paso completado, solicitud enviada, clic en WhatsApp.
- Herramienta a definir por el negocio (por ejemplo GA4). Requiere ampliar la CSP (ADR-0010) y un aviso de cookies si aplica.
- Los eventos no incluyen datos personales.

## Criterios de aceptación

```gherkin
Característica: Medición

  Escenario: Evento de solicitud enviada
    Cuando el usuario envía el cotizador con éxito
    Entonces se registra un evento con la referencia y sin datos personales

  Escenario: Respeto de la preferencia del usuario
    Dado que el usuario rechazó la medición
    Entonces no se envían eventos

  Escenario: CSP compatible
    Cuando se activa la herramienta de medición
    Entonces la consola no muestra violaciones de CSP
```

## Dependencia del negocio

Elección de herramienta, propiedad de analítica y política de cookies.
