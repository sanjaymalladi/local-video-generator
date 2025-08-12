"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  FileText,
  Video,
  Sparkles
} from "lucide-react"

export type JobStatus = 'processing' | 'completed' | 'failed' | 'idle'

export interface StatusDisplayProps {
  status: JobStatus
  progress: number
  currentStep?: string
  error?: string | null
  onRetry?: () => void
  estimatedTime?: number
  jobId?: string | null
}

const statusConfig = {
  idle: {
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    title: "Ready to Generate",
    description: "Submit a query to start video generation"
  },
  processing: {
    icon: Loader2,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    title: "Generating Video",
    description: "Your video is being created..."
  },
  completed: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    title: "Video Ready!",
    description: "Your video has been generated successfully"
  },
  failed: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    title: "Generation Failed",
    description: "There was an error generating your video"
  }
}

const processingSteps = [
  { key: "script", label: "Generating Script", icon: FileText },
  { key: "manim", label: "Creating Animation", icon: Sparkles },
  { key: "render", label: "Rendering Video", icon: Video },
  { key: "complete", label: "Finalizing", icon: CheckCircle }
]

export function StatusDisplay({ 
  status, 
  progress, 
  currentStep = "script",
  error,
  onRetry,
  estimatedTime,
  jobId
}: StatusDisplayProps) {
  // Ensure status is valid
  const validStatus = status && statusConfig[status] ? status : 'idle'
  const config = statusConfig[validStatus]
  
  // Handle invalid status
  if (!config) {
    console.error(`Invalid status: ${status}, falling back to idle`)
    return null
  }
  
  const Icon = config.icon
  
  const getCurrentStepIndex = () => {
    return processingSteps.findIndex(step => step.key === currentStep)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  if (status === 'idle') {
    return null
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <Icon 
                className={`h-5 w-5 ${config.color} ${status === 'processing' ? 'animate-spin' : ''}`} 
              />
            </div>
            <div>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          
          {jobId && (
            <Badge variant="outline" className="text-xs font-mono">
              {jobId.slice(0, 8)}...
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === 'processing' && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Processing Steps */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Processing Steps</h4>
              <div className="space-y-2">
                {processingSteps.map((step, index) => {
                  const currentIndex = getCurrentStepIndex()
                  const isActive = index === currentIndex
                  const isCompleted = index < currentIndex
                  const StepIcon = step.icon || CheckCircle // Fallback icon

                  return (
                    <div 
                      key={step.key}
                      className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                        isActive ? 'bg-primary/10' : isCompleted ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/30'
                      }`}
                    >
                      <div className={`p-1 rounded-full ${
                        isCompleted ? 'bg-green-100 dark:bg-green-900' : 
                        isActive ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <StepIcon className={`h-3 w-3 ${
                          isCompleted ? 'text-green-600' :
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <span className={`text-sm ${
                        isActive ? 'font-medium' : 
                        isCompleted ? 'text-muted-foreground line-through' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </span>
                      {isActive && (
                        <Loader2 className="h-3 w-3 animate-spin text-primary ml-auto" />
                      )}
                      {isCompleted && (
                        <CheckCircle className="h-3 w-3 text-green-600 ml-auto" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Estimated Time */}
            {estimatedTime && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Estimated time remaining:</span>
                <span className="font-medium">{formatTime(estimatedTime)}</span>
              </div>
            )}
          </>
        )}

        {status === 'failed' && error && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            {onRetry && (
              <Button 
                onClick={onRetry} 
                variant="outline" 
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        )}

        {status === 'completed' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your video is ready for viewing and download!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}