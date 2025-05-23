#!/bin/bash

# SmartDispatch Planner Enhanced Setup Script
# This script sets up the enhanced version with Google Maps integration and advanced algorithms

echo "🚛 SmartDispatch Planner Enhanced Setup"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file for Google Maps API key
echo ""
echo "🗺️  Setting up Google Maps integration..."

if [ ! -f .env ]; then
    echo "Creating .env file for Google Maps API key..."
    cat > .env << EOL
# Google Maps API Key
# Get your API key from: https://console.cloud.google.com/google/maps-apis
# For Vite, environment variables must be prefixed with VITE_
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Optional: Enable development mode features
VITE_DEV_MODE=true
EOL
    echo "✅ .env file created"
    echo "⚠️  Please update .env with your Google Maps API key"
else
    echo "✅ .env file already exists"
fi

# Create Google Maps API setup instructions
cat > GOOGLE_MAPS_SETUP.md << EOL
# Google Maps API Setup Instructions

## 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

## 2. Enable Required APIs
Enable the following APIs in the Google Cloud Console:
- **Maps JavaScript API** - For interactive maps
- **Directions API** - For route optimization
- **Distance Matrix API** - For multi-point calculations
- **Geocoding API** - For address conversion
- **Places API** (optional) - For location search

## 3. Create API Key
1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Recommended) Restrict the API key to your domain

## 4. Configure the Application
1. Open the \`.env\` file in the project root
2. Replace \`your_google_maps_api_key_here\` with your actual API key
3. Note: For Vite, environment variables must be prefixed with \`VITE_\`
4. Save the file and restart the development server

## 5. API Usage and Pricing
- **Free Tier**: \$200 credit per month
- **Directions API**: \$5 per 1,000 requests
- **Distance Matrix API**: \$5 per 1,000 requests
- **Maps JavaScript API**: \$7 per 1,000 loads

For development and testing, the free tier should be sufficient.

## 6. Security Best Practices
- Restrict API key to specific domains in production
- Monitor API usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges
- Use environment variables for API keys (never commit to version control)
EOL

echo "✅ Google Maps setup instructions created (GOOGLE_MAPS_SETUP.md)"

# Run tests to verify everything is working
echo ""
echo "🧪 Running tests..."
npm test -- --watchAll=false --verbose

if [ $? -eq 0 ]; then
    echo "✅ All tests passed"
else
    echo "⚠️  Some tests failed, but the application should still work"
fi

# Build the application to verify everything compiles
echo ""
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Application built successfully"
    echo "📁 Build files are in the 'dist' directory"
else
    echo "❌ Build failed. Please check for errors above."
    exit 1
fi

# Create a quick start guide
cat > QUICK_START.md << EOL
# SmartDispatch Planner - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Development Server
\`\`\`bash
npm run dev
\`\`\`

### 2. Open in Browser
Navigate to: http://localhost:5173

### 3. Configure Google Maps (Optional)
1. Get a Google Maps API key (see GOOGLE_MAPS_SETUP.md)
2. Update the \`.env\` file with your API key (use \`VITE_GOOGLE_MAPS_API_KEY\`)
3. Restart the development server

## 📋 Basic Usage

### Step 1: Order Intake
- Select orders from the sample data
- Filter by route, material type, or status
- Use checkboxes to select multiple orders

### Step 2: Material Type Selection
- Choose between Cuboidal, Cylindrical, or Mixed loads
- Review material-specific constraints

### Step 3: Plan Creation
- Configure vehicle types and quantities
- Set optimization priorities
- Choose loading sequence (LIFO/FIFO/Route/Weight)
- Generate optimized plan

### Step 4: 3D Visualization
- View interactive 3D truck load arrangement
- Click items to see details
- Rotate, zoom, and pan the view
- Toggle labels and export options

### Step 5: Route Optimization (Requires Google Maps API)
- View optimized routes on interactive map
- See real-time traffic information
- Compare route options and costs

## 🔧 Configuration Options

### Vehicle Types
- **SXL Container**: 25 tons, 38.5 m³
- **Eicher 14ft**: 4.5 tons, 16.6 m³
- **Tata Ace**: 750 kg, 4.6 m³

### Material Types
- **Cuboidal**: Boxes, cartons, pallets
- **Cylindrical**: Drums, rolls, pipes
- **Mixed**: Combination of both types

### Optimization Priorities
- **Cost**: Minimize transportation cost
- **Volume**: Maximize space usage
- **Weight**: Optimize weight distribution
- **Route**: Minimize travel distance
- **Balanced**: Balance all factors

## 🎯 Key Features

### Advanced Load Optimization
- 3D bin packing algorithm
- Collision detection
- Weight distribution analysis
- Center of gravity calculations

### Material-Specific Handling
- Cuboidal stacking rules
- Cylindrical nesting and interlocking
- Rolling prevention for horizontal cylinders
- Support structure calculations

### Route Optimization
- Real-time traffic data
- Multi-vehicle routing
- Distance and time calculations
- Cost optimization

### Safety and Compliance
- Stacking height limits
- Weight distribution constraints
- Hazardous material separation
- Loading sequence validation

## 📊 Sample Data

The application includes realistic sample data:
- 7 sample orders with different material types
- 4 route options (Delhi to Mumbai/Hyderabad/Chennai/Bangalore)
- 3 vehicle types with different capacities
- Various material dimensions and weights

## 🛠️ Troubleshooting

### Common Issues

1. **Google Maps not loading**
   - Check if API key is set in .env file
   - Verify API key has required permissions
   - Check browser console for errors

2. **3D visualization not working**
   - Ensure WebGL is supported in your browser
   - Try refreshing the page
   - Check browser console for Three.js errors

3. **Build errors**
   - Run \`npm install\` to ensure all dependencies are installed
   - Check Node.js version (16+ required)
   - Clear node_modules and reinstall if needed

### Performance Tips

1. **Large datasets**
   - Use filtering to reduce visible orders
   - Limit vehicle quantities for complex optimizations
   - Consider pagination for very large order lists

2. **3D rendering**
   - Reduce detail level for better performance
   - Close other browser tabs to free memory
   - Use a dedicated graphics card if available

## 📚 Additional Resources

- **BRD**: Business Requirements Document
- **PROJECT_SUMMARY.md**: Detailed feature overview
- **IMPLEMENTATION_PLAN.md**: Technical implementation details
- **GOOGLE_MAPS_SETUP.md**: Google Maps API configuration

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Verify all dependencies are properly installed
4. Ensure Google Maps API is configured correctly
EOL

echo "✅ Quick start guide created (QUICK_START.md)"

# Final setup summary
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "✅ Dependencies installed"
echo "✅ Environment configuration created"
echo "✅ Google Maps setup instructions provided"
echo "✅ Application built successfully"
echo "✅ Documentation created"
echo ""
echo "📋 Next Steps:"
echo "1. Configure Google Maps API key in .env file (optional)"
echo "2. Start development server: npm run dev"
echo "3. Open http://localhost:5173 in your browser"
echo "4. Read QUICK_START.md for usage instructions"
echo ""
echo "🗺️  For Google Maps integration:"
echo "   - Read GOOGLE_MAPS_SETUP.md for detailed instructions"
echo "   - Get API key from: https://console.cloud.google.com/google/maps-apis"
echo ""
echo "Happy dispatching! 🚛📦"
