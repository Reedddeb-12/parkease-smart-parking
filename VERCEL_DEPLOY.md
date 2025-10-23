# Deploy ParkEase to Vercel

## Quick Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with your GitHub account
3. **Click "Add New Project"**
4. **Import** your GitHub repository: `parkease-smart-parking`
5. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: `npm install`

6. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   MONGODB_URI = mongodb+srv://reeddhijitdeb_db_user:Reeddhijit_12@cluster0.7i6abub.mongodb.net/parkease?retryWrites=true&w=majority&appName=Cluster0
   
   JWT_SECRET = parkease-super-secret-jwt-key-2024-production-ready
   
   NODE_ENV = production
   ```

7. **Click "Deploy"**
8. **Wait 2-3 minutes** for deployment

### 3. Your Live URLs
After deployment, you'll get:
- **Frontend**: `https://parkease-smart-parking.vercel.app`
- **API**: `https://parkease-smart-parking.vercel.app/api`

### 4. Test Your Deployment
1. Visit your Vercel URL
2. Click "Try Demo"
3. Test login/register
4. Check if everything works!

## Advantages of Vercel

✅ **No Sleep Time** - Always instant response
✅ **Fast CDN** - Global edge network
✅ **Auto Deploy** - Deploys on every git push
✅ **Free SSL** - HTTPS by default
✅ **No Caching Issues** - Fresh deploys every time

## Troubleshooting

### If API doesn't work:
1. Check Vercel logs in dashboard
2. Verify environment variables are set
3. Make sure MongoDB Atlas allows all IPs (0.0.0.0/0)

### If deployment fails:
1. Check build logs in Vercel dashboard
2. Make sure all dependencies are in package.json
3. Verify vercel.json is correct

## Alternative: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

---

🎉 **Your ParkEase app will be live on Vercel with no caching issues!**
