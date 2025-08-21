import { NextRequest, NextResponse } from 'next/server'

// Import the shared storage (in production, use Convex)
import { jobs } from '../../generate/route'

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
    console.log(`[Status Endpoint] Looking for job ${jobId}`)
    console.log(`[Status Endpoint] Available jobs:`, Array.from(jobs.keys()))
    console.log(`[Status Endpoint] Job found:`, !!job)

    if (!job) {
      return NextResponse.json({
        success: false,
        error: `Job not found. Available jobs: ${Array.from(jobs.keys()).join(', ')}`
      }, { status: 404 })
    }

    // Flatten response to match frontend expectations
    return NextResponse.json({
      success: true,
      id: job.id,
      query: job.query,
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep,
      videoUrl: job.videoUrl,
      videoId: job.videoId,
      fileSize: job.fileSize,
      duration: job.duration,
      resolution: job.resolution,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    })

  } catch (error) {
    console.error('Job status error:', error)
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
    error: 'Method not allowed. Use GET to check job status.'
  }, { status: 405 })
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use GET to check job status.'
  }, { status: 405 })
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed. Use GET to check job status.'
  }, { status: 405 })
}