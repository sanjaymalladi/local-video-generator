"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download,
  Clock,
  Calendar,
  FileVideo,
  AlertCircle
} from "lucide-react"
import { formatDuration, formatDate, formatFileSize } from "@/lib/transformers"

interface VideoPlayerProps {
  jobId: string
  title?: string
  query?: string
  createdAt?: Date
  duration?: number
  fileSize?: number
  onDownload?: () => void
  className?: string
}

export function VideoPlayer({
  jobId,
  title,
  query,
  createdAt,
  duration,
  fileSize,
  onDownload,
  className = ""
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [videoDuration, setVideoDuration] = React.useState(0)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [volume, setVolume] = React.useState(1)

  const videoSrc = `/api/video/${jobId}`

  // Handle play/pause
  const togglePlay = React.useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }, [isPlaying])

  // Handle mute/unmute
  const toggleMute = React.useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  // Handle fullscreen
  const toggleFullscreen = React.useCallback(() => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }
  }, [isFullscreen])

  // Handle volume change
  const handleVolumeChange = React.useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }, [])

  // Handle time update
  const handleTimeUpdate = React.useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [])

  // Handle seek
  const handleSeek = React.useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  // Video event handlers
  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      setIsLoading(false)
      setVideoDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleError = () => {
      setHasError(true)
      setIsLoading(false)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('error', handleError)
    video.addEventListener('timeupdate', handleTimeUpdate)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('error', handleError)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [handleTimeUpdate])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target !== document.body) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'KeyM':
          toggleMute()
          break
        case 'KeyF':
          toggleFullscreen()
          break
        case 'ArrowLeft':
          handleSeek(Math.max(0, currentTime - 10))
          break
        case 'ArrowRight':
          handleSeek(Math.min(videoDuration, currentTime + 10))
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [togglePlay, toggleMute, toggleFullscreen, handleSeek, currentTime, videoDuration])

  if (hasError) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load video. The video file may be corrupted or not yet ready.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {title || `Video ${jobId.slice(0, 8)}`}
            </CardTitle>
            {query && (
              <CardDescription className="line-clamp-2">
                {query}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <FileVideo className="w-3 h-3 mr-1" />
              MP4
            </Badge>
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden group">
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full aspect-video object-contain"
            preload="metadata"
            playsInline
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress Bar */}
              <div className="flex items-center gap-2 text-white text-sm">
                <span>{formatDuration(currentTime)}</span>
                <div 
                  className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const percent = (e.clientX - rect.left) / rect.width
                    handleSeek(percent * videoDuration)
                  }}
                >
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-150"
                    style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                  />
                </div>
                <span>{formatDuration(videoDuration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {duration && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(duration)}</span>
            </div>
          )}
          
          {createdAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(createdAt)}</span>
            </div>
          )}
          
          {fileSize && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileVideo className="w-4 h-4" />
              <span>{formatFileSize(fileSize)}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs font-mono">ID: {jobId.slice(0, 8)}</span>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          <p className="font-medium mb-1">Keyboard shortcuts:</p>
          <div className="grid grid-cols-2 gap-1">
            <span>Space: Play/Pause</span>
            <span>M: Mute/Unmute</span>
            <span>F: Fullscreen</span>
            <span>←/→: Seek ±10s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}