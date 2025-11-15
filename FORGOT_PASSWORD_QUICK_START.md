# 🔐 Forgot Password - Quick Start

## ✅ Feature Added!

Your ParkEase app now has a complete **Forgot Password** system!

---

## 🚀 Test It Now (2 Minutes)

### Step 1: Server Running?
```bash
# If not running, start it:
npm start
```

### Step 2: Create Test User
1. Open: http://localhost:8888
2. Click "Create Account"
3. Register with:
   - Email: `test@parkease.com`
   - Password: `test123`
   - Name: Test User
   - Phone: 1234567890

### Step 3: Test Forgot Password
1. Go back to login page
2. Click **"Forgot Password?"** link
3. Enter: `test@parkease.com`
4. Click "Send Reset Link"
5. See success message!

### Step 4: Get Reset Link
**Check your server console** for:
```
=============================================================
🔐 PASSWORD RESET REQUEST
=============================================================
Email: test@parkease.com
Reset Link: http://localhost:8888/reset-password.html?token=...
Token expires in: 10 minutes
=============================================================
```

### Step 5: Reset Password
1. **Copy the reset link** from console
2. **Paste in browser**
3. Enter new password: `newpass123`
4. Confirm password: `newpass123`
5. Click "Reset Password"
6. **Success!** 🎉

### Step 6: Login with New Password
1. Go to login page
2. Email: `test@parkease.com`
3. Password: `newpass123`
4. Login successful!

---

## 🎯 Features

### User Features
- ✅ Click "Forgot Password" on login
- ✅ Enter email address
- ✅ Receive reset link
- ✅ Set new password
- ✅ Password strength indicator
- ✅ Login with new password

### Security Features
- ✅ Secure token generation
- ✅ 10-minute expiration
- ✅ One-time use tokens
- ✅ Password validation
- ✅ Token hashing (SHA-256)

---

## 📱 Pages Added

### 1. Forgot Password Page
**URL:** http://localhost:8888/forgot-password.html
- Enter email
- Request reset link
- Beautiful UI

### 2. Reset Password Page
**URL:** http://localhost:8888/reset-password.html?token=...
- Verify token
- Enter new password
- Password strength indicator
- Confirm password

---

## 🔌 API Endpoints

### Request Reset
```bash
curl -X POST http://localhost:8888/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@parkease.com"}'
```

### Reset Password
```bash
curl -X POST http://localhost:8888/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN","newPassword":"newpass123"}'
```

---

## 🎨 Password Strength Indicator

Shows real-time strength:
- 🔴 **Weak** - Less than 6 characters
- 🟠 **Fair** - 6+ characters
- 🟡 **Good** - 10+ chars, mixed case
- 🟢 **Strong** - 10+ chars, mixed case, numbers, special chars

---

## 📧 Development Mode

**Current Setup:**
- Reset links shown in **server console**
- No email sending required
- Perfect for testing!

**Production Setup:**
- Integrate with email service (Nodemailer, SendGrid)
- Send actual emails
- See `FORGOT_PASSWORD_GUIDE.md` for details

---

## 🐛 Troubleshooting

### Link not working?
- Token expires in 10 minutes
- Copy complete URL from console
- Request new link if expired

### Can't find reset link?
- Check **server console** (terminal window)
- Look for "PASSWORD RESET REQUEST"
- Copy the full URL

### Password not updating?
- Must be 6+ characters
- Passwords must match
- Check for error messages

---

## ✅ What's Included

**Files Created:**
- `routes/auth.js` - API endpoints
- `forgot-password.html` - Request page
- `reset-password.html` - Reset page
- `FORGOT_PASSWORD_GUIDE.md` - Complete guide
- `FORGOT_PASSWORD_QUICK_START.md` - This file

**Files Updated:**
- `index.html` - Added "Forgot Password" link
- `app.js` - Integrated auth routes

---

## 🎉 You're Ready!

The forgot password feature is fully functional!

**Try it now:**
1. Go to: http://localhost:8888
2. Click "Forgot Password?"
3. Follow the steps above

---

## 📚 More Info

For detailed documentation, see:
- `FORGOT_PASSWORD_GUIDE.md` - Complete guide
- Email integration
- Production setup
- Security best practices

---

**Secure. Simple. Ready to Use!** 🔐
