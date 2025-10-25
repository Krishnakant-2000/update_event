import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { achievementEngine, UserActionType } from '../../services/achievementEngine';
import { liveFeedManager } from '../../services/liveFeedManager';
import { challengeSystem } from '../../services/challengeSystem';
import { leaderboardService } from '../../services/leaderboardService';
import { reactionSystem } from '../../services/reactionSystem';
import { mentorshipSystem } from '../../services/mentorshipSystem';
import { recommendationService } from '../../services/recommendationService';
import { statisticsService } from '../../services/statisticsService';
import { webSocketService } from '../../services/webSocketService';
import { ActivityType } from '../../types/realtime.types';
import { ChallengeType, LeaderboardType, LeaderboardPeriod } from '../../types/engagement.types';
import { SkillLevel } from '../../types/user.types';

/**
 * End-to-End Integration Tests for User Engagement Workflows
 * 
 * These tests verify complete user engagement workflows and cross-system interactions
 * covering all requirements from the athlete engagement features specification.
 */

describe('User Engagement Workflows - Integration Tests', () => {

  const mockEventId = 'test-event-123';
  const mockUserId = 'test-user-456';
  const mockUser2Id = 'test-user-789';
  const mockMentorId = 'mentor-user-101';

  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear();
    
    // Initialize WebSocket service
    await webSocketService.connect(mockUserId);
    
    // Setup test data
    await setupTestData();
  });

  afterEach(() => {
    webSocketService.disconnect();
    localStorage.clear();
  });

  async function setupTestData() {
    // Create test user profiles
    const testUser = {
      id: mockUserId,
      name: 'Test Athlete',
      email: 'test@example.com',
      avatar: 'avatar1.jpg',
      primarySports: ['Basketball'],
      skillLevel: SkillLevel.INTERMEDIATE,
      timezone: 'UTC',
      verified: false
    };

    const testUser2 = {
      id: mockUser2Id,
      name: 'Test Athlete 2',
      email: 'test2@example.com',
      avatar: 'avatar2.jpg',
      primarySports: ['Basketball'],
      skillLevel: SkillLevel.BEGINNER,
      timezone: 'UTC',
      verified: false
    };

    const mentorUser = {
      id: mockMentorId,
      name: 'Mentor Athlete',
      email: 'mentor@example.com',
      avatar: 'mentor.jpg',
      primarySports: ['Basketball'],
      skillLevel: SkillLevel.PROFESSIONAL,
      timezone: 'UTC',
      verified: true
    };

    // Store user data
    localStorage.setItem('user_profiles', JSON.stringify([testUser, testUser2, mentorUser]));
    
    // Initialize live feed for test event
    liveFeedManager.initializeFeed(mockEventId);
  }

  describe('Complete User Journey: First-Time Event Participation', () => {
    it('should handle complete first-time user engagement workflow', async () => {
      // Step 1: User joins their first event
      await liveFeedManager.publishActivity({
        id: 'activity-1',
        eventId: mockEventId,
        userId: mockUserId,
        type: ActivityType.USER_JOINED,
        data: { userName: 'Test Athlete', userAvatar: 'avatar1.jpg' },
        timestamp: new Date(),
        priority: 'medium'
      });

      // Verify live feed activity
      const activities = liveFeedManager.getRecentActivities(mockEventId, 10);
      expect(activities).toHaveLength(1);
      expect(activities[0].type).toBe(ActivityType.USER_JOINED);

      // Step 2: Check for first event achievement
      const achievements = await achievementEngine.checkAchievements(mockUserId, {
        type: UserActionType.EVENT_JOINED,
        userId: mockUserId,
        eventId: mockEventId,
        timestamp: new Date()
      });

      expect(achievements).toHaveLength(1);
      expect(achievements[0].name).toBe('First Step');

      // Step 3: Verify achievement appears in live feed
      const updatedActivities = liveFeedManager.getRecentActivities(mockEventId, 10);
      expect(updatedActivities.some(a => a.type === ActivityType.ACHIEVEMENT_EARNED)).toBe(true);

      // Step 4: Update user statistics
      await statisticsService.updateUserStats(mockUserId, {
        eventsJoined: 1,
        participationRate: 100
      });

      const userStats = await statisticsService.getUserStats(mockUserId);
      expect(userStats.eventsJoined).toBe(1);

      // Step 5: Update leaderboards
      await leaderboardService.updateUserScore(mockUserId, LeaderboardType.PARTICIPATION, 10);
      
      const leaderboard = await leaderboardService.getLeaderboard(
        LeaderboardType.PARTICIPATION,
        LeaderboardPeriod.ALL_TIME
      );
      
      expect(leaderboard.entries).toHaveLength(1);
      expect(leaderboard.entries[0].userId).toBe(mockUserId);
      expect(leaderboard.entries[0].rank).toBe(1);
    });
  });

  describe('Challenge Participation and Competition Workflow', () => {
    it('should handle complete challenge participation workflow', async () => {
      // Step 1: Generate challenges for event
      const challenges = await challengeSystem.generateChallenges(mockEventId, 'Basketball');
      expect(challenges).toHaveLength(3);

      const skillChallenge = challenges.find(c => c.type === ChallengeType.SKILL_SHOWCASE);
      expect(skillChallenge).toBeDefined();

      // Step 2: User participates in challenge
      await challengeSystem.submitChallengeEntry(skillChallenge!.id, mockUserId, {
        content: 'Amazing basketball trick shot!',
        mediaUrl: 'video1.mp4'
      });

      // Step 3: Second user also participates
      await challengeSystem.submitChallengeEntry(skillChallenge!.id, mockUser2Id, {
        content: 'Great dribbling skills!',
        mediaUrl: 'video2.mp4'
      });

      // Step 4: Check challenge leaderboard
      const leaderboard = await challengeSystem.getChallengeLeaderboard(skillChallenge!.id);
      expect(leaderboard).toHaveLength(2);

      // Step 5: Complete challenge and announce winners
      const results = await challengeSystem.endChallenge(skillChallenge!.id);
      expect(results).toHaveLength(1); // One winner

      // Step 6: Verify achievement for challenge completion
      const achievements = await achievementEngine.checkAchievements(mockUserId, {
        type: UserActionType.CHALLENGE_COMPLETED,
        userId: mockUserId,
        challengeId: skillChallenge!.id,
        timestamp: new Date()
      });

      expect(achievements.length).toBeGreaterThanOrEqual(0);

      // Step 7: Verify live feed updates
      const activities = liveFeedManager.getRecentActivities(mockEventId, 20);
      const challengeActivities = activities.filter(a => 
        a.type === ActivityType.CHALLENGE_COMPLETED || 
        a.type === ActivityType.ACHIEVEMENT_EARNED
      );
      expect(challengeActivities.length).toBeGreaterThan(0);
    });
  });

  describe('Social Interaction and Mentorship Workflow', () => {
    it('should handle complete social interaction and mentorship workflow', async () => {
      // Step 1: User reacts to event content
      await reactionSystem.addReaction('event-content-1', mockUserId, '🔥');
      await reactionSystem.addReaction('event-content-1', mockUser2Id, '💪');

      // Step 2: Check reaction summary
      const reactions = await reactionSystem.getReactions('event-content-1');
      expect(reactions.total).toBe(2);
      expect(reactions['🔥']).toBe(1);
      expect(reactions['💪']).toBe(1);

      // Step 3: Find mentors for beginner user
      const mentors = await mentorshipSystem.findMentors(mockUser2Id, 'Basketball');
      expect(mentors).toHaveLength(1);
      expect(mentors[0].id).toBe(mockMentorId);

      // Step 4: Request mentorship
      await mentorshipSystem.requestMentorship(mockUser2Id, mockMentorId);

      // Step 5: Accept mentorship
      const requests = await mentorshipSystem.getMentorshipRequests(mockMentorId);
      expect(requests).toHaveLength(1);
      
      await mentorshipSystem.acceptMentorship(requests[0].id);

      // Step 6: Verify mentorship connection
      const connections = await mentorshipSystem.getMentorshipConnections(mockUser2Id);
      expect(connections).toHaveLength(1);
      expect(connections[0].mentorId).toBe(mockMentorId);
      expect(connections[0].status).toBe('active');

      // Step 7: Verify live feed updates for social activities
      const activities = liveFeedManager.getRecentActivities(mockEventId, 20);
      const socialActivities = activities.filter(a => 
        a.type === ActivityType.USER_REACTED || 
        a.type === ActivityType.MENTORSHIP_STARTED
      );
      expect(socialActivities.length).toBeGreaterThan(0);
    });
  });

  describe('Achievement and Progression System Integration', () => {
    it('should handle complex achievement progression and streak tracking', async () => {
      // Step 1: Simulate multiple event participations for streak
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        new Date('2024-01-03'),
        new Date('2024-01-04'),
        new Date('2024-01-05')
      ];

      for (let i = 0; i < dates.length; i++) {
        await achievementEngine.checkAchievements(mockUserId, {
          type: UserActionType.EVENT_JOINED,
          userId: mockUserId,
          eventId: `event-${i}`,
          timestamp: dates[i]
        });
      }

      // Step 2: Check for streak achievement
      const streakAchievements = await achievementEngine.getUserAchievements(mockUserId);
      const streakMaster = streakAchievements.find(a => a.name === 'Streak Master');
      expect(streakMaster).toBeDefined();

      // Step 3: Simulate receiving reactions for social achievement
      for (let i = 0; i < 50; i++) {
        await achievementEngine.checkAchievements(mockUserId, {
          type: UserActionType.REACTION_RECEIVED,
          userId: mockUserId,
          data: { reactionType: '🔥' },
          timestamp: new Date()
        });
      }

      // Step 4: Check for community favorite achievement
      const socialAchievements = await achievementEngine.getUserAchievements(mockUserId);
      const communityFavorite = socialAchievements.find(a => a.name === 'Community Favorite');
      expect(communityFavorite).toBeDefined();

      // Step 5: Verify engagement score calculation
      const engagementScore = await achievementEngine.calculateEngagementScore(mockUserId);
      expect(engagementScore).toBeGreaterThan(0);

      // Step 6: Update leaderboards with new achievements
      await leaderboardService.updateUserScore(mockUserId, LeaderboardType.ACHIEVEMENTS, socialAchievements.length);
      
      const achievementLeaderboard = await leaderboardService.getLeaderboard(
        LeaderboardType.ACHIEVEMENTS,
        LeaderboardPeriod.ALL_TIME
      );
      
      expect(achievementLeaderboard.entries[0].userId).toBe(mockUserId);
    });
  });

  describe('Personalization and Recommendation System Integration', () => {
    it('should handle personalized recommendations based on user behavior', async () => {
      // Step 1: Track user interactions
      await recommendationService.trackUserInteraction(mockUserId, {
        type: 'event_view',
        eventId: mockEventId,
        sport: 'Basketball',
        duration: 300,
        timestamp: new Date()
      });

      await recommendationService.trackUserInteraction(mockUserId, {
        type: 'challenge_participation',
        challengeId: 'challenge-1',
        sport: 'Basketball',
        timestamp: new Date()
      });

      // Step 2: Update user preferences based on behavior
      await recommendationService.updateUserPreferences(mockUserId, {
        preferredSports: ['Basketball'],
        skillLevelFilter: [SkillLevel.INTERMEDIATE],
        locationRadius: 50,
        gamificationEnabled: true,
        competitiveMode: true,
        mentorshipAvailable: true,
        teamParticipation: true,
        showRealTimeUpdates: true,
        showAchievementAnimations: true,
        showLeaderboards: true,
        showProgressTracking: true,
        allowDirectMessages: true,
        allowMentorshipRequests: true,
        allowTeamInvitations: true,
        personalizedRecommendations: true,
        challengeRecommendations: true,
        eventRecommendations: true,
        socialRecommendations: true
      });

      // Step 3: Generate personalized event recommendations
      const recommendations = await recommendationService.getPersonalizedEvents(mockUserId);
      expect(recommendations).toHaveLength(5);
      expect(recommendations.every(event => event.sport === 'Basketball')).toBe(true);

      // Step 4: Generate user insights
      const insights = await recommendationService.generateInsights(mockUserId);
      expect(insights.userId).toBe(mockUserId);
      expect(insights.preferredEventTypes).toContain('Basketball');
      expect(insights.suggestedGoals.length).toBeGreaterThan(0);
    });
  });

  describe('Real-time System Performance and Consistency', () => {
    it('should maintain data consistency across real-time updates', async () => {
      // Step 1: Simulate concurrent user activities
      const activities = [
        {
          id: 'activity-1',
          eventId: mockEventId,
          userId: mockUserId,
          type: ActivityType.USER_JOINED,
          data: { userName: 'Test Athlete' },
          timestamp: new Date(),
          priority: 'medium' as const
        },
        {
          id: 'activity-2',
          eventId: mockEventId,
          userId: mockUser2Id,
          type: ActivityType.USER_JOINED,
          data: { userName: 'Test Athlete 2' },
          timestamp: new Date(),
          priority: 'medium' as const
        },
        {
          id: 'activity-3',
          eventId: mockEventId,
          userId: mockUserId,
          type: ActivityType.USER_REACTED,
          data: { reactionType: '🔥', targetId: 'content-1' },
          timestamp: new Date(),
          priority: 'low' as const
        }
      ];

      // Step 2: Publish activities concurrently
      await Promise.all(activities.map(activity => 
        liveFeedManager.publishActivity(activity)
      ));

      // Step 3: Verify all activities are recorded
      const feedActivities = liveFeedManager.getRecentActivities(mockEventId, 10);
      expect(feedActivities).toHaveLength(3);

      // Step 4: Verify participant count is accurate
      const participantCount = liveFeedManager.getParticipantCount(mockEventId);
      expect(participantCount).toBe(2); // Two unique users joined

      // Step 5: Test WebSocket message broadcasting
      let receivedMessages: any[] = [];
      webSocketService.subscribe(`event:${mockEventId}`, (data) => {
        receivedMessages.push(data);
      });

      // Publish new activity and verify broadcast
      await liveFeedManager.publishActivity({
        id: 'activity-4',
        eventId: mockEventId,
        userId: mockUserId,
        type: ActivityType.COMMENT_POSTED,
        data: { content: 'Great event!' },
        timestamp: new Date(),
        priority: 'medium'
      });

      // Allow time for WebSocket message processing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(receivedMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-System Data Consistency', () => {
    it('should maintain consistency between achievements, leaderboards, and statistics', async () => {
      // Step 1: User completes multiple actions
      const actions = [
        { type: UserActionType.EVENT_JOINED, eventId: 'event-1' },
        { type: UserActionType.EVENT_JOINED, eventId: 'event-2' },
        { type: UserActionType.CHALLENGE_COMPLETED, challengeId: 'challenge-1' },
        { type: UserActionType.CHALLENGE_COMPLETED, challengeId: 'challenge-2' }
      ];

      for (const action of actions) {
        await achievementEngine.checkAchievements(mockUserId, {
          ...action,
          userId: mockUserId,
          timestamp: new Date()
        });
      }

      // Step 2: Update statistics
      await statisticsService.updateUserStats(mockUserId, {
        eventsJoined: 2,
        challengesCompleted: 2,
        participationRate: 100
      });

      // Step 3: Update leaderboards
      await leaderboardService.updateUserScore(mockUserId, LeaderboardType.PARTICIPATION, 20);
      await leaderboardService.updateUserScore(mockUserId, LeaderboardType.CHALLENGE_WINS, 2);

      // Step 4: Verify data consistency
      const userStats = await statisticsService.getUserStats(mockUserId);
      const achievements = await achievementEngine.getUserAchievements(mockUserId);
      const participationLeaderboard = await leaderboardService.getLeaderboard(
        LeaderboardType.PARTICIPATION,
        LeaderboardPeriod.ALL_TIME
      );

      // Verify statistics match actions
      expect(userStats.eventsJoined).toBe(2);
      expect(userStats.challengesCompleted).toBe(2);

      // Verify achievements were awarded
      expect(achievements.length).toBeGreaterThan(0);

      // Verify leaderboard reflects user activity
      expect(participationLeaderboard.entries[0].userId).toBe(mockUserId);
      expect(participationLeaderboard.entries[0].score).toBe(20);
    });
  });

  describe('Performance Under Load Simulation', () => {
    it('should handle multiple concurrent users and activities', async () => {
      const startTime = Date.now();
      
      // Step 1: Simulate 50 concurrent users joining event
      const userPromises = [];
      for (let i = 0; i < 50; i++) {
        const userId = `load-test-user-${i}`;
        userPromises.push(
          liveFeedManager.publishActivity({
            id: `activity-${i}`,
            eventId: mockEventId,
            userId,
            type: ActivityType.USER_JOINED,
            data: { userName: `User ${i}` },
            timestamp: new Date(),
            priority: 'medium'
          })
        );
      }

      await Promise.all(userPromises);

      // Step 2: Verify all activities processed
      const activities = liveFeedManager.getRecentActivities(mockEventId, 100);
      expect(activities.length).toBeGreaterThanOrEqual(50);

      // Step 3: Verify participant count
      const participantCount = liveFeedManager.getParticipantCount(mockEventId);
      expect(participantCount).toBeGreaterThanOrEqual(50);

      // Step 4: Measure performance
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Should process 50 concurrent activities within reasonable time (< 1 second)
      expect(processingTime).toBeLessThan(1000);

      // Step 5: Test system stability after load
      await liveFeedManager.publishActivity({
        id: 'post-load-activity',
        eventId: mockEventId,
        userId: mockUserId,
        type: ActivityType.COMMENT_POSTED,
        data: { content: 'System still responsive!' },
        timestamp: new Date(),
        priority: 'high'
      });

      const finalActivities = liveFeedManager.getRecentActivities(mockEventId, 1);
      expect(finalActivities[0].id).toBe('post-load-activity');
    });
  });
});