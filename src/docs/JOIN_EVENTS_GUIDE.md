# 🎯 How to Join Events - Complete Guide

## 🚀 Quick Start

### Step 1: Browse Available Events
1. Open the app at http://localhost:3007
2. Use the tabs to filter events:
   - **Upcoming** - Future events you can join
   - **Ongoing** - Currently active events
   - **AmaPlayer** - Official talent hunts

### Step 2: Find an Event
- Browse the event cards
- Look for events in your sport
- Check the location and date
- Read the description and requirements

### Step 3: Join the Event
1. Click on an event card to view details
2. Click the **"Join Event"** button
3. Confirm your participation
4. Start earning points and badges!

---

## 🎮 Participation System Functions

### Core Functions Available

#### Join Event
```typescript
// Function: participationService.joinEvent()
await participationService.joinEvent("event_123", "user_456");

// What happens:
// - Adds user to event.participantIds
// - Increases event.participantCount
// - Awards 10 engagement points
// - Triggers achievement check
// - Updates leaderboards
// - Broadcasts activity
```

#### Leave Event
```typescript
await participationService.leaveEvent("event_123", "user_456");
```

#### Check Participation Status
```typescript
const isJoined = await participationService.isUserParticipating("event_123", "user_456");
```

#### Get Event Participants
```typescript
const participants = await participationService.getEventParticipants("event_123");
```

---

## 🏆 Rewards & Badges System

### Points Earned for Participation

| Action | Points | Badge Progress |
|--------|--------|----------------|
| Join Event | 10 | ✓ Participation badges |
| Complete Event | 25 | ✓ Completion badges |
| Win Event | 50 | ✓ Winner badges |
| Team Event | +5 bonus | ✓ Team player badges |
| Streak Day | +2-10 | ✓ Streak badges |

### Available Badges

#### 🎯 **Participation Badges**
- **First Step** (1 event) - 50 points
- **Regular** (5 events) - 100 points
- **Dedicated** (20 events) - 250 points
- **Champion** (50 events) - 500 points

#### 🔥 **Streak Badges**
- **Streak Starter** (3 days) - 25 points
- **Streak Master** (7 days) - 75 points
- **Streak Legend** (30 days) - 300 points

#### 🏆 **Performance Badges**
- **Winner** (Win 1 event) - 150 points
- **Dominator** (Win 5 events) - 500 points
- **Champion** (Win 10 events) - 1000 points

---

## 📊 Leaderboard System

### Leaderboard Types Available

#### 🎯 **Engagement Score Leaderboard**
```typescript
// View engagement leaderboard
const leaderboard = await leaderboardService.getLeaderboard(
  LeaderboardType.ENGAGEMENT_SCORE,
  LeaderboardPeriod.WEEKLY
);
```

#### 📅 **Participation Leaderboard**
```typescript
// View participation leaderboard
const leaderboard = await leaderboardService.getLeaderboard(
  LeaderboardType.PARTICIPATION,
  LeaderboardPeriod.ALL_TIME
);
```

#### 🏆 **Achievement Leaderboard**
```typescript
// View achievement leaderboard
const leaderboard = await leaderboardService.getLeaderboard(
  LeaderboardType.ACHIEVEMENTS,
  LeaderboardPeriod.MONTHLY
);
```

### Check Your Ranking
```typescript
// Get your position in leaderboard
const position = await leaderboardService.getUserPosition(
  "your_user_id",
  LeaderboardType.PARTICIPATION,
  LeaderboardPeriod.WEEKLY
);
```

---

## 🎮 Challenge System

### Participate in Event Challenges
```typescript
// Get challenges for an event
const challenges = await challengeSystem.getEventChallenges("event_123");

// Join a challenge
await challengeSystem.participateInChallenge("challenge_456", "user_123");

// Submit challenge entry
await challengeSystem.submitChallengeEntry("challenge_456", "user_123", {
  type: "video",
  content: videoFile,
  description: "My basketball skills!"
});
```

### Challenge Types
- **Skill Showcase** - Show your abilities (5-15 min)
- **Team Collaboration** - Work with others (10-30 min)
- **Creativity** - Creative content (15-60 min)
- **Speed** - Quick tasks (1-5 min)

---

## 💬 Social Features

### React to Events
```typescript
// Add reaction to event
await reactionSystem.addReaction("event_123", "user_456", "🔥");

// Available reactions: ❤️ 👍 👏 🔥 💪 🏀 ⚽ 🏆
```

### Find Mentors
```typescript
// Find mentors in your sport
const mentors = await mentorshipSystem.findMentors("user_123", "Basketball");

// Request mentorship
await mentorshipSystem.requestMentorship("user_123", "mentor_456");
```

---

## ⚡ Real-time Features

### Live Activity Feed
```typescript
// Subscribe to live updates
liveFeedManager.subscribeToFeed("event_123", (activity) => {
  console.log("New activity:", activity);
});

// Activity types you'll see:
// - USER_JOINED - Someone joins event
// - USER_REACTED - Someone reacts
// - CHALLENGE_COMPLETED - Challenge finished
// - ACHIEVEMENT_EARNED - Badge earned
```

---

## 📱 PWA Features

### Offline Support
```typescript
// Actions are queued when offline
pwaService.addToOfflineQueue("/api/events/join", "POST", {
  eventId: "event_123",
  userId: "user_456"
});

// Automatically syncs when back online
```

### Push Notifications
```typescript
// Get notified about events
const permission = await pwaService.requestNotificationPermission();
```

---

## 🔧 Developer Tools

### Browser Console Commands
```javascript
// View all events
devTools.viewEvents()

// Check user stats
devTools.getStats()

// Reset app data
devTools.reset()

// Join event (for testing)
await participationService.joinEvent("event_1", "test-user")
```

---

## 📊 Complete Participation Flow Example

```typescript
// Complete flow when user joins an event
const joinEventFlow = async (eventId: string, userId: string) => {
  // 1. Join the event
  await participationService.joinEvent(eventId, userId);
  
  // 2. Track activity for points
  await progressTracker.trackActivity(userId, {
    type: "event_joined",
    eventId: eventId,
    points: 10
  });
  
  // 3. Check for new achievements
  const achievements = await achievementEngine.checkAchievements(userId, {
    type: "event_joined",
    eventId: eventId
  });
  
  // 4. Update leaderboards
  await leaderboardService.updateUserRankingData(userId, {
    totalEvents: userStats.totalEvents + 1,
    engagementScore: userStats.engagementScore + 10
  });
  
  // 5. Broadcast to live feed
  liveFeedManager.publishActivity({
    id: generateId(),
    eventId: eventId,
    userId: userId,
    type: ActivityType.USER_JOINED,
    data: { userName: user.name },
    timestamp: new Date(),
    priority: "medium"
  });
  
  // 6. Show achievement notification if earned
  if (achievements.length > 0) {
    showAchievementNotification(achievements[0]);
  }
};
```

This guide covers all the functions and features for joining events and participating in the gamified sports community!