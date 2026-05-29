/**
 * CFK Academy — Google Sheets Registration Handler
 * ─────────────────────────────────────────────────
 * Deploy sebagai Web App:
 *   Execute as  : Me
 *   Who can access : Anyone
 *
 * Selepas deploy, salin URL dan tampal ke dalam
 * src/daftar.html pada baris: const APPS_SCRIPT_URL = '...'
 */

var SPREADSHEET_ID = '18wOTckf0aBxCuto8aD4m2Dsk-cmMTgQLi7Wu2q-K8gA';
var SHEET_GID      = 1225745916;    // GID tab yang dikehendaki
var SHEET_NAME_FALLBACK = 'Pendaftaran'; // nama tab kalau GID tak jumpa

/* ── Column headers (akan ditulis pada Row 1 jika sheet kosong) ── */
var HEADERS = [
  'Timestamp',
  'Nama Penjaga',
  'No. Telefon',
  'E-mel',
  'Nama Pelajar',
  'Umur',
  'Jantina',
  'Cawangan',
  'Tahap Catur',
  'Pakej',
  'Mesej',
  'Sumber'
];

/* ══════════════════════════════════════════════════════════════ */

function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : '{}';
    var data = JSON.parse(raw);

    var sheet = getTargetSheet();
    ensureHeaders(sheet);

    sheet.appendRow([
      data.timestamp    || new Date().toLocaleString('ms-MY'),
      data.nama_penjaga || '',
      data.telefon      || '',
      data.email        || '',
      data.nama_pelajar || '',
      data.umur         || '',
      data.jantina      || '',
      data.cawangan     || '',
      data.tahap_catur  || '',
      data.pakej        || '',
      data.mesej        || '',
      data.sumber       || 'Web Form'
    ]);

    return jsonResponse({ status: 'success', message: 'Pendaftaran berjaya disimpan.' });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

/* Juga sokong GET (untuk test URL dalam browser) */
function doGet(e) {
  return jsonResponse({ status: 'ok', message: 'CFK Academy Registration API is running.' });
}

/* ── Helpers ── */

function getTargetSheet() {
  var ss     = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets();

  /* Cuba cari mengikut GID */
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === SHEET_GID) return sheets[i];
  }

  /* Kalau tak jumpa GID, cari mengikut nama */
  var byName = ss.getSheetByName(SHEET_NAME_FALLBACK);
  if (byName) return byName;

  /* Kalau masih tak ada, buat sheet baru */
  return ss.insertSheet(SHEET_NAME_FALLBACK);
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
         .setFontWeight('bold')
         .setBackground('#1e3a5f')
         .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
