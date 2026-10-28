# Integración de leads (webhook)

La función `POST /api/quote` envía cada solicitud válida a `LEADS_WEBHOOK_URL`. Decisión: [ADR-0005](../adr/0005-leads-por-webhook-firmado-opcional.md). El webhook es opcional y su falla **no** impide que el cliente reciba la referencia y el enlace de WhatsApp: la API responde 200 con `webhookDelivered: false` y deja una advertencia en el registro con la referencia y el motivo del error, sin datos personales ni la URL del webhook.

## Contrato

- Método: `POST`, `content-type: application/json`, solo por HTTPS (HTTP únicamente hacia `localhost`). Tiempo máximo de espera: 8 s, o 25 s si el lead lleva el RUT.
- Fallo: cualquier respuesta distinta de 2xx, un tiempo agotado, un error de red o una respuesta JSON con `"ok": false`. Una respuesta 2xx de texto plano (`Accepted`, vacía) cuenta como entregada.
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
    "contact": {
      "personType": "juridica",
      "fullName": "...",
      "businessName": "...",
      "taxId": "900123456",
      "taxIdCheckDigit": "8",
      "ciiuCode": "2599",
      "fiscalResponsibilities": ["responsable-iva", "autorretenedor"],
      "email": "...",
      "phone": "573001234567",
      "acceptsDataPolicy": true
    },
    "rutFile": { "fileName": "RUT.pdf", "mimeType": "application/pdf", "sizeBytes": 183422, "contentBase64": "JVBERi0x..." }
  }
}
```

- `personType`: `natural` o `juridica`. Para `natural`, `businessName` y `taxIdCheckDigit` no vienen; `taxId` es la cédula. Para `juridica`, `businessName` y `taxIdCheckDigit` son obligatorios y el DV ya fue verificado contra el NIT con el algoritmo de la DIAN.
- `fiscalResponsibilities`: uno o más de `responsable-iva`, `no-responsable-iva`, `gran-contribuyente`, `autorretenedor`, `regimen-simple`, `otra`. Es lo que declaró el cliente; la fuente de verdad es el RUT adjunto.
- `rutFile` es opcional. Si viene, la API ya comprobó que es PDF, JPG o PNG, que pesa 5 MB o menos, que el tamaño coincide con el contenido y que la firma del archivo corresponde al formato declarado. `contentBase64` no lleva prefijo `data:`. Con archivo, el tiempo máximo de espera del webhook sube de 8 a 25 s y el cuerpo puede pesar cerca de 7 MB (el límite de Static Web Apps es 30 MB).
- Los demás campos opcionales pueden faltar. `phone`, `taxId` y `ciiuCode` llegan solo con dígitos, y `email` en minúsculas.
- El destino recibe datos personales y un documento tributario: debe estar bajo control de la empresa, con acceso restringido al personal de facturación, y mencionado en la política de datos (`/privacidad/`). El archivo, el NIT y los datos fiscales nunca van en el enlace de WhatsApp ni en los registros de la función.

## Opción A: Google Sheets con Apps Script

Es la opción elegida: sin costo de licencias. Instalación paso a paso, verificación y operación en **[`google-apps-script.md`](google-apps-script.md)**; el código está en [`apps-script-leads.gs`](apps-script-leads.gs).

Apps Script no expone las cabeceras HTTP, así que no puede verificar la firma HMAC: se usa un token secreto en la URL (`?token=`) y no se define `LEADS_WEBHOOK_SECRET`. Tampoco permite fijar el código HTTP de la respuesta, por lo que informa el resultado en el cuerpo JSON (`{"ok":true}` o `{"ok":false,"error":"<código>"}`), y la API trata `ok:false` como lead no entregado.

Cada fila queda con la referencia, la fecha, los productos, el proyecto, el tipo de persona, los datos de identificación y fiscales, el contacto y el enlace al RUT, que se guarda en una subcarpeta de Drive con el nombre de la cotización.

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

- Pruebas automáticas (`api/quote`): la API responde 200 con enlace de WhatsApp cuando el webhook falla, se agota el tiempo, rechaza con `ok:false` o lanza cualquier valor; registra una advertencia con la referencia y sin datos personales; no envía leads por HTTP plano; lee el destino de `LEADS_WEBHOOK_URL`; elige 8 o 25 s según haya archivo; y firma el cuerpo con HMAC-SHA256.
- Probado en local con un receptor de prueba: un PDF de 5 MB llegó íntegro con firma válida.
- Probado en producción con Google Apps Script (octubre de 2026): una solicitud con un PDF de 5 MB respondió 200 con `webhookDelivered: true` en unos 16 s; la fila completa llegó a la hoja y el archivo a su subcarpeta de Drive. El tiempo máximo con archivo es 25 s, así que el margen es limitado.
- **No probado:** la entrega a Make, y el comportamiento cuando Google tarda más de 25 s (el cliente vería el aviso de enviar el RUT por WhatsApp).
