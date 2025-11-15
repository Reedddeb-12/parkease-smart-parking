# ✅ Google Maps Setup Checklist

Follow this checklist to get Google Maps working in your ParkEase app.

## 📋 Pre-Setup Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] Project dependencies installed (`npm install`)
- [ ] `.env` file created from `.env.example`

## 🔑 Step 1: Get Google Maps API Key (5 minutes)

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a new project (or select existing)
- [ ] Enable these APIs:
  - [ ] Maps JavaScript API
  - [ ] Geocoding API (optional)
  - [ ] Directions API (optional)
  - [ ] Places API (optional)
- [ ] Create API Key:
  - [ ] Go to **APIs & Services** → **Credentials**
  - [ ] Click **Create Credentials** → **API Key**
  - [ ] Copy your API key
- [ ] (Recommended) Restrict API Key:
  - [ ] Add HTTP referrer restrictions
  - [ ] Restrict to specific APIs

## ⚙️ Step 2: Configure Your App (2 minutes)

### Update .env file
- [ ] Open `.env` file
- [ ] Add: `GOOGLE_MAPS_API_KEY=your_actual_api_key_here`
- [ ] Save file

### Update HTML files
- [ ] Open `index-google-maps.html`
- [ ] Find line 186: Replace `YOUR_GOOGLE_MAPS_API_KEY` with your key
- [ ] Find line 189: Replace `YOUR_GOOGLE_MAPS_API_KEY` with your key
- [ ] Save file

### Update test file (optional)
- [ ] Open `test-google-maps.html`
- [ ] Replace `YOUR_GOOGLE_MAPS_API_KEY` with your key
- [ ] Save file

## 🗄️ Step 3: Setup Database (2 minutes)

- [ ] Ensure MongoDB is running
- [ ] Run seed script: `node seed-parking-lots.js`
- [ ] Verify data: `node view-database.js`

## 🚀 Step 4: Start Server (1 minute)

- [ ] Run: `npm start`
- [ ] Check console for success message
- [ ] Verify server is running on port 8888

## 🧪 Step 5: Test Integration (5 minutes)

### Test Page
- [ ] Open: http://localhost:8888/test-google-maps.html
- [ ] Click "Run Tests" button
- [ ] Verify all tests pass ✅

### Test Nearby Search
- [ ] Open: http://localhost:8888/index-google-maps.html
- [ ] Login with demo account (click "Try Demo")
- [ ] Click "Find Nearby" button
- [ ] Verify map shows your location
- [ ] Verify parking lots appear on map
- [ ] Click on a marker to see details

### Test Address Search
- [ ] Enter an address in search box
- [ ] Click "Search" button
- [ ] Verify map centers on searched location

### Test Sorting
- [ ] Use "Sort by" dropdown
- [ ] Try: Distance, Price, Availability
- [ ] Verify list updates correctly

## 🔍 Step 6: Verify API Endpoints (2 minutes)

### Test in browser or Postman:

**Nearby Search:**
```
http://localhost:8888/api/parking/nearby?lat=22.5726&lng=88.3639&radius=5
```
- [ ] Returns JSON with parking lots
- [ ] Includes distance calculations
- [ ] Sorted by distance

**Search:**
```
http://localhost:8888/api/parking/search?q=parking
```
- [ ] Returns matching parking lots

**Directions:**
```
POST http://localhost:8888/api/parking/directions
Body: {
  "origin": {"lat": 22.5726, "lng": 88.3639},
  "destination": {"lat": 22.5800, "lng": 88.3700}
}
```
- [ ] Returns distance and time

## 📱 Step 7: Test on Mobile (Optional)

- [ ] Access from mobile device on same network
- [ ] Use: http://YOUR_IP:8888/index-google-maps.html
- [ ] Grant location permission
- [ ] Test "Find Nearby" feature
- [ ] Verify responsive design

## 🎨 Step 8: Customization (Optional)

- [ ] Change default location (if not in Kolkata)
- [ ] Adjust search radius
- [ ] Customize map styles
- [ ] Update marker icons
- [ ] Modify color scheme

## 📊 Verification Checklist

### Frontend
- [ ] Map loads without errors
- [ ] User location detected
- [ ] Parking markers appear
- [ ] Info windows work
- [ ] Search functionality works
- [ ] Sorting works
- [ ] Responsive on mobile

### Backend
- [ ] Server starts without errors
- [ ] MongoDB connected
- [ ] All API endpoints respond
- [ ] Distance calculations correct
- [ ] Search returns results

### Integration
- [ ] Google Maps API key valid
- [ ] No console errors
- [ ] No 403 errors (API restrictions)
- [ ] Geolocation permission granted
- [ ] Data loads from database

## 🐛 Troubleshooting

### Map not loading?
- [ ] Check API key is correct
- [ ] Verify Maps JavaScript API is enabled
- [ ] Check browser console for errors
- [ ] Verify no API restrictions blocking localhost

### Location not detected?
- [ ] Grant location permission in browser
- [ ] Check if HTTPS (required in production)
- [ ] Try different browser
- [ ] Check geolocation settings

### No parking lots showing?
- [ ] Run: `node seed-parking-lots.js`
- [ ] Check MongoDB connection
- [ ] Verify data in database: `node view-database.js`
- [ ] Check API endpoint: `/api/parking`

### API errors?
- [ ] Check server is running
- [ ] Verify MongoDB is connected
- [ ] Check network tab in browser
- [ ] Review server logs

### Distance not calculating?
- [ ] Verify coordinates format: [longitude, latitude]
- [ ] Check parking lots have valid coordinates
- [ ] Test with known coordinates

## 📚 Documentation Reference

- [ ] Read: `QUICK_START_GOOGLE_MAPS.md`
- [ ] Read: `GOOGLE_MAPS_SETUP.md`
- [ ] Read: `INTEGRATION_SUMMARY.md`
- [ ] Review: Code comments in `google-maps-helper.js`

## 🎯 Next Steps After Setup

- [ ] Add more parking lots to database
- [ ] Implement booking functionality
- [ ] Add payment integration
- [ ] Set up user authentication
- [ ] Deploy to production
- [ ] Configure production API key
- [ ] Set up monitoring

## 💡 Pro Tips

- [ ] Use environment variables for API keys
- [ ] Implement caching to reduce API calls
- [ ] Add error boundaries for better UX
- [ ] Monitor API usage in Google Cloud Console
- [ ] Set up billing alerts
- [ ] Keep Leaflet as fallback option

## ✅ Final Verification

Run through this complete flow:

1. [ ] Open app in browser
2. [ ] Login/register
3. [ ] See map with parking lots
4. [ ] Click "Find Nearby"
5. [ ] See your location on map
6. [ ] See distance to each parking lot
7. [ ] Click on a marker
8. [ ] See parking details
9. [ ] Search for an address
10. [ ] Sort parking lots
11. [ ] Everything works smoothly!

## 🎉 Success!

If all items are checked, congratulations! Your Google Maps integration is complete and working.

---

**Need Help?**
- Check documentation files
- Review code comments
- Test with `test-google-maps.html`
- Verify API key in Google Cloud Console

**Ready to Deploy?**
- Update API key restrictions for production domain
- Enable HTTPS
- Set up monitoring
- Configure rate limiting
