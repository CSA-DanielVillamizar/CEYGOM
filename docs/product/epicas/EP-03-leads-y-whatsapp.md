# EP-03: Captura de leads y contacto por WhatsApp

- **Estado:** Entregada (pendiente de datos de negocio)
- **Prioridad:** Alta
- **Historias:** [HU-03](../historias/HU-03-api-de-cotizacion.md) (hecha), [HU-08](../historias/HU-08-contacto-directo-por-whatsapp.md) (hecha, pendiente de número real)

## Objetivo

Registrar cada solicitud en el destino definido por ventas y permitir que el cliente continúe la conversación por WhatsApp con el resumen ya escrito.

## Valor de negocio

Reduce el tiempo de respuesta comercial y evita perder solicitudes cuando el destino de registro falla.

## Alcance

- `POST /api/quote` con validación, referencia `COT-AAAA-XXXXXX`, webhook firmado opcional y enlace `wa.me`.
- Botón flotante de WhatsApp con alternativa al cotizador si no hay número configurado.

## Decisiones relacionadas

ADR-0005 (webhook firmado), ADR-0006 (enlace de WhatsApp), ADR-0008 (configuración).

## Datos pendientes del negocio

Número de WhatsApp Business y horario de atención; destino del webhook (Apps Script, Make, Zapier u otro).

## Indicadores de éxito

- Solicitudes recibidas por semana.
- Proporción de respuestas con `webhookDelivered: false` (debe tender a cero).
