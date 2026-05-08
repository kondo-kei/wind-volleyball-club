// ═══════════════════════════════════════════════════════
// Google Apps Script — Wind VBC Forms → Sheets + Email
// ═══════════════════════════════════════════════════════
//
// Handles three form types, each written to its own sheet tab:
//   - Contact form         → "Contact Form" tab
//   - Tryout registration  → "Tryout Registrations" tab
//   - Clinic registration  → "Clinic Registrations" tab
//
// SETUP:
// 1. Open your Google Sheet
// 2. Create three tabs named exactly:
//      Contact Form
//      Tryout Registrations
//      Clinic Registrations
//
// 3. Add these headers in Row 1 of each tab:
//
//    Contact Form (A1–G1):
//      Timestamp | Parent Name | Email | Phone | Player Name | Birth Month/Year | Message
//
//    Tryout Registrations (A1–N1):
//      Timestamp | Parent Name | Phone | Email | Player Name | Birthdate | School | Grade | Street | City | State | ZIP | Positions | Prior Club | USAV ID
//
//    Clinic Registrations (A1–M1):
//      Timestamp | Parent Name | Phone | Email | Player Name | School | Grade | USAV ID | Street | City | State | ZIP | Positions | Prior Club
//
// 4. Go to Extensions > Apps Script, paste this file, save
// 5. Deploy as Web App (Execute as: Me, Who has access: Anyone)
// 6. Copy the Web App URL into all three HTML files' GOOGLE_SCRIPT_URL constant
// ═══════════════════════════════════════════════════════

var NOTIFY_EMAIL = 'kondo.kei@windvbc.com';

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var formType = data.formType || 'contact';

  // ── DEBUG: log every incoming payload to a Debug sheet ──
  var debugSheet = getSheet('Debug Log');
  debugSheet.appendRow([new Date(), formType, e.postData.contents]);
  // ────────────────────────────────────────────────────────

  if (formType === 'tryoutRegistration') {
    return handleTryout(data);
  } else if (formType === 'clinicRegistration') {
    return handleClinic(data);
  } else {
    return handleContact(data);
  }
}

// ── Contact Form ─────────────────────────────────────────
function handleContact(data) {
  var sheet = getSheet('Contact Form');
  var timestamp  = new Date();
  var parentName = data.parentName     || '';
  var email      = data.email          || '';
  var phone      = data.phone          || '';
  var playerName = data.playerName     || '';
  var birthMonth = data.birthMonthYear || '';
  var message    = data.message        || '';

  sheet.appendRow([timestamp, parentName, email, phone, playerName, birthMonth, message]);

  var subject = 'New Contact Request – Wind VBC: ' + parentName;
  var body =
    'A new contact request was submitted on the Wind VBC website.\n\n' +
    'Timestamp:        ' + timestamp.toLocaleString() + '\n' +
    'Parent Name:      ' + parentName + '\n' +
    'Email:            ' + email + '\n' +
    'Phone:            ' + phone + '\n' +
    'Player Name:      ' + playerName + '\n' +
    'Birth Month/Year: ' + birthMonth + '\n\n' +
    'Message:\n' + message + '\n\n' +
    '──────────────────────────────────────\n' +
    'Sent automatically by the Wind VBC contact form.';

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  return ok();
}

// ── Tryout Registration ───────────────────────────────────
function handleTryout(data) {
  var sheet = getSheet('Tryout Registrations');
  var timestamp = new Date();

  sheet.appendRow([
    timestamp,
    data.parentName      || '',
    data.parentPhone     || '',
    data.parentEmail     || '',
    data.playerName      || '',
    data.playerBirthdate || '',
    data.playerSchool    || '',
    data.playerGrade     || '',
    data.street          || '',
    data.city            || '',
    data.state           || '',
    data.zip             || '',
    data.positions       || '',
    data.priorClub       || '',
    data.usavId          || '',
  ]);

  var subject = 'New Tryout Registration – Wind VBC: ' + (data.playerName || '');
  var body =
    'A new tryout registration was submitted.\n\n' +
    'Timestamp:       ' + timestamp.toLocaleString() + '\n' +
    'Parent Name:     ' + (data.parentName || '') + '\n' +
    'Phone:           ' + (data.parentPhone || '') + '\n' +
    'Email:           ' + (data.parentEmail || '') + '\n\n' +
    'Player Name:     ' + (data.playerName || '') + '\n' +
    'Birthdate:       ' + (data.playerBirthdate || '') + '\n' +
    'School:          ' + (data.playerSchool || '') + '\n' +
    'Grade (2026-27): ' + (data.playerGrade || '') + '\n' +
    'Position(s):     ' + (data.positions || '') + '\n' +
    'Prior Club:      ' + (data.priorClub || '') + '\n' +
    'USAV ID:         ' + (data.usavId || '') + '\n\n' +
    'Address:         ' + (data.street || '') + ', ' + (data.city || '') + ', ' + (data.state || '') + ' ' + (data.zip || '') + '\n\n' +
    '──────────────────────────────────────\n' +
    'Sent automatically by the Wind VBC tryout registration form.';

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  return ok();
}

// ── Clinic Registration ───────────────────────────────────
function handleClinic(data) {
  var sheet = getSheet('Clinic Registrations');
  var timestamp = new Date();

  sheet.appendRow([
    timestamp,
    data.parentName   || '',
    data.parentPhone  || '',
    data.parentEmail  || '',
    data.playerName   || '',
    data.playerSchool || '',
    data.playerGrade  || '',
    data.usavId       || '',
    data.street       || '',
    data.city         || '',
    data.state        || '',
    data.zip          || '',
    data.positions    || '',
    data.priorClub    || '',
  ]);

  var subject = 'New Clinic Registration – Wind VBC: ' + (data.playerName || '');
  var body =
    'A new Pre-Tryout Tune-Up Clinic registration was submitted.\n\n' +
    'Timestamp:       ' + timestamp.toLocaleString() + '\n' +
    'Parent Name:     ' + (data.parentName || '') + '\n' +
    'Phone:           ' + (data.parentPhone || '') + '\n' +
    'Email:           ' + (data.parentEmail || '') + '\n\n' +
    'Player Name:     ' + (data.playerName || '') + '\n' +
    'School:          ' + (data.playerSchool || '') + '\n' +
    'Grade (2026-27): ' + (data.playerGrade || '') + '\n' +
    'Position(s):     ' + (data.positions || '') + '\n' +
    'Prior Club:      ' + (data.priorClub || '') + '\n' +
    'USAV ID:         ' + (data.usavId || '') + '\n\n' +
    'Address:         ' + (data.street || '') + ', ' + (data.city || '') + ', ' + (data.state || '') + ' ' + (data.zip || '') + '\n\n' +
    '──────────────────────────────────────\n' +
    'Sent automatically by the Wind VBC clinic registration form.';

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  return ok();
}

// ── Helpers ───────────────────────────────────────────────
function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function ok() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput('Wind VBC form endpoint is active.')
    .setMimeType(ContentService.MimeType.TEXT);
}
