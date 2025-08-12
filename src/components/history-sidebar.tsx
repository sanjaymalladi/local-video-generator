"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoMetadata } from "@/lib/types"
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  History,
  Play,
  Download,
  Trash2,
  FileVideo
} from "lucide-react"
import { formatRelativeTime, formatDuration } from "@/lib/transformers"

interface HistoryItem {
  id: string
  title: string
  query: string
  duration?: number
  createdAt: Date
  fileSize?: number
  thumbnailPath?: string
}

interface HistorySidebarProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onVideoSelect?: (videoId: string) => void
  onVideoDownload?: (videoId: string) => void
  onVideoDelete?: (videoId: string) => void
  className?: string
}

export function HistorySidebar({
  isOpen,
  onOpenChange,
  onVideoSelect,
  onVideoDownload,
  onVideoDelete,
  className = ""
}: HistorySidebarProps) {
  const [history, setHistory] = React.useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Load history data
  React.useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/history')
      if (response.ok) {
        const data = await response.json()
        const historyItems = data.videos.map((video: VideoMetadata) => ({
          ...video,
          createdAt: new Date(video.createdAt),
        }))
        setHistory(historyItems)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoSelect = (videoId: string) => {
    onVideoSelect?.(videoId)
  }

  const handleVideoDownload = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation()
    onVideoDownload?.(videoId)
  }

  const handleVideoDelete = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation()
    onVideoDelete?.(videoId)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Video History</SheetTitle>
          <SheetDescription>
            Browse and manage your generated videos
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 border rounded-lg animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <FileVideo className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No videos in history</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleVideoSelect(item.id)}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center">
                        <FileVideo className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-3 w-3 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {item.query}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {item.duration && (
                            <span>{formatDuration(item.duration)}</span>
                          )}
                          <span>{formatRelativeTime(item.createdAt)}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleVideoDownload(e, item.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleVideoDelete(e, item.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}