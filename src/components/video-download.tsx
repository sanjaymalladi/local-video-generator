"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Download, 
  CheckCircle, 
  AlertCircle,
  FileVideo,
  Loader2
} from "lucide-react"
import { formatFileSize } from "@/lib/transformers"

interface VideoDownloadProps {
  jobId: string
  title?: string
  fileSize?: number
  onDownloadStart?: () => void
  onDownloadComplete?: () => void
  onDownloadError?: (error: string) => void
  className?: string
}

type DownloadFormat = 'mp4' | 'mov' | 'avi'
type DownloadQuality = 'original' | 'high' | 'medium' | 'low'

interface DownloadState {
  isDownloading: boolean
  progress: number
  error: string | null
  completed: boolean
  format: DownloadFormat
  quality: DownloadQuality
}

export function VideoDownload({
  jobId,
  title,
  fileSize,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  className = ""
}: VideoDownloadProps) {
  const [downloadState, setDownloadState] = React.useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    error: null,
    completed: false,
    format: 'mp4',
    quality: 'original',
  })
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const handleDownload = async () => {
    if (downloadState.isDownloading) return

    setDownloadState(prev => ({
      ...prev,
      isDownloading: true,
      progress: 0,
      error: null,
      completed: false,
    }))

    onDownloadStart?.()

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      // Build download URL with format and quality parameters
      const params = new URLSearchParams({
        format: downloadState.format,
        quality: downloadState.quality,
      })
      const downloadUrl = `/api/video/${jobId}?${params.toString()}`

      // Start download with progress tracking
      const response = await fetch(downloadUrl, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      const contentLength = response.headers.get('content-length')
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to read response body')
      }

      const chunks: Uint8Array[] = []
      let receivedLength = 0

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        chunks.push(value)
        receivedLength += value.length

        // Update progress
        if (totalSize > 0) {
          const progress = Math.round((receivedLength / totalSize) * 100)
          setDownloadState(prev => ({ ...prev, progress }))
        }
      }

      // Combine chunks into single array
      const videoData = new Uint8Array(receivedLength)
      let position = 0
      for (const chunk of chunks) {
        videoData.set(chunk, position)
        position += chunk.length
      }

      // Create blob and download
      const blob = new Blob([videoData], { type: `video/${downloadState.format}` })
      const url = URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `${title || `video-${jobId.slice(0, 8)}`}.${downloadState.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup
      URL.revokeObjectURL(url)

      setDownloadState(prev => ({
        ...prev,
        isDownloading: false,
        progress: 100,
        completed: true,
      }))

      onDownloadComplete?.()

      // Auto-close dialog after success
      setTimeout(() => {
        setIsDialogOpen(false)
        setDownloadState(prev => ({ ...prev, completed: false, progress: 0 }))
      }, 2000)

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Download was cancelled
        setDownloadState(prev => ({
          ...prev,
          isDownloading: false,
          progress: 0,
          error: 'Download cancelled',
        }))
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setDownloadState(prev => ({
          ...prev,
          isDownloading: false,
          error: errorMessage,
        }))
        onDownloadError?.(errorMessage)
      }
    } finally {
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleQuickDownload = async () => {
    // Quick download with default settings
    try {
      const link = document.createElement('a')
      link.href = `/api/video/${jobId}`
      link.download = `${title || `video-${jobId.slice(0, 8)}`}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      onDownloadComplete?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      onDownloadError?.(errorMessage)
    }
  }

  return (
    <div className={className}>
      {/* Quick Download Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickDownload}
        className="mr-2"
      >
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>

      {/* Advanced Download Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            Advanced
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Video</DialogTitle>
            <DialogDescription>
              Choose format and quality options for your download.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video Info */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <FileVideo className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {title || `Video ${jobId.slice(0, 8)}`}
                </p>
                {fileSize && (
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(fileSize)}
                  </p>
                )}
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select
                value={downloadState.format}
                onValueChange={(value: DownloadFormat) =>
                  setDownloadState(prev => ({ ...prev, format: value }))
                }
                disabled={downloadState.isDownloading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">
                    <div className="flex items-center gap-2">
                      <span>MP4</span>
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="mov">MOV</SelectItem>
                  <SelectItem value="avi">AVI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quality Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality</label>
              <Select
                value={downloadState.quality}
                onValueChange={(value: DownloadQuality) =>
                  setDownloadState(prev => ({ ...prev, quality: value }))
                }
                disabled={downloadState.isDownloading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">
                    <div className="flex items-center gap-2">
                      <span>Original</span>
                      <Badge variant="secondary" className="text-xs">Best</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">High (1080p)</SelectItem>
                  <SelectItem value="medium">Medium (720p)</SelectItem>
                  <SelectItem value="low">Low (480p)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Download Progress */}
            {downloadState.isDownloading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Downloading...</span>
                  <span>{downloadState.progress}%</span>
                </div>
                <Progress value={downloadState.progress} className="h-2" />
              </div>
            )}

            {/* Success Message */}
            {downloadState.completed && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Download completed successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {downloadState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {downloadState.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {downloadState.isDownloading ? (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel Download
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                    disabled={downloadState.isDownloading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="flex-1"
                    disabled={downloadState.isDownloading || downloadState.completed}
                  >
                    {downloadState.isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : downloadState.completed ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Download Info */}
            <div className="text-xs text-muted-foreground border-t pt-3">
              <p className="mb-1">Download options:</p>
              <ul className="space-y-1">
                <li>• Original quality preserves the source video</li>
                <li>• Lower qualities reduce file size</li>
                <li>• MP4 format is compatible with most devices</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Hook for managing multiple downloads
export function useVideoDownloads() {
  const [downloads, setDownloads] = React.useState<Map<string, DownloadState>>(new Map())

  const startDownload = (jobId: string) => {
    setDownloads(prev => new Map(prev.set(jobId, {
      isDownloading: true,
      progress: 0,
      error: null,
      completed: false,
      format: 'mp4',
      quality: 'original',
    })))
  }

  const updateProgress = (jobId: string, progress: number) => {
    setDownloads(prev => {
      const current = prev.get(jobId)
      if (current) {
        return new Map(prev.set(jobId, { ...current, progress }))
      }
      return prev
    })
  }

  const completeDownload = (jobId: string) => {
    setDownloads(prev => {
      const current = prev.get(jobId)
      if (current) {
        return new Map(prev.set(jobId, {
          ...current,
          isDownloading: false,
          completed: true,
          progress: 100,
        }))
      }
      return prev
    })
  }

  const failDownload = (jobId: string, error: string) => {
    setDownloads(prev => {
      const current = prev.get(jobId)
      if (current) {
        return new Map(prev.set(jobId, {
          ...current,
          isDownloading: false,
          error,
        }))
      }
      return prev
    })
  }

  const clearDownload = (jobId: string) => {
    setDownloads(prev => {
      const newMap = new Map(prev)
      newMap.delete(jobId)
      return newMap
    })
  }

  return {
    downloads,
    startDownload,
    updateProgress,
    completeDownload,
    failDownload,
    clearDownload,
  }
}