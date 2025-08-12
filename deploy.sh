#!/bin/bash

# Deployment script for Video Generator
set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo "📋 Checking dependencies..."
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found. Install with: npm i -g vercel${NC}"
        exit 1
    fi
    

    
    echo -e "${GREEN}✅ Dependencies checked${NC}"
}

# Deploy video service (placeholder for future implementation)
deploy_video_service() {
    echo "🐳 Video service deployment not implemented yet..."
    echo "Using local video processing for now"
}

# Deploy frontend to Vercel
deploy_frontend() {
    echo "🌐 Deploying frontend to Vercel..."
    
    # Check if logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        echo "Please login to Vercel first:"
        echo "vercel login"
        exit 1
    fi
    
    # Deploy to Vercel
    echo "Deploying to Vercel..."
    vercel --prod
    
    echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
}

# Set environment variables
setup_env_vars() {
    echo "🔧 Setting up environment variables..."
    
    # Check if GEMINI_API_KEY is set
    if [ -z "$GEMINI_API_KEY" ]; then
        echo -e "${YELLOW}⚠️  GEMINI_API_KEY not found in environment${NC}"
        echo "Please set it with: vercel env add GEMINI_API_KEY"
    else
        echo "GEMINI_API_KEY" | vercel env add GEMINI_API_KEY production
    fi
    
    # Set video service URL if available
    if [ -f ".env.production" ]; then
        source .env.production
        if [ ! -z "$VIDEO_SERVICE_URL" ]; then
            echo "$VIDEO_SERVICE_URL" | vercel env add VIDEO_SERVICE_URL production
            echo -e "${GREEN}✅ VIDEO_SERVICE_URL set to: $VIDEO_SERVICE_URL${NC}"
        fi
    fi
}

# Health check
health_check() {
    echo "🏥 Running health checks..."
    
    # Check if .env.production exists and get URL
    if [ -f ".env.production" ]; then
        source .env.production
        if [ ! -z "$VIDEO_SERVICE_URL" ]; then
            echo "Checking video service health..."
            if curl -f "$VIDEO_SERVICE_URL/health" &> /dev/null; then
                echo -e "${GREEN}✅ Video service is healthy${NC}"
            else
                echo -e "${RED}❌ Video service health check failed${NC}"
            fi
        fi
    fi
    
    echo -e "${GREEN}✅ Health checks completed${NC}"
}

# Main deployment flow
main() {
    echo "🎬 Video Generator Deployment"
    echo "=============================="
    
    check_dependencies
    
    # Deploy frontend only for now
    deploy_frontend
    setup_env_vars
    health_check
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up your environment variables in Vercel dashboard"
    echo "2. Test the application with a sample video generation"
    echo "3. Monitor logs and performance"
    echo ""
    echo "📚 For more details, see DEPLOYMENT.md"
}

# Run main function
main "$@"