import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      gemini: !!process.env.GEMINI_API_KEY,
      backend_api: process.env.BACKEND_URL || 'http://localhost:8000',
    },
    architecture: 'client-server',
    renderer: 'manim-coqui-tts',
    description: 'Frontend calls Python backend with Manim + Coqui TTS for video generation'
  })
}