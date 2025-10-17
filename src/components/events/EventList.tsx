import React from 'react';
import { Event } from '../../types/event.types';
import { EventCard } from './EventCard';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

interface EventListProps {
  events: Event[];
  loading: boolean;
  error?: string;
  onEventClick: (eventId: string) => void;
  onRetry?: () => void;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
}

/**
 * EventList component with error handling, retry functionality, and infinite scroll
 * Requirements: 2.1, 2.3, 2.4, 3.1, 3.3, 3.4, 4.1, 4.3, 4.4, 10.6
 */
export const EventList: React.FC<EventListProps> = ({
  events,
  loading,
  error,
  onEventClick,
  onRetry,
  onLoadMore,
  hasMore = false
}) => {
  // Set up infinite scroll
  const { loadMoreRef, isLoadingMore } = useInfiniteScroll(
    onLoadMore || (async () => {}),
    hasMore && !loading && !error
  );
  if (loading) {
    return (
      <div className="event-list-loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <span>Loading events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-list-error" role="alert" aria-live="assertive">
        <p className="error-message">{error}</p>
        <p className="error-hint">
          {error.includes('timeout') 
            ? 'The request took too long. Please check your internet connection.'
            : error.includes('Network')
            ? 'Unable to connect to the server. Please check your internet connection.'
            : 'Something went wrong. Please try again.'}
        </p>
        <button 
          className="retry-button"
          onClick={onRetry || (() => window.location.reload())}
          aria-label="Retry loading events"
        >
          Retry
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="event-list-empty" role="status">
        <p className="empty-message">No events found</p>
        <p className="empty-description">
          Check back later or create your own event to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      <div className="event-list" role="list">
        {events.map((event) => (
          <div key={event.id} role="listitem">
            <EventCard event={event} onClick={onEventClick} />
          </div>
        ))}
      </div>

      {/* Infinite scroll trigger element */}
      {hasMore && !loading && !error && (
        <div ref={loadMoreRef} className="load-more-trigger">
          {isLoadingMore && (
            <div className="load-more-loading" role="status" aria-live="polite">
              <div className="spinner" aria-hidden="true"></div>
              <span>Loading more events...</span>
            </div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && events.length > 0 && (
        <div className="end-of-list" role="status">
          <p>You've reached the end of the list</p>
        </div>
      )}
    </div>
  );
};
