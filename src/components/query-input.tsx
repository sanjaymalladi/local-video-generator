"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Sparkles } from "lucide-react"

interface QueryInputProps {
  onSubmit: (query: string) => void
  isLoading?: boolean
  error?: string | null
}

export function QueryInput({ onSubmit, isLoading = false, error = null }: QueryInputProps) {
  const [query, setQuery] = React.useState("")
  const [charCount, setCharCount] = React.useState(0)
  const [validationError, setValidationError] = React.useState<string | null>(null)

  const MIN_CHARS = 10
  const MAX_CHARS = 2000

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setCharCount(value.length)
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null)
    }
  }

  const validateQuery = (text: string): string | null => {
    if (!text.trim()) {
      return "Please enter a query to generate your video"
    }
    
    if (text.trim().length < MIN_CHARS) {
      return `Query must be at least ${MIN_CHARS} characters long`
    }
    
    if (text.length > MAX_CHARS) {
      return `Query must be less than ${MAX_CHARS} characters`
    }
    
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateQuery(query)
    if (validation) {
      setValidationError(validation)
      return
    }
    
    onSubmit(query.trim())
  }

  const isValid = query.trim().length >= MIN_CHARS && query.length <= MAX_CHARS
  const isNearLimit = charCount > MAX_CHARS * 0.9

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Create Your Video
        </CardTitle>
        <CardDescription>
          Describe what you want to create and our AI will generate an animated video for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="query" className="text-sm font-medium">
                Your Query
              </label>
              <Badge 
                variant={isNearLimit ? "destructive" : "secondary"}
                className="text-xs"
              >
                {charCount}/{MAX_CHARS}
              </Badge>
            </div>
            
            <Textarea
              id="query"
              placeholder="Example: Explain how photosynthesis works in plants, including the role of chlorophyll and the conversion of sunlight into energy..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isLoading}
            />
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Minimum {MIN_CHARS} characters required</span>
              {isValid && (
                <span className="text-green-600 dark:text-green-400">
                  ✓ Ready to generate
                </span>
              )}
            </div>
          </div>

          {(validationError || error) && (
            <Alert variant="destructive">
              <AlertDescription>
                {validationError || error}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isValid || isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">💡 Tips for better results:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Be specific about what you want to explain or demonstrate</li>
            <li>• Include key concepts, processes, or steps you want covered</li>
            <li>• Mention if you want examples, comparisons, or visual elements</li>
            <li>• Keep it focused - one main topic works best</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}