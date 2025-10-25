# 🏆 AmaPlayer Events App - Complete Feature Documentation

## 📋 Table of Contents

1. [Core Event Features](#core-event-features)
2. [User Engagement System](#user-engagement-system)
3. [Achievement & Badge System](#achievement--badge-system)
4. [Leaderboard System](#leaderboard-system)
5. [Challenge System](#challenge-system)
6. [Social Features](#social-features)
7. [Real-time Features](#real-time-features)
8. [PWA Features](#pwa-features)
9. [API Reference](#api-reference)
10. [Component Reference](#component-reference)

---

## 🎯 Core Event Features

### Event Creation
**Function**: `eventService.createEvent(data: CreateEventDTO)`

```typescript
// Create a new event
const newEvent = await eventService.createEvent({
  title: "Basketball Tournament",
  description: "Annual basketball championship",
  sport: "Basketball",
  location: "Sports Arena",
  startDate: new Date("2024-12-01"),
  endDate: new Date("2024-12-03"),
  eventType: EventType.TOURNAMENT,
  maxParticipants: 32,
  prizes: ["$1000 First Place", "Trophy", "Medals"],
  rules: "1. Teams of 5 players\n2. Standard NBA rules\n3. Fair play required"
});
```

### Event Participation
**Function**: `participationService.joinEvent(eventId: string, userId: string)`

```typescript
// Join an event
await participationService.joinEvent("event_123", "user_456");

// Check participation status
const isParticipating = await participationService.isUserParticipating("event_123", "user_456");

// Leave an event
await participationService.leaveEvent("event_123", "user_456");

// Get participant list
const participants = await participationService.getEventParticipants("event_123");
```

### Event Categories
- **Upcoming**: Future events you can join
- **Ongoing**: Currently active events
- **AmaPlayer**: Official talent hunts and competitions

---

## 👤 User Engagement System

### Participation Tracking
**Service**: `progressTracker`

```typescript
// Track user activity
await progressTracker.trackActivity("user_123", {
  type: "event_joined",
  eventId: "event_456",
  timestamp: new Date(),
  points: 10
});

// Get user progress
const progress = await progressTracker.getUserProgress("user_123");
// Returns: { totalEvents: 15, streakDays: 7, engagementScore: 850 }

// Track streak
await progressTracker.updateStreak("user_123", "event_participation");
```

### Engagement Scoring
**Algorithm**: Points are awarded for various activities

| Activity | Points | Description |
|----------|--------|-------------|
| Join Event | 10 | Basic participation |
| Complete Event | 25 | Finish an event |
| Win Challenge | 50 | Win a mini-challenge |
| Social Reaction | 2 | Like, cheer, or react |
| Comment/Post | 5 | Engage in discussions |
| Mentor Someone | 30 | Help other athletes |
| Streak Bonus | 5-20 | Daily participation bonus |

---

## 🏅 Achievement & Badge System

### Achievement Engine
**Service**: `achievementEngine`

```typescript
// Check for new achievements
const newAchievements = await achievementEngine.checkAchievements("user_123", {
  type: "event_completed",
  eventId: "event_456",
  data: { placement: 1, participants: 50 }
});

// Get user achievements
const achievements = await achievementEngine.getUserAchievements("user_123");

// Award custom badge
await achievementEngine.awardBadge("user_123", "first_place_winner");
```

### Available Badges

#### 🥇 **Participation Badges**
- **First Step** - Join your first event
- **Regular** - Join 5 events
- **Dedicated** - Join 20 events
- **Champion** - Join 50 events

#### 🔥 **Streak Badges**
- **Streak Starter** - 3-day participation streak
- **Streak Master** - 7-day participation streak
- **Streak Legend** - 30-day participation streak

#### 🏆 **Performance Badges**
- **Winner** - Win your first event
- **Dominator** - Win 5 events
- **Legend** - Win 20 events

#### 👥 **Social Badges**
- **Community Favorite** - Get 50 reactions
- **Influencer** - Get 200 reactions
- **Mentor** - Help 5 other athletes
- **Team Player** - Join 10 team events

#### ⭐ **Special Badges**
- **Early Bird** - Join events early
- **Night Owl** - Active during late hours
- **Globetrotter** - Join events in different locations
- **Multi-Sport** - Participate in 5+ different sports

### Badge Display Component
```typescript
<BadgeDisplay 
  badge={badge}
  size="large"
  showAnimation={true}
  onClick={() => showBadgeDetails(badge)}
/>
```

---

## 📊 Leaderboard System

### Leaderboard Service
**Service**: `leaderboardService`

```typescript
// Get leaderboard
const leaderboard = await leaderboardService.getLeaderboard(
  LeaderboardType.ENGAGEMENT_SCORE,
  LeaderboardPeriod.WEEKLY
);

// Update user ranking
await leaderboardService.updateUserRankingData("user_123", {
  totalEvents: 25,
  engagementScore: 1250,
  achievementPoints: 500,
  challengeWins: 8,
  socialImpact: 300
});

// Get user position
const position = await leaderboardService.getUserPosition(
  "user_123",
  LeaderboardType.PARTICIPATION,
  LeaderboardPeriod.ALL_TIME
);
```

### Leaderboard Types

#### 🎯 **Engagement Score**
- **Calculation**: Total points from all activities
- **Updates**: Real-time
- **Periods**: Daily, Weekly, Monthly, All-time

#### 📅 **Participation**
- **Calculation**: Number of events joined
- **Bonus**: Streak multipliers
- **Categories**: By sport, by location

#### 🏆 **Achievements**
- **Calculation**: Total achievement points
- **Rarity Bonus**: Rare badges worth more
- **Special**: Seasonal achievements

#### 🎮 **Challenge Wins**
- **Calculation**: Mini-challenge victories
- **Types**: Skill, creativity, teamwork
- **Rewards**: Bonus points and badges

#### 👥 **Social Impact**
- **Calculation**: Reactions, comments, mentoring
- **Community**: Helping other athletes
- **Influence**: Content engagement

#### 🏅 **Team Performance**
- **Calculation**: Team event success
- **Collaboration**: Team challenges
- **Leadership**: Captain bonuses

### Leaderboard Component
```typescript
<LeaderboardDisplay
  type={LeaderboardType.ENGAGEMENT_SCORE}
  period={LeaderboardPeriod.WEEKLY}
  maxEntries={20}
  showUserHighlight={true}
  currentUserId="user_123"
  showFilters={true}
  onUserClick={(userId) => showUserProfile(userId)}
/>
```

---

## 🎮 Challenge System

### Challenge Service
**Service**: `challengeSystem`

```typescript
// Get available challenges
const challenges = await challengeSystem.getEventChallenges("event_123");

// Participate in challenge
await challengeSystem.participateInChallenge("challenge_456", "user_123");

// Submit challenge entry
await challengeSystem.submitChallengeEntry("challenge_456", "user_123", {
  type: "video",
  content: videoFile,
  description: "My best basketball shot!"
});

// Get challenge leaderboard
const leaderboard = await challengeSystem.getChallengeLeaderboard("challenge_456");
```

### Challenge Types

#### 🎯 **Skill Showcase**
- **Duration**: 5-15 minutes
- **Format**: Video submission
- **Judging**: Community voting + expert review
- **Rewards**: Skill badges, points

#### 👥 **Team Collaboration**
- **Duration**: 10-30 minutes
- **Format**: Team coordination tasks
- **Judging**: Performance metrics
- **Rewards**: Team badges, bonus points

#### 🎨 **Creativity**
- **Duration**: 15-60 minutes
- **Format**: Creative content (video, photo, story)
- **Judging**: Originality and engagement
- **Rewards**: Creative badges, feature spots

#### ⚡ **Speed**
- **Duration**: 1-5 minutes
- **Format**: Quick tasks or questions
- **Judging**: Speed and accuracy
- **Rewards**: Speed badges, instant points

### Challenge Component
```typescript
<ChallengeCard
  challenge={challenge}
  userParticipated={false}
  onParticipate={(challengeId) => joinChallenge(challengeId)}
  onClick={(challengeId) => viewChallenge(challengeId)}
  showLeaderboard={true}
/>
```

---

## 💬 Social Features

### Reaction System
**Service**: `reactionSystem`

```typescript
// Add reaction to event
await reactionSystem.addReaction("event_123", "user_456", "🔥");

// Get event reactions
const reactions = await reactionSystem.getReactions("event_123");

// Remove reaction
await reactionSystem.removeReaction("event_123", "user_456");

// Get sport-specific emojis
const basketballEmojis = await reactionSystem.getCustomEmojis("Basketball");
```

### Available Reactions
- **Basic**: ❤️ 👍 👏 🔥 💪
- **Sport-Specific**: 🏀 ⚽ 🏈 🎾 ⚾ 🏐 🏓 🥊
- **Achievement**: 🏆 🥇 🥈 🥉 ⭐
- **Celebration**: 🎉 🎊 💥 ⚡ 🚀

### Mentorship System
**Service**: `mentorshipSystem`

```typescript
// Find mentors
const mentors = await mentorshipSystem.findMentors("user_123", "Basketball");

// Request mentorship
await mentorshipSystem.requestMentorship("mentee_123", "mentor_456");

// Accept mentorship
await mentorshipSystem.acceptMentorship("request_789");

// Get mentorship connections
const connections = await mentorshipSystem.getMentorshipConnections("user_123");
```

---

## ⚡ Real-time Features

### Live Activity Feed
**Service**: `liveFeedManager`

```typescript
// Initialize feed for event
liveFeedManager.initializeFeed("event_123");

// Subscribe to live updates
liveFeedManager.subscribeToFeed("event_123", (activity) => {
  console.log("New activity:", activity);
});

// Publish activity
liveFeedManager.publishActivity({
  id: "activity_789",
  eventId: "event_123",
  userId: "user_456",
  type: ActivityType.USER_JOINED,
  data: { userName: "John Doe" },
  timestamp: new Date(),
  priority: "medium"
});

// Get recent activities
const activities = liveFeedManager.getRecentActivities("event_123", 20);
```

### Activity Types
- **USER_JOINED** - User joins event
- **USER_REACTED** - User reacts to content
- **CHALLENGE_COMPLETED** - Challenge finished
- **ACHIEVEMENT_EARNED** - New badge earned
- **COMMENT_POSTED** - User comments
- **TEAM_FORMED** - Team created
- **MENTORSHIP_STARTED** - Mentorship begins
- **LEADERBOARD_UPDATED** - Ranking changes

### WebSocket Service
**Service**: `webSocketService`

```typescript
// Connect to real-time updates
await webSocketService.connect("user_123");

// Subscribe to channel
webSocketService.subscribe("event_123", (data) => {
  handleRealTimeUpdate(data);
});

// Publish message
webSocketService.publish("event_123", {
  type: "user_action",
  data: { action: "joined", userId: "user_123" }
});
```

---

## 📱 PWA Features

### PWA Service
**Service**: `pwaService`

```typescript
// Check PWA capabilities
const capabilities = pwaService.getCapabilities();

// Install app
if (pwaService.canInstall()) {
  const installed = await pwaService.installApp();
}

// Handle offline functionality
pwaService.addToOfflineQueue("/api/events/join", "POST", {
  eventId: "event_123",
  userId: "user_456"
});

// Request notifications
const permission = await pwaService.requestNotificationPermission();

// Subscribe to push notifications
const subscription = await pwaService.subscribeToPushNotifications("vapid-key");
```

### Offline Features
- **Event Viewing**: Cached events available offline
- **Queue Actions**: Join/leave events queued for when online
- **Sync**: Automatic sync when connection restored
- **Notifications**: Push notifications for important updates

---

## 🔧 API Reference

### Event Service Methods

```typescript
interface EventService {
  // CRUD Operations
  getEvents(filters: EventFilters): Promise<Event[]>
  getEventById(id: string): Promise<Event>
  createEvent(data: CreateEventDTO): Promise<Event>
  updateEvent(id: string, data: Partial<CreateEventDTO>): Promise<Event>
  deleteEvent(id: string): Promise<void>
  
  // Metrics
  incrementViewCount(eventId: string): Promise<void>
  updateEventMetrics(eventId: string, updates: Partial<Event>): Promise<void>
  
  // Utilities
  clearAllEvents(): void
  seedSampleData(): Promise<void>
  markTrendingEvents(): void
}
```

### Participation Service Methods

```typescript
interface ParticipationService {
  joinEvent(eventId: string, userId: string): Promise<void>
  leaveEvent(eventId: string, userId: string): Promise<void>
  isUserParticipating(eventId: string, userId: string): Promise<boolean>
  getEventParticipants(eventId: string): Promise<User[]>
  getUserEvents(userId: string): Promise<Event[]>
  updateParticipationStatus(eventId: string, userId: string, status: ParticipationStatus): Promise<void>
}
```

### Achievement Engine Methods

```typescript
interface AchievementEngine {
  checkAchievements(userId: string, action: UserAction): Promise<Achievement[]>
  awardBadge(userId: string, badgeId: string): Promise<void>
  getUserAchievements(userId: string): Promise<Achievement[]>
  calculateEngagementScore(userId: string): Promise<number>
  getBadgeProgress(userId: string, badgeId: string): Promise<BadgeProgress>
}
```

---

## 🧩 Component Reference

### Event Components

#### EventCard
```typescript
<EventCard
  event={event}
  onClick={(eventId) => navigateToEvent(eventId)}
  showMetrics={true}
  showParticipation={true}
/>
```

#### EventList
```typescript
<EventList
  events={events}
  loading={false}
  error={undefined}
  onEventClick={handleEventClick}
  onLoadMore={loadMoreEvents}
  hasMore={true}
/>
```

#### CreateEventForm
```typescript
<CreateEventForm
  isOpen={showForm}
  onSuccess={(event) => handleEventCreated(event)}
  onCancel={() => setShowForm(false)}
/>
```

### Engagement Components

#### LiveActivityFeed
```typescript
<LiveActivityFeed
  eventId="event_123"
  maxItems={20}
  autoScroll={true}
  showFilters={true}
  onActivityClick={handleActivityClick}
/>
```

#### AchievementNotification
```typescript
<AchievementNotification
  achievement={newAchievement}
  isVisible={showNotification}
  onClose={() => setShowNotification(false)}
  autoCloseDelay={5000}
/>
```

#### BadgeCollection
```typescript
<BadgeCollection
  badges={userBadges}
  layout="grid"
  showProgress={true}
  onBadgeClick={showBadgeDetails}
/>
```

### Social Components

#### ReactionButton
```typescript
<ReactionButton
  targetId="event_123"
  currentReaction="🔥"
  reactionCount={42}
  onReact={(reaction) => handleReaction(reaction)}
/>
```

#### MentorProfile
```typescript
<MentorProfile
  mentor={mentorData}
  showStats={true}
  onConnect={() => requestMentorship()}
  onMessage={() => openChat()}
/>
```

---

## 🎯 Usage Examples

### Complete Event Participation Flow

```typescript
// 1. User discovers event
const events = await eventService.getEvents({ category: EventCategory.UPCOMING });

// 2. User joins event
await participationService.joinEvent("event_123", "user_456");

// 3. System tracks participation
await progressTracker.trackActivity("user_456", {
  type: "event_joined",
  eventId: "event_123",
  points: 10
});

// 4. Check for achievements
const achievements = await achievementEngine.checkAchievements("user_456", {
  type: "event_joined",
  eventId: "event_123"
});

// 5. Update leaderboards
await leaderboardService.updateUserRankingData("user_456", {
  totalEvents: userStats.totalEvents + 1,
  engagementScore: userStats.engagementScore + 10
});

// 6. Broadcast activity
liveFeedManager.publishActivity({
  id: generateId(),
  eventId: "event_123",
  userId: "user_456",
  type: ActivityType.USER_JOINED,
  data: { userName: "John Doe" },
  timestamp: new Date(),
  priority: "medium"
});
```

### Challenge Participation Flow

```typescript
// 1. Get event challenges
const challenges = await challengeSystem.getEventChallenges("event_123");

// 2. Join challenge
await challengeSystem.participateInChallenge("challenge_456", "user_456");

// 3. Submit entry
await challengeSystem.submitChallengeEntry("challenge_456", "user_456", {
  type: "video",
  content: videoFile,
  description: "My basketball skills!"
});

// 4. Track completion
await progressTracker.trackActivity("user_456", {
  type: "challenge_completed",
  challengeId: "challenge_456",
  points: 25
});

// 5. Check for challenge-specific achievements
const challengeAchievements = await achievementEngine.checkAchievements("user_456", {
  type: "challenge_completed",
  challengeId: "challenge_456",
  data: { challengeType: "skill_showcase" }
});
```

---

## 🚀 Getting Started

### For Users
1. **Browse Events**: View upcoming, ongoing, and official events
2. **Join Events**: Click "Join" on any event you're interested in
3. **Participate**: Complete challenges, react to content, engage with community
4. **Earn Badges**: Unlock achievements through participation and performance
5. **Climb Leaderboards**: Compete with other athletes across various metrics
6. **Connect**: Find mentors, join teams, build your network

### For Developers
1. **Event Management**: Use `eventService` for CRUD operations
2. **User Engagement**: Implement `progressTracker` and `achievementEngine`
3. **Real-time Updates**: Set up `webSocketService` and `liveFeedManager`
4. **Social Features**: Add `reactionSystem` and `mentorshipSystem`
5. **Gamification**: Configure challenges and leaderboards
6. **PWA Features**: Enable offline support and push notifications

---

## 📞 Support & Resources

- **Dev Tools**: Use `window.devTools` in browser console
- **Testing**: Run `npm test` for comprehensive test suite
- **Documentation**: Check `/docs` folder for detailed guides
- **API Reference**: See service files in `/src/services`
- **Components**: Browse `/src/components` for UI elements

This documentation covers all the major features and functions available in the AmaPlayer Events App. Each system is designed to work together to create an engaging, gamified experience for athletes and sports enthusiasts.