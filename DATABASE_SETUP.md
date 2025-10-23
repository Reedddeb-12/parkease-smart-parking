# 🗄️ ParkEase Database Setup Guide

## Database Options

### Option 1: MongoDB Atlas (Cloud - Recommended)
**Free tier available, no local installation needed**

#### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create a new cluster (choose free M0 tier)
4. Wait for cluster to be created (2-3 minutes)

#### Step 2: Configure Database Access
1. **Database Access** → **Add New Database User**
   - Username: `parkease-admin`
   - Password: Generate secure password
   - Database User Privileges: **Read and write to any database**

#### Step 3: Configure Network Access
1. **Network Access** → **Add IP Address**
   - Add Current IP Address: `0.0.0.0/0` (allow from anywhere)
   - Or add your specific IP for security

#### Step 4: Get Connection String
1. **Clusters** → **Connect** → **Connect your application**
2. Copy connection string:
   ```
   mongodb+srv://parkease-admin:<password>@cluster0.xxxxx.mongodb.net/parkease?retryWrites=true&w=majority
   ```

#### Step 5: Configure Environment
Create `.env` file in your project root:
```env
MONGODB_URI=mongodb+srv://parkease-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/parkease?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3000
NODE_ENV=development
```

---

### Option 2: Local MongoDB Installation

#### Windows Installation
1. **Download MongoDB Community Server**
   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select Windows, MSI package
   - Download and run installer

2. **Install MongoDB**
   - Run as Administrator
   - Choose "Complete" installation
   - Install MongoDB as a Service ✅
   - Install MongoDB Compass ✅ (GUI tool)

3. **Start MongoDB Service**
   ```cmd
   net start MongoDB
   ```

4. **Verify Installation**
   ```cmd
   mongo --version
   ```

#### macOS Installation
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Connect to MongoDB
mongosh
```

#### Ubuntu/Linux Installation
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Local Environment Configuration
Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/parkease
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3000
NODE_ENV=development
```

---

### Option 3: Docker MongoDB (Development)

#### Docker Compose Setup
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    container_name: parkease-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: parkease
    volumes:
      - mongodb_data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro

  mongo-express:
    image: mongo-express
    container_name: parkease-mongo-express
    restart: always
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: password123
      ME_CONFIG_MONGODB_URL: mongodb://admin:password123@mongodb:27017/
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

#### Start Docker Services
```bash
# Start MongoDB and Mongo Express
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Docker Environment Configuration
```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/parkease?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3000
NODE_ENV=development
```

---

## 🚀 Running the Application with Database

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your database connection details
```

### Step 3: Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### Step 4: Verify Database Connection
Check server logs for:
```
✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
🚀 ParkEase Server running on port 3000
```

### Step 5: Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","phone":"+1234567890"}'
```

---

## 🔧 Database Management

### MongoDB Compass (GUI Tool)
1. **Download MongoDB Compass**
   - [Download here](https://www.mongodb.com/products/compass)
   - Free GUI tool for MongoDB

2. **Connect to Database**
   - Connection String: Your MongoDB URI
   - Browse collections, documents, and indexes

### Useful MongoDB Commands
```javascript
// Connect to database
use parkease

// View collections
show collections

// Count documents
db.users.countDocuments()
db.parkinglots.countDocuments()
db.bookings.countDocuments()

// Find documents
db.users.find().pretty()
db.parkinglots.find({isActive: true}).pretty()

// Create indexes
db.parkinglots.createIndex({"location": "2dsphere"})
db.bookings.createIndex({"user": 1, "createdAt": -1})

// Drop collection (be careful!)
db.users.drop()
```

### Backup and Restore
```bash
# Backup database
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/parkease" --out=./backup

# Restore database
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/parkease" ./backup/parkease
```

---

## 🔒 Security Best Practices

### Environment Variables
```env
# Strong JWT secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-32-character-random-string-here

# Database connection with authentication
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parkease

# Secure settings
NODE_ENV=production
BCRYPT_ROUNDS=12
```

### Database Security
1. **Enable Authentication** (always in production)
2. **Use Strong Passwords** (minimum 12 characters)
3. **Limit Network Access** (specific IP addresses)
4. **Regular Backups** (automated daily backups)
5. **Monitor Access Logs** (track database connections)

### Connection Security
```javascript
// Production MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  ssl: true,
  sslValidate: true
};
```

---

## 📊 Database Schema Overview

### Collections Structure
```
parkease/
├── users/              # User accounts and profiles
├── parkinglots/        # Parking space information
├── bookings/           # Parking reservations
└── sessions/           # User sessions (optional)
```

### Sample Data
The application will automatically create sample data on first run:
- Demo user account
- Sample parking lots with coordinates
- Test bookings for demonstration

### Indexes Created
- **Users**: email (unique), userType
- **ParkingLots**: location (2dsphere), owner, isActive
- **Bookings**: user + createdAt, parkingLot + status, qrCode (unique)

---

## 🚨 Troubleshooting

### Common Issues

#### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

#### Authentication Failed
```
Error: Authentication failed
```
**Solution**: Check username/password in connection string

#### Network Timeout
```
Error: Server selection timed out
```
**Solution**: Check network access settings in MongoDB Atlas

#### Database Not Found
```
Error: Database 'parkease' not found
```
**Solution**: Database will be created automatically on first document insert

### Debug Mode
Enable debug logging:
```env
DEBUG=mongoose:*
NODE_ENV=development
```

### Health Check Endpoint
Monitor database status:
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": "Connected"
}
```

---

## 🎯 Next Steps

1. **Choose Database Option** (MongoDB Atlas recommended)
2. **Configure Environment Variables**
3. **Install Dependencies** (`npm install`)
4. **Start Server** (`npm run dev`)
5. **Test API Endpoints**
6. **Update Frontend** to use API instead of localStorage

Your ParkEase application will now have persistent data storage with MongoDB! 🎉