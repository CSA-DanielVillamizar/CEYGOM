/**
 * Receptor de leads del cotizador para Google Sheets y Google Drive (Google Apps Script).
 *
 * Guía de instalación: docs/integraciones/google-apps-script.md
 *
 * Propiedades del script (Configuración del proyecto > Propiedades del script):
 *   WEBHOOK_TOKEN   Valor secreto; debe coincidir con el parámetro ?token= de LEADS_WEBHOOK_URL.
 *   RUT_FOLDER_ID   Id de la carpeta de Drive donde se crea una subcarpeta por cotización. Debe ser una
 *                   carpeta privada, compartida solo con el personal de facturación.
 *   NOTIFY_EMAIL    (opcional) Correo que recibe un aviso por cada cotización. Si falta, no se envía aviso.
 *   MAX_RUT_PER_DAY (opcional, 100 por defecto) Tope diario de archivos RUT guardados en Drive. Pasado el
 *                   tope la solicitud se registra igualmente, pero sin archivo.
 * El script debe estar vinculado a la hoja de cálculo (Extensiones > Apps Script desde la hoja).
 *
 * Apps Script no permite fijar el código HTTP de la respuesta, así que todo resultado se informa en el cuerpo
 * JSON: { ok: true } o { ok: false, error: "<código>" }. Si el lead trae RUT y no se pudo guardar, responde
 * { ok: true, rutSaved: false }. La Azure Function trata ambos casos como no entregado (el cliente verá el
 * aviso de enviar el RUT por WhatsApp).
 */
var SHEET_NAME = 'Leads';
var DEFAULT_MAX_RUT_PER_DAY = 100;
var HEADERS = [
  'Referencia', 'Fecha (UTC)', 'Productos', 'Ciudad', 'Fecha requerida', 'Entorno',
  'Notas del proyecto', 'Tipo de persona', 'Razón social', 'Nombre', 'NIT / cédula', 'DV',
  'CIIU', 'Responsabilidades fiscales', 'Correo', 'Celular', 'RUT (Drive)'
];

// Permite comprobar en el navegador que el despliegue responde. No devuelve ningún dato.
function doGet() {
  return json_({ ok: true, service: 'ceygom-leads' });
}

function doPost(e) {
  var reference = '';
  try {
    var expected = PropertiesService.getScriptProperties().getProperty('WEBHOOK_TOKEN');
    if (!expected || !e || !e.parameter || e.parameter.token !== expected) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    var lead;
    try {
      lead = JSON.parse(e.postData.contents);
    } catch (err) {
      return json_({ ok: false, error: 'invalid_json' });
    }
    if (!lead || !/^COT-\d{4}-[A-Z0-9]{6}$/.test(lead.reference || '') || !lead.request || !lead.request.contact) {
      return json_({ ok: false, error: 'invalid_payload' });
    }
    reference = lead.reference;

    var rutUrl = '';
    var rutSaved = true;
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getSheet_();
      if (alreadyStored_(sheet, reference)) {
        return json_({ ok: true, duplicate: true });
      }
      var r = lead.request;
      var c = r.contact;
      var items = (r.items || []).map(function (it) {
        var dims = [it.widthMm, it.heightMm, it.depthMm].filter(Boolean).join('x');
        return it.quantity + ' x ' + (it.productSlug || it.category) + (it.reference ? ' (' + it.reference + ')' : '') +
          (dims ? ' (' + dims + ' mm)' : '') + (it.finish ? ' [' + it.finish + ']' : '') +
          (it.notes ? ' - ' + it.notes : '');
      }).join('\n');

      // Primero el archivo: si falla, no queda una fila sin su RUT y la Azure Function lo ve como no entregado.
      // Con el tope diario alcanzado la solicitud se registra sin archivo, para proteger la cuota de Drive.
      if (r.rutFile) {
        if (rutQuotaLeft_()) {
          rutUrl = saveRut_(reference, r.rutFile);
          countRut_();
        } else {
          rutSaved = false;
          rutUrl = 'NO GUARDADO: límite diario de archivos';
          console.error('Lead ' + reference + ': daily RUT limit reached, file not stored');
        }
      }

      sheet.appendRow([
        reference, lead.createdAt, items,
        r.project.city, r.project.neededBy || '', r.project.environment || '', r.project.notes || '',
        c.personType, c.businessName || '', c.fullName, "'" + c.taxId, c.taxIdCheckDigit || '',
        "'" + c.ciiuCode, (c.fiscalResponsibilities || []).join(', '), c.email, "'" + c.phone, rutUrl
      ]);
    } finally {
      lock.releaseLock();
    }
    // Fuera del candado: enviar el correo es lento y un fallo suyo nunca debe perder el lead.
    notify_(lead, rutUrl, rutSaved);
    return json_({ ok: true, rutSaved: rutSaved });
  } catch (err) {
    // Solo la referencia y el mensaje del error: nunca datos del cliente.
    console.error('Lead ' + (reference || '?') + ' not stored: ' + (err && err.message));
    return json_({ ok: false, error: 'internal' });
  }
}

// Guarda el RUT en una subcarpeta privada con el nombre de la cotización. Devuelve la URL del archivo.
function saveRut_(reference, rut) {
  var parentId = PropertiesService.getScriptProperties().getProperty('RUT_FOLDER_ID');
  if (!parentId) throw new Error('RUT_FOLDER_ID is not configured');
  var extension = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }[rut.mimeType];
  if (!extension) throw new Error('Unsupported mime type');

  var parent = DriveApp.getFolderById(parentId);
  var existing = parent.getFoldersByName(reference);
  var folder = existing.hasNext() ? existing.next() : parent.createFolder(reference);
  var blob = Utilities.newBlob(Utilities.base64Decode(rut.contentBase64), rut.mimeType, reference + '-RUT.' + extension);
  return folder.createFile(blob).getUrl();
}

// Archivos RUT guardados hoy (zona horaria del script). Se llama con el candado tomado.
function rutCounter_() {
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var raw = PropertiesService.getScriptProperties().getProperty('RUT_COUNT');
  var saved = raw ? JSON.parse(raw) : null;
  return saved && saved.date === today ? saved : { date: today, count: 0 };
}

function rutQuotaLeft_() {
  var max = parseInt(PropertiesService.getScriptProperties().getProperty('MAX_RUT_PER_DAY'), 10);
  return rutCounter_().count < (max > 0 ? max : DEFAULT_MAX_RUT_PER_DAY);
}

function countRut_() {
  var c = rutCounter_();
  c.count += 1;
  PropertiesService.getScriptProperties().setProperty('RUT_COUNT', JSON.stringify(c));
}

// Aviso por correo a NOTIFY_EMAIL. No incluye NIT, CIIU ni responsabilidades fiscales: esos datos quedan en la
// hoja. El campo "responder a" es el correo del cliente, para contestarle directamente.
function notify_(lead, rutUrl, rutSaved) {
  try {
    var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
    if (!to) return;
    if (MailApp.getRemainingDailyQuota() < 1) {
      console.error('Lead ' + lead.reference + ': daily email quota exhausted, no notification sent');
      return;
    }
    var r = lead.request;
    var c = r.contact;
    var who = (c.businessName ? c.businessName + ' - ' : '') + c.fullName;
    var items = (r.items || []).map(function (it) {
      return '- ' + it.quantity + ' x ' + (it.productSlug || it.category) + (it.reference ? ' (' + it.reference + ')' : '') + (it.notes ? ' - ' + it.notes : '');
    }).join('\n');
    var rutLine = !r.rutFile ? 'No adjuntó RUT.' : rutSaved ? 'RUT guardado en Drive: ' + rutUrl : 'El RUT NO se guardó (límite diario): pídeselo al cliente.';
    var body = [
      'Nueva solicitud de cotización ' + lead.reference,
      '',
      'Cliente: ' + who,
      'Teléfono: ' + c.phone,
      'Correo: ' + c.email,
      'Ciudad: ' + r.project.city + (r.project.neededBy ? ' - requerida para el ' + r.project.neededBy : ''),
      '',
      'Productos:',
      items,
      r.project.notes ? '\nNotas: ' + r.project.notes : '',
      '',
      rutLine,
      'Todos los datos (incluida la información fiscal): ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
    ].join('\n');
    MailApp.sendEmail({
      to: to,
      replyTo: c.email,
      name: 'Cotizador Ceygom',
      subject: ('Nueva cotización ' + lead.reference + ' - ' + who).replace(/[\r\n]+/g, ' ').slice(0, 120),
      body: body
    });
  } catch (err) {
    // Solo la referencia y el mensaje del error: nunca datos del cliente.
    console.error('Lead ' + lead.reference + ': notification failed: ' + (err && err.message));
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// La referencia es única por solicitud, así que una entrega repetida se ignora.
function alreadyStored_(sheet, reference) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var refs = sheet.getRange(2, 1, last - 1, 1).getValues();
  return refs.some(function (row) { return row[0] === reference; });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
