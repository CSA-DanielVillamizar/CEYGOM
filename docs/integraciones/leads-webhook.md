# Integración de leads (webhook)

La función `POST /api/quote` envía cada solicitud válida a `LEADS_WEBHOOK_URL`. Decisión: [ADR-0005](../adr/0005-leads-por-webhook-firmado-opcional.md). El webhook es opcional y su falla **no** impide que el cliente reciba la referencia y el enlace de WhatsApp: la API responde 200 con `webhookDelivered: false` y deja en el registro la referencia y el motivo del error, sin datos personales.

## Contrato

- Método: `POST`, `content-type: application/json`, tiempo máximo de espera 8 s. Cualquier respuesta distinta de 2xx cuenta como fallo.
- Cabecera `x-ceygom-signature: sha256=<hex>` solo si hay `LEADS_WEBHOOK_SECRET`. Es el HMAC-SHA256 del cuerpo exacto, calculado con ese secreto.
- Cuerpo (`LeadRecordSchema` en `packages/shared/quote.schema.ts`):

```json
{
  "reference": "COT-2026-ABC234",
  "createdAt": "2026-10-28T02:15:00.000Z",
  "request": {
    "items": [
      { "category": "bandejas-portacables", "productSlug": "bandeja-cruz", "quantity": 10, "widthMm": 300, "finish": "galvanizado", "notes": "..." }
    ],
    "project": { "city": "Medellín", "neededBy": "2026-12-01", "environment": "interior", "notes": "..." },
    "contact": { "fullName": "...", "company": "...", "email": "...", "phone": "573001234567", "acceptsDataPolicy": true }
  }
}
```

Los campos opcionales pueden faltar. `phone` llega solo con dígitos y `email` en minúsculas. El destino recibe datos personales: debe estar bajo control de la empresa y mencionado en la política de datos (`/privacidad/`).

## Opción A: Google Sheets con Apps Script

Apps Script no expone las cabeceras HTTP, así que no puede verificar la firma HMAC. En su lugar se usa un token secreto en la URL.

1. Crea una hoja de cálculo y abre **Extensiones > Apps Script**.
2. Pega el contenido de [`apps-script-leads.gs`](apps-script-leads.gs).
3. En **Configuración del proyecto > Propiedades del script** crea `WEBHOOK_TOKEN` con un valor largo y aleatorio.
4. **Implementar > Nueva implementación > Aplicación web**: ejecutar como tu usuario, acceso "Cualquier usuario". Copia la URL que termina en `/exec`.
5. En las Application settings de `swa-ceygom-prd` define `LEADS_WEBHOOK_URL` con esa URL más `?token=<WEBHOOK_TOKEN>`. No definas `LEADS_WEBHOOK_SECRET`. La URL completa es un secreto: no la versiones ni la pegues en tickets.

Cada fila queda con la referencia, la fecha, los productos, el proyecto y los datos de contacto. El script ignora referencias repetidas y crea la hoja `Leads` con encabezados si no existe.

Apps Script responde 200 incluso con un token incorrecto (el cuerpo trae `unauthorized`), por lo que la API lo contaría como entregado. Verifica la integración con una solicitud real y confirma que aparece la fila.

## Opción B: Make

1. Crea un escenario con el módulo **Webhooks > Custom webhook** y copia su URL.
2. Define esa URL como `LEADS_WEBHOOK_URL` y un valor aleatorio como `LEADS_WEBHOOK_SECRET`.
3. Si necesitas verificar la firma, calcula el HMAC-SHA256 del cuerpo con ese secreto y compáralo con `x-ceygom-signature`.
4. Conecta los módulos siguientes (hoja de cálculo, CRM, correo) usando los campos del cuerpo.

## Cómo configurarlo en producción

```bash
az staticwebapp appsettings set -n swa-ceygom-prd -g rg-ceygom-prd --setting-names "LEADS_WEBHOOK_URL=<url>" "LEADS_WEBHOOK_SECRET=<secreto, solo con Make>"
```

La configuración se aplica sin volver a desplegar. Después envía una solicitud de prueba por el cotizador y confirma que la respuesta trae `webhookDelivered: true` y que el lead llegó al destino.

## Qué se probó

- Pruebas automáticas: la API responde 200 con enlace de WhatsApp cuando el webhook devuelve error o lanza cualquier valor, y firma el cuerpo con HMAC-SHA256 (`api/quote`).
- Probado en local con un receptor de prueba: firma válida.
- **No probado:** la entrega real a Google Apps Script o a Make. Falta definir el destino con el negocio (HU-03, #10).
