import React, { useState, lazy, Suspense, useEffect } from 'react';
import { EventCategory } from '../types/event.types';
import { EventTabs } from '../components/events/EventTabs';
import { EventList } from '../components/events/EventList';
import { CreateEventButton } from '../components/events/CreateEventButton';
import { useEvents } from '../hooks/useEvents';
import { EventDetailPage } from './EventDetailPage';
import { LiveActivityFeed } from '../components/common/LiveActivityFeed';
import { AchievementNotification } from '../components/common/AchievementNotification';
import { ChallengeCard } from '../components/common/ChallengeCard';
import { LeaderboardDisplay } from '../components/common/LeaderboardDisplay';
import { Achievement, Challenge, LeaderboardType, LeaderboardPeriod } from '../types/engagement.types';
import { achievementEngine } from '../services/achievementEngine';
import { challengeSystem } from '../services/challengeSystem';

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
 * Now includes routing to event detail page and engagement features
 * Requirements: 1.1, 1.2, 1.3, 2.4, 3.3, 4.3, 5.1, 5.2
 */
export const EventPage: React.FC<EventPageProps> = ({
  initialCategory = EventCategory.UPCOMING,
  isAuthenticated = false
}) => {
  const [activeTab, setActiveTab] = useState<EventCategory>(initialCategory);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Engagement features state
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);
  const [featuredChallenges, setFeaturedChallenges] = useState<Challenge[]>([]);
  const [showEngagementPanel, setShowEngagementPanel] = useState(true);

  // Fetch events based on active tab with pagination and caching
  const { events, loading, error, refetch, loadMore, hasMore } = useEvents(activeTab, {
    pageSize: 20,
    enableCache: true,
    cacheTTL: 5 * 60 * 1000 // 5 minutes
  });

  // Load featured challenges and check for achievements
  useEffect(() => {
    const loadEngagementData = async () => {
      if (isAuthenticated) {
        try {
          // Load featured challenges
          const challenges = await challengeSystem.getFeaturedChallenges(5);
          setFeaturedChallenges(challenges);

          // Check for new achievements
          const userAchievements = await achievementEngine.checkForNewAchievements('current-user');
          if (userAchievements.length > 0) {
            setNewAchievement(userAchievements[0]);
            setShowAchievementNotification(true);
          }
        } catch (error) {
          console.error('Failed to load engagement data:', error);
        }
      }
    };

    loadEngagementData();
  }, [isAuthenticated, activeTab]);

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
    setSelectedEventId(eventId);
  };

  /**
   * Handle back from detail page
   */
  const handleBackToList = () => {
    setSelectedEventId(null);
    // Refresh the list to show updated data
    refetch();
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

  /**
   * Handle challenge participation
   * Requirement 3.3: Implement challenge and leaderboard sections
   */
  const handleChallengeParticipate = async (challengeId: string) => {
    if (!isAuthenticated) {
      alert('Please log in to participate in challenges');
      return;
    }

    try {
      await challengeSystem.participateInChallenge(challengeId, 'current-user');
      // Refresh challenges to show updated participation
      const updatedChallenges = await challengeSystem.getFeaturedChallenges(5);
      setFeaturedChallenges(updatedChallenges);
    } catch (error) {
      console.error('Failed to participate in challenge:', error);
    }
  };

  /**
   * Handle challenge click
   */
  const handleChallengeClick = (challengeId: string) => {
    // In a real app, this would navigate to challenge detail page
    console.log('Navigate to challenge:', challengeId);
  };

  /**
   * Handle achievement notification close
   */
  const handleAchievementClose = () => {
    setShowAchievementNotification(false);
    setNewAchievement(null);
  };

  /**
   * Toggle engagement panel visibility
   */
  const toggleEngagementPanel = () => {
    setShowEngagementPanel(!showEngagementPanel);
  };

  // If an event is selected, show detail page
  if (selectedEventId) {
    return <EventDetailPage eventId={selectedEventId} onBack={handleBackToList} />;
  }

  // Otherwise show event list with engagement features
  return (
    <div className="event-page">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="event-page-header">
        <h1 className="event-page-title" id="page-title">Events</h1>
        <div className="header-actions">
          <button
            className="engagement-toggle"
            onClick={toggleEngagementPanel}
            aria-label={showEngagementPanel ? 'Hide engagement panel' : 'Show engagement panel'}
          >
            {showEngagementPanel ? '🔽' : '🔼'} Engagement
          </button>
          <CreateEventButton
            onClick={handleCreateClick}
            disabled={!isAuthenticated}
          />
        </div>
      </div>

      {/* Requirement 1.1: Display three navigation options */}
      <EventTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="event-page-layout">
        {/* Main content area */}
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

        {/* Engagement panel - Requirements: 1.1, 2.4, 3.3, 4.3 */}
        {showEngagementPanel && isAuthenticated && (
          <aside className="engagement-panel" aria-label="Engagement features">
            {/* Real-time activity feed - Requirement 1.1 */}
            <section className="engagement-section">
              <LiveActivityFeed
                eventId="global-feed"
                maxItems={10}
                showFilters={false}
                className="global-activity-feed"
              />
            </section>

            {/* Featured challenges - Requirement 3.3 */}
            {featuredChallenges.length > 0 && (
              <section className="engagement-section">
                <h3 className="section-title">Featured Challenges</h3>
                <div className="challenges-grid">
                  {featuredChallenges.slice(0, 3).map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onClick={handleChallengeClick}
                      onParticipate={handleChallengeParticipate}
                      userParticipated={challenge.participants.includes('current-user')}
                      className="featured-challenge"
                    />
                  ))}
                </div>
                <button className="view-all-challenges">
                  View All Challenges
                </button>
              </section>
            )}

            {/* Leaderboard - Requirement 4.3 */}
            <section className="engagement-section">
              <LeaderboardDisplay
                type={LeaderboardType.ENGAGEMENT_SCORE}
                period={LeaderboardPeriod.WEEKLY}
                maxEntries={10}
                showUserHighlight={true}
                currentUserId="current-user"
                showFilters={false}
                className="main-leaderboard"
              />
            </section>
          </aside>
        )}
      </div>

      {/* Achievement notification - Requirement 2.4 */}
      {newAchievement && (
        <AchievementNotification
          achievement={newAchievement}
          isVisible={showAchievementNotification}
          onClose={handleAchievementClose}
          autoCloseDelay={6000}
        />
      )}

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
