# Reminder System Backend Setup

The reminder system MUST run in the backend (Google Apps Script), not in the frontend.

## Overview

Reminders are sent automatically by Apps Script time-driven triggers:
- 30 days before event
- 7 days before event  
- 1 day before event

## Setup Instructions

### Step 1: Add Reminder Function to Apps Script

Add this function to your Google Apps Script:

```javascript
// Reminder schedule in days before event
const REMINDER_SCHEDULE = [30, 7, 1];
const EVENT_DATE = new Date('2026-06-28T09:30:00');

function sendReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysUntilEvent = Math.ceil((EVENT_DATE - today) / (1000 * 60 * 60 * 24));
  
  // Check if today is a reminder day
  if (!REMINDER_SCHEDULE.includes(daysUntilEvent)) {
    console.log('Not a reminder day. Days until event:', daysUntilEvent);
    return;
  }
  
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  
  if (values.length <= 1) {
    console.log('No RSVPs to send reminders to');
    return;
  }
  
  // Send reminders to all guests
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const email = row[4]; // Email column
    const firstName = row[1]; // First name
    const lastName = row[2]; // Last name
    
    if (email) {
      sendReminderEmail_(email, firstName, lastName, daysUntilEvent);
    }
  }
  
  // Log completion
  console.log(`Reminders sent for ${daysUntilEvent} days before event`);
}

function sendReminderEmail_(email, firstName, lastName, daysUntil) {
  const subject = `Reminder: Baby Shower in ${daysUntil} Days!`;
  
  let body = `Dear ${firstName} ${lastName},\n\n`;
  
  if (daysUntil === 30) {
    body += `This is a friendly reminder that Tarang & Vidhi's Baby Shower is just one month away!`;
  } else if (daysUntil === 7) {
    body += `The Baby Shower is just one week away! We're excited to see you there.`;
  } else if (daysUntil === 1) {
    body += `Tomorrow is the big day! The Baby Shower is happening tomorrow at 9:30 AM. See you there!`;
  }
  
  body += `\n\nEvent Details:\n`;
  body += `Date: June 28, 2026\n`;
  body += `Time: 9:30 AM\n`;
  body += `Hosted by: Malani Family\n\n`;
  body += `If you need to update your RSVP, please visit the website.\n\n`;
  body += `Looking forward to celebrating with you!\n`;
  body += `Malani Family`;
  
  MailApp.sendEmail(email, subject, body);
}
```

### Step 2: Set Up Time-Driven Trigger

1. In Apps Script, click the **clock icon** (Triggers) on the left
2. Click **+ Add Trigger**
3. Configure:
   - **Function**: `sendReminders`
   - **Deployment**: Head
   - **Event source**: Time-driven
   - **Type**: Day timer
   - **Time**: 9:00 AM to 10:00 AM (or your preferred time)
4. Click **Save**

This will run the function once per day at the specified time.

### Step 3: Test the Trigger

1. Manually run `sendReminders()` from the Apps Script editor
2. Check the execution log
3. Verify emails are sent (check your admin email for bounces)

## How It Works

1. Every day at the set time, Apps Script runs `sendReminders()`
2. Function calculates days until the event
3. If today matches a reminder day (30, 7, or 1 days before), emails are sent
4. All guests with email addresses receive a reminder
5. No frontend code is involved - completely automated

## Free Solution

This uses Google Apps Script's built-in:
- **Time-driven triggers** (FREE)
- **MailApp service** (FREE, within quotas)
- **No third-party services needed**

## Quota Limits

Google Apps Script free quotas (per day):
- Email recipients: 100/day for consumer accounts
- Time-driven triggers: Unlimited executions

For most baby showers (under 100 guests), this is well within limits.

## Troubleshooting

**Reminders not sending?**
- Check trigger execution log in Apps Script
- Verify email addresses in spreadsheet are valid
- Check spam folders
- Ensure `sendReminders()` function is saved

**Want to test immediately?**
- Temporarily change `EVENT_DATE` to a future date 30/7/1 days from today
- Manually run `sendReminders()`
- Remember to change it back to the real event date

## Security Note

- Reminders are sent from the backend only
- No sensitive data is exposed in frontend
- Email addresses are read directly from the spreadsheet
