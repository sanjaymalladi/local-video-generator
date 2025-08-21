import { NextRequest, NextResponse } from 'next/server'

// Import the shared storage (in production, use Convex)
import { videos } from '../generate/route'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'))
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))

    // Get videos from memory
    const all = Array.from(videos.values()).sort((a, b) => b.createdAt - a.createdAt)
    const total = all.length
    const start = (page - 1) * limit
    const end = start + limit
    const pageItems = all.slice(start, end)

    return NextResponse.json({
      success: true,
      videos: pageItems.map(video => ({
        id: video.jobId,
        title: video.title,
        query: video.query,
        videoUrl: video.videoUrl,
        videoId: video.videoId,
        fileSize: video.fileSize,
        duration: video.duration,
        resolution: video.resolution,
        createdAt: video.createdAt,
        views: video.views,
        downloads: video.downloads,
      })),
      page,
      limit,
      total,
      hasMore: end < total
    })

  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { videoId } = await request.json()

    if (!videoId || typeof videoId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'videoId must be a non-empty string'
      }, { status: 400 })
    }

    // Delete video from memory
    videos.delete(videoId)

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('History delete error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle unsupported methods
export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use GET to retrieve history or DELETE to remove items.'
  }, { status: 405 })
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use GET to retrieve history or DELETE to remove items.'
  }, { status: 405 })
}