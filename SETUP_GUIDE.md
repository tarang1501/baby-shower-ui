# Baby Shower RSVP - Google Apps Script Setup Guide

## Modified Files
1. `index.html` - Added "Are you attending?" Yes/No radio buttons
2. `assets/css/styles.css` - Added attendance option styles
3. `assets/js/app.js` - Added attendance handling logic
4. `dashboard/index.html` - Added attendance stats and filter
5. `assets/js/dashboard.js` - Added attendance statistics and filtering
6. `google-apps-script/Code.gs` - Complete Apps Script code

## Google Sheet Headers (Row 1)
| Column | Header |
|--------|--------|
| A | Timestamp |
| B | First Name |
| C | Last Name |
| D | Phone |
| E | Email |
| F | Are Attending |
| G | Adults |
| H | Kids |
| I | Note |
| J | Total Attending Persons |
| K | Status |

## Manual Setup Steps

### 1. Create Google Sheet
1. Go to https://sheets.new
2. Rename sheet to "RSVPs"
3. Add headers in row 1 (see table above)

### 2. Add Apps Script
1. Open Extensions > Apps Script
2. Delete default `myFunction`
3. Copy entire code from `google-apps-script/Code.gs`
4. Update CONFIG section:
   - `ADMIN_EMAIL`: Your email for notifications
   - `DASHBOARD_PASSWORD`: Password for dashboard access

### 3. Deploy Web App
1. Click Deploy > New deployment
2. Select type: Web app
3. Execute as: Me
4. Access: Anyone
5. Copy the Web App URL

### 4. Update Frontend Config
1. Open `assets/js/config.js`
2. Update `SCRIPT_URL` with your Apps Script URL

### 5. Enable Gmail (for email notifications)
1. In Apps Script, click Services (+ icon)
2. Add Gmail API
3. Authorize when prompted

## Features Implemented

### RSVP Form
- ✅ Required "Are you attending?" Yes/No field
- ✅ If No: Adults/Kids auto-set to 0, fields disabled
- ✅ If Yes: Adults/Kids fields enabled
- ✅ Total persons calculated automatically

### Dashboard
- ✅ Attendance count stats (Attending / Not Attending)
- ✅ Total adults, kids, and persons attending
- ✅ Attendance filter (All / Attending / Not Attending)
- ✅ Attendance badges in guest table
- ✅ Total column per guest

### Emails
- ✅ Admin notification with all details
- ✅ Guest confirmation email (if email provided)
- ✅ Attending confirmation includes counts
- ✅ Not attending confirmation with thanks

### Data Handling
- ✅ Updates existing RSVP (by phone) instead of duplicating
- ✅ Attending=Yes: adults+kids = total
- ✅ Attending=No: adults=0, kids=0, total=0
