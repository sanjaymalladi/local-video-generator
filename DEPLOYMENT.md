# Deployment Guide

## Architecture Overview

This application uses a **local-first deployment** strategy:

- **Frontend (Vercel)**: Next.js app with UI and API routes - **FREE**
- **Video Processing**: Local Manim installation or remote video service

## 🚀 Quick Deployment

### 1. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add GEMINI_API_KEY
```

### 2. Set Up Local Video Processing (Optional)

For local video generation, install Manim:

```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y ffmpeg libcairo2-dev libpango1.0-dev

# Install Manim
pip install manim>=0.18.0
```

## 📋 Environment Variables

### Frontend (Vercel)
```bash
GEMINI_API_KEY=your_gemini_api_key
VIDEO_SERVICE_URL=http://localhost:8000  # Optional: for remote video service
```

## 💰 Cost Breakdown

### Vercel (FREE Tier)
- ✅ 100GB bandwidth/month
- ✅ 1000 serverless function invocations/day
- ✅ Custom domains
- ✅ Automatic HTTPS

### Local Processing
- ✅ $0 cost (uses your own hardware)
- ✅ Full control over processing
- ✅ No external dependencies

**Estimated Monthly Cost**: $0 for local processing

## 🔧 Configuration Files

### `vercel.json`
```json
{
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 300
    }
  }
}
```

## 🚀 Deployment Steps

### Step 1: Prepare Repository
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy Frontend
```bash
# Deploy to Vercel
vercel --prod

# Add environment variables
vercel env add GEMINI_API_KEY production

# Redeploy with env vars
vercel --prod
```

### Step 3: Set Up Local Video Processing (Optional)
```bash
# Install Manim locally
pip install manim>=0.18.0

# Test installation
manim --version
```

## 🔍 Testing Deployment

### Health Check
```bash
curl https://your-vercel-app.vercel.app/api/health
```

### Generate Test Video
```bash
curl -X POST https://your-vercel-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "explain neural networks"}'
```

## 🛠 Troubleshooting

### Common Issues

1. **Video Processing Not Working**
   - Ensure Manim is installed locally
   - Check system dependencies (FFmpeg, Cairo, Pango)
   - Verify Python environment

2. **TTS Not Working**
   - TTS models download at runtime
   - First request may take longer

3. **Vercel Function Timeout**
   - Increase timeout in `vercel.json`
   - Use async processing for long tasks

### Monitoring

- **Vercel**: Built-in analytics and logs
- **Local**: System resource monitoring
- **Health Checks**: Automated monitoring endpoints

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 📈 Scaling

### Local Processing
- Limited by your hardware resources
- Consider using a dedicated server for production
- Can be enhanced with GPU acceleration

### Performance Optimization
- Local video caching
- CDN delivery through Vercel
- Async job processing

## 🔐 Security

- HTTPS everywhere (automatic with Vercel)
- Environment variable encryption
- Local video generation (no external code execution)
- CORS configuration
- Rate limiting built-in

## 📊 Monitoring & Analytics

- Vercel Analytics (free)
- Local system monitoring
- Custom health checks
- Error tracking and logging

## 🚀 Future Enhancements

### Remote Video Service
For production use, consider setting up a dedicated video processing service:

1. **Docker Container**: Package Manim in a container
2. **Cloud VM**: Deploy to AWS/GCP/Azure
3. **Kubernetes**: For high availability
4. **Serverless**: AWS Lambda with container support

### Example Remote Service Setup
```bash
# Deploy to cloud provider
docker build -t video-generator .
docker run -p 8000:8000 video-generator

# Update environment variable
VIDEO_SERVICE_URL=https://your-video-service.com
```

This approach gives you full control over video processing while keeping costs low and maintaining security.