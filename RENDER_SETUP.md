# Deploy ParkEase to Render - Quick Guide

## Step 1: Go to Render
👉 https://render.com

## Step 2: Sign Up/Login
- Click "Get Started" or "Login"
- Sign in with GitHub

## Step 3: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: **parkease-smart-parking**
3. Click **"Connect"**

## Step 4: Configure Service

**Basic Settings:**
- **Name**: `parkease-smart-parking`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: (leave empty)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node app.js`

**Instance Type:**
- Select **Free** tier

## Step 5: Add Environment Variables

Click **"Advanced"** and add these 2 variables:

### Variable 1:
```
Key: MONGODB_URI
Value: mongodb+srv://reeddhijitdeb_db_user:Reeddhijit_12@cluster0.7i6abub.mongodb.net/parkease?retryWrites=true&w=majority&appName=Cluster0
```

### Variable 2:
```
Key: JWT_SECRET
Value: parkease-super-secret-jwt-key-2024-production-ready
```

## Step 6: Deploy!
1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Your app will be live!

---

## ✅ What You'll Get:

- **Single Page App** - No reload issues!
- **MongoDB Connected** - All your data works
- **Fast Loading** - Optimized for performance
- **Free Hosting** - No cost for testing

---

## 🎯 After Deployment:

Your site will be at: `https://parkease-smart-parking.onrender.com`

**Test it:**
1. Click "Try Demo" to login
2. See your dashboard
3. Everything works in one page!

---

## 💡 Tips:

- **Free tier sleeps after 15 min** - First load takes 30-60 seconds
- **Keep MongoDB Atlas IP whitelist** set to 0.0.0.0/0
- **Check logs** in Render dashboard if issues occur

---

🎉 **Your ParkEase app will be live with zero reload issues!**
