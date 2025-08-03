#!/bin/bash

# 🚀 Campus Marketplace Backend Deployment Script
# This script automates the Railway deployment process

echo "🎯 Campus Marketplace Backend Deployment"
echo "========================================"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "📝 Please login to Railway:"
    railway login
fi

# Create new Railway project or use existing
echo "🚀 Initializing Railway project..."
railway init

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set FIREBASE_PROJECT_ID=dcpmarketplace
railway variables set ALLOWED_DOMAINS="@email.iimcal.ac.in,@gmail.com"

echo "🔑 Please set FIREBASE_SERVICE_ACCOUNT manually in Railway dashboard"
echo "    Copy the contents of serviceAccountKey.json"

# Deploy
echo "🚀 Deploying to Railway..."
railway deploy

# Get the deployment URL
echo "🌐 Getting deployment URL..."
URL=$(railway domain)

echo "✅ Deployment Complete!"
echo "========================"
echo "🌐 Backend URL: $URL"
echo "🎯 Health Check: $URL/health"
echo "📝 Next steps:"
echo "   1. Update frontend/src/config/api.js with this URL"
echo "   2. Set FIREBASE_SERVICE_ACCOUNT in Railway dashboard"
echo "   3. Test the deployment"
echo ""
echo "🎉 Your Campus Marketplace backend is live!"
