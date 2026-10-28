/**
 * Receptor de leads del cotizador para Google Sheets y Google Drive (Google Apps Script).
 *
 * Uso: ver docs/integraciones/leads-webhook.md.
 * Propiedades del script (Configuración del proyecto > Propiedades del script):
 *   WEBHOOK_TOKEN   Valor secreto; debe coincidir con el parámetro ?token= de LEADS_WEBHOOK_URL.
 *   RUT_FOLDER_ID   Id de la carpeta de Drive donde se guardan los RUT adjuntos (carpeta privada,
 *                   compartida solo con el personal de facturación).
 * El script debe estar vinculado a la hoja de cálculo (Extensiones > Apps Script desde la hoja).
 */
var SHEET_NAME = 'Leads';
var HEADERS = [
  'Referencia', 'Fecha (UTC)', 'Productos', 'Ciudad', 'Fecha requerida', 'Entorno',
  'Notas del proyecto', 'Tipo de persona', 'Razón social', 'Nombre', 'NIT / cédula', 'DV',
  'CIIU', 'Responsabilidades fiscales', 'Correo', 'Celular', 'RUT (Drive)'
];

function doPost(e) {
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
  if (!lead || !lead.reference || !lead.request) {
    return json_({ ok: false, error: 'invalid_payload' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet_();
    if (alreadyStored_(sheet, lead.reference)) {
      return json_({ ok: true, duplicate: true });
    }
    var r = lead.request;
    var c = r.contact;
    var items = (r.items || []).map(function (it) {
      var dims = [it.widthMm, it.heightMm, it.depthMm].filter(Boolean).join('x');
      return it.quantity + ' x ' + (it.productSlug || it.category) +
        (dims ? ' (' + dims + ' mm)' : '') + (it.finish ? ' [' + it.finish + ']' : '') +
        (it.notes ? ' - ' + it.notes : '');
    }).join('\n');

    // Save the file first so that a failure leaves no row without its attachment.
    var rutUrl = r.rutFile ? saveRut_(lead.reference, r.rutFile) : '';

    sheet.appendRow([
      lead.reference, lead.createdAt, items,
      r.project.city, r.project.neededBy || '', r.project.environment || '', r.project.notes || '',
      c.personType, c.businessName || '', c.fullName, "'" + c.taxId, c.taxIdCheckDigit || '',
      "'" + c.ciiuCode, (c.fiscalResponsibilities || []).join(', '), c.email, "'" + c.phone, rutUrl
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// Stores the RUT in a private Drive folder, named after the quote reference. Returns the file URL.
function saveRut_(reference, rut) {
  var folderId = PropertiesService.getScriptProperties().getProperty('RUT_FOLDER_ID');
  if (!folderId) throw new Error('RUT_FOLDER_ID is not configured');
  var extension = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' }[rut.mimeType];
  if (!extension) throw new Error('Unsupported mime type');
  var blob = Utilities.newBlob(Utilities.base64Decode(rut.contentBase64), rut.mimeType, reference + '-RUT.' + extension);
  return DriveApp.getFolderById(folderId).createFile(blob).getUrl();
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

// The reference is unique per request, so a repeated delivery is ignored.
function alreadyStored_(sheet, reference) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var refs = sheet.getRange(2, 1, last - 1, 1).getValues();
  return refs.some(function (row) { return row[0] === reference; });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
