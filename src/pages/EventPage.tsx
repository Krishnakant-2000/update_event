import React, { useState, lazy, Suspense } from 'react';
import { EventCategory } from '../types/event.types';
import { EventTabs } from '../components/events/EventTabs';
import { EventList } from '../components/events/EventList';
import { CreateEventButton } from '../components/events/CreateEventButton';
import { useEvents } from '../hooks/useEvents';

// Lazy load CreateEventForm for better bundle size
const CreateEventForm = lazy(() => 
  import('../components/events/CreateEventForm').then(module => ({
    default: module.CreateEventForm
  }))
);

interface EventPageProps {
  initialCategory?: EventCategory;
  isAuthenticated?: boolean;
}

/**
 * Main EventPage container component
 * Manages state for active tab and create form visibility
 * Requirements: 1.1, 1.2, 1.3, 2.4, 3.4, 4.4, 5.1, 5.2
 */
export const EventPage: React.FC<EventPageProps> = ({ 
  initialCategory = EventCategory.UPCOMING,
  isAuthenticated = false 
}) => {
  const [activeTab, setActiveTab] = useState<EventCategory>(initialCategory);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Fetch events based on active tab with pagination and caching
  const { events, loading, error, refetch, loadMore, hasMore } = useEvents(activeTab, {
    pageSize: 20,
    enableCache: true,
    cacheTTL: 5 * 60 * 1000 // 5 minutes
  });

  /**
   * Handle tab change with smooth transition
   * Requirement 1.2: Switch between event categories
   */
  const handleTabChange = (tab: EventCategory) => {
    if (tab === activeTab) return;
    
    // Trigger fade out
    setIsTransitioning(true);
    
    // Change tab after fade out starts
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 200);
  };

  /**
   * Handle event click - navigate to event detail page
   * Requirements: 2.4, 3.4, 4.4
   */
  const handleEventClick = (eventId: string) => {
    // Navigate to event detail page
    // In a real app, this would use a router like React Router
    window.location.href = `/events/${eventId}`;
  };

  /**
   * Handle create event button click
   * Requirement 5.1: Open event creation form
   */
  const handleCreateClick = () => {
    if (!isAuthenticated) {
      // Requirement 5.3: Prompt for login if not authenticated
      alert('Please log in to create an event');
      // In a real app, this would redirect to login page
      window.location.href = '/login';
      return;
    }
    setShowCreateForm(true);
  };

  /**
   * Handle successful event creation
   * Requirement 5.2: Refresh list after event creation
   */
  const handleEventCreated = async () => {
    // Refresh the event list after successful creation
    await refetch();
    setShowCreateForm(false);
  };

  /**
   * Handle form cancel
   */
  const handleFormCancel = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="event-page">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <div className="event-page-header">
        <h1 className="event-page-title" id="page-title">Events</h1>
        <CreateEventButton 
          onClick={handleCreateClick}
          disabled={!isAuthenticated}
        />
      </div>

      {/* Requirement 1.1: Display three navigation options */}
      <EventTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Display event list based on active category */}
      <main 
        id="main-content"
        role="tabpanel"
        aria-labelledby={`${activeTab}-tab`}
        className={`event-page-content ${isTransitioning ? 'content-transitioning' : 'content-visible'}`}
        tabIndex={-1}
      >
        <EventList
          events={events}
          loading={loading}
          error={error || undefined}
          onEventClick={handleEventClick}
          onRetry={refetch}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </main>

      {/* Event creation form modal - lazy loaded */}
      {showCreateForm && (
        <Suspense fallback={
          <div className="form-loading" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true"></div>
            <span>Loading form...</span>
          </div>
        }>
          <CreateEventForm
            isOpen={showCreateForm}
            onSuccess={handleEventCreated}
            onCancel={handleFormCancel}
          />
        </Suspense>
      )}
    </div>
  );
};

export default EventPage;
