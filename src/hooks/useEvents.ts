import { useState, useEffect, useCallback } from 'react';
import { Event, EventCategory } from '../types/event.types';
import { eventService, APIError } from '../services/eventService';
import { cache } from '../utils/cache';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  page: number;
}

interface UseEventsOptions {
  pageSize?: number;
  enableCache?: boolean;
  cacheTTL?: number;
}

/**
 * Custom hook for fetching and managing event data by category
 * Now includes caching and pagination support for performance optimization
 * Requirements: 2.1, 2.3, 3.1, 3.3, 4.1, 4.3
 */
export function useEvents(
  category: EventCategory,
  options: UseEventsOptions = {}
): UseEventsReturn {
  const { pageSize = 20, enableCache = true, cacheTTL = 5 * 60 * 1000 } = options;
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const getCacheKey = useCallback((cat: EventCategory, pg: number) => {
    return `events_${cat}_page_${pg}`;
  }, []);

  const fetchEvents = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!append) {
      setLoading(true);
    }
    setError(null);

    try {
      // Check cache first
      const cacheKey = getCacheKey(category, pageNum);
      let fetchedEvents: Event[] | null = null;

      if (enableCache) {
        fetchedEvents = cache.get<Event[]>(cacheKey);
      }

      // If not in cache, fetch from API
      if (!fetchedEvents) {
        fetchedEvents = await eventService.getEvents({ category });
        
        // Simulate pagination (in real app, API would handle this)
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedEvents = fetchedEvents.slice(startIndex, endIndex);
        
        // Cache the result
        if (enableCache) {
          cache.set(cacheKey, paginatedEvents, cacheTTL);
        }
        
        fetchedEvents = paginatedEvents;
      }

      // Update state
      if (append) {
        setEvents(prev => [...prev, ...fetchedEvents]);
      } else {
        setEvents(fetchedEvents);
      }

      // Check if there are more events to load
      setHasMore(fetchedEvents.length === pageSize);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching events');
      }
      if (!append) {
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  }, [category, pageSize, enableCache, cacheTTL, getCacheKey]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchEvents(nextPage, true);
  }, [page, hasMore, loading, fetchEvents]);

  const refetch = useCallback(async () => {
    // Clear cache for this category
    if (enableCache) {
      for (let i = 1; i <= page; i++) {
        cache.delete(getCacheKey(category, i));
      }
    }
    setPage(1);
    setHasMore(true);
    await fetchEvents(1, false);
  }, [category, page, enableCache, fetchEvents, getCacheKey]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchEvents(1, false);
  }, [category]); // Only re-fetch when category changes

  return {
    events,
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    page
  };
}

export default useEvents;
