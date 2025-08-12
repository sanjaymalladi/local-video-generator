"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Play, 
  Download, 
  Trash2,
  Clock,
  Calendar,
  FileVideo,
  Grid3X3,
  List
} from "lucide-react"
import { formatDuration, formatDate, formatFileSize, formatRelativeTime } from "@/lib/transformers"

interface VideoItem {
  id: string
  title: string
  query: string
  duration?: number
  createdAt: Date
  fileSize?: number
  thumbnailPath?: string
}

interface VideoGalleryProps {
  videos: VideoItem[]
  isLoading?: boolean
  viewMode?: 'grid' | 'list'
  onVideoSelect?: (videoId: string) => void
  onVideoDownload?: (videoId: string) => void
  onVideoDelete?: (videoId: string) => void
  onViewModeChange?: (mode: 'grid' | 'list') => void
  className?: string
}

export function VideoGallery({
  videos,
  isLoading = false,
  viewMode = 'grid',
  onVideoSelect,
  onVideoDownload,
  onVideoDelete,
  onViewModeChange,
  className = ""
}: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = React.useState<string | null>(null)

  const handleVideoClick = (videoId: string) => {
    setSelectedVideo(videoId)
    onVideoSelect?.(videoId)
  }

  const handleDownload = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation()
    onVideoDownload?.(videoId)
  }

  const handleDelete = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation()
    onVideoDelete?.(videoId)
  }

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="aspect-video w-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <FileVideo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
        <p className="text-muted-foreground">
          Generate your first video by entering a query above.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Video Gallery</h2>
          <p className="text-muted-foreground">
            {videos.length} video{videos.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        
        {onViewModeChange && (
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Video Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            viewMode={viewMode}
            isSelected={selectedVideo === video.id}
            onClick={() => handleVideoClick(video.id)}
            onDownload={(e) => handleDownload(e, video.id)}
            onDelete={(e) => handleDelete(e, video.id)}
          />
        ))}
      </div>
    </div>
  )
}

interface VideoCardProps {
  video: VideoItem
  viewMode: 'grid' | 'list'
  isSelected: boolean
  onClick: () => void
  onDownload: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

function VideoCard({ video, viewMode, isSelected, onClick, onDownload, onDelete }: VideoCardProps) {
  const [imageError, setImageError] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)

  const thumbnailSrc = video.thumbnailPath ? `/api/video/${video.id}?thumbnail=true` : null

  if (viewMode === 'list') {
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="relative w-32 h-18 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {thumbnailSrc && !imageError ? (
                <img
                  src={thumbnailSrc}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileVideo className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              
              {/* Play Overlay */}
              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold truncate pr-2">{video.title}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDownload}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {video.query}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {video.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatRelativeTime(video.createdAt)}</span>
                </div>
                {video.fileSize && (
                  <div className="flex items-center gap-1">
                    <FileVideo className="w-3 h-3" />
                    <span>{formatFileSize(video.fileSize)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
          {thumbnailSrc && !imageError ? (
            <img
              src={thumbnailSrc}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileVideo className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {/* Duration Badge */}
          {video.duration && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 right-2 text-xs bg-black/70 text-white border-0"
            >
              {formatDuration(video.duration)}
            </Badge>
          )}
          
          {/* Play Overlay */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold line-clamp-1 pr-2">{video.title}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownload}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {video.query}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatRelativeTime(video.createdAt)}</span>
            {video.fileSize && (
              <span>{formatFileSize(video.fileSize)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}