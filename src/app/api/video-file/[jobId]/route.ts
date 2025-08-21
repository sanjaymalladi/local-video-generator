import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    const { jobId } = await params

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid job ID'
      }, { status: 400 })
    }

    // Sanitize job ID to prevent path traversal
    const sanitizedJobId = jobId.replace(/[^a-zA-Z0-9_-]/g, '')
    
    // Try different possible video file locations
    const possiblePaths = [
      // Backend generated videos (served via proxy)
      path.join(process.cwd(), 'public', 'videos', `${sanitizedJobId}.mp4`),
      path.join(process.cwd(), 'public', 'videos', `${sanitizedJobId}.webm`),
      path.join(process.cwd(), 'public', 'videos', `${sanitizedJobId}.png`), // Fallback frame
    ]

    let videoPath: string | null = null
    let contentType = 'video/mp4'

    // Find the first existing file
    for (const filePath of possiblePaths) {
      try {
        await fs.access(filePath)
        videoPath = filePath
        
        // Set appropriate content type
        if (filePath.endsWith('.webm')) {
          contentType = 'video/webm'
        } else if (filePath.endsWith('.png')) {
          contentType = 'image/png'
        }
        break
      } catch {
        // File doesn't exist, try next
      }
    }

    if (!videoPath) {
      return NextResponse.json({
        success: false,
        error: 'Video file not found'
      }, { status: 404 })
    }

    // Read and serve the file
    const fileBuffer = await fs.readFile(videoPath)
    const stats = await fs.stat(videoPath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${sanitizedJobId}.${contentType === 'video/webm' ? 'webm' : contentType === 'image/png' ? 'png' : 'mp4'}"`
      }
    })

  } catch (error) {
    console.error('Video file serve error:', error)
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
    error: 'Method not allowed. Use GET to retrieve video files.'
  }, { status: 405 })
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use GET to retrieve video files.'
  }, { status: 405 })
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use GET to retrieve video files.'
  }, { status: 405 })
}
