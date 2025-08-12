import { NextRequest, NextResponse } from 'next/server'
// Import the shared storage (in production, use a proper database)
import { jobs, videos } from '../../generate/route'

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    const { jobId } = await params

    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 })
    }

    // Get job from memory
    const job = jobs.get(jobId)
    if (!job) {
      return NextResponse.json({
        success: false,
        error: 'Job not found'
      }, { status: 404 })
    }

    // Check if job is completed
    if (job.status !== 'completed') {
      return NextResponse.json({
        success: false,
        error: `Video is not ready yet. Current status: ${job.status}`
      }, { status: 400 })
    }

    // Get video from memory
    const video = videos.get(jobId)
    if (!video || !video.videoUrl) {
      return NextResponse.json({
        success: false,
        error: 'Video not found'
      }, { status: 404 })
    }

    // Check if this is a metadata request
    const url = new URL(request.url)
    const metadata = url.searchParams.get('metadata')
    
    if (metadata === 'true') {
      // Return video metadata
      return NextResponse.json({
        id: jobId,
        title: video.title,
        query: video.query,
        createdAt: video.createdAt,
        fileSize: video.fileSize,
        duration: video.duration,
        resolution: video.resolution,
        videoUrl: video.videoUrl
      }, { status: 200 })
    }

    // Handle different types of video URLs
    if (video.videoUrl.startsWith('data:')) {
      // For data URLs (SVG mock videos), convert them to a proper response
      const base64Data = video.videoUrl.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      
      const headers = new Headers({
        'Content-Type': 'image/svg+xml',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="video-${jobId}.svg"`,
        'Cache-Control': 'public, max-age=31536000',
      })

      return new NextResponse(buffer, {
        status: 200,
        headers,
      })
    } else if (video.videoUrl.startsWith('http')) {
      // For external URLs, redirect to the video
      return NextResponse.redirect(video.videoUrl)
    } else {
      // For relative URLs, return error (shouldn't happen with current setup)
      return NextResponse.json({
        success: false,
        error: 'Invalid video URL format'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Unexpected error in video endpoint:', error)
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}

// Handle unsupported methods
export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use GET to retrieve videos.'
  }, { status: 405 })
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use GET to retrieve videos.'
  }, { status: 405 })
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use GET to retrieve videos.'
  }, { status: 405 })
}