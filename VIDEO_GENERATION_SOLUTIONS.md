# 🎬 Video Generation Solutions for Vercel Deployment

## 🚫 **Problem: Vercel Cannot Run Python/Manim**

Vercel Edge Functions have these limitations:
- ❌ **No Python execution** - Only Node.js/JavaScript
- ❌ **No external processes** - No `child_process.spawn`
- ❌ **No file system access** - Limited file operations
- ❌ **No long-running processes** - Timeout limits (10-60 seconds)

## ✅ **Solution Options**

### **Option 1: External Video Generation APIs (Recommended)**

#### **A. Replicate API**
```typescript
// Example: Using Replicate for video generation
async function generateVideoWithReplicate(manimCode: string): Promise<string> {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "your-manim-model-version",
      input: {
        code: manimCode,
        quality: "high"
      }
    })
  })
  
  const prediction = await response.json()
  return prediction.output.video_url
}
```

#### **B. RunPod API**
```typescript
// Example: Using RunPod for GPU-powered video generation
async function generateVideoWithRunPod(manimCode: string): Promise<string> {
  const response = await fetch('https://api.runpod.io/v2/your-endpoint-id/run', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: {
        manim_code: manimCode,
        output_format: "mp4"
      }
    })
  })
  
  const result = await response.json()
  return result.output.video_url
}
```

#### **C. Custom API Endpoint**
```typescript
// Example: Your own server with Python/Manim
async function generateVideoWithCustomAPI(manimCode: string): Promise<string> {
  const response = await fetch('https://your-manim-server.com/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CUSTOM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: manimCode,
      quality: "1080p"
    })
  })
  
  const result = await response.json()
  return result.video_url
}
```

### **Option 2: Background Job Processing**

#### **A. Vercel Cron Jobs + External Storage**
```typescript
// 1. Queue the job in Vercel
// 2. Process with cron job on external server
// 3. Store result in cloud storage (AWS S3, Cloudinary, etc.)
```

#### **B. Message Queue (Redis + Worker)**
```typescript
// 1. Add job to Redis queue
// 2. Worker processes with Python/Manim
// 3. Store result and notify completion
```

### **Option 3: Hybrid Approach**

#### **A. Local Development + Cloud Production**
```typescript
// Development: Use local Python/Manim
// Production: Use external API
const isDevelopment = process.env.NODE_ENV === 'development'

async function generateVideo(manimCode: string): Promise<string> {
  if (isDevelopment) {
    return await generateVideoLocally(manimCode)
  } else {
    return await generateVideoWithAPI(manimCode)
  }
}
```

## 🛠 **Implementation Steps**

### **Step 1: Choose Your Solution**
1. **For MVP**: Use Replicate API (easiest)
2. **For Production**: Use RunPod or custom server
3. **For Development**: Use hybrid approach

### **Step 2: Update Environment Variables**
```bash
# Add to .env.local
REPLICATE_API_TOKEN=your_token_here
# or
RUNPOD_API_KEY=your_key_here
# or
CUSTOM_API_KEY=your_key_here
```

### **Step 3: Update Video Generation Function**
```typescript
// Replace the current mock function with real API calls
async function generateVideoWithExternalService(
  jobId: string, 
  manimCode: string, 
  query: string
): Promise<string> {
  try {
    // Call your chosen external API
    const videoUrl = await callExternalVideoAPI(manimCode)
    return videoUrl
  } catch (error) {
    console.error('External video generation error:', error)
    return createMockVideo(jobId, query) // Fallback
  }
}
```

### **Step 4: Handle Async Processing**
```typescript
// For APIs that return job IDs (not immediate results)
async function handleAsyncVideoGeneration(jobId: string, manimCode: string) {
  // 1. Submit job to external API
  const externalJobId = await submitVideoJob(manimCode)
  
  // 2. Update local job status
  jobs.set(jobId, {
    ...jobs.get(jobId),
    status: 'processing',
    externalJobId: externalJobId
  })
  
  // 3. Poll for completion (or use webhooks)
  // 4. Update with final video URL
}
```

## 💰 **Cost Comparison**

| Service | Cost | Setup | Features |
|---------|------|-------|----------|
| **Replicate** | $0.01-0.10/video | Easy | GPU, managed |
| **RunPod** | $0.20-0.50/hour | Medium | Full control |
| **Custom Server** | $5-50/month | Hard | Complete control |
| **AWS Lambda** | $0.0001/request | Medium | Serverless |

## 🚀 **Recommended Implementation**

### **For Quick Start (MVP):**
1. Use **Replicate API** with a pre-trained Manim model
2. Simple integration, managed infrastructure
3. Pay-per-use pricing

### **For Production:**
1. Use **RunPod** with custom Manim environment
2. Full control over rendering quality
3. Cost-effective for high volume

### **For Development:**
1. Use **hybrid approach** (local + cloud)
2. Fast iteration locally
3. Production-ready cloud deployment

## 📝 **Next Steps**

1. **Choose your preferred solution**
2. **Set up API keys and accounts**
3. **Update the `generateVideoWithExternalService` function**
4. **Test with real video generation**
5. **Deploy to Vercel**

The current implementation provides a working foundation that can be easily extended with any of these external video generation services! 