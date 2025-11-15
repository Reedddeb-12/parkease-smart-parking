# Google Maps API Integration Guide for ParkEase

This guide will help you integrate Google Maps API into your ParkEase parking application to enable location-based features like finding nearby parking lots.

## Features Added

✅ **Google Maps Integration** - Interactive map with custom markers
✅ **Nearby Parking Search** - Find parking lots within a specified radius
✅ **User Location Detection** - Automatically detect user's current location
✅ **Distance Calculation** - Show distance from user to each parking lot
✅ **Address Search** - Search for parking by address using Geocoding API
✅ **Directions** - Get directions to selected parking lot
✅ **Sort & Filter** - Sort parking lots by distance, price, or availability

## Setup Instructions

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional, for enhanced search)
   - Directions API (optional, for navigation)

4. Create credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **API Key**
   - Copy your API key

5. (Recommended) Restrict your API key:
   - Click on your API key
   - Under **Application restrictions**, select **HTTP referrers**
   - Add your domain (e.g., `localhost:8888/*`, `yourdomain.com/*`)
   - Under **API restrictions**, select **Restrict key** and choose the APIs you enabled

### Step 2: Configure Environment Variables

1. Open your `.env` file (or create one from `.env.example`)
2. Add your Google Maps API key:

```env
GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### Step 3: Update HTML Files

Replace the placeholder API key in your HTML files:

**In `index-google-maps.html`:**

Find these lines:
```javascript
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
```
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
```

Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key.

### Step 4: Use the New Google Maps Version

You have two options:

**Option A: Replace existing index.html**
```bash
# Backup your current index.html
mv index.html index-leaflet-backup.html

# Use the Google Maps version
mv index-google-maps.html index.html
```

**Option B: Keep both versions**
- Access Leaflet version at: `http://localhost:8888/index.html`
- Access Google Maps version at: `http://localhost:8888/index-google-maps.html`

### Step 5: Test the Integration

1. Start your server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:8888
```

3. Test these features:
   - ✅ Map loads correctly
   - ✅ Click "Find Nearby" to locate parking lots near you
   - ✅ Search for an address in the search box
   - ✅ Click on map markers to see parking details
   - ✅ Sort parking lots by distance, price, or availability

## API Endpoints

### Find Nearby Parking Lots

```http
GET /api/parking/nearby?lat=22.5726&lng=88.3639&radius=5
```

**Parameters:**
- `lat` (required): User's latitude
- `lng` (required): User's longitude
- `radius` (optional): Search radius in kilometers (default: 5)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "searchRadius": "5km",
  "userLocation": { "lat": 22.5726, "lng": 88.3639 },
  "data": [
    {
      "_id": "...",
      "name": "City Center Parking",
      "address": "123 Main St",
      "distance": 0.8,
      "distanceText": "800m",
      "availableSlots": 45,
      "totalSlots": 100,
      "pricePerHour": 50
    }
  ]
}
```

### Search Parking Lots

```http
GET /api/parking/search?q=city+center
```

**Parameters:**
- `q` (required): Search query (searches in name and address)

### Get Directions

```http
POST /api/parking/directions
Content-Type: application/json

{
  "origin": { "lat": 22.5726, "lng": 88.3639 },
  "destination": { "lat": 22.5800, "lng": 88.3700 }
}
```

## Frontend Usage

### Initialize Google Maps

```javascript
const mapsHelper = new GoogleMapsHelper(GOOGLE_MAPS_API_KEY);
mapsHelper.initMap('map');
```

### Get User Location

```javascript
const location = await mapsHelper.getUserLocation();
mapsHelper.addUserMarker(location);
```

### Add Parking Markers

```javascript
mapsHelper.addParkingMarkers(parkingLots);
mapsHelper.fitBounds();
```

### Find Nearby Parking

```javascript
const nearbyLots = mapsHelper.findNearbyLots(allParkingLots, 5); // 5km radius
```

### Search Address

```javascript
const result = await mapsHelper.geocodeAddress('123 Main Street, Kolkata');
mapsHelper.map.setCenter({ lat: result.lat, lng: result.lng });
```

## Cost Considerations

Google Maps API has a free tier with monthly credits:
- **$200 free credit per month**
- Maps JavaScript API: $7 per 1,000 loads
- Geocoding API: $5 per 1,000 requests
- Directions API: $5 per 1,000 requests

For a small to medium application, the free tier should be sufficient.

## Troubleshooting

### Map not loading
- Check if your API key is correct
- Verify that Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for errors
- Ensure your domain is whitelisted in API key restrictions

### "This page can't load Google Maps correctly"
- Your API key might be restricted or invalid
- Check if billing is enabled in Google Cloud Console
- Verify API restrictions match your usage

### Location not detected
- User must grant location permission in browser
- HTTPS is required for geolocation in production
- Provide fallback to manual location entry

### Markers not showing
- Verify parking lot coordinates are in correct format: [longitude, latitude]
- Check if parking lots have `isActive: true`
- Ensure coordinates are valid numbers

## Alternative: Keep Using Leaflet

If you prefer to keep using Leaflet (OpenStreetMap) instead of Google Maps:

**Pros:**
- Free and open-source
- No API key required
- No usage limits

**Cons:**
- Less features than Google Maps
- No built-in geocoding or directions
- Fewer customization options

You can still use the nearby search functionality with Leaflet by using the backend API endpoints.

## Next Steps

1. ✅ Set up Google Maps API key
2. ✅ Test nearby parking search
3. ✅ Implement booking functionality
4. ✅ Add real-time availability updates
5. ✅ Integrate payment gateway
6. ✅ Add user reviews and ratings

## Support

For issues or questions:
- Check Google Maps API documentation: https://developers.google.com/maps/documentation
- Review the code in `public/js/google-maps-helper.js`
- Check backend routes in `routes/parking-nearby.js`

---

**Happy Parking! 🚗🅿️**
