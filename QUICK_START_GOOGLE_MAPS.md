# Quick Start: Google Maps Integration

Get your ParkEase app running with Google Maps in 5 minutes!

## 🚀 Quick Setup

### 1. Get Your API Key (2 minutes)

1. Visit: https://console.cloud.google.com/
2. Create/select a project
3. Enable **Maps JavaScript API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### 2. Configure Your App (1 minute)

**Update `.env` file:**
```env
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Update `index-google-maps.html` (line 186 and 189):**
```javascript
const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';
```
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places"></script>
```

### 3. Start Your Server (1 minute)

```bash
npm install
npm start
```

### 4. Test It! (1 minute)

Open: http://localhost:8888/index-google-maps.html

Click **"Find Nearby"** button to see nearby parking lots!

## ✨ Features You Get

- 📍 **Find Nearby Parking** - Automatically detect your location
- 🗺️ **Interactive Map** - Click markers to see details
- 🔍 **Address Search** - Search any location
- 📏 **Distance Display** - See how far each parking lot is
- 🎯 **Smart Sorting** - Sort by distance, price, or availability

## 📱 Usage Examples

### Find Nearby Parking Lots

```javascript
// Frontend
const nearbySearch = new NearbyParkingSearch('/api/parking');
const location = await nearbySearch.getUserLocation();
const nearby = await nearbySearch.findNearby(location.lat, location.lng, 5);
```

### Backend API Call

```bash
curl "http://localhost:8888/api/parking/nearby?lat=22.5726&lng=88.3639&radius=5"
```

### Search by Name

```bash
curl "http://localhost:8888/api/parking/search?q=city+center"
```

## 🎨 Customization

### Change Default Location

Edit `index-google-maps.html`:
```javascript
// Change from Kolkata to your city
mapsHelper.initMap('map', { lat: YOUR_LAT, lng: YOUR_LNG }, 13);
```

### Change Search Radius

```javascript
// Change from 5km to 10km
const nearbyLots = mapsHelper.findNearbyLots(allParkingLots, 10);
```

### Customize Map Style

Edit `public/js/google-maps-helper.js`:
```javascript
styles: [
    {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
    },
    // Add more styles here
]
```

## 🆚 Google Maps vs Leaflet

| Feature | Google Maps | Leaflet (Current) |
|---------|-------------|-------------------|
| Cost | Free tier ($200/month) | Free |
| Geocoding | Built-in | Requires 3rd party |
| Directions | Built-in | Requires 3rd party |
| Places Search | Built-in | Not available |
| Customization | High | Medium |
| Performance | Excellent | Good |

## 🔧 Troubleshooting

**Map not loading?**
- Check API key is correct
- Enable Maps JavaScript API in Google Cloud Console
- Check browser console for errors

**Location not detected?**
- Grant location permission in browser
- Use HTTPS in production (required for geolocation)

**No parking lots showing?**
- Run `node seed-parking-lots.js` to add sample data
- Check MongoDB connection in `.env`

## 📚 Files Created

```
├── config/
│   └── google-maps.config.js          # Google Maps configuration
├── public/
│   └── js/
│       ├── google-maps-helper.js      # Google Maps utility class
│       └── nearby-parking.js          # Nearby search utility
├── routes/
│   └── parking-nearby.js              # Backend API routes
├── index-google-maps.html             # Google Maps version
├── GOOGLE_MAPS_SETUP.md              # Detailed setup guide
└── QUICK_START_GOOGLE_MAPS.md        # This file
```

## 🎯 Next Steps

1. ✅ Test nearby parking search
2. ✅ Add more parking lots to database
3. ✅ Implement booking functionality
4. ✅ Add payment integration
5. ✅ Deploy to production

## 💡 Pro Tips

- **Free Tier**: $200/month = ~28,000 map loads
- **Restrict API Key**: Add domain restrictions for security
- **Cache Results**: Reduce API calls by caching nearby results
- **Fallback**: Keep Leaflet as backup if quota exceeded

## 🆘 Need Help?

- 📖 [Full Setup Guide](./GOOGLE_MAPS_SETUP.md)
- 🌐 [Google Maps Docs](https://developers.google.com/maps/documentation)
- 💬 Check the code comments in `google-maps-helper.js`

---

**Ready to find parking? Let's go! 🚗💨**
