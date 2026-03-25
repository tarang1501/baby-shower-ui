/**
 * Baby Shower RSVP System - Google Apps Script
 * 
 * Sheet Structure (Headers in Row 1):
 * Column A: Timestamp
 * Column B: First Name
 * Column C: Last Name
 * Column D: Phone
 * Column E: Email
 * Column F: Are Attending (Yes/No)
 * Column G: Adults
 * Column H: Kids
 * Column I: Note
 * Column J: Total Attending Persons
 * Column K: Status (New/Updated)
 * 
 * Setup Instructions:
 * 1. Create a new Google Sheet
 * 2. Add headers in row 1: Timestamp | First Name | Last Name | Phone | Email | Are Attending | Adults | Kids | Note | Total Attending Persons | Status
 * 3. Open Extensions > Apps Script
 * 4. Delete the default function and paste this entire code
 * 5. Set SCRIPT_URL in your config.js to the deployed web app URL
 * 6. Set ADMIN_EMAIL below to your email address
 * 7. Set DASHBOARD_PASSWORD for admin access
 * 8. Deploy as web app (Execute as: Me, Access: Anyone)
 */

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const CONFIG = {
  SHEET_NAME: 'RSVPs',  // Name of the sheet tab
  SECRET_KEY: 'MALANI_RSVP_2026_SECURE',  // Must match config.js SECRET_KEY
  ADMIN_EMAIL: 'tarangmmalani@gmail.com',  // Admin notification email
  DASHBOARD_PASSWORD: 'malani2026',  // Dashboard access password
  EVENT_DETAILS: {
    title: 'Baby Shower for Tarang & Vidhi',
    host: 'Malani Family',
    date: 'June 28, 2026',
    time: '9:30 AM',
    venue: 'Malani Residence'
  }
};

// ============================================
// WEB APP ENTRY POINT
// ============================================
function doGet(e) {
  try {
    // Validate secret
    const secret = e.parameter.secret;
    if (secret !== CONFIG.SECRET_KEY) {
      return jsonResponse({ success: false, message: 'Unauthorized' });
    }

    // Get all RSVPs
    const sheet = getSheet();
    if (!sheet) {
      return jsonResponse({ success: false, message: 'Sheet not found' });
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = [];

    // Start from row 2 (skip headers)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) {  // Has timestamp
        rows.push({
          timestamp: row[0],
          firstName: row[1] || '',
          lastName: row[2] || '',
          phone: row[3] || '',
          email: row[4] || '',
          attending: row[5] || 'No',
          adults: row[6] || 0,
          kids: row[7] || 0,
          note: row[8] || '',
          total: row[9] || 0,
          status: row[10] || 'New'
        });
      }
    }

    return jsonResponse({ success: true, rows: rows });
  } catch (error) {
    return jsonResponse({ success: false, message: 'Error: ' + error.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validate secret
    if (data.secret !== CONFIG.SECRET_KEY) {
      return jsonResponse({ success: false, message: 'Unauthorized' });
    }

    // Route to appropriate handler
    if (data.action === 'delete') {
      return deleteRSVP(data.phone);
    }
    
    if (data.action === 'login') {
      return validateLogin(data.password);
    }

    // Default: submit RSVP
    return submitRSVP(data);
  } catch (error) {
    return jsonResponse({ success: false, message: 'Error: ' + error.toString() });
  }
}

// ============================================
// RSVP SUBMISSION
// ============================================
function submitRSVP(data) {
  try {
    const sheet = getSheet();
    if (!sheet) {
      return jsonResponse({ success: false, message: 'Sheet not found' });
    }

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.phone || !data.attending) {
      return jsonResponse({ success: false, message: 'Missing required fields' });
    }

    // Calculate totals based on attendance
    const attending = data.attending === 'Yes';
    const adults = attending ? (parseInt(data.adults) || 0) : 0;
    const kids = attending ? (parseInt(data.kids) || 0) : 0;
    const total = attending ? (adults + kids) : 0;

    // Check if this is an update (phone already exists)
    const existingRow = findRowByPhone(sheet, data.phone);
    const isUpdate = existingRow > 0;
    const timestamp = isUpdate ? sheet.getRange(existingRow, 1).getValue() : new Date();

    // Prepare row data
    const rowData = [
      timestamp,           // A: Timestamp
      data.firstName,      // B: First Name
      data.lastName,       // C: Last Name
      data.phone,          // D: Phone
      data.email || '',    // E: Email
      data.attending,      // F: Are Attending
      adults,              // G: Adults
      kids,                // H: Kids
      data.note || '',     // I: Note
      total,               // J: Total Attending Persons
      isUpdate ? 'Updated' : 'New'  // K: Status
    ];

    if (isUpdate) {
      // Update existing row
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Append new row
      sheet.appendRow(rowData);
    }

    // Send emails
    sendAdminNotification({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      attending: data.attending,
      adults: adults,
      kids: kids,
      total: total,
      note: data.note,
      isUpdate: isUpdate
    });

    // Send guest confirmation if email provided
    if (data.email && data.email.trim()) {
      sendGuestConfirmation({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        attending: data.attending,
        adults: adults,
        kids: kids,
        total: total
      });
    }

    return jsonResponse({
      success: true,
      message: isUpdate ? 'Your RSVP has been updated!' : 'Thank you! Your RSVP has been received.'
    });

  } catch (error) {
    return jsonResponse({ success: false, message: 'Error: ' + error.toString() });
  }
}

// ============================================
// DELETE RSVP
// ============================================
function deleteRSVP(phone) {
  try {
    const sheet = getSheet();
    if (!sheet) {
      return jsonResponse({ success: false, message: 'Sheet not found' });
    }

    const rowIndex = findRowByPhone(sheet, phone);
    if (rowIndex === -1) {
      return jsonResponse({ success: false, message: 'RSVP not found' });
    }

    sheet.deleteRow(rowIndex);
    return jsonResponse({ success: true, message: 'RSVP deleted' });
  } catch (error) {
    return jsonResponse({ success: false, message: 'Error: ' + error.toString() });
  }
}

// ============================================
// LOGIN VALIDATION
// ============================================
function validateLogin(password) {
  if (password === CONFIG.DASHBOARD_PASSWORD) {
    return jsonResponse({ success: true, message: 'Login successful' });
  }
  return jsonResponse({ success: false, message: 'Incorrect password' });
}

// ============================================
// EMAIL FUNCTIONS
// ============================================
function sendAdminNotification(data) {
  try {
    const attendingText = data.attending === 'Yes' ? 'Yes - Attending' : 'No - Not Attending';
    const subject = `Baby Shower RSVP: ${data.firstName} ${data.lastName} - ${attendingText}`;

    const body = `
New RSVP ${data.isUpdate ? 'Updated' : 'Received'}!

GUEST DETAILS:
==============
Name: ${data.firstName} ${data.lastName}
Phone: ${data.phone}
Email: ${data.email || 'Not provided'}

ATTENDANCE:
===========
Attending: ${attendingText}
Adults: ${data.adults}
Kids: ${data.kids}
Total Attending Persons: ${data.total}

MESSAGE:
========
${data.note || 'No message'}

${data.isUpdate ? 'Note: This was an update to an existing RSVP' : ''}
    `.trim();

    GmailApp.sendEmail(CONFIG.ADMIN_EMAIL, subject, body);
  } catch (error) {
    console.error('Error sending admin notification: ' + error.toString());
  }
}

function sendGuestConfirmation(data) {
  try {
    const attendingYes = data.attending === 'Yes';
    const subject = attendingYes
      ? `Confirmed: You're attending ${CONFIG.EVENT_DETAILS.title}!`
      : `Recorded: You can't make it to ${CONFIG.EVENT_DETAILS.title}`;

    let body;
    if (attendingYes) {
      body = `
Dear ${data.firstName} ${data.lastName},

Thank you for your RSVP! We're excited to celebrate with you.

YOUR RSVP DETAILS:
==================
Attending: Yes
Adults: ${data.adults}
Kids: ${data.kids}
Total Persons: ${data.total}

EVENT DETAILS:
==============
${CONFIG.EVENT_DETAILS.title}
Hosted by ${CONFIG.EVENT_DETAILS.host}
Date: ${CONFIG.EVENT_DETAILS.date}
Time: ${CONFIG.EVENT_DETAILS.time}

We can't wait to see you there!

With love,
Malani Family
      `.trim();
    } else {
      body = `
Dear ${data.firstName} ${data.lastName},

Thank you for letting us know. We've recorded that you won't be able to make it to the celebration.

YOUR RSVP DETAILS:
==================
Attending: No

EVENT DETAILS:
==============
${CONFIG.EVENT_DETAILS.title}
Hosted by ${CONFIG.EVENT_DETAILS.host}
Date: ${CONFIG.EVENT_DETAILS.date}
Time: ${CONFIG.EVENT_DETAILS.time}

We'll miss you, but we understand. Thank you for your response!

With love,
Malani Family
      `.trim();
    }

    GmailApp.sendEmail(data.email, subject, body);
  } catch (error) {
    console.error('Error sending guest confirmation: ' + error.toString());
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    // Create sheet if it doesn't exist
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
    // Add headers
    const headers = [
      'Timestamp', 'First Name', 'Last Name', 'Phone', 'Email',
      'Are Attending', 'Adults', 'Kids', 'Note', 'Total Attending Persons', 'Status'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    // Format header row
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#8B9A8B')
      .setFontColor('white');
  }
  
  return sheet;
}

function findRowByPhone(sheet, phone) {
  const data = sheet.getDataRange().getValues();
  const normalizedPhone = phone.replace(/\D/g, '');
  
  for (let i = 1; i < data.length; i++) {
    const rowPhone = (data[i][3] || '').replace(/\D/g, '');
    if (rowPhone === normalizedPhone) {
      return i + 1;  // Return 1-based row index
    }
  }
  
  return -1;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
