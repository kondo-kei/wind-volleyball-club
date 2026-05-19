// ═══════════════════════════════════════════════════════
// Google Apps Script — Wind VBC Forms → Sheets + Email
// ═══════════════════════════════════════════════════════
//
// Handles four form types, each written to its own sheet tab:
//   - Contact form         → "Contact Form" tab
//   - Tryout registration  → "Tryout Registrations" tab
//   - Clinic registration  → "Clinic Registrations" tab
//   - Open House RSVP      → "Open House June 2026" tab
//
// SETUP:
// 1. Open your Google Sheet
// 2. Create four tabs named exactly:
//      Contact Form
//      Tryout Registrations
//      Clinic Registrations
//      Open House June 2026
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
//    Open House June 2026 (A1–F1):
//      Timestamp | Parent Name | Email | Player Name | Birth Month | Birth Year
//
// 4. Go to Extensions > Apps Script, paste this file, save
// 5. Deploy as Web App (Execute as: Me, Who has access: Anyone)
// 6. Copy the Web App URL into all HTML files' GOOGLE_SCRIPT_URL constant
// ═══════════════════════════════════════════════════════

var NOTIFY_EMAIL = 'kondo.kei@windvbc.com';

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var formType = data.formType || 'contact';

  if (formType === 'tryoutRegistration') {
    return handleTryout(data);
  } else if (formType === 'clinicRegistration') {
    return handleClinic(data);
  } else if (formType === 'openHouseRSVP') {
    return handleOpenHouse(data);
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

  // ── Confirmation email to parent ──
  var parentFirstName = (data.parentName || '').split(' ')[0];
  var playerFirstName = (data.playerName || '').split(' ')[0];
  var confirmSubject = 'You\'re registered for Wind VC Tryouts!';
  var confirmPlain =
    'Hi ' + parentFirstName + ',\n\n' +
    'You\'re registered for Wind Volleyball Club tryouts — we look forward to seeing ' + playerFirstName + ' on the court!\n\n' +
    'Tryout Details\n' +
    'Dates:    July 18th & 19th\n' +
    'Time:     4:00 – 6:00 p.m.\n' +
    'Location: The Prairie School\n\n' +
    'Please arrive 15 minutes early to complete registration. Nets will be set up and balls will be available when you arrive — feel free to grab one and start warming up.\n\n' +
    'One thing to remember: bring a water bottle!\n\n' +
    'Questions? Don\'t hesitate to reach out — we\'re happy to help.\n\n' +
    'See you on the court!\n\n' +
    'Kei Kondo & Henry Yunker\n' +
    'Wind Volleyball Club';
  var confirmHtml =
    'Hi ' + parentFirstName + ',<br><br>' +
    'You\'re registered for Wind Volleyball Club tryouts — we look forward to seeing ' + playerFirstName + ' on the court!<br><br>' +
    '<strong>Tryout Details</strong><br>' +
    'Dates:&nbsp;&nbsp;&nbsp;&nbsp;July 18th &amp; 19th<br>' +
    'Time:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4:00 – 6:00 p.m.<br>' +
    'Location: The Prairie School<br><br>' +
    'Please arrive 15 minutes early to complete registration. Nets will be set up and balls will be available when you arrive — feel free to grab one and start warming up.<br><br>' +
    'One thing to remember: <strong>bring a water bottle!</strong><br><br>' +
    'Questions? Don\'t hesitate to reach out — we\'re happy to help.<br><br>' +
    'See you on the court!<br><br>' +
    'Kei Kondo &amp; Henry Yunker<br>' +
    'Wind Volleyball Club';

  GmailApp.sendEmail(data.parentEmail, confirmSubject, confirmPlain, { htmlBody: confirmHtml, name: 'Kei Kondo | Wind Volleyball Club' });
  // ─────────────────────────────────────

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

// ── Open House RSVP ───────────────────────────────────────
function handleOpenHouse(data) {
  var sheet = getSheet('Open House June 2026');
  var timestamp = new Date();

  sheet.appendRow([
    timestamp,
    data.parentName || '',
    data.email      || '',
    data.playerName || '',
    data.birthMonth || '',
    data.birthYear  || '',
  ]);

  var subject = 'New Open House RSVP – Wind VBC: ' + (data.parentName || '');
  var body =
    'A new Open House RSVP was submitted.\n\n' +
    'Timestamp:    ' + timestamp.toLocaleString() + '\n' +
    'Parent Name:  ' + (data.parentName || '') + '\n' +
    'Email:        ' + (data.email || '') + '\n\n' +
    'Player Name:  ' + (data.playerName || '') + '\n' +
    'Birth Month:  ' + (data.birthMonth || '') + '\n' +
    'Birth Year:   ' + (data.birthYear || '') + '\n\n' +
    '──────────────────────────────────────\n' +
    'Sent automatically by the Wind VBC Open House RSVP form.';

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
