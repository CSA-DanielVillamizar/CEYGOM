# HU-03: API de cotización con registro del lead y enlace de WhatsApp

- **Épica:** [EP-03](../epicas/EP-03-leads-y-whatsapp.md)
- **Estado:** Hecha (verificada en local y en producción: 200 con solicitud válida, 400 sin consentimiento, 403 con origen ajeno; el webhook aún no está configurado)
- **Prioridad:** Alta

**Como** equipo de ventas, **quiero** recibir cada solicitud en nuestro destino de registro y que el cliente pueda abrir WhatsApp con el resumen ya escrito, **para** responder en minutos.

## Alcance

`POST /api/quote` (función administrada, Node 22, modelo v4). Valida con el esquema compartido, genera la referencia `COT-AAAA-XXXXXX`, envía el lead al webhook si está configurado y responde `{ reference, whatsappUrl, webhookDelivered }`. Decisiones: ADR-0003, ADR-0005, ADR-0006, ADR-0008.

## Criterios de aceptación

```gherkin
Característica: Procesamiento del cotizador

  Antecedentes:
    Dado que WHATSAPP_NUMBER está configurada

  Escenario: Solicitud válida
    Cuando se envía POST a "/api/quote" con un cuerpo que cumple "QuoteRequestSchema"
    Entonces la respuesta es 200
    Y "reference" tiene el formato "COT-AAAA-XXXXXX"
    Y "whatsappUrl" empieza por "https://wa.me/"
    Y la respuesta lleva "cache-control: no-store"

  Escenario: Mensaje de WhatsApp sin datos de contacto
    Cuando se construye el enlace
    Entonces el texto decodificado contiene la referencia, los productos, la ciudad y el nombre
    Y no contiene el correo, el celular, la identificación, los datos fiscales ni el contenido del RUT
    Y mide 800 caracteres o menos

  Escenario: Webhook configurado
    Dado LEADS_WEBHOOK_URL y LEADS_WEBHOOK_SECRET
    Cuando se procesa una solicitud válida
    Entonces el webhook recibe el lead una vez
    Y la cabecera "x-ceygom-signature" contiene "sha256=" y el HMAC del cuerpo
    Y "webhookDelivered" es true

  Escenario: Webhook caído
    Dado que el webhook responde con error
    Cuando se procesa una solicitud válida
    Entonces la respuesta es 200 con "webhookDelivered" en false
    Y el registro no contiene datos personales

  Escenario: Datos inválidos
    Cuando falta el correo, el tipo de persona, la identificación, el CIIU o las responsabilidades fiscales, o no se acepta la política de datos
    Entonces la respuesta es 400 con "VALIDATION_ERROR" e "issues" con la ruta del campo

  Escenario: Cuerpo que no es JSON o demasiado grande
    Cuando el cuerpo no es JSON o supera 20 000 caracteres
    Entonces la respuesta es 400

  Escenario: Origen no permitido
    Dado ALLOWED_ORIGIN configurado
    Cuando la petición trae otro "Origin"
    Entonces la respuesta es 403 con "FORBIDDEN_ORIGIN"

  Escenario: Campo señuelo
    Cuando el campo "website" contiene texto
    Entonces la respuesta es 200
    Y no se envía nada al webhook

  Escenario: Falta configuración
    Dado que WHATSAPP_NUMBER no está definida
    Cuando llega cualquier solicitud
    Entonces la respuesta es 500 con "SERVER_MISCONFIGURED"
    Y el registro nombra la variable faltante sin imprimir valores

  Escenario: Método no permitido
    Cuando se envía GET a "/api/quote"
    Entonces la respuesta es 404 (comportamiento observado en el emulador)
```

## Definición de terminado específica

- Pruebas automáticas en `api/quote/handler.test.ts`.
- Probado a través del emulador de Static Web Apps y en el entorno desplegado (hecho).
- Pendiente: configurar `LEADS_WEBHOOK_URL` para que las solicitudes queden registradas.
