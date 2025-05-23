#!/bin/bash

echo "🚛 SmartDispatch Planner Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "📥 Please install Node.js from https://nodejs.org/"
    echo "   Or use a package manager:"
    echo "   - macOS: brew install node"
    echo "   - Ubuntu: sudo apt install nodejs npm"
    echo "   - Windows: Download from nodejs.org"
    echo ""
    echo "🌐 In the meantime, you can view the demo at:"
    echo "   file://$(pwd)/demo.html"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🚀 Starting development server..."
    echo "   The application will open at http://localhost:3000"
    echo ""
    echo "📋 Available commands:"
    echo "   npm run dev     - Start development server"
    echo "   npm run build   - Build for production"
    echo "   npm run preview - Preview production build"
    echo ""
    
    # Start the development server
    npm run dev
else
    echo "❌ Failed to install dependencies"
    echo "🌐 You can still view the demo at:"
    echo "   file://$(pwd)/demo.html"
    exit 1
fi
