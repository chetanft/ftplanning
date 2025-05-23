# Freight Tiger SmartDispatch Planner - Troubleshooting Guide

## Common Issues and Solutions

### 1. "process is not defined" Error

**Error Message:**
```
Uncaught ReferenceError: process is not defined at App (App.jsx:28:28)
```

**Cause:**
This error occurs because Vite (the build tool) doesn't provide the `process` global variable that's available in Node.js environments.

**Solution:**
✅ **Already Fixed** - The code has been updated to use `import.meta.env` instead of `process.env`.

**What was changed:**
```javascript
// Before (causes error):
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// After (fixed):
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
```

**Environment Variable Setup:**
1. Create or update `.env` file in project root:
```bash
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

2. Restart the development server:
```bash
npm run dev
```

### 2. Google Maps Not Loading

**Symptoms:**
- Map area shows as blank or gray
- Console errors related to Google Maps

**Solutions:**

#### Check API Key Configuration
1. Verify `.env` file exists with correct format:
```bash
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

2. Ensure API key is valid and has required permissions
3. Restart development server after changing `.env`

#### Enable Required APIs
In Google Cloud Console, enable:
- Maps JavaScript API
- Directions API
- Distance Matrix API
- Geocoding API

#### Check API Key Restrictions
- Remove domain restrictions during development
- Add `localhost:5173` to allowed domains if restrictions are needed

### 3. 3D Visualization Issues

**Symptoms:**
- Black screen in 3D view
- "WebGL not supported" errors
- Poor performance or crashes

**Solutions:**

#### WebGL Support
1. Check if WebGL is enabled in browser:
   - Visit: https://get.webgl.org/
   - Should show spinning cube

2. Update graphics drivers
3. Try different browser (Chrome/Firefox recommended)

#### Performance Issues
1. Reduce number of items being visualized
2. Close other browser tabs
3. Lower browser zoom level
4. Use hardware acceleration if available

### 4. Build/Compilation Errors

**Symptoms:**
- Application won't start
- Import/export errors
- Module not found errors

**Solutions:**

#### Clear Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Check Node.js Version
```bash
node --version  # Should be 16+
```

#### Verify File Structure
Ensure all required files exist:
```
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/
├── utils/
├── services/
└── data/
```

### 5. Route Optimization Not Working

**Symptoms:**
- Routes tab shows "No Routes to Display"
- Route calculations fail
- Console errors from Google Maps API

**Solutions:**

#### API Quota Issues
1. Check Google Cloud Console for API usage
2. Verify billing is enabled
3. Check for quota exceeded errors

#### Network Issues
1. Check internet connection
2. Verify firewall isn't blocking Google APIs
3. Try different network if behind corporate firewall

#### API Key Permissions
1. Ensure API key has Directions API enabled
2. Check for IP/domain restrictions
3. Verify API key hasn't expired

### 6. Excel Import/Export Issues

**Symptoms:**
- File upload fails
- Export doesn't work
- Data formatting errors

**Solutions:**

#### File Format
- Use .xlsx format (not .xls)
- Ensure proper column headers
- Check for special characters in data

#### Browser Permissions
- Allow file downloads in browser
- Check popup blocker settings
- Ensure sufficient disk space

### 7. Performance Issues

**Symptoms:**
- Slow loading times
- Laggy interactions
- High memory usage

**Solutions:**

#### Optimize Data
1. Limit number of orders displayed
2. Use filtering to reduce dataset
3. Paginate large lists

#### Browser Optimization
1. Close unnecessary tabs
2. Clear browser cache
3. Disable browser extensions
4. Use incognito mode for testing

#### System Resources
1. Close other applications
2. Ensure sufficient RAM (4GB+ recommended)
3. Use SSD storage if available

## Getting Help

### Debug Information to Collect

When reporting issues, please include:

1. **Browser Information:**
   - Browser name and version
   - Operating system
   - WebGL support status

2. **Console Errors:**
   - Open Developer Tools (F12)
   - Copy any error messages from Console tab
   - Include full stack traces

3. **Environment:**
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Project setup method used

4. **Steps to Reproduce:**
   - Exact steps that cause the issue
   - Expected vs actual behavior
   - Screenshots if helpful

### Quick Diagnostic Commands

```bash
# Check versions
node --version
npm --version

# Check for build errors
npm run build

# Check for test failures
npm test

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Browser Console Commands

```javascript
// Check if Google Maps is loaded
console.log(window.google);

// Check environment variables
console.log(import.meta.env);

// Check WebGL support
console.log(!!window.WebGLRenderingContext);
```

## Prevention Tips

1. **Regular Updates:**
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Test after updates

2. **Environment Management:**
   - Use `.env.example` as template
   - Never commit API keys to version control
   - Use different keys for dev/prod

3. **Performance Monitoring:**
   - Monitor API usage quotas
   - Track application performance
   - Set up error logging

4. **Testing:**
   - Test in multiple browsers
   - Verify on different devices
   - Test with various data sizes

## Contact Support

If issues persist after trying these solutions:

1. Check existing GitHub issues
2. Create new issue with debug information
3. Include steps to reproduce
4. Provide system/browser details
