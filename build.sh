#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Netlify build process..."

# Check if we're in the right directory
echo "📁 Current directory: $(pwd)"
echo "📋 Directory contents:"
ls -la

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
else
    echo "📦 Dependencies already installed"
fi

# Check if vite is available
echo "🔍 Checking if vite is available..."
if ! command -v vite &> /dev/null; then
    echo "❌ Vite not found in PATH, trying npx..."
    if ! npx vite --version &> /dev/null; then
        echo "❌ Vite not found even with npx!"
        exit 1
    fi
fi

# Run the build
echo "🏗️ Building the application..."
npm run build

# Check if dist directory was created
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not created!"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build output:"
ls -la dist/
