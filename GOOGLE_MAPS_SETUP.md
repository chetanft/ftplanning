# Google Maps API Setup Guide

## Overview

The Freight Tiger SmartDispatch Planner includes route visualization features that can use Google Maps API for enhanced mapping capabilities. However, the application works perfectly fine without a Google Maps API key by using static route visualization.

## Current Status

✅ **Application works without Google Maps API key**
- Static route visualization is displayed when no API key is provided
- All route calculations use estimated data based on predefined routes
- No functionality is lost - just the interactive map view

## Setting up Google Maps API (Optional)

If you want to enable interactive Google Maps features, follow these steps:

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure the API Key

Create a `.env` file in the root directory of your project:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Restart the Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Features Available

### Without Google Maps API Key:
- ✅ Static route visualization with estimated distances
- ✅ Route summary with cost calculations
- ✅ Vehicle assignment and optimization
- ✅ All planning and visualization features
- ✅ 3D truck load visualization

### With Google Maps API Key:
- ✅ All above features
- ✅ Interactive Google Maps
- ✅ Real-time traffic data
- ✅ Optimized route calculations
- ✅ Accurate distance and time estimates
- ✅ Turn-by-turn directions

## Troubleshooting

### Common Issues:

1. **"Invalid API Key" errors**:
   - Check that your API key is correct
   - Ensure the required APIs are enabled
   - Verify domain restrictions

2. **Map not loading**:
   - Check browser console for errors
   - Verify internet connection
   - The app will automatically fall back to static visualization

3. **Quota exceeded**:
   - Check your Google Cloud Console for usage limits
   - Consider upgrading your plan if needed

### Error Handling

The application includes robust error handling:
- Automatic fallback to static visualization if Google Maps fails
- Error boundaries to prevent crashes
- Clear error messages for debugging

## Cost Considerations

Google Maps API usage may incur costs based on:
- Number of map loads
- Route calculations
- Geocoding requests

For development and testing, Google provides free tier usage that should be sufficient for most use cases.

## Alternative Solutions

If you prefer not to use Google Maps API, the application works perfectly with:
- Static route visualization
- Estimated route data based on predefined routes
- All core planning and optimization features

The static visualization provides all essential information needed for dispatch planning without requiring external API dependencies.
