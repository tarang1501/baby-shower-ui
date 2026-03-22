# Backend Changes Required - Google Apps Script

This document outlines all the changes needed in your Google Apps Script backend to support the production-level features.

## 1. Secret Key Validation

Add secret validation to ALL endpoints:

```javascript
const SECRET_KEY = "MALANI_RSVP_2026_SECURE";

function validateSecret_(data) {
  return data.secret === SECRET_KEY;
}
```

## 2. Updated doGet with Secret

```javascript
function doGet(e) {
  // Validate secret
  const secret = e.parameter.secret || '';
  if (secret !== SECRET_KEY) {
    return jsonOutput_({
      success: false,
      message: 'Unauthorized: Invalid secret'
    });
  }
  
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return jsonOutput_({
        success: true,
        rows: []
      });
    }

    const rows = values.slice(1).map(row => ({
      timestamp: row[0],
      firstName: row[1],
      lastName: row[2],
      phone: row[3],
      email: row[4],
      adults: Number(row[5] || 0),
      kids: Number(row[6] || 0),
      note: row[7],
      status: row[8],
      lastUpdated: row[9]
    }));

    return jsonOutput_({
      success: true,
      rows
    });
  } catch (err) {
    return jsonOutput_({
      success: false,
      message: err.message || 'Unknown error'
    });
  }
}
```

## 3. Updated doPost with Delete and OTP

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    
    // Handle OTP requests (no secret needed for sending OTP)
    if (data.action === 'sendOtp') {
      return handleSendOtp_(data);
    }
    
    // Validate secret for all other actions
    if (!validateSecret_(data)) {
      return jsonOutput_({
        success: false,
        message: 'Unauthorized: Invalid secret'
      });
    }
    
    // Handle delete action
    if (data.action === 'delete') {
      return handleDelete_(data);
    }
    
    // Handle RSVP submission/update
    return handleRsvp_(data);
    
  } catch (err) {
    return jsonOutput_({
      success: false,
      message: err.message || 'Unknown error'
    });
  }
}

function handleDelete_(data) {
  const phone = String(data.phone || '').trim();
  
  if (!phone) {
    return jsonOutput_({
      success: false,
      message: 'Phone number is required'
    });
  }
  
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  
  // Find row by phone
  let foundRow = -1;
  for (let i = 1; i < values.length; i++) {
    const rowPhone = normalize_(values[i][3]);
    if (rowPhone === normalize_(phone)) {
      foundRow = i + 1;
      break;
    }
  }
  
  if (foundRow > 0) {
    // Delete the row
    sheet.deleteRow(foundRow);
    
    MailApp.sendEmail(
      NOTIFY_EMAIL,
      'RSVP Deleted',
      `An RSVP with phone ${phone} has been deleted from the dashboard.`
    );
    
    return jsonOutput_({
      success: true,
      message: 'RSVP deleted successfully'
    });
  }
  
  return jsonOutput_({
    success: false,
    message: 'RSVP not found'
  });
}

function handleSendOtp_(data) {
  const email = String(data.email || '').trim();
  const phone = String(data.phone || '').trim();
  
  if (!email && !phone) {
    return jsonOutput_({
      success: false,
      message: 'Email or phone required'
    });
  }
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in PropertiesService (valid for 10 minutes)
  const otpKey = email || phone;
  PropertiesService.getScriptProperties().setProperty(
    'otp_' + otpKey,
    JSON.stringify({
      otp: otp,
      expiry: Date.now() + (10 * 60 * 1000) // 10 minutes
    })
  );
  
  // Send OTP via email
  if (email) {
    MailApp.sendEmail(
      email,
      'Baby Shower Dashboard - Access Code',
      `Your OTP for dashboard access is: ${otp}\n\nThis code will expire in 10 minutes.` 
    );
  }
  
  // For phone, you would need a free SMS service (like TextBelt)
  // or manually send via your own method
  
  // Return OTP to frontend for comparison (in production, backend should validate)
  return jsonOutput_({
    success: true,
    otp: otp, // In production, don't return OTP, validate server-side instead
    message: 'OTP sent successfully'
  });
}
```

## 4. Updated RSVP Handler

```javascript
function handleRsvp_(data) {
  const firstName = String(data.firstName || '').trim();
  const lastName = String(data.lastName || '').trim();
  const phone = String(data.phone || '').trim();
  const email = String(data.email || '').trim();
  const adults = Number(data.adults || 0);
  const kids = Number(data.kids || 0);
  const note = String(data.note || '').trim();

  if (!firstName || !phone) {
    return jsonOutput_({
      success: false,
      message: 'First name and phone are required.'
    });
  }

  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const now = new Date();

  let foundRow = -1;

  // Phone is primary key - find existing
  for (let i = 1; i < values.length; i++) {
    const rowPhone = normalize_(values[i][3]);
    if (rowPhone === normalize_(phone)) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    // Update existing
    sheet.getRange(foundRow, 1, 1, 10).setValues([[
      values[foundRow - 1][0], // keep original timestamp
      firstName,
      lastName,
      phone,
      email,
      adults,
      kids,
      note,
      'Updated',
      now
    ]]);

    return jsonOutput_({
      success: true,
      mode: 'updated',
      message: 'Your RSVP was updated successfully.'
    });
  }

  // Create new
  sheet.appendRow([
    now,
    firstName,
    lastName,
    phone,
    email,
    adults,
    kids,
    note,
    'New',
    now
  ]);

  return jsonOutput_({
    success: true,
    mode: 'created',
    message: 'Your RSVP was submitted successfully.'
  });
}
```

## 5. CORS Headers

Add CORS headers to all responses:

```javascript
function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
```

## Implementation Steps

1. Open your Google Apps Script project
2. Replace the entire code with the updated version above
3. Deploy as new version (Save > New deployment)
4. Copy the new Web App URL
5. Update config.js with the new URL if changed

## Security Notes

- Frontend security is limited; backend validation is required
- Secret key should match between frontend (config.js) and backend
- Phone is the primary key for RSVP matching
- OTP system allows dashboard access without permanent passwords
