# Deploy ParkEase to Render

## Quick Deployment Steps

### 1. Push to GitHub (Already Done ✅)
Your code is already on GitHub at:
https://github.com/Reedddeb-12/parkease-smart-parking

### 2. Sign Up for Render
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account

### 3. Create New Web Service
1. Click "New +" button
2. Select "Web Service"
3. Connect your GitHub repository: `parkease-smart-parking`
4. Click "Connect"

### 4. Configure Your Service

**Basic Settings:**
- **Name**: `parkease-smart-parking` (or your preferred name)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node app.js`

**Instance Type:**
- Select **Free** tier (perfect for testing)

### 5. Add Environment Variables

Click "Advanced" and add these environment variables:

```
MONGODB_URI = mongodb+srv://reeddhijitdeb_db_user:Reeddhijit_12@cluster0.7i6abub.mongodb.net/parkease?retryWrites=true&w=majority&appName=Cluster0

NODE_ENV = production

JWT_SECRET = parkease-super-secret-jwt-key-2024-production-ready

JWT_EXPIRE = 7d

PORT = 8888
```

### 6. Deploy!
1. Click "Create Web Service"
2. Wait 2-3 minutes for deployment
3. Your app will be live at: `https://parkease-smart-parking.onrender.com`

## After Deployment

### Your Live URLs:
- **Frontend**: `https://your-app-name.onrender.com`
- **API**: `https://your-app-name.onrender.com/api`
- **Health Check**: `https://your-app-name.onrender.com/api/health`

### Test Your Deployment:
1. Visit your Render URL
2. Click "Try Demo" to test login
3. Check if MongoDB connection works
4. Test booking a parking spot

## Important Notes

⚠️ **Free Tier Limitations:**
- App sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month free (enough for one app running 24/7)

💡 **Tips:**
- Keep your MongoDB Atlas connection string secure
- Monitor your app in Render dashboard
- Check logs if something goes wrong
- Free tier is perfect for demos and testing

## Troubleshooting

### If deployment fails:
1. Check Render logs in dashboard
2. Verify MongoDB connection string is correct
3. Make sure all dependencies are in package.json
4. Check that PORT environment variable is set

### If app doesn't load:
1. Wait 60 seconds (might be waking from sleep)
2. Check Render dashboard for errors
3. Visit `/api/health` endpoint to test API
4. Check MongoDB Atlas whitelist (should allow all IPs: 0.0.0.0/0)

## MongoDB Atlas Setup

Make sure your MongoDB Atlas is configured:
1. Go to https://cloud.mongodb.com
2. Click "Network Access"
3. Add IP Address: `0.0.0.0/0` (Allow from anywhere)
4. This allows Render to connect to your database

## Support

If you need help:
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Check your Render dashboard logs

---

🎉 **Your ParkEase app will be live and accessible worldwide!**
