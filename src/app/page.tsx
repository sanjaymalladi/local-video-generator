"use client"

import { MainLayout } from "@/components/main-layout";
import { QueryInput } from "@/components/query-input";
import { StatusDisplay, JobStatus } from "@/components/status-display";
import { VideoPlayer } from "@/components/video-player";
import { VideoGallery } from "@/components/video-gallery";
// import { HistorySidebar } from "@/components/history-sidebar";
import { VideoDownload } from "@/components/video-download";
import { useHistory } from "@/hooks/use-history";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, History } from "lucide-react";
import { toast } from "sonner";
import { ErrorBoundary, useApiErrorHandler, ErrorAlert } from "@/components/error-boundary";
import { validateApiResponse } from "@/lib/error-utils";
import { GenerateVideoResponse } from "@/lib/types";

export default function Home() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}

function HomeContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('script');
  const [jobId, setJobId] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Use history hook
  const { items: historyItems, refresh: refreshHistory } = useHistory();
  
  // Use API error handler
  const { error: apiError, handleApiError, clearError, retryOperation } = useApiErrorHandler();

  // Real-time job status polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (jobId && jobStatus === 'processing') {
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/status/${jobId}`);
          if (response.ok) {
            const status = await response.json();
            setProgress(status.progress);
            setCurrentStep(status.currentStep);
            setEstimatedTime(status.estimatedTime);

            if (status.status === 'completed') {
              setJobStatus('completed');
              setProgress(100);
              refreshHistory(); // Refresh history when job completes

              // Show success toast
              toast.success("Video generation completed!", {
                description: "Your video has been generated with Manim + Coqui TTS",
                duration: 5000,
              });

              // Auto-scroll to video section after a brief delay
              setTimeout(() => {
                const videoSection = document.querySelector('[data-video-player]');
                if (videoSection) {
                  videoSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });
                }
              }, 1000);
            } else if (status.status === 'failed') {
              setJobStatus('failed');
              setError(status.error || 'Video generation failed');

              // Show error toast
              toast.error("Video generation failed", {
                description: status.error || 'An error occurred during video generation',
                duration: 5000,
              });
            }
          }
        } catch (err) {
          console.error('Failed to poll job status:', err);
        }
      }, 2000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [jobId, jobStatus, refreshHistory]);

  const handleQuerySubmit = async (query: string) => {
    setIsLoading(true);
    setError(null);
    clearError();
    setJobStatus('processing');
    setProgress(0);
    setCurrentStep('script');
    
    // Show loading toast
    toast.loading("Starting video generation...", {
      id: "video-generation",
      description: "Your request is being processed"
    });
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const result = await validateApiResponse<GenerateVideoResponse>(response);
      setJobId(result.jobId);
      setJobStatus(result.status || 'completed'); // Default to completed if status is missing
      
      // Update toast to success
      toast.success("Video generation started!", {
        id: "video-generation",
        description: "Your video is being created in the background"
      });
    } catch (err) {
      handleApiError(err, "Failed to generate video. Please try again.");
      const errorMessage = apiError || "An unexpected error occurred";
      setError(errorMessage);
      setJobStatus('failed');
      
      // Show error toast
      toast.error("Failed to start video generation", {
        id: "video-generation",
        description: errorMessage
      });
      
      console.error("Query submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setJobStatus('idle');
    setProgress(0);
    setError(null);
    clearError();
    setJobId(null);
    setEstimatedTime(undefined);
  };

  const handleRetrySubmit = () => {
    if (!apiError) return;
    retryOperation(async () => {
      // Reset state and show message to resubmit
      handleRetry();
      toast.info("Please submit your query again", {
        description: "Ready to generate your video"
      });
    });
  };

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleVideoDownload = async (videoId: string) => {
    try {
      toast.loading("Preparing download...", {
        id: `download-${videoId}`,
        description: "Getting your video ready"
      });

      const link = document.createElement('a');
      link.href = `/api/video/${videoId}`;
      link.download = `video-${videoId.slice(0, 8)}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success toast
      toast.success("Download started!", {
        id: `download-${videoId}`,
        description: "Your video download has begun",
        duration: 3000,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Download failed", {
        id: `download-${videoId}`,
        description: "Failed to download video. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleVideoDelete = async (videoId: string) => {
    toast.success("Video removed", {
      description: "Video has been removed from your history",
      duration: 3000,
    });
    refreshHistory(); // Refresh history after deletion
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header with History Button */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight animate-in fade-in slide-in-from-top-4 duration-1000">
              Transform Text into 
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}Animated Videos
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-top-6 duration-1000 delay-200">
              Powered by AI, our platform converts your ideas into engaging animated explanations
              using Gemini AI, Manim mathematical animations, and Coqui TTS voice synthesis.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* <HistorySidebar
              isOpen={showHistory}
              onOpenChange={setShowHistory}
              onVideoSelect={handleVideoSelect}
              onVideoDownload={handleVideoDownload}
              onVideoDelete={handleVideoDelete}
            /> */}
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            {historyItems.length > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                {historyItems.length}
              </Badge>
            )}
          </div>
        </div>

        {/* Query Input */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <QueryInput 
            onSubmit={handleQuerySubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ErrorAlert
              error={apiError}
              onRetry={handleRetrySubmit}
              onDismiss={clearError}
              className="max-w-2xl mx-auto"
            />
          </div>
        )}

        {/* Status Display */}
        {jobStatus !== 'idle' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatusDisplay
              status={jobStatus}
              progress={progress}
              currentStep={currentStep}
              error={error}
              onRetry={handleRetry}
              estimatedTime={estimatedTime}
              jobId={jobId}
            />
          </div>
        )}

        {/* Video Player - Show when job is completed and video is selected */}
        {jobStatus === 'completed' && jobId && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700" data-video-player>
            <VideoPlayer
              jobId={jobId}
              title={`Generated Video ${jobId.slice(0, 8)}`}
              query="Your generated video is ready!"
              createdAt={new Date()}
              onDownload={() => handleVideoDownload(jobId)}
            />
          </div>
        )}

        {/* Selected Video Player */}
        {selectedVideoId && selectedVideoId !== jobId && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            {(() => {
              const selectedVideo = historyItems.find(item => item.id === selectedVideoId);
              return selectedVideo ? (
                <VideoPlayer
                  jobId={selectedVideo.id}
                  title={selectedVideo.title}
                  query={selectedVideo.query}
                  createdAt={selectedVideo.createdAt}
                  duration={selectedVideo.duration}
                  fileSize={selectedVideo.fileSize}
                  onDownload={() => handleVideoDownload(selectedVideo.id)}
                />
              ) : null;
            })()}
          </div>
        )}

        {/* Video Gallery */}
        {historyItems.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <VideoGallery
              videos={historyItems}
              viewMode={viewMode}
              onVideoSelect={handleVideoSelect}
              onVideoDownload={handleVideoDownload}
              onVideoDelete={handleVideoDelete}
              onViewModeChange={setViewMode}
            />
          </div>
        )}

        {/* Features Preview - Only show when no videos */}
        {historyItems.length === 0 && jobStatus === 'idle' && (
          <div className="grid md:grid-cols-3 gap-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">AI-Powered Scripts</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced language models generate comprehensive scripts from your input
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🎬</span>
                </div>
                <h3 className="font-semibold text-lg">Manim + TTS</h3>
                <p className="text-sm text-muted-foreground">
                  Professional mathematical animations with Coqui TTS voice synthesis
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Local Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Fast, secure video generation processed entirely on your machine
                </p>
              </CardContent>
            </Card>
          </div>
        )}


      </div>
    </MainLayout>
  );
}
