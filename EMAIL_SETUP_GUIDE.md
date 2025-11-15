# 📧 Email Setup Guide - Password Reset Emails

## 🎯 Overview

Your ParkEase app now sends **actual password reset emails** instead of just console logs!

**Current Status:**
- ✅ Email service installed (Nodemailer)
- ✅ Beautiful HTML email templates
- ✅ Fallback to console mode if not configured
- ⚠️  **Needs email credentials to send real emails**

---

## 🚀 Quick Setup (5 Minutes)

### Option 1: Gmail (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**

#### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter: **ParkEase**
5. Click **Generate**
6. **Copy the 16-character password**

#### Step 3: Update .env File
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

#### Step 4: Restart Server
```bash
# Stop server (Ctrl+C)
npm start
```

#### Step 5: Test!
1. Go to: http://localhost:8888
2. Click "Forgot Password?"
3. Enter email
4. **Check your inbox!** 📧

---

### Option 2: Outlook/Hotmail

#### Step 1: Update .env
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Step 2: Restart & Test
```bash
npm start
```

---

### Option 3: Yahoo Mail

#### Step 1: Generate App Password
1. Go to: https://login.yahoo.com/account/security
2. Generate app password

#### Step 2: Update .env
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

---

### Option 4: Custom SMTP

For other email providers:

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
```

---

## 📧 Email Features

### What Users Receive

**Subject:** Password Reset Request - ParkEase

**Content:**
- Beautiful HTML template
- Blue gradient header with ParkEase logo
- Clear "Reset Password" button
- Clickable link (if button doesn't work)
- 10-minute expiration warning
- Security notice
- Professional footer

**Example:**
```
🅿️ ParkEase
Password Reset Request

Hello John,

We received a request to reset your password for your ParkEase account.

[Reset Password Button]

⏰ Important: This link will expire in 10 minutes for security reasons.

⚠️ Didn't request this?
If you didn't request a password reset, please ignore this email.

Best regards,
The ParkEase Team
```

---

## 🧪 Testing

### Test 1: With Email Configured

1. **Setup email credentials** in .env
2. **Restart server**
3. **Request password reset**
4. **Check your email inbox**
5. **Click reset link**
6. **Set new password**

### Test 2: Without Email (Console Mode)

If email is not configured:
- ✅ Still works!
- ✅ Shows link in server console
- ✅ User sees success message
- ⚠️  No actual email sent

**Console Output:**
```
======================================================================
📧 EMAIL (Console Mode - Email not configured)
======================================================================
To: user@example.com
Subject: Password Reset Request - ParkEase

Hello User,

You requested to reset your password for ParkEase.

Click the link below to reset your password:
http://localhost:8888/reset-password.html?token=...

This link will expire in 10 minutes.
======================================================================
```

---

## 🔧 Configuration Options

### .env Variables

```env
# Email Service (gmail, outlook, yahoo, or custom)
EMAIL_SERVICE=gmail

# Your email address
EMAIL_USER=your-email@gmail.com

# App password (NOT your regular password!)
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:8888

# Node environment
NODE_ENV=development
```

### Custom SMTP Settings

```env
# For custom email servers
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
```

---

## 🎨 Email Templates

### Password Reset Email

**Features:**
- Responsive design
- Mobile-friendly
- Professional styling
- Clear call-to-action
- Security warnings
- Expiration notice

**Customization:**

Edit `services/emailService.js`:

```javascript
getPasswordResetTemplate(resetUrl, userName) {
  return `
    <!DOCTYPE html>
    <html>
      <!-- Your custom HTML here -->
    </html>
  `;
}
```

---

## 🔒 Security Features

### Email Security

✅ **App Passwords** - Never use regular passwords
✅ **TLS/SSL** - Encrypted email transmission
✅ **No password in logs** - Credentials protected
✅ **Token expiration** - 10-minute validity
✅ **One-time use** - Tokens deleted after use

### Best Practices

1. **Use App Passwords** - Not regular passwords
2. **Enable 2FA** - On email account
3. **Rotate passwords** - Regularly update
4. **Monitor usage** - Check email logs
5. **Use environment variables** - Never commit credentials

---

## 🐛 Troubleshooting

### Email Not Sending?

**Check 1: Credentials**
```bash
# Verify .env file
cat .env | grep EMAIL
```

**Check 2: App Password**
- Using app password (not regular password)?
- 16 characters without spaces?
- 2FA enabled on account?

**Check 3: Server Logs**
```bash
# Look for email errors
npm start
# Check console output
```

**Check 4: Test Configuration**
```bash
# Add test endpoint in app.js
app.get('/test-email', async (req, res) => {
  const result = await emailService.testEmailConfig();
  res.json(result);
});

# Visit: http://localhost:8888/test-email
```

### Common Errors

**Error: Invalid login**
- ✅ Check email/password
- ✅ Use app password
- ✅ Enable 2FA

**Error: Connection timeout**
- ✅ Check internet connection
- ✅ Verify SMTP settings
- ✅ Check firewall

**Error: Authentication failed**
- ✅ Generate new app password
- ✅ Update .env file
- ✅ Restart server

---

## 📊 Email Service Status

### Check Status

The server logs will show:

**Email Configured:**
```
✅ Email service initialized
```

**Email Not Configured:**
```
⚠️  Email not configured. Using console mode for password reset.
💡 To enable email: Set EMAIL_USER and EMAIL_PASS in .env file
```

### Test Email

Add this route to test:

```javascript
// In app.js
app.post('/api/test-email', async (req, res) => {
  const { email } = req.body;
  const result = await emailService.sendPasswordResetEmail(
    email,
    'http://localhost:8888/reset-password.html?token=test',
    'Test User'
  );
  res.json(result);
});
```

Test:
```bash
curl -X POST http://localhost:8888/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

---

## 🎯 Production Setup

### For Production Deployment

1. **Use Environment Variables**
   ```bash
   # On server
   export EMAIL_USER=your-email@gmail.com
   export EMAIL_PASS=your-app-password
   export FRONTEND_URL=https://yourdomain.com
   export NODE_ENV=production
   ```

2. **Update Frontend URL**
   ```env
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Remove Dev Mode**
   - Reset URLs won't show in response
   - Only sent via email

4. **Monitor Email Logs**
   - Check email sending success
   - Monitor bounce rates
   - Track delivery issues

---

## 📧 Alternative: SendGrid (Optional)

For high-volume email sending:

### Install SendGrid
```bash
npm install @sendgrid/mail
```

### Update emailService.js
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async sendEmail(to, subject, text, html) {
  const msg = {
    to: to,
    from: 'noreply@parkease.com',
    subject: subject,
    text: text,
    html: html
  };
  
  await sgMail.send(msg);
}
```

### Update .env
```env
SENDGRID_API_KEY=your-sendgrid-api-key
```

---

## ✅ Checklist

### Setup Checklist

- [ ] Install nodemailer (`npm install nodemailer`)
- [ ] Generate app password
- [ ] Update .env file
- [ ] Restart server
- [ ] Test password reset
- [ ] Check email inbox
- [ ] Verify reset link works

### Production Checklist

- [ ] Use production email account
- [ ] Set FRONTEND_URL to production domain
- [ ] Set NODE_ENV=production
- [ ] Test email delivery
- [ ] Monitor email logs
- [ ] Set up email alerts

---

## 🎉 Summary

### What You Have Now

✅ **Real email sending** - Actual emails to users
✅ **Beautiful templates** - Professional HTML emails
✅ **Fallback mode** - Console logs if email fails
✅ **Multiple providers** - Gmail, Outlook, Yahoo, custom
✅ **Secure** - App passwords, TLS encryption
✅ **Production ready** - Environment-based configuration

### Quick Start

1. **Get app password** from Gmail
2. **Update .env** with credentials
3. **Restart server**
4. **Test** forgot password feature
5. **Check inbox** for email!

---

## 📚 Resources

**Gmail App Passwords:**
https://myaccount.google.com/apppasswords

**Nodemailer Docs:**
https://nodemailer.com/

**Email Testing:**
https://mailtrap.io/ (for testing)

---

**Need Help?**
- Check server console for errors
- Verify .env configuration
- Test with different email provider
- Review troubleshooting section

---

**Emails are now working! 📧✅**
