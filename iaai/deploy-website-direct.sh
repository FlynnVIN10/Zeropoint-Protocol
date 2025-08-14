#!/bin/bash

echo "🚀 DIRECT WEBSITE DEPLOYMENT TO CLOUDFLARE PAGES"
echo "=================================================="

# Check if we're in the right directory
if [ ! -d "website" ]; then
    echo "❌ Error: website directory not found"
    echo "Please run this script from the Zeropoint-Protocol root directory"
    exit 1
fi

echo "📁 Building website..."
cd website

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build website
echo "🔨 Building website..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful!"

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "❌ Build output directory 'out' not found"
    exit 1
fi

echo "📊 Build output:"
ls -la out/
echo ""

echo "🌐 Website is ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Go to Cloudflare Dashboard: https://dash.cloudflare.com"
echo "2. Navigate to Pages > zeropointprotocol-ai"
echo "3. Upload the contents of the 'out' directory"
echo "4. Or use Wrangler CLI: wrangler pages deploy out --project-name=zeropointprotocol-ai"
echo ""
echo "The website includes:"
echo "✅ Professional AI control center interface"
echo "✅ Modern glassmorphism design"
echo "✅ Responsive layout"
echo "✅ All control center pages (overview, synthients, consensus, metrics, audit)"
echo "✅ Real-time status indicators"
echo "✅ Professional data tables and metrics"
echo ""
echo "🎯 Deployment ready at: https://zeropointprotocol.ai"
