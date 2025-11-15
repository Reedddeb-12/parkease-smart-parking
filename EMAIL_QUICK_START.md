# 📧 Email Quick Start - 2 Minutes!

## 🚀 Setup Email in 2 Minutes

### Option 1: Interactive Setup (Easiest!)

```bash
npm run setup-email
```

Follow the prompts:
1. Choose email service (Gmail recommended)
2. Enter your email
3. Enter app password
4. Done! ✅

### Option 2: Manual Setup

#### For Gmail:

1. **Get App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate password for "Mail"
   - Copy 16-character password

2. **Update .env:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

3. **Restart Server:**
   ```bash
   npm start
   ```

4. **Test:**
   - Go to: http://localhost:8888
   - Click "Forgot Password?"
   - Enter email
   - Check inbox! 📧

---

## ✅ What Happens Now

### With Email Configured:
- ✅ Real emails sent to users
- ✅ Beautiful HTML template
- ✅ Professional appearance
- ✅ Instant delivery

### Without Email (Console Mode):
- ⚠️  Reset link in server console
- ✅ Still works for testing
- ✅ No email needed for development

---

## 🧪 Quick Test

1. **Request password reset:**
   ```
   http://localhost:8888
   → Click "Forgot Password?"
   → Enter your email
   ```

2. **Check email:**
   - Subject: "Password Reset Request - ParkEase"
   - Beautiful blue template
   - "Reset Password" button

3. **Click reset link:**
   - Opens reset password page
   - Enter new password
   - See strength indicator

4. **Login:**
   - Use new password
   - Success! 🎉

---

## 📧 Email Preview

**Subject:** Password Reset Request - ParkEase

```
🅿️ ParkEase
Password Reset Request

Hello John,

We received a request to reset your password.

[Reset Password Button]

⏰ This link expires in 10 minutes.

⚠️ Didn't request this? Ignore this email.

Best regards,
The ParkEase Team
```

---

## 🐛 Troubleshooting

### Email not sending?

**Check 1:** App password (not regular password)
```bash
# Gmail: https://myaccount.google.com/apppasswords
```

**Check 2:** .env file
```bash
cat .env | grep EMAIL
```

**Check 3:** Server logs
```bash
# Look for:
✅ Email service initialized
# Or:
⚠️  Email not configured
```

### Still not working?

**Use console mode:**
- Works without email setup
- Reset link in server console
- Perfect for development

---

## 📚 More Info

**Detailed Guide:**
- See `EMAIL_SETUP_GUIDE.md`

**Supported Services:**
- Gmail (recommended)
- Outlook/Hotmail
- Yahoo
- Custom SMTP

---

## 🎯 Summary

**Setup:**
```bash
npm run setup-email
```

**Or manually:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Restart:**
```bash
npm start
```

**Test:**
- Forgot password → Check email! 📧

---

**That's it! Emails are working! ✅**
