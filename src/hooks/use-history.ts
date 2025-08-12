"use client"

import * as React from "react"

interface HistoryItem {
  id: string
  title: string
  query: string
  duration?: number
  createdAt: Date
  fileSize?: number
  thumbnailPath?: string
}

interface HistoryState {
  items: HistoryItem[]
  isLoading: boolean
  error: string | null
  total: number
  page: number
  limit: number
  hasMore: boolean
}

interface HistoryFilters {
  search: string
  sortBy: 'newest' | 'oldest' | 'duration' | 'size' | 'title'
  filterBy: 'all' | 'today' | 'week' | 'month'
}

interface UseHistoryOptions {
  initialLimit?: number
  autoLoad?: boolean
}

export function useHistory(options: UseHistoryOptions = {}) {
  const { initialLimit = 20, autoLoad = true } = options

  const [state, setState] = React.useState<HistoryState>({
    items: [],
    isLoading: false,
    error: null,
    total: 0,
    page: 1,
    limit: initialLimit,
    hasMore: false,
  })

  const [filters, setFilters] = React.useState<HistoryFilters>({
    search: '',
    sortBy: 'newest',
    filterBy: 'all',
  })

  // Load history data
  const loadHistory = React.useCallback(async (
    page: number = 1,
    append: boolean = false
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: state.limit.toString(),
        search: filters.search,
        sortBy: filters.sortBy,
        filterBy: filters.filterBy,
      })

      const response = await fetch(`/api/history?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load history: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Convert date strings back to Date objects
      const items = data.videos.map((video: Record<string, unknown>) => ({
        ...video,
        createdAt: new Date(video.createdAt as string),
      }))

      setState(prev => ({
        ...prev,
        items: append ? [...prev.items, ...items] : items,
        total: data.total,
        page: data.page,
        hasMore: data.page * data.limit < data.total,
        isLoading: false,
      }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load history'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }))
    }
  }, [state.limit, filters])

  // Load more items (pagination)
  const loadMore = React.useCallback(() => {
    if (!state.isLoading && state.hasMore) {
      loadHistory(state.page + 1, true)
    }
  }, [loadHistory, state.isLoading, state.hasMore, state.page])

  // Refresh history
  const refresh = React.useCallback(() => {
    loadHistory(1, false)
  }, [loadHistory])

  // Delete item from history
  const deleteItem = React.useCallback(async (videoId: string) => {
    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete video: ${response.statusText}`)
      }

      // Remove item from local state
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== videoId),
        total: prev.total - 1,
      }))

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete video'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [])

  // Clear all history
  const clearHistory = React.useCallback(async () => {
    try {
      // Delete all items one by one
      const deletePromises = state.items.map(item =>
        fetch('/api/history', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: item.id }),
        })
      )

      await Promise.all(deletePromises)

      // Clear local state
      setState(prev => ({
        ...prev,
        items: [],
        total: 0,
        page: 1,
        hasMore: false,
      }))

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear history'
      setState(prev => ({ ...prev, error: errorMessage }))
      return false
    }
  }, [state.items])

  // Update filters
  const updateFilters = React.useCallback((newFilters: Partial<HistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Search history
  const search = React.useCallback((query: string) => {
    updateFilters({ search: query })
  }, [updateFilters])

  // Sort history
  const sort = React.useCallback((sortBy: HistoryFilters['sortBy']) => {
    updateFilters({ sortBy })
  }, [updateFilters])

  // Filter history
  const filter = React.useCallback((filterBy: HistoryFilters['filterBy']) => {
    updateFilters({ filterBy })
  }, [updateFilters])

  // Get item by ID
  const getItem = React.useCallback((id: string) => {
    return state.items.find(item => item.id === id)
  }, [state.items])

  // Check if item exists
  const hasItem = React.useCallback((id: string) => {
    return state.items.some(item => item.id === id)
  }, [state.items])

  // Get statistics
  const getStats = React.useCallback(() => {
    const totalDuration = state.items.reduce((sum, item) => sum + (item.duration || 0), 0)
    const totalSize = state.items.reduce((sum, item) => sum + (item.fileSize || 0), 0)
    const avgDuration = state.items.length > 0 ? totalDuration / state.items.length : 0

    return {
      totalVideos: state.total,
      totalDuration,
      totalSize,
      avgDuration,
      oldestVideo: state.items.length > 0 ? 
        state.items.reduce((oldest, item) => 
          item.createdAt < oldest.createdAt ? item : oldest
        ) : null,
      newestVideo: state.items.length > 0 ? 
        state.items.reduce((newest, item) => 
          item.createdAt > newest.createdAt ? item : newest
        ) : null,
    }
  }, [state.items, state.total])

  // Auto-load on mount and filter changes (with debouncing)
  React.useEffect(() => {
    if (autoLoad) {
      const timer = setTimeout(() => {
        loadHistory(1, false)
      }, 500) // Debounce filter changes
      
      return () => clearTimeout(timer)
    }
  }, [filters, autoLoad]) // Removed loadHistory dependency to prevent excessive calls

  // Initial load only
  React.useEffect(() => {
    if (autoLoad && state.items.length === 0 && !state.isLoading) {
      loadHistory(1, false)
    }
  }, []) // Empty dependency array for initial load only

  return {
    // State
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
    total: state.total,
    page: state.page,
    limit: state.limit,
    hasMore: state.hasMore,
    filters,

    // Actions
    loadHistory,
    loadMore,
    refresh,
    deleteItem,
    clearHistory,
    updateFilters,
    search,
    sort,
    filter,

    // Utilities
    getItem,
    hasItem,
    getStats,
  }
}

// Hook for managing history selection
export function useHistorySelection() {
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set())

  const selectItem = React.useCallback((id: string) => {
    setSelectedItems(prev => new Set(prev).add(id))
  }, [])

  const deselectItem = React.useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])

  const toggleItem = React.useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = React.useCallback((ids: string[]) => {
    setSelectedItems(new Set(ids))
  }, [])

  const deselectAll = React.useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const isSelected = React.useCallback((id: string) => {
    return selectedItems.has(id)
  }, [selectedItems])

  const getSelectedCount = React.useCallback(() => {
    return selectedItems.size
  }, [selectedItems])

  const getSelectedIds = React.useCallback(() => {
    return Array.from(selectedItems)
  }, [selectedItems])

  return {
    selectedItems,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedCount,
    getSelectedIds,
  }
}

// Hook for history search with debouncing
export function useHistorySearch(delay: number = 300) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [debouncedQuery, setDebouncedQuery] = React.useState('')

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, delay)

    return () => clearTimeout(timer)
  }, [searchQuery, delay])

  return {
    searchQuery,
    debouncedQuery,
    setSearchQuery,
  }
}