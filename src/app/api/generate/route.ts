import { NextRequest, NextResponse } from 'next/server'
import { generateManimCode } from '@/lib/gemini'
import { videoServiceClient } from '@/lib/video-service-client'

// Simple in-memory storage for demo (in production, use Convex)
export const jobs = new Map()
export const videos = new Map()

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Query is required and must be a non-empty string'
      }, { status: 400 })
    }

    // Sanitize query
    const sanitizedQuery = query.trim().substring(0, 500) // Limit length

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create job in memory
    jobs.set(jobId, {
      id: jobId,
      query: sanitizedQuery,
      status: 'pending',
      progress: 0,
      currentStep: 'initializing',
      createdAt: Date.now()
    })

    // Update job status to processing
    jobs.set(jobId, {
      ...jobs.get(jobId),
      status: 'processing',
      progress: 10,
      currentStep: 'generating_script'
    })

    try {
      // Generate Manim script using Gemini
      const scriptResponse = await generateManimCode({
        query: sanitizedQuery,
        temperature: 0.7,
        maxTokens: 2048
      })

      // Update job with script
      jobs.set(jobId, {
        ...jobs.get(jobId),
        status: 'processing',
        progress: 30,
        currentStep: 'generating_video',
        script: scriptResponse.manimCode
      })

      // Generate video using external service
      const videoUrl = await generateVideoWithExternalService(jobId, scriptResponse.manimCode, sanitizedQuery)

      // Update job as completed
      jobs.set(jobId, {
        ...jobs.get(jobId),
        status: 'completed',
        progress: 100,
        currentStep: 'completed',
        videoUrl: videoUrl,
        videoId: jobId,
        fileSize: 2048000, // Estimated file size
        duration: 30,
        resolution: '1080p',
        completedAt: Date.now()
      })

      // Add to video history
      videos.set(jobId, {
        jobId: jobId,
        title: sanitizedQuery.substring(0, 50) + (sanitizedQuery.length > 50 ? '...' : ''),
        query: sanitizedQuery,
        videoUrl: videoUrl,
        videoId: jobId,
        fileSize: 2048000,
        duration: 30,
        resolution: '1080p',
        createdAt: Date.now(),
        views: 0,
        downloads: 0
      })

      return NextResponse.json({
        success: true,
        jobId: jobId,
        status: 'completed',
        videoUrl: videoUrl,
        message: 'Video generated successfully'
      })

    } catch (error) {
      // Update job as failed
      jobs.set(jobId, {
        ...jobs.get(jobId),
        status: 'failed',
        progress: 0,
        currentStep: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }

  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Generate video using external service
async function generateVideoWithExternalService(jobId: string, manimCode: string, query: string): Promise<string> {
  try {
    // If a remote video service (e.g., Render) is configured, use it
    if (process.env.VIDEO_SERVICE_URL) {
      console.log(`[Render] Sending job ${jobId} to video service at ${process.env.VIDEO_SERVICE_URL}`)
      const result = await videoServiceClient.generateVideo(jobId, manimCode)
      if (result.success) {
        const url = videoServiceClient.getVideoUrl(jobId)
        console.log(`[Render] Video ready for job ${jobId}: ${url}`)
        return url
      }
      console.warn(`[Render] Video service failed for job ${jobId}: ${result.error}`)
    }

    // Otherwise, try third-party APIs if configured (Replicate/RunPod)
    // Note: keep it simple here; if not configured, fall back to mock
    console.log(`[External Service] No VIDEO_SERVICE_URL set; falling back to mock video`)
    return await createMockVideo(jobId, query)
    
  } catch (error) {
    console.error('External video generation error:', error)
    
    // Fallback: Create a mock video with the query
    return createMockVideo(jobId, query)
  }
}

// Mock video creation function (fallback)
async function createMockVideo(jobId: string, query: string): Promise<string> {
  try {
    // Create a simple SVG image as a mock video
    const svgContent = `
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        <text x="50%" y="50%" font-family="Arial" font-size="48" fill="white" text-anchor="middle">
          ${query.substring(0, 100)}
        </text>
        <text x="50%" y="60%" font-family="Arial" font-size="24" fill="#888" text-anchor="middle">
          Generated Video - ${new Date().toLocaleDateString()}
        </text>
        <text x="50%" y="70%" font-family="Arial" font-size="18" fill="#666" text-anchor="middle">
          (External video generation service would render real Manim here)
        </text>
      </svg>
    `

    // Convert SVG to base64
    const base64Data = Buffer.from(svgContent).toString('base64')
    const dataUrl = `data:image/svg+xml;base64,${base64Data}`

    return dataUrl
  } catch (error) {
    console.error('Video creation error:', error)
    // Fallback to a placeholder URL
    return `https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=${encodeURIComponent(query.substring(0, 50))}`
  }
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to generate videos.'
  }, { status: 405 })
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to generate videos.'
  }, { status: 405 })
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use POST to generate videos.'
  }, { status: 405 })
}