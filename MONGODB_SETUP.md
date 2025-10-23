# 🗄️ MongoDB Atlas Setup for ParkEase

## Your MongoDB Atlas Configuration

**Cluster**: `cluster0.7i6abub.mongodb.net`
**Username**: `reeddhijitdeb_db_user`
**Database**: `parkease`

## 🔧 Complete Setup Steps

### Step 1: Set Database Password

You need to replace `<db_password>` in your connection string with your actual password.

#### Option A: Use MongoDB Atlas Dashboard
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in to your account
3. Go to **Database Access** in the left sidebar
4. Find user `reeddhijitdeb_db_user`
5. Click **Edit** → **Edit Password**
6. Set a strong password (e.g., `ParkEase2024!`)
7. Click **Update User**

#### Option B: Create New Database User (Recommended)
1. Go to **Database Access** → **Add New Database User**
2. **Authentication Method**: Password
3. **Username**: `parkease-admin`
4. **Password**: `ParkEase2024!` (or generate secure password)
5. **Database User Privileges**: **Read and write to any database**
6. Click **Add User**

### Step 2: Update Environment File

Edit your `.env` file and replace `<db_password>` with your actual password:

```env
# Replace <db_password> with your actual password
MONGODB_URI=mongodb+srv://reeddhijitdeb_db_user:YOUR_ACTUAL_PASSWORD@cluster0.7i6abub.mongodb.net/parkease?retryWrites=true&w=majority&appName=Cluster0
```

**Example with password:**
```env
MONGODB_URI=mongodb+srv://reeddhijitdeb_db_user:ParkEase2024!@cluster0.7i6abub.mongodb.net/parkease?retryWrites=true&w=majority&appName=Cluster0
```

### Step 3: Configure Network Access

1. Go to **Network Access** in MongoDB Atlas
2. Click **Add IP Address**
3. Choose **Allow Access from Anywhere** (0.0.0.0/0)
4. Or add your specific IP address for security
5. Click **Confirm**

### Step 4: Test Connection

Run this command to test your database connection:

```bash
# Install dependencies
npm install

# Test the connection
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.7i6abub.mongodb.net
🚀 ParkEase Server running on port 3000
```

## 🔒 Security Best Practices

### Strong Password Requirements
- Minimum 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Avoid common words or personal information

### Example Strong Passwords
```
ParkEase2024!Secure
SmartParking#2024
ParkingApp$Strong123
```

### Network Security
- **Development**: Allow all IPs (0.0.0.0/0)
- **Production**: Restrict to specific server IPs

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (edit .env with your password)
cp .env.example .env

# 3. Start development server
npm run dev

# 4. Test API endpoints
curl http://localhost:3000/api/health
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Authentication Failed
```
Error: Authentication failed
```
**Solution**: Check username and password in connection string

#### 2. Network Timeout
```
Error: Server selection timed out
```
**Solution**: Add your IP to Network Access in MongoDB Atlas

#### 3. Database Not Found
```
Error: Database 'parkease' not found
```
**Solution**: Database will be created automatically on first use

#### 4. Connection String Format
Make sure your connection string follows this format:
```
mongodb+srv://username:password@cluster.mongodb.net/database?options
```

### Debug Connection
Enable debug mode in `.env`:
```env
DEBUG=true
NODE_ENV=development
```

## 📊 Database Collections

Your ParkEase database will automatically create these collections:

```
parkease/
├── users/              # User accounts and profiles
├── parkinglots/        # Parking space information  
├── bookings/           # Parking reservations
└── sessions/           # User sessions
```

## 🎯 Next Steps

1. **Set your database password** in MongoDB Atlas
2. **Update `.env` file** with the actual password
3. **Run `npm install`** to install dependencies
4. **Run `npm run dev`** to start the server
5. **Test the application** at http://localhost:3000

## 📞 Need Help?

If you encounter issues:

1. **Check MongoDB Atlas Dashboard** for connection status
2. **Verify Network Access** settings
3. **Test connection string** format
4. **Check server logs** for detailed error messages

Your ParkEase application will be connected to MongoDB Atlas and ready for production! 🎉