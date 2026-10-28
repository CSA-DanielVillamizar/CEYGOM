# ADR-0005: Captura de leads por webhook firmado y opcional

- **Estado:** Aceptada
- **Fecha:** 2026-10-27
- **Responsables:** Daniel Villamizar
- **Épicas relacionadas:** EP-03

## Contexto

Ventas necesita recibir cada solicitud en una hoja de cálculo o CRM. En funciones administradas no hay identidad administrada ni Key Vault, por lo que guardar credenciales de una cuenta de servicio para llamar a una API de hojas de cálculo sería un riesgo. El destino definitivo del lead aún no está decidido por el negocio.

## Alternativas consideradas

1. **Webhook HTTP configurable (`LEADS_WEBHOOK_URL`), firmado con HMAC-SHA256 y opcional.** El destino puede ser un Apps Script publicado, Make, Zapier u otro.
2. API directa de la hoja de cálculo con credenciales de cuenta de servicio. Requiere custodiar credenciales.
3. Base de datos propia. Costo y operación no justificados por el volumen.

## Decisión

Si `LEADS_WEBHOOK_URL` está definida, la función envía el lead con `POST` JSON y un tiempo máximo de 8 s. Si hay `LEADS_WEBHOOK_SECRET`, añade `x-ceygom-signature: sha256=<hex del HMAC del cuerpo>`. Si el webhook falla, se registra el error sin datos personales y se responde 200 con `webhookDelivered: false`, para no perder la intención del cliente; el cliente puede escribir igualmente por WhatsApp.

## Consecuencias

- Positivas: sin credenciales de terceros en el servidor; el destino se cambia sin tocar código.
- Negativas: si el webhook falla de forma sostenida, los leads solo llegan por WhatsApp; hay que monitorear la proporción de `webhookDelivered: false`.

## Verificación

Probado en local con un receptor de prueba: tres envíos con firma válida. Cubierto por pruebas en `api/quote/handler.test.ts`.
