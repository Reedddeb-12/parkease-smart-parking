# 🗄️ MongoDB Quick Start - 5 Minutes

## 🚀 Fastest Way: Interactive Setup

```bash
npm run setup-mongodb
```

Follow the prompts - it will guide you through everything!

---

## 📋 Manual Setup (If You Prefer)

### Step 1: Create Account (2 minutes)

1. **Open:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up:**
   - Email: parkease25@gmail.com
   - Password: (create one)
   - Click "Create your Atlas account"
3. **Verify email** (check inbox)

### Step 2: Create FREE Cluster (2 minutes)

1. **Choose deployment:**
   - Click "Build a Database"
   - Select: **M0 FREE** (Shared)
   - Provider: **AWS**
   - Region: **Mumbai** (or closest to you)
   - Cluster Name: **Cluster0**
   - Click "Create"

2. **Wait 1-2 minutes** for cluster creation

### Step 3: Create Database User (1 minute)

1. **Security Quickstart appears:**
   - Username: `parkease`
   - Password: `parkease123`
   - Click "Create User"

### Step 4: Whitelist IP (30 seconds)

1. **Add IP Address:**
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - IP: `0.0.0.0/0`
   - Click "Confirm"

### Step 5: Get Connection String (30 seconds)

1. **Connect to cluster:**
   - Click "Database" (left sidebar)
   - Click "Connect" button
   - Choose "Connect your application"
   - Driver: Node.js
   - Copy the connection string

2. **Example string:**
   ```
   mongodb+srv://parkease:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update .env File

1. **Open .env file**

2. **Find this line:**
   ```env
   # MONGODB_URI=mongodb://localhost:27017/parkease
   ```

3. **Replace with your connection string:**
   ```env
   MONGODB_URI=mongodb+srv://parkease:parkease123@cluster0.xxxxx.mongodb.net/parkease?retryWrites=true&w=majority
   ```

   **Important:**
   - Replace `<password>` with `parkease123`
   - Replace `cluster0.xxxxx` with your actual cluster URL
   - Add `/parkease` before the `?`

4. **Save file**

### Step 7: Restart Server

```bash
npm start
```

**Look for:**
```
✅ MongoDB Connected
```

---

## 🧪 Test It

```bash
npm run test-mongodb
```

Should show:
```
✅ MongoDB Connected Successfully!
📊 Database: parkease
🌐 Host: cluster0.xxxxx.mongodb.net
```

---

## ✅ What You Get (FREE!)

- 512 MB storage (enough for ~10,000 users)
- Automatic backups
- SSL encryption
- 99.9% uptime
- No credit card required
- Free forever!

---

## 🎯 Benefits

**Before (In-Memory):**
- ❌ Data lost on restart
- ❌ No persistence
- ❌ Testing only

**After (MongoDB):**
- ✅ Data persists forever
- ✅ Users saved permanently
- ✅ Production ready
- ✅ Scalable

---

## 🐛 Troubleshooting

### "Authentication failed"
- Check username: `parkease`
- Check password: `parkease123`
- Verify user has "Read and write" permissions

### "IP not whitelisted"
- Go to "Network Access"
- Add IP: `0.0.0.0/0`
- Wait 1-2 minutes

### "Connection timeout"
- Check internet connection
- Try different network
- Wait for cluster to be ready

### "Invalid connection string"
- Copy string again from Atlas
- Replace `<password>` with actual password
- Add `/parkease` before `?`

---

## 📊 Connection String Format

```
mongodb+srv://[username]:[password]@[cluster]/[database]?[options]
```

**Example:**
```
mongodb+srv://parkease:parkease123@cluster0.abc123.mongodb.net/parkease?retryWrites=true&w=majority
```

**Parts:**
- `parkease` - Username
- `parkease123` - Password  
- `cluster0.abc123.mongodb.net` - Your cluster URL
- `parkease` - Database name
- `retryWrites=true&w=majority` - Options

---

## 🎓 Quick Commands

```bash
# Interactive setup
npm run setup-mongodb

# Test connection
npm run test-mongodb

# Start server
npm start
```

---

## ✅ Checklist

- [ ] Create MongoDB Atlas account
- [ ] Verify email
- [ ] Create M0 FREE cluster
- [ ] Create user (parkease/parkease123)
- [ ] Whitelist IP (0.0.0.0/0)
- [ ] Get connection string
- [ ] Update .env file
- [ ] Test connection
- [ ] Restart server
- [ ] See "MongoDB Connected" ✅

---

## 🎉 Done!

Once you see:
```
✅ MongoDB Connected
```

Your data will now persist permanently! 🎊

---

**Need help? See MONGODB_SETUP.md for detailed guide!**
