"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Home, Bug, AlertCircle } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo || undefined}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError, errorInfo }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Don&apos;t worry, this has been logged and we&apos;ll look into it.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={handleReload} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          {/* Error Details Toggle */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              <Bug className="h-4 w-4 mr-2" />
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </Button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Error Stack:</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </div>

                {errorInfo && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Component Stack:</h4>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm mb-2">Browser Info:</h4>
                  <div className="text-xs bg-muted p-3 rounded-md">
                    <p>User Agent: {navigator.userAgent}</p>
                    <p>URL: {window.location.href}</p>
                    <p>Timestamp: {new Date().toISOString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>If this problem persists, please try refreshing the page or contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for using error boundary in functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    // In a real app, you might want to send this to an error reporting service
    console.error('Handled error:', error, errorInfo)
    
    // You could also show a toast notification
    // toast.error('An error occurred', { description: error.message })
  }, [])
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Async error boundary for handling promise rejections
export function AsyncErrorBoundary({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      // You could throw this error to be caught by the error boundary
      // throw new Error(`Unhandled promise rejection: ${event.reason}`)
    }

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return <>{children}</>
}

// Hook for handling API errors
export function useApiErrorHandler() {
  const [error, setError] = React.useState<string | null>(null)
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleApiError = React.useCallback((error: unknown, defaultMessage: string = "An unexpected error occurred") => {
    if (typeof error === "string") {
      setError(error)
    } else if (error instanceof Error) {
      setError(error.message)
    } else if (typeof error === "object" && error !== null && "error" in error) {
      setError(String((error as Record<string, unknown>).error))
    } else {
      setError(defaultMessage)
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  const retryOperation = React.useCallback(async (operation: () => Promise<void>) => {
    setIsRetrying(true)
    clearError()
    
    try {
      await operation()
    } catch (err) {
      handleApiError(err)
    } finally {
      setIsRetrying(false)
    }
  }, [clearError, handleApiError])

  return {
    error,
    isRetrying,
    handleApiError,
    clearError,
    retryOperation
  }
}

// Error alert component
export function ErrorAlert({ 
  error, 
  onRetry,
  onDismiss,
  className = ""
}: { 
  error: string | null, 
  onRetry?: () => void,
  onDismiss?: () => void,
  className?: string 
}) {
  if (!error) return null
  
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <div className="flex gap-2">
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}