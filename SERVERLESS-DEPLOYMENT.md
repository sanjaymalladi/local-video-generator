# 🚀 Serverless Video Generator Deployment Guide

## Architecture Overview

This application uses a **Vercel-only serverless architecture**:

- **Frontend**: Vercel (FREE tier)
- **Backend**: Vercel Edge Functions (FREE tier)
- **Storage**: In-Memory (for demo) / Vercel KV (for production)
- **Video Processing**: Vercel Edge Functions
- **AI**: Google Gemini API

### Cost Breakdown
- **Vercel**: FREE (100GB bandwidth, 1000 function calls/day)
- **Gemini API**: ~$0.001 per request
- **Total**: ~$1-2/month for moderate usage

## 🚀 Quick Deployment

### 1. Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Google AI Studio**: Get Gemini API key at [makersuite.google.com](https://makersuite.google.com)

### 2. Environment Setup

#### Local Development
Create a `.env.local` file:
```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

#### Production (Vercel)
Set these environment variables in your Vercel dashboard:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Deploy to Vercel

```bash
# Deploy to Vercel
npm run deploy
```

## 🔧 Configuration

### Vercel Edge Functions Setup

Your application uses Vercel Edge Functions for:
- **API Routes**: Video generation, status checking, history
- **In-Memory Storage**: Jobs and videos (for demo)
- **File Processing**: SVG generation and data URLs

### Vercel Configuration

The `vercel.json` file is configured for:
- Edge Functions with 300-second timeout
- Automatic HTTPS
- Global CDN

## 🎯 How It Works

### Video Generation Flow

1. **User submits query** → Frontend (Vercel)
2. **Create job** → In-Memory storage
3. **Generate script** → Gemini AI
4. **Create video** → SVG generation
5. **Update job** → In-Memory storage
6. **Add to history** → In-Memory storage

### API Endpoints

- `POST /api/generate` - Generate video
- `GET /api/status/[jobId]` - Get job status
- `GET /api/history` - Get video history
- `GET /api/health` - Health check

## 🧪 Testing

### Local Development

```bash
# Start development server
npm run dev

# Start Convex development
npm run convex:dev
```

### Test Video Generation

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "explain how photosynthesis works"}'
```

### Test Job Status

```bash
curl http://localhost:3000/api/status/job_1234567890_abc123
```

## 🚀 Production Deployment

### 1. Deploy Convex Functions

```bash
npm run convex:deploy
```

### 2. Deploy to Vercel

```bash
npm run deploy
```

### 3. Set Environment Variables

In your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required environment variables
3. Redeploy the project

### 4. Test Production

```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"query": "explain neural networks"}'
```

## 🔍 Monitoring

### Vercel Analytics
- Built-in request monitoring
- Function execution logs
- Performance metrics

### Convex Dashboard
- Database queries and mutations
- Real-time data changes
- Error tracking

### Vercel Dashboard
- Function execution logs
- Performance metrics
- Error tracking
- Request monitoring

## 🛠 Troubleshooting

### Common Issues

1. **Vercel Function Error**
   ```bash
   # Check function logs
   vercel logs
   
   # Redeploy functions
   npm run deploy
   ```

2. **Memory Storage Reset**
   - Data is lost on server restart (demo only)
   - For production, use Vercel KV or database

3. **Gemini API Errors**
   - Verify API key is valid
   - Check usage limits
   - Ensure proper billing setup

4. **Vercel Function Timeout**
   - Increase timeout in `vercel.json`
   - Optimize function performance
   - Use streaming responses

### Debug Mode

Enable debug logging by adding to your environment:
```bash
DEBUG=true
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Convex
        run: npm run convex:deploy
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 Scaling

### Auto-scaling Features
- **Vercel**: Automatic edge scaling globally
- **Convex**: Automatic database scaling
- **Cloudinary**: CDN scaling worldwide

### Performance Optimization
- Edge function caching
- Database query optimization
- CDN video delivery
- Async job processing

## 🔐 Security

- HTTPS everywhere (automatic)
- Environment variable encryption
- API key management
- CORS configuration
- Rate limiting (can be added)

## 💰 Cost Optimization

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 1000 function calls/day

### Optimization Tips
1. **Cache frequently accessed data**
2. **Optimize database queries**
3. **Compress video files**
4. **Use CDN for video delivery**
5. **Monitor usage closely**

## 🎉 Next Steps

1. ✅ Configure environment variables
2. ✅ Deploy to Vercel
3. 🚀 Test video generation
4. 📊 Monitor usage and performance

Your Vercel-only video generator is now ready for production! 🎬

## 🗑️ Manual Cleanup Required

To completely remove Convex:

1. **Delete the convex/ directory** from your project
2. **Remove Convex environment variables** from Vercel:
   ```bash
   vercel env rm NEXT_PUBLIC_CONVEX_URL production -y
   ```
3. **Run npm install** to update dependencies:
   ```bash
   npm install
   ``` 