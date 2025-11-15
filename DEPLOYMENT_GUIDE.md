# 🚀 Deployment Guide - ParkEase

## ⚠️ IMPORTANT: Environment Variables

**NEVER commit your .env file to GitHub!**

Your .env file contains sensitive credentials that should **NEVER** be public:
- Email passwords
- JWT secrets
- Database credentials
- API keys

---

## 🔒 Secure Deployment Process

### Step 1: Verify .env is Ignored

Check that .env is in .gitignore:
```bash
cat .gitignore | grep .env
```

Should show:
```
.env
```

### Step 2: Set Environment Variables on Server

When deploying to production, set environment variables directly on your server:

#### For Render.com:
1. Go to your service dashboard
2. Click "Environment"
3. Add each variable:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=parkease25@gmail.com
   EMAIL_PASS=your-app-password-here
   JWT_SECRET=your-jwt-secret-here
   NODE_ENV=production
   ```

#### For Heroku:
```bash
heroku config:set EMAIL_SERVICE=gmail
heroku config:set EMAIL_USER=parkease25@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set NODE_ENV=production
```

#### For Vercel:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add each variable

#### For Railway:
1. Go to your project
2. Click "Variables"
3. Add each variable

---

## 📋 Required Environment Variables

### Production Configuration

```env
# Server
NODE_ENV=production
PORT=8888
FRONTEND_URL=https://yourdomain.com

# Database (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parkease

# JWT (Generate new for production!)
JWT_SECRET=generate-new-128-character-secret
JWT_EXPIRE=7d

# Email (Use your configured email)
EMAIL_SERVICE=gmail
EMAIL_USER=parkease25@gmail.com
EMAIL_PASS=your-16-character-app-password

# Demo Mode (Disable in production)
ENABLE_DEMO=false
DEMO_PASSWORD=strong-random-password

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## 🔐 Security Best Practices

### 1. Generate New Secrets for Production

**NEVER use development secrets in production!**

Generate new JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Or use the script:
```bash
npm run generate-secrets
```

### 2. Use Different Credentials

- ✅ Different JWT_SECRET for dev/staging/production
- ✅ Different database for each environment
- ✅ Different email account (optional)
- ✅ Different API keys

### 3. Rotate Secrets Regularly

- Change JWT_SECRET every 3-6 months
- Rotate email app passwords annually
- Update database passwords regularly

---

## 📝 Deployment Checklist

### Before Deployment

- [ ] Verify .env is in .gitignore
- [ ] Generate new production secrets
- [ ] Set up production database (MongoDB Atlas)
- [ ] Configure production email
- [ ] Test all features locally
- [ ] Run security audit

### During Deployment

- [ ] Set all environment variables on server
- [ ] Verify NODE_ENV=production
- [ ] Disable demo mode (ENABLE_DEMO=false)
- [ ] Configure HTTPS
- [ ] Set correct FRONTEND_URL
- [ ] Test email sending

### After Deployment

- [ ] Test forgot password feature
- [ ] Verify emails are sent
- [ ] Check security headers
- [ ] Monitor error logs
- [ ] Test all API endpoints

---

## 🌐 Platform-Specific Guides

### Render.com (Recommended)

1. **Create Web Service:**
   - Connect GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Add Environment Variables:**
   - Go to Environment tab
   - Add all variables from list above
   - Save changes

3. **Deploy:**
   - Render will auto-deploy
   - Check logs for errors

### Heroku

1. **Create App:**
   ```bash
   heroku create parkease-app
   ```

2. **Set Environment Variables:**
   ```bash
   heroku config:set EMAIL_USER=parkease25@gmail.com
   heroku config:set EMAIL_PASS=your-app-password
   # ... add all other variables
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

### Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add Environment Variables:**
   - Go to project settings
   - Add all variables
   - Redeploy

---

## 🔍 Verify Deployment

### Test Checklist

1. **Health Check:**
   ```bash
   curl https://yourdomain.com/api/health
   ```

2. **Email Test:**
   - Request password reset
   - Check email inbox
   - Verify reset link works

3. **Security Test:**
   - Verify HTTPS is working
   - Check security headers
   - Test rate limiting

---

## 🚨 What NOT to Do

❌ **NEVER commit .env to GitHub**
❌ **NEVER share credentials in issues/PRs**
❌ **NEVER use development secrets in production**
❌ **NEVER expose API keys in frontend code**
❌ **NEVER disable security features in production**

---

## ✅ What TO Do

✅ **Use environment variables on server**
✅ **Generate new secrets for production**
✅ **Use HTTPS in production**
✅ **Enable rate limiting**
✅ **Monitor logs and errors**
✅ **Keep dependencies updated**
✅ **Regular security audits**

---

## 📞 Support

**For deployment issues:**
- Check server logs
- Verify environment variables
- Test locally first
- Review documentation

**Security concerns:**
- Rotate compromised credentials immediately
- Check access logs
- Update all secrets
- Monitor for suspicious activity

---

## 🎯 Summary

### Local Development
- Use .env file (never commit!)
- Test all features
- Generate secrets with script

### Production Deployment
- Set environment variables on server
- Use new production secrets
- Enable HTTPS
- Disable demo mode
- Monitor and test

**Your credentials are safe! They're only on your local machine and production server.** 🔒✅

---

**Need help deploying? Check platform-specific guides above!**
