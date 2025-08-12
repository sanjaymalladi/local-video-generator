#!/bin/bash

# Daytona Sandbox Setup Script
# This script helps you set up and deploy the Manim video generation service on Daytona

set -e

echo "🎬 Setting up Daytona Sandbox for Manim Video Generation"
echo "========================================================"

# Check if Daytona CLI is installed
if ! command -v daytona &> /dev/null; then
    echo "❌ Daytona CLI not found. Installing..."
    curl -fsSL https://download.daytona.io/daytona/install.sh | sh
    echo "✅ Daytona CLI installed successfully"
else
    echo "✅ Daytona CLI already installed"
fi

# Check if user is logged in
if ! daytona whoami &> /dev/null; then
    echo "❌ Not logged in to Daytona. Please log in:"
    echo "   daytona login"
    exit 1
fi

echo "✅ Logged in to Daytona as: $(daytona whoami)"

# Create sandbox
echo "🚀 Creating Daytona sandbox..."
SANDBOX_NAME="manim-video-generator-$(date +%s)"

daytona create \
    --name "$SANDBOX_NAME" \
    --template python \
    --cpu 2 \
    --memory 4 \
    --disk 10

echo "✅ Sandbox created: $SANDBOX_NAME"

# Get sandbox URL
SANDBOX_URL=$(daytona sandbox url "$SANDBOX_NAME")
echo "🌐 Sandbox URL: $SANDBOX_URL"

# Deploy the application
echo "📦 Deploying application to sandbox..."

# Copy files to sandbox
daytona sandbox cp "$SANDBOX_NAME" app.py app.py
daytona sandbox cp "$SANDBOX_NAME" requirements.txt requirements.txt
daytona sandbox cp "$SANDBOX_NAME" Dockerfile Dockerfile

# Install dependencies
echo "📥 Installing Python dependencies..."
daytona sandbox exec "$SANDBOX_NAME" -- pip install -r requirements.txt

# Start the application
echo "🚀 Starting the application..."
daytona sandbox exec "$SANDBOX_NAME" -- python app.py &

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Test the health endpoint
echo "🏥 Testing health endpoint..."
if curl -f "$SANDBOX_URL/health" > /dev/null 2>&1; then
    echo "✅ Application is healthy!"
else
    echo "❌ Health check failed. Check the logs:"
    daytona sandbox logs "$SANDBOX_NAME"
    exit 1
fi

echo ""
echo "🎉 Daytona Sandbox Setup Complete!"
echo "=================================="
echo "Sandbox Name: $SANDBOX_NAME"
echo "Sandbox URL: $SANDBOX_URL"
echo "Health Check: $SANDBOX_URL/health"
echo "Video Generation: $SANDBOX_URL/generate-video"
echo ""
echo "📝 Next Steps:"
echo "1. Update your Vercel environment variables:"
echo "   DAYTONA_SANDBOX_URL=$SANDBOX_URL"
echo "2. Test video generation from your Vercel app"
echo "3. Monitor sandbox usage in Daytona dashboard"
echo ""
echo "🔧 Useful Commands:"
echo "   daytona sandbox logs $SANDBOX_NAME    # View logs"
echo "   daytona sandbox stop $SANDBOX_NAME    # Stop sandbox"
echo "   daytona sandbox start $SANDBOX_NAME   # Start sandbox"
echo "   daytona sandbox delete $SANDBOX_NAME  # Delete sandbox" 