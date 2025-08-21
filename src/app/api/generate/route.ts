import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getSecurityHeaders, validateOrigin, getSecureErrorMessage } from '@/lib/security-utils'
import { generateAnimatedVideo } from '@/lib/animated-video-generator'

export const runtime = 'nodejs'

// Global storage that persists across HMR in development
declare global {
  var __jobs: Map<string, any> | undefined
  var __videos: Map<string, any> | undefined
}

// Simple in-memory storage for demo (in production, use Convex)
export const jobs = globalThis.__jobs ?? (globalThis.__jobs = new Map())
export const videos = globalThis.__videos ?? (globalThis.__videos = new Map())

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Security checks
    if (!validateOrigin(request)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimit = checkRateLimit(clientIp, 5, 60000) // 5 requests per minute
    
    if (!rateLimit.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded',
        resetTime: rateLimit.resetTime
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          ...getSecurityHeaders()
        }
      })
    }
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

    console.log(`[Generate] Creating job ${jobId}`)
    console.log(`[Generate] Current jobs count:`, jobs.size)

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
      // Call the backend API to generate video
      console.log(`[Generate] Calling backend API for ${jobId}`)

      // Update job status to indicate we're calling the backend
      jobs.set(jobId, {
        ...jobs.get(jobId),
        status: 'processing',
        progress: 20,
        currentStep: 'calling_backend'
      })

      // Call backend API (assuming backend is running on localhost:8000)
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
      const backendResponse = await fetch(`${backendUrl}/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: sanitizedQuery
        })
      })

      if (!backendResponse.ok) {
        throw new Error(`Backend API error: ${backendResponse.status} ${backendResponse.statusText}`)
      }

      const backendResult = await backendResponse.json()
      const backendJobId = backendResult.video_id

      console.log(`[Generate] Backend job started: ${backendJobId} for frontend job: ${jobId}`)

      // Update job with backend job ID for polling
      jobs.set(jobId, {
        ...jobs.get(jobId),
        status: 'processing',
        progress: 30,
        currentStep: 'backend_processing',
        backendJobId: backendJobId,
        backendUrl: backendUrl
      })

      // Start polling backend for status updates
      ;(async () => {
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`${backendUrl}/video-status/${backendJobId}`)
            if (!statusResponse.ok) {
              console.error(`[Generate] Failed to poll backend status for ${backendJobId}`)
              return
            }

            const statusData = await statusResponse.json()

            // Update progress based on backend status
            let progress = 30
            let currentStep = 'backend_processing'

            if (statusData.status === 'generating_script') {
              progress = 40
              currentStep = 'generating_script'
            } else if (statusData.status === 'generating_manim_code') {
              progress = 60
              currentStep = 'generating_manim_code'
            } else if (statusData.status === 'rendering_video') {
              progress = 80
              currentStep = 'rendering_video'
            } else if (statusData.status === 'completed') {
              progress = 100
              currentStep = 'completed'
              clearInterval(pollInterval)
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval)
              // Update job as failed
              jobs.set(jobId, {
                ...jobs.get(jobId),
                status: 'failed',
                progress: 0,
                currentStep: 'failed',
                error: statusData.error || 'Backend video generation failed'
              })
              return
            }

            // Update job status
            let videoUrl = undefined
            if (statusData.video_url) {
              if (statusData.video_url.startsWith('/videos/')) {
                videoUrl = `${backendUrl}${statusData.video_url}`
              } else if (!statusData.video_url.startsWith('http')) {
                videoUrl = `${backendUrl}/videos/${statusData.video_id || backendJobId}`
              } else {
                videoUrl = statusData.video_url
              }
            }

            jobs.set(jobId, {
              ...jobs.get(jobId),
              status: statusData.status === 'completed' ? 'completed' : 'processing',
              progress: progress,
              currentStep: currentStep,
              videoUrl: videoUrl,
              completedAt: statusData.status === 'completed' ? Date.now() : undefined
            })

            // If completed, add to video history
            if (statusData.status === 'completed' && statusData.video_url) {
              // Ensure the video URL is properly formatted
              let videoUrl = statusData.video_url
              if (videoUrl.startsWith('/videos/')) {
                // Backend returns relative URL, make it absolute
                videoUrl = `${backendUrl}${videoUrl}`
              } else if (!videoUrl.startsWith('http')) {
                // If it's not already an absolute URL, construct it
                videoUrl = `${backendUrl}/videos/${statusData.video_id || backendJobId}`
              }

              videos.set(jobId, {
                jobId: jobId,
                title: sanitizedQuery.substring(0, 50) + (sanitizedQuery.length > 50 ? '...' : ''),
                query: sanitizedQuery,
                videoUrl: videoUrl,
                videoId: jobId,
                fileSize: undefined, // Backend doesn't provide this
                duration: 30, // Default duration
                resolution: '720p', // Manim default
                createdAt: Date.now(),
                views: 0,
                downloads: 0
              })
              console.log(`[Generate] Video completed for ${jobId} with URL: ${videoUrl}`)
            }
          } catch (error) {
            console.error(`[Generate] Error polling backend for ${jobId}:`, error)
          }
        }, 3000) // Poll every 3 seconds

        // Stop polling after 10 minutes to prevent infinite polling
        setTimeout(() => {
          clearInterval(pollInterval)
          console.log(`[Generate] Stopped polling for ${jobId} (timeout)`)
        }, 600000)
      })()

      // Respond immediately so the client can start polling
      return NextResponse.json({
        success: true,
        jobId: jobId,
        status: 'processing',
        message: 'Video generation started on backend'
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

// Create enhanced preview with Motion Canvas code visualization
async function createEnhancedPreview(jobId: string, query: string, motionCanvasCode: string): Promise<string> {
  try {
    // Extract key information from the Motion Canvas code
    const codeLines = motionCanvasCode.split('\n')
    const components = codeLines.filter(line => 
      line.includes('<Circle') || line.includes('<Rect') || line.includes('<Txt')
    ).length
    
    const animations = codeLines.filter(line => 
      line.includes('yield*') || line.includes('all(') || line.includes('waitFor')
    ).length

    const codePreview = motionCanvasCode.substring(0, 200) + '...'

    const svgContent = `
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="#0a0f1a"/>
        
        <!-- Header Section -->
        <rect x="0" y="0" width="100%" height="120" fill="url(#grad1)" opacity="0.8"/>
        <text x="960" y="35" font-family="Inter, system-ui" font-size="28" fill="white" text-anchor="middle" font-weight="700">
          Motion Canvas Educational Video
        </text>
        <text x="960" y="70" font-family="Inter, system-ui" font-size="18" fill="#e2e8f0" text-anchor="middle">
          Professional AI-Generated Animation • TypeScript Based
        </text>
        <text x="960" y="95" font-family="Inter, system-ui" font-size="14" fill="#cbd5e1" text-anchor="middle">
          Generated ${components} visual components • ${animations} animations • Ready for rendering
        </text>
        
        <!-- Main Title -->
        <text x="960" y="180" font-family="Inter, system-ui" font-size="48" fill="white" text-anchor="middle" font-weight="800">
          ${query.substring(0, 60)}
        </text>
        <text x="960" y="220" font-family="Inter, system-ui" font-size="24" fill="#64748b" text-anchor="middle">
          Generated comprehensive Motion Canvas animation code
        </text>
        
        <!-- Stats Section -->
        <rect x="200" y="280" width="1520" height="200" fill="#1e293b" rx="12" opacity="0.8"/>
        <text x="960" y="320" font-family="Inter, system-ui" font-size="32" fill="#3b82f6" text-anchor="middle" font-weight="700">
          Code Generation Summary
        </text>
        
        <!-- Stats Grid -->
        <g transform="translate(300, 350)">
          <rect x="0" y="0" width="300" height="80" fill="#22c55e" opacity="0.2" rx="8"/>
          <text x="150" y="30" font-family="Inter, system-ui" font-size="28" fill="#22c55e" text-anchor="middle" font-weight="700">
            ${components}
          </text>
          <text x="150" y="55" font-family="Inter, system-ui" font-size="14" fill="#94a3b8" text-anchor="middle">
            Visual Components
          </text>
        </g>
        
        <g transform="translate(650, 350)">
          <rect x="0" y="0" width="300" height="80" fill="#3b82f6" opacity="0.2" rx="8"/>
          <text x="150" y="30" font-family="Inter, system-ui" font-size="28" fill="#3b82f6" text-anchor="middle" font-weight="700">
            ${animations}
          </text>
          <text x="150" y="55" font-family="Inter, system-ui" font-size="14" fill="#94a3b8" text-anchor="middle">
            Animations
          </text>
        </g>
        
        <g transform="translate(1000, 350)">
          <rect x="0" y="0" width="300" height="80" fill="#8b5cf6" opacity="0.2" rx="8"/>
          <text x="150" y="30" font-family="Inter, system-ui" font-size="28" fill="#8b5cf6" text-anchor="middle" font-weight="700">
            ${Math.round(motionCanvasCode.length / 1000)}K
          </text>
          <text x="150" y="55" font-family="Inter, system-ui" font-size="14" fill="#94a3b8" text-anchor="middle">
            Lines of Code
          </text>
        </g>
        
        <!-- Code Preview Section -->
        <rect x="200" y="520" width="1520" height="400" fill="#111827" rx="12" stroke="#374151" stroke-width="2"/>
        <text x="960" y="560" font-family="Inter, system-ui" font-size="24" fill="#f1f5f9" text-anchor="middle" font-weight="600">
          Generated Motion Canvas Code Preview
        </text>
        
        <!-- Code Preview Text -->
        <foreignObject x="250" y="580" width="1420" height="300">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Fira Code', monospace; font-size: 12px; color: #e2e8f0; line-height: 1.4; padding: 20px; background: #1f2937; border-radius: 8px; height: 260px; overflow: hidden;">
            <div style="color: #22c55e;">// Professional Motion Canvas Animation</div>
            <div style="color: #3b82f6;">import { makeScene2D } from '@motion-canvas/2d'</div>
            <div style="color: #3b82f6;">import { Circle, Txt, Rect, Line } from '@motion-canvas/2d/lib/components'</div>
            <div style="color: #f59e0b;">// Educational content for: ${query}</div>
            <div style="color: #e2e8f0;">export default makeScene2D(function* (view) {</div>
            <div style="color: #64748b; margin-left: 20px;">// Background and setup</div>
            <div style="color: #e2e8f0; margin-left: 20px;">view.fill('#0a0f1a')</div>
            <div style="color: #64748b; margin-left: 20px;">// Animation sequence generated...</div>
            <div style="color: #94a3b8; margin-top: 20px; text-align: center;">✨ Complete implementation ready for Motion Canvas rendering ✨</div>
          </div>
        </foreignObject>
        
        <!-- Footer -->
        <text x="960" y="950" font-family="Inter, system-ui" font-size="16" fill="#64748b" text-anchor="middle">
          Ready for production rendering • Optimized for educational content
        </text>
        <text x="960" y="980" font-family="Inter, system-ui" font-size="14" fill="#475569" text-anchor="middle">
          Job ID: ${jobId} • Generated with advanced AI • Motion Canvas v3.17.2
        </text>
        
        <!-- Animated Elements -->
        <circle cx="150" cy="300" r="60" fill="url(#grad2)" opacity="0.3">
          <animate attributeName="r" values="60;80;60" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="1770" cy="800" r="40" fill="#22c55e" opacity="0.3">
          <animate attributeName="r" values="40;60;40" dur="2s" repeatCount="indefinite"/>
        </circle>
        
        <!-- Progress Indicator -->
        <rect x="760" y="1030" width="400" height="4" fill="#374151" rx="2"/>
        <rect x="760" y="1030" width="400" height="4" fill="url(#grad1)" rx="2">
          <animate attributeName="width" values="0;400;0" dur="3s" repeatCount="indefinite"/>
        </rect>
      </svg>
    `

    const base64Data = Buffer.from(svgContent).toString('base64')
    return `data:image/svg+xml;base64,${base64Data}`
  } catch (error) {
    console.error('Enhanced preview creation error:', error)
    return `https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=${encodeURIComponent(query.substring(0, 50))}`
  }
}

// Create mock video (fallback function - kept for compatibility)
async function createMockVideo(jobId: string, query: string): Promise<string> {
  try {
    const svgContent = `
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        
        <!-- Animated background circles -->
        <circle cx="200" cy="200" r="100" fill="url(#grad1)" opacity="0.1">
          <animate attributeName="r" values="100;150;100" dur="4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="1720" cy="880" r="80" fill="#22c55e" opacity="0.1">
          <animate attributeName="r" values="80;120;80" dur="3s" repeatCount="indefinite"/>
        </circle>
        
        <!-- Main content -->
        <text x="50%" y="35%" font-family="Inter, system-ui" font-size="48" fill="white" text-anchor="middle" font-weight="700">
          ${query.substring(0, 60)}
        </text>
        <text x="50%" y="45%" font-family="Inter, system-ui" font-size="24" fill="#888" text-anchor="middle">
          AI-Generated Educational Animation
        </text>
        <text x="50%" y="55%" font-family="Inter, system-ui" font-size="20" fill="#3b82f6" text-anchor="middle">
          ✨ Powered by Motion Canvas
        </text>
        <text x="50%" y="65%" font-family="Inter, system-ui" font-size="16" fill="#666" text-anchor="middle">
          Ready for Motion Canvas Implementation • TypeScript Animation Engine
        </text>
        <text x="50%" y="75%" font-family="Inter, system-ui" font-size="14" fill="#444" text-anchor="middle">
          Job ID: ${jobId}
        </text>
        
        <!-- Progress indicator -->
        <rect x="760" y="820" width="400" height="4" fill="#333" rx="2"/>
        <rect x="760" y="820" width="400" height="4" fill="#3b82f6" rx="2">
          <animate attributeName="width" values="0;400;0" dur="2s" repeatCount="indefinite"/>
        </rect>
      </svg>
    `

    const base64Data = Buffer.from(svgContent).toString('base64')
    return `data:image/svg+xml;base64,${base64Data}`
  } catch (error) {
    console.error('Video creation error:', error)
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