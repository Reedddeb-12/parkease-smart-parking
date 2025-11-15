# 📧 Email Troubleshooting Guide

## ✅ Email System Status: WORKING!

Your email configuration is correct and emails are being sent successfully!

**Test Result:**
- ✅ Configuration: Valid
- ✅ Test Email: Sent
- ✅ Message ID: Confirmed

---

## 📬 Where to Find Your Email

### 1. Check Inbox
- Go to: https://mail.google.com
- Login to: parkease25@gmail.com
- Look for email from: ParkEase

### 2. Check SPAM/Junk Folder
Gmail might filter it as spam initially:
1. Click "More" in left sidebar
2. Click "Spam"
3. Look for "ParkEase" email
4. If found, click "Not Spam"

### 3. Check Promotions Tab
Gmail might categorize it:
1. Look for tabs at top: Primary, Social, Promotions
2. Click "Promotions" tab
3. Search for "ParkEase"

### 4. Search for Email
Use Gmail search:
```
from:parkease25@gmail.com
```
Or:
```
subject:Password Reset
```

---

## 🔍 Email Details

**What to Look For:**

**From:** ParkEase <parkease25@gmail.com>
**Subject:** Password Reset Request - ParkEase
**Content:** 
- Blue gradient header
- "Hello [Name]"
- "Reset Password" button
- Reset link

---

## 🧪 Test Email Sending

### Quick Test
```bash
node test-email.js
```

This will:
1. Verify email configuration
2. Send test email to parkease25@gmail.com
3. Show success/error message

### Test from App
1. Go to: http://localhost:8888
2. Click "Forgot Password?"
3. Enter: parkease25@gmail.com
4. Click "Send Reset Link"
5. Check inbox!

---

## ⏱️ Email Delivery Time

**Normal:** 10-30 seconds
**Sometimes:** 1-2 minutes
**Rarely:** Up to 5 minutes

If no email after 5 minutes, check troubleshooting below.

---

## 🐛 Common Issues & Solutions

### Issue 1: Email in Spam
**Solution:**
1. Check Spam folder
2. Mark as "Not Spam"
3. Add parkease25@gmail.com to contacts

### Issue 2: Gmail Blocking
**Solution:**
1. Check "Less secure app access" (if using old Gmail)
2. Verify App Password is correct
3. Try generating new App Password

### Issue 3: Wrong Email Address
**Solution:**
1. Verify you're checking: parkease25@gmail.com
2. Not a different email account
3. Check if logged into correct Gmail

### Issue 4: Email Filters
**Solution:**
1. Go to Gmail Settings → Filters
2. Check if any filter is blocking
3. Remove blocking filters

### Issue 5: Storage Full
**Solution:**
1. Check Gmail storage
2. Delete old emails if full
3. Free up space

---

## 🔧 Advanced Troubleshooting

### Check Server Logs

When you request password reset, server should show:
```
✅ Email service initialized
✅ Email sent to user@example.com: <message-id>
```

If you see:
```
⚠️  Email not configured. Using console mode.
```
Then email is not configured properly.

### Verify Configuration

Run:
```bash
node test-email.js
```

Should show:
```
✅ Email configuration is valid!
✅ Test email sent successfully!
```

### Check .env File

Open .env and verify:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=parkease25@gmail.com
EMAIL_PASS=tify dggn vokk pctr
```

All three must be set correctly.

---

## 📊 Email Status Indicators

### ✅ Working Correctly
```
✅ Email service initialized
✅ Email sent to user@example.com: <message-id>
```

### ⚠️ Console Mode (Not Configured)
```
⚠️  Email not configured. Using console mode.
📧 EMAIL (Console Mode)
Reset Link: http://localhost:8888/reset-password.html?token=...
```

### ❌ Error
```
❌ Email sending failed: [error message]
```

---

## 🎯 Quick Checklist

When requesting password reset:

- [ ] Server is running
- [ ] Email configured in .env
- [ ] Server restarted after .env changes
- [ ] Correct email address entered
- [ ] Checked inbox
- [ ] Checked spam folder
- [ ] Checked promotions tab
- [ ] Searched for "ParkEase"
- [ ] Waited 1-2 minutes

---

## 💡 Pro Tips

### 1. Add to Contacts
Add parkease25@gmail.com to your Gmail contacts to prevent spam filtering.

### 2. Whitelist Domain
In Gmail settings, whitelist @gmail.com emails.

### 3. Check Mobile App
Sometimes emails appear faster in Gmail mobile app.

### 4. Use Search
Don't scroll - use Gmail search:
```
from:parkease25@gmail.com after:2024/11/15
```

---

## 🔄 Reset Email Configuration

If still not working, regenerate App Password:

### Step 1: Revoke Old Password
1. Go to: https://myaccount.google.com/apppasswords
2. Find "ParkEase" app password
3. Click "Remove"

### Step 2: Generate New Password
1. Click "Generate"
2. Select app: Mail
3. Select device: Other (ParkEase)
4. Copy new password

### Step 3: Update .env
```env
EMAIL_PASS=new-app-password-here
```

### Step 4: Restart Server
```bash
npm start
```

### Step 5: Test Again
```bash
node test-email.js
```

---

## 📞 Still Not Working?

### Check These:

1. **Gmail Account Status**
   - Account not suspended
   - 2-Step Verification enabled
   - App Passwords available

2. **Network Issues**
   - Internet connection working
   - Firewall not blocking
   - Antivirus not interfering

3. **Gmail Limits**
   - Not exceeding 500 emails/day
   - Not marked as spam sender
   - Account in good standing

---

## ✅ Verification Steps

### 1. Test Email Configuration
```bash
node test-email.js
```
Expected: ✅ Test email sent successfully!

### 2. Check Gmail Inbox
- Login to parkease25@gmail.com
- Look for test email
- Should arrive within 1-2 minutes

### 3. Test from App
- Request password reset
- Check inbox
- Click reset link

### 4. Verify Email Content
- Blue gradient header
- ParkEase branding
- Reset button works
- Link is clickable

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Server logs show: "Email sent to..."
✅ Email appears in inbox
✅ Email has proper formatting
✅ Reset link works
✅ Can reset password successfully

---

## 📚 Additional Resources

- **Email Setup Guide:** EMAIL_SETUP_GUIDE.md
- **Quick Start:** EMAIL_QUICK_START.md
- **Test Script:** test-email.js
- **Gmail Help:** https://support.google.com/mail

---

**Your email system is configured correctly!**
**Check your inbox at: parkease25@gmail.com** 📧✅
