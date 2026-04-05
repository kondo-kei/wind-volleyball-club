// ═══════════════════════════════════════════════════════
// Google Apps Script — Wind VBC Contact Form → Sheet
// ═══════════════════════════════════════════════════════
//
// SETUP:
// 1. Create a Google Sheet
// 2. Add these headers in Row 1 (cells A1 through G1):
//    Timestamp | Parent Name | Email | Phone | Player Name | Birth Month/Year | Message
//
// 3. In the Sheet, go to Extensions > Apps Script
// 4. Delete any existing code and paste this entire file
// 5. Click the floppy disk icon (Save)
// 6. Click Deploy > New deployment
//    - Click the gear icon next to "Select type" → choose "Web app"
//    - Description: "Wind VBC Contact Form"
//    - Execute as: Me (your Google account)
//    - Who has access: Anyone
//    - Click Deploy
// 7. Authorize the app when prompted (click through the "unsafe" warning — it's your own script)
// 8. Copy the Web App URL
// 9. Paste that URL into contact.html where it says YOUR_GOOGLE_APPS_SCRIPT_URL_HERE
//
// That's it! Form submissions will now appear as rows in your sheet.
// ═══════════════════════════════════════════════════════

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),              // Timestamp
    data.parentName || '',   // Parent Name
    data.email || '',        // Email
    data.phone || '',        // Phone
    data.playerName || '',   // Player Name
    data.birthMonthYear || '',// Birth Month/Year
    data.message || ''       // Message
  ]);

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
