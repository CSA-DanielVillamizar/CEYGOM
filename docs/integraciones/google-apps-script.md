# Guía: registrar leads y RUT con Google Apps Script, Sheets y Drive

Esta guía instala el receptor que guarda cada solicitud del cotizador en una hoja de Google Sheets y el RUT adjunto en una carpeta privada de Google Drive, sin costo de licencias. Decisiones: [ADR-0005](../adr/0005-leads-por-webhook-firmado-opcional.md) y [ADR-0012](../adr/0012-datos-fiscales-y-adjunto-del-rut.md). El contrato del mensaje está en [`leads-webhook.md`](leads-webhook.md) y el código en [`apps-script-leads.gs`](apps-script-leads.gs).

## Cómo funciona

```
Cotizador (navegador)
   │  POST /api/quote  (JSON, RUT en Base64)
   ▼
Azure Function ── valida con Zod ──► responde 200 al cliente con la referencia y el enlace de WhatsApp
   │  POST LEADS_WEBHOOK_URL  (JSON, hasta 25 s con archivo)
   ▼
Google Apps Script (Web App)
   ├─► Drive:  <carpeta privada>/COT-AAAA-XXXXXX/COT-AAAA-XXXXXX-RUT.pdf
   └─► Sheets: una fila por cotización, con identificación y datos fiscales
```

El cliente nunca espera por Google: si el receptor falla, tarda o responde un rechazo, la función igualmente responde 200 con el enlace de WhatsApp, deja una advertencia en el registro con la referencia (sin datos personales) y marca `webhookDelivered: false`.

## Requisitos

- Una cuenta de Google **de la empresa** (preferiblemente Google Workspace) que será la propietaria de la hoja, la carpeta y el script. Evita cuentas personales: si la persona se va, el acceso se pierde.
- Acceso a la configuración de Application settings de `swa-ceygom-prd` en Azure.

## Instalación

1. **Hoja de cálculo.** Crea una hoja nueva en Google Sheets (por ejemplo "Leads Ceygom"). El script crea la pestaña `Leads` y sus encabezados en la primera ejecución.
2. **Carpeta del RUT.** En Drive crea una carpeta (por ejemplo "RUT clientes"), déjala **privada** y compártela solo con el personal de facturación. Copia su id: es el texto que va después de `/folders/` en la URL.
3. **Script.** En la hoja abre **Extensiones > Apps Script**, borra el código de ejemplo y pega el contenido de [`apps-script-leads.gs`](apps-script-leads.gs). Guarda.
4. **Propiedades del script.** En **Configuración del proyecto > Propiedades del script** crea:

   | Propiedad | Valor |
   |---|---|
   | `WEBHOOK_TOKEN` | Un valor largo y aleatorio (ver abajo) |
   | `RUT_FOLDER_ID` | El id de la carpeta del paso 2 |
   | `NOTIFY_EMAIL` | (opcional) Correo que recibe un aviso por cada cotización, por ejemplo `contacto@electrometalicasceygom.com`. Para cambiarlo basta editar esta propiedad: no hace falta volver a implementar |
   | `MAX_RUT_PER_DAY` | (opcional, 100 por defecto) Tope diario de archivos RUT guardados en Drive |
   | `CUSTOMER_ACK` | (opcional) `off` desactiva el correo de confirmación al cliente; cualquier otro valor lo deja activo |
   | `MAX_ACK_PER_DAY` | (opcional, 50 por defecto) Tope diario de confirmaciones a clientes |
   | `SITE_URL` | (opcional) Dirección del sitio, sin barra final de preferencia, para enlazar `/privacidad/` en la confirmación. Cámbiala al configurar el dominio propio |

   Para generar el token:

   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
   ```

5. **Implementar.** **Implementar > Nueva implementación > Aplicación web**:
   - Ejecutar como: **Yo** (la cuenta de la empresa).
   - Quién tiene acceso: **Cualquier usuario**. La función de Azure no inicia sesión en Google; el acceso lo protege el token del paso 4.
   - Pulsa **Implementar**, autoriza los permisos que pide (hoja de cálculo y Drive) y copia la **URL de la aplicación web**, que termina en `/exec`.
6. **Probar el despliegue.** Abre la URL en el navegador: debe mostrar `{"ok":true,"service":"ceygom-leads"}`.

## Configurar Azure

Define `LEADS_WEBHOOK_URL` en las Application settings de la Static Web App, con la URL del paso 5 seguida de `?token=<WEBHOOK_TOKEN>`:

```bash
az staticwebapp appsettings set -n swa-ceygom-prd -g rg-ceygom-prd --setting-names "LEADS_WEBHOOK_URL=https://script.google.com/macros/s/<ID>/exec?token=<WEBHOOK_TOKEN>"
```

- No definas `LEADS_WEBHOOK_SECRET` con Apps Script: no puede leer cabeceras, así que no verificaría la firma.
- La URL completa es un secreto. No la versiones, no la pegues en issues ni en PR. La función nunca la escribe en los registros.
- La función solo envía leads por HTTPS (HTTP únicamente hacia `localhost`, para pruebas).
- La configuración se aplica sin volver a desplegar el sitio.

## Verificación

1. **Token incorrecto** (debe rechazar sin guardar nada):

   ```bash
   curl -s -L "https://script.google.com/macros/s/<ID>/exec?token=incorrecto" -H "content-type: application/json" -d "{}"
   ```

   Respuesta esperada: `{"ok":false,"error":"unauthorized"}`.
2. **Extremo a extremo.** Envía una solicitud desde `/cotizador/` con un RUT de **5 MB** (el peor caso). Comprueba que:
   - la pantalla final dice "Un asesor revisará tu solicitud" (no pide enviar el RUT por WhatsApp);
   - aparece la fila en la hoja `Leads` con el CIIU, las responsabilidades y la identificación;
   - existe `COT-AAAA-XXXXXX/COT-AAAA-XXXXXX-RUT.pdf` en la carpeta de Drive y el enlace de la última columna abre el archivo.
3. Borra de la hoja y de Drive los datos de las pruebas.

Google no documenta un límite de tamaño para las peticiones que recibe una aplicación web, por lo que la prueba con 5 MB es obligatoria antes de dar por buena la integración. En la instalación de producción (octubre de 2026) un PDF de 5 MB se guardó correctamente y la respuesta tardó unos 16 s, frente a un máximo de 25 s con archivo. Los límites oficiales que sí conocemos: 6 minutos por ejecución y 30 ejecuciones simultáneas por usuario ([cuotas de Apps Script](https://developers.google.com/apps-script/guides/services/quotas)). Si 5 MB resultara demasiado, la alternativa es la subida directa a un almacenamiento propio (ADR-0012, alternativa 2).

## Aviso por correo y tope diario de archivos

- **Aviso.** Con `NOTIFY_EMAIL` definido, cada cotización envía un correo a esa dirección con la referencia, el cliente, el teléfono, el correo, la ciudad, los productos y los enlaces a la hoja y al RUT en Drive. El campo "responder a" es el correo del cliente, así que ventas puede contestarle directamente. El aviso **no** incluye NIT, CIIU ni responsabilidades fiscales: esos datos quedan solo en la hoja. Si el envío falla o se agotó la cuota diaria de correo de la cuenta, el lead se registra igualmente y el motivo queda en el registro de ejecuciones, con la referencia y sin datos del cliente. La primera vez que se despliega una versión con este código, Google pide autorizar también el envío de correo.
- **Confirmación al cliente (ADR-0015).** Después del aviso al equipo, el script envía un correo a la dirección que escribió el cliente, con la referencia, los productos, la ciudad, el teléfono de la empresa y el enlace a la política de datos. "Responder a" es `NOTIFY_EMAIL`. **No** incluye NIT o cédula, CIIU, responsabilidades fiscales, el celular ni enlaces a la hoja o al RUT. Se omite sin avisar al cliente cuando: `CUSTOMER_ACK=off`; quedan 10 envíos de cuota o menos (reserva para los avisos al equipo); se alcanzó `MAX_ACK_PER_DAY`; o esa dirección ya recibió 3 en el día. Un fallo nunca pierde la solicitud ni el aviso al equipo, y el registro guarda solo la referencia. Cada cotización con confirmación gasta 2 de los 100 destinatarios diarios de una cuenta Gmail gratuita (1.500 en Google Workspace), por eso el techo práctico es de unas 50 al día. Como cambia el código, hay que volver a implementar y autorizar de nuevo el envío de correo: abre el editor, ejecuta una función que envíe correo y acepta los permisos.
- **Tope diario.** Cada archivo RUT son hasta 5 MB de los 15 GB gratuitos de la cuenta. Con `MAX_RUT_PER_DAY` alcanzado, la solicitud se registra en la hoja con "NO GUARDADO: límite diario de archivos" y el script responde `{"ok":true,"rutSaved":false}`; la función de Azure lo trata como no entregado y el cliente ve el aviso de enviar el RUT por WhatsApp. El contador se reinicia cada día (zona horaria del script). Ajusta el tope según el volumen real de solicitudes.

## Qué pasa ante un fallo

| Situación | Respuesta del receptor | Resultado para el cliente |
|---|---|---|
| Token incorrecto o ausente | `{"ok":false,"error":"unauthorized"}` | 200 con WhatsApp; `webhookDelivered: false`; advertencia en el registro |
| JSON o campos inválidos | `invalid_json` o `invalid_payload` | Igual |
| Error al guardar en Drive o en la hoja | `{"ok":false,"error":"internal"}` (el detalle queda en el registro de ejecuciones de Apps Script) | Igual; si adjuntó RUT, la pantalla le pide enviarlo por WhatsApp |
| Google tarda más de 25 s con archivo (8 s sin archivo) | La función corta la espera | Igual |
| Tope diario de archivos alcanzado | `{"ok":true,"rutSaved":false}` (la fila sí se guarda) | 200 con WhatsApp; `webhookDelivered: false`; la pantalla final pide enviar el RUT por WhatsApp |
| Referencia repetida | `{"ok":true,"duplicate":true}` | Entregado; no se duplica la fila |
| La página de error de Google (HTML) | No es JSON | Se cuenta como entregado: revisar el registro de ejecuciones si faltan filas |

El receptor guarda el archivo antes de escribir la fila, así que un fallo deja la solicitud sin fila y la función la reporta como no entregada. Si falla la escritura de la hoja después de guardar el archivo, puede quedar un archivo huérfano en la subcarpeta de esa referencia.

## Operación y seguridad

- **Cambios en el script.** Una Web App sirve la versión desplegada, no la guardada. Tras editar el código: **Implementar > Administrar implementaciones > editar > Versión nueva > Implementar**. La URL no cambia.
- **Permisos nuevos.** Si el código nuevo usa un servicio que el script no usaba antes (como `MailApp` para el aviso por correo), Google **no pide autorización al implementar**: la versión se despliega, pero esa parte falla en silencio y queda solo en el registro de ejecuciones (el lead sí se guarda). Para autorizar, crea una función temporal en el editor que use el servicio nuevo, ejecútala con **Ejecutar**, acepta los permisos (Configuración avanzada > Ir a… > Permitir) y vuelve a dejar el código tal como está en el repositorio. Ejecutar `doGet` o `doPost` no sirve: Google solo pide el permiso de lo que la función ejecutada usa. Luego comprueba con una cotización de prueba (la carpeta "Enviados" de la cuenta debe mostrar el aviso).
- **Rotar el token.** Cambia `WEBHOOK_TOKEN` en el script y `LEADS_WEBHOOK_URL` en Azure al mismo tiempo. Entre los dos cambios los leads no se registran (el cliente no lo nota).
- **Acceso.** La hoja y la carpeta contienen identificación y documentos tributarios: compártelas solo con facturación y revisa los permisos con regularidad.
- **Derechos de los titulares.** Para atender una solicitud de supresión, borra la fila de la hoja y la subcarpeta de la referencia en Drive (ver `/privacidad/`).
- **Monitoreo.** Revisa en Azure los registros de la función buscando advertencias `webhook not delivered`; cada una trae la referencia para reconciliar con el cliente.
- **Sin analizar el archivo.** Ni la función ni el script analizan el RUT en busca de malware (solo se comprueba que su contenido sea PDF, JPG o PNG). Descárgalo solo desde Drive y con el equipo protegido.
