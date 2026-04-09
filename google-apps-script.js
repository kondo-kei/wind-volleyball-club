// ═══════════════════════════════════════════════════════
// Google Apps Script — Wind VBC Contact Form → Sheet + Email
// ═══════════════════════════════════════════════════════
//
// SETUP:
// 1. Create a Google Sheet
// 2. Add these headers in Row 1 (cells A1 through G1):
//    Timestamp | Parent Name | Email | Phone | Player Name | Birth Month/Year | Message
//
// 3. In the Sheet, go to Extensions > Apps Script
// 4. Delete any existing code and paste this entire file
// 5. Set NOTIFY_EMAIL below to the address you want notifications sent to
// 6. Click the floppy disk icon (Save)
// 7. Click Deploy > New deployment
//    - Click the gear icon next to "Select type" → choose "Web app"
//    - Description: "Wind VBC Contact Form"
//    - Execute as: Me (your Google account)
//    - Who has access: Anyone
//    - Click Deploy
// 8. Authorize the app when prompted (click through the "unsafe" warning — it's your own script)
//    Note: the Gmail permission is required to send notification emails
// 9. Copy the Web App URL
// 10. Paste that URL into index.html in the fetch() call inside the <script> block
//
// That's it! Form submissions will appear as rows in your sheet AND trigger an email.
// ═══════════════════════════════════════════════════════

// ── Set this to the email address that should receive notifications ──
var NOTIFY_EMAIL = 'kondo.kei@windvbc.com';

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var data = JSON.parse(e.postData.contents);

  var timestamp   = new Date();
  var parentName  = data.parentName     || '';
  var email       = data.email          || '';
  var phone       = data.phone          || '';
  var playerName  = data.playerName     || '';
  var birthMonth  = data.birthMonthYear || '';
  var message     = data.message        || '';

  sheet.appendRow([timestamp, parentName, email, phone, playerName, birthMonth, message]);

  // ── Send notification email ──────────────────────────
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
  // ────────────────────────────────────────────────────

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle GET requests (for testing in browser)
function doGet() {
  return ContentService
    .createTextOutput('Wind VBC contact form endpoint is active.')
    .setMimeType(ContentService.MimeType.TEXT);
}
