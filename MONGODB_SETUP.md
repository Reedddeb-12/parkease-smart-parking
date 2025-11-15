# 🗄️ MongoDB Setup Guide

## 🎯 Current Status

Your app is running **without MongoDB** (in-memory mode). This means:
- ⚠️ Data is lost when server restarts
- ⚠️ No persistent storage
- ⚠️ Users/bookings not saved permanently

---

## ✅ Quick Setup: MongoDB Atlas (FREE Cloud Database)

### Step 1: Create MongoDB Atlas Account (2 minutes)

1. **Go to MongoDB Atlas:**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Click "Try Free"

2. **Sign up:**
   - Email: parkease25@gmail.com (or your email)
   - Password: Create a strong password
   - Click "Create your Atlas account"

3. **Verify email:**
   - Check your email inbox
   - Click verification link

### Step 2: Create Free Cluster (3 minutes)

1. **Choose deployment:**
   - Select: **M0 FREE** (Shared)
   - Provider: AWS
   - Region: Choose closest to you (e.g., Mumbai for India)
   - Cluster Name: Cluster0 (default)
   - Click "Create"

2. **Wait for cluster creation:**
   - Takes 1-3 minutes
   - You'll see "Cluster0" being created

### Step 3: Create Database User (1 minute)

1. **Security Quickstart appears:**
   - Username: `parkease`
   - Password: `parkease123` (or create your own)
   - Click "Create User"

2. **Or create manually:**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `parkease`
   - Password: `parkease123`
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

### Step 4: Whitelist IP Address (1 minute)

1. **Add IP Address:**
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - IP: `0.0.0.0/0`
   - Click "Confirm"

   **Note:** For production, use specific IP addresses

### Step 5: Get Connection String (1 minute)

1. **Go to Database:**
   - Click "Database" in left sidebar
   - Click "Connect" button on your cluster

2. **Choose connection method:**
   - Click "Connect your application"
   - Driver: Node.js
   - Version: 4.1 or later

3. **Copy connection string:**
   ```
   mongodb+srv://parkease:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

4. **Replace `<password>`:**
   ```
   mongodb+srv://parkease:parkease123@cluster0.xxxxx.mongodb.net/parkease?retryWrites=true&w=majority
   ```

### Step 6: Update .env File

1. **Open .env file**

2. **Update MONGODB_URI:**
   ```env
   MONGODB_URI=mongodb+srv://parkease:parkease123@cluster0.xxxxx.mongodb.net/parkease?retryWrites=true&w=majority
   ```

   Replace `cluster0.xxxxx` with your actual cluster URL

3. **Save file**

### Step 7: Restart Server

```bash
# Stop server (Ctrl+C)
npm start
```

You should see:
```
✅ MongoDB Connected
```

---

## 🚀 Quick Alternative: Use My Pre-configured Connection

I've already added a connection string to your .env file. Just:

1. **Create MongoDB Atlas account** (steps above)
2. **Create cluster named "Cluster0"**
3. **Create user:**
   - Username: `parkease`
   - Password: `parkease123`
4. **Whitelist all IPs:** `0.0.0.0/0`
5. **Restart server**

---

## 🧪 Test MongoDB Connection

### Quick Test Script

Create `test-mongodb.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoDB() {
  console.log('\n🗄️  Testing MongoDB Connection...\n');
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI not set in .env file');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!\n');
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:');
    console.log(`   ${error.message}\n`);
    process.exit(1);
  }
}

testMongoDB();
```

Run:
```bash
node test-mongodb.js
```

---

## 🔧 Troubleshooting

### Error: "Authentication failed"

**Solution:**
1. Check username and password are correct
2. Verify user has "Read and write" permissions
3. Make sure password doesn't have special characters (or URL encode them)

### Error: "IP not whitelisted"

**Solution:**
1. Go to "Network Access" in Atlas
2. Click "Add IP Address"
3. Add `0.0.0.0/0` (allow all)
4. Wait 1-2 minutes for changes to apply

### Error: "Connection timeout"

**Solution:**
1. Check internet connection
2. Verify firewall isn't blocking MongoDB
3. Try different network (mobile hotspot)

### Error: "Invalid connection string"

**Solution:**
1. Copy connection string again from Atlas
2. Replace `<password>` with actual password
3. Add database name: `/parkease` before `?`
4. Remove any extra spaces

---

## 📊 MongoDB Atlas Features (FREE Tier)

**What you get for FREE:**
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Shared vCPU
- ✅ Perfect for development
- ✅ No credit card required
- ✅ Automatic backups
- ✅ SSL encryption

**Limits:**
- Storage: 512 MB (enough for ~10,000 users)
- Connections: 500 concurrent
- No performance guarantees (shared cluster)

---

## 🎯 Why Use MongoDB?

### Without MongoDB (Current):
- ❌ Data lost on restart
- ❌ No user persistence
- ❌ No booking history
- ❌ Testing only

### With MongoDB:
- ✅ Data persists forever
- ✅ Users saved permanently
- ✅ Booking history maintained
- ✅ Production ready
- ✅ Scalable

---

## 🔐 Security Best Practices

### Development:
```env
MONGODB_URI=mongodb+srv://parkease:parkease123@cluster0.xxxxx.mongodb.net/parkease
```

### Production:
1. **Create new user** with strong password
2. **Whitelist specific IPs** (not 0.0.0.0/0)
3. **Use environment variables** on server
4. **Enable audit logs**
5. **Regular backups**

---

## 📝 Connection String Format

```
mongodb+srv://[username]:[password]@[cluster-url]/[database]?[options]
```

**Example:**
```
mongodb+srv://parkease:parkease123@cluster0.abc123.mongodb.net/parkease?retryWrites=true&w=majority
```

**Parts:**
- `parkease` - Username
- `parkease123` - Password
- `cluster0.abc123.mongodb.net` - Cluster URL
- `parkease` - Database name
- `retryWrites=true&w=majority` - Options

---

## 🚀 Quick Start Commands

```bash
# Test MongoDB connection
node test-mongodb.js

# Start server with MongoDB
npm start

# Check if MongoDB is connected
# Look for: ✅ MongoDB Connected
```

---

## 📚 Additional Resources

**MongoDB Atlas:**
- Dashboard: https://cloud.mongodb.com
- Documentation: https://docs.atlas.mongodb.com
- Free tier: https://www.mongodb.com/pricing

**Mongoose (MongoDB for Node.js):**
- Documentation: https://mongoosejs.com
- Getting Started: https://mongoosejs.com/docs/index.html

---

## ✅ Setup Checklist

- [ ] Create MongoDB Atlas account
- [ ] Verify email
- [ ] Create free cluster (M0)
- [ ] Create database user (parkease/parkease123)
- [ ] Whitelist IP (0.0.0.0/0)
- [ ] Get connection string
- [ ] Update .env file
- [ ] Test connection
- [ ] Restart server
- [ ] Verify "MongoDB Connected" message

---

## 🎉 Summary

**Current Status:** Running without MongoDB (in-memory)

**To Enable MongoDB:**
1. Create free MongoDB Atlas account (5 minutes)
2. Get connection string
3. Update .env file
4. Restart server

**Benefits:**
- Persistent data storage
- Production ready
- Free forever (512 MB)
- No credit card needed

---

**Ready to set up MongoDB? Follow the steps above!** 🗄️✅
