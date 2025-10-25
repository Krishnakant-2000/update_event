import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { achievementEngine, UserActionType } from '../../services/achievementEngine';
import { liveFeedManager } from '../../services/liveFeedManager';
import { challengeSystem } from '../../services/challengeSystem';
import { leaderboardService } from '../../services/leaderboardService';
import { reactionSystem } from '../../services/reactionSystem';
import { mentorshipSystem } from '../../services/mentorshipSystem';
import { recommendationService } from '../../services/recommendationService';
import { statisticsService } from '../../services/statisticsService';
import { teamSystem } from '../../services/teamSystem';
import { interactiveEventService } from '../../services/interactiveEventService';
import { motivationalMessagingSystem } from '../../services/motivationalMessaging';
import { webSocketService } from '../../services/webSocketService';
import { ActivityType } from '../../types/realtime.types';
import { ChallengeType, LeaderboardType, LeaderboardPeriod } from '../../types/engagement.types';
import { SkillLevel } from '../../types/user.types';
import { PollType } from '../../types/social.types';

/**
 * Complete System Integration Tests
 * 
 * These tests simulate complete user journeys across all systems to verify
 * end-to-end functionality, data consistency, and system performance under
 * realistic usage scenarios covering all requirements.
 */

describe('Complete System Integration Tests', () => {

  const mockEventId = 'integration-event-123';
  const mockUsers = {
    newbie: 'newbie-user-001',
    intermediate: 'intermediate-user-002',
    advanced: 'advanced-user-003',
    mentor: 'mentor-user-004',
    captain: 'captain-user-005'
  };

  beforeEach(async () => {
    // Clear all storage
    localStorage.clear();
    
    // Initialize WebSocket service
    await webSocketService.connect(mockUsers.newbie);
    
    // Setup comprehensive test data
    await setupComprehensiveTestData();
  });

  afterEach(() => {
    webSocketService.disconnect();
    localStorage.clear();
  });

  async function setupComprehensiveTestData() {
    // Create diverse user profiles
    const users = [
      {
        id: mockUsers.newbie,
        name: 'Alex Newbie',
        email: 'alex@example.com',
        avatar: 'alex.jpg',
        primarySports: ['Basketball'],
        skillLevel: SkillLevel.BEGINNER,
        timezone: 'UTC',
        verified: false,
        joinedAt: new Date('2024-01-01')
      },
      {
        id: mockUsers.intermediate,
        name: 'Jordan Intermediate',
        email: 'jordan@example.com',
        avatar: 'jordan.jpg',
        primarySports: ['Basketball', 'Soccer'],
        skillLevel: SkillLevel.INTERMEDIATE,
        timezone: 'UTC',
        verified: false,
        joinedAt: new Date('2023-06-01')
      },
      {
        id: mockUsers.advanced,
        name: 'Sam Advanced',
        email: 'sam@example.com',
        avatar: 'sam.jpg',
        primarySports: ['Basketball'],
        skillLevel: SkillLevel.ADVANCED,
        timezone: 'UTC',
        verified: true,
        joinedAt: new Date('2022-01-01')
      },
      {
        id: mockUsers.mentor,
        name: 'Coach Mentor',
        email: 'coach@example.com',
        avatar: 'coach.jpg',
        primarySports: ['Basketball', 'Soccer', 'Tennis'],
        skillLevel: SkillLevel.PROFESSIONAL,
        timezone: 'UTC',
        verified: true,
        joinedAt: new Date('2020-01-01')
      },
      {
        id: mockUsers.captain,
        name: 'Team Captain',
        email: 'captain@example.com',
        avatar: 'captain.jpg',
        primarySports: ['Basketball'],
        skillLevel: SkillLevel.ADVANCED,
        timezone: 'UTC',
        verified: true,
        joinedAt: new Date('2021-01-01')
      }
    ];

    localStorage.setItem('user_profiles', JSON.stringify(users));
    
    // Initialize live feed
    liveFeedManager.initializeFeed(mockEventId);

    // Setup initial user preferences
    for (const userId of Object.values(mockUsers)) {
      await recommendationService.updateUserPreferences(userId, {
        preferredSports: ['Basketball'],
        skillLevelFilter: [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED],
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
    }
  }

  describe('Complete Newbie User Journey', () => {
    it('should handle complete journey from first login to team participation', async () => {
      const userId = mockUsers.newbie;
      let userAchievements: any[] = [];
      let userStats: any = {};

      // Step 1: First-time user joins event
      await liveFeedManager.publishActivity({
        id: 'newbie-join-1',
        eventId: mockEventId,
        userId,
        type: ActivityType.USER_JOINED,
        data: { userName: 'Alex Newbie', userAvatar: 'alex.jpg' },
        timestamp: new Date(),
        priority: 'medium'
      });

      // Check first achievement
      userAchievements = await achievementEngine.checkAchievements(userId, {
        type: UserActionType.EVENT_JOINED,
        userId,
        eventId: mockEventId,
        timestamp: new Date()
      });

      expect(userAchievements.some(a => a.name === 'First Step')).toBe(true);

      // Step 2: User explores and reacts to content
      await reactionSystem.addReaction('event-content-1', userId, '🔥');
      await reactionSystem.addReaction('event-content-2', userId, '💪');

      // Step 3: User discovers mentorship opportunities
      const mentors = await mentorshipSystem.findMentors(userId, 'Basketball');
      expect(mentors.length).toBeGreaterThan(0);
      
      const mentor = mentors.find(m => m.id === mockUsers.mentor);
      expect(mentor).toBeDefined();

      // Request mentorship
      await mentorshipSystem.requestMentorship(userId, mockUsers.mentor);
      
      // Mentor accepts
      const requests = await mentorshipSystem.getMentorshipRequests(mockUsers.mentor);
      await mentorshipSystem.acceptMentorship(requests[0].id);

      // Step 4: User participates in beginner-friendly challenge
      const challenges = await challengeSystem.generateChallenges(mockEventId, 'Basketball');
      const beginnerChallenge = challenges.find(c => c.type === ChallengeType.SKILL_SHOWCASE);
      
      await challengeSystem.submitChallengeEntry(beginnerChallenge!.id, userId, {
        content: 'My first basketball skill attempt!',
        mediaUrl: 'newbie-skill.mp4'
      });

      // Step 5: Mentor provides encouragement
      await motivationalMessagingSystem.sendMotivationalMessage(mockUsers.mentor, userId, {
        templateId: 'encouragement_first_attempt',
        personalizedData: {
          userName: 'Alex',
          achievement: 'first challenge participation'
        }
      });

      // Step 6: User receives reactions and feedback
      await reactionSystem.addReaction(`challenge-${beginnerChallenge!.id}-${userId}`, mockUsers.mentor, '👏');
      await reactionSystem.addReaction(`challenge-${beginnerChallenge!.id}-${userId}`, mockUsers.intermediate, '💪');

      // Check social achievements
      for (let i = 0; i < 5; i++) {
        await achievementEngine.checkAchievements(userId, {
          type: UserActionType.REACTION_RECEIVED,
          userId,
          data: { reactionType: '👏' },
          timestamp: new Date()
        });
      }

      // Step 7: User joins a team
      const team = await teamSystem.createTeam({
        name: 'Newbie Friendly Team',
        description: 'Team for beginners to learn together',
        sport: 'Basketball',
        captainId: mockUsers.captain,
        maxMembers: 5,
        isPublic: true
      });

      await teamSystem.requestToJoinTeam(team.id, userId);
      const joinRequests = await teamSystem.getTeamJoinRequests(team.id);
      await teamSystem.acceptJoinRequest(joinRequests[0].id);

      // Step 8: User participates in team activities
      const teamPoll = await interactiveEventService.createTeamPoll({
        eventId: mockEventId,
        teamId: team.id,
        question: 'What skill should we practice together?',
        options: ['Shooting', 'Dribbling', 'Passing'],
        type: PollType.SINGLE_CHOICE,
        duration: 300,
        createdBy: mockUsers.captain
      });

      await interactiveEventService.submitPollVote(teamPoll.id, userId, ['Shooting']);

      // Step 9: Update and verify user statistics
      await statisticsService.updateUserStats(userId, {
        eventsJoined: 1,
        challengesCompleted: 1,
        reactionsReceived: 2,
        teamMemberships: 1,
        mentorshipsActive: 1,
        participationRate: 100
      });

      userStats = await statisticsService.getUserStats(userId);
      expect(userStats.eventsJoined).toBe(1);
      expect(userStats.challengesCompleted).toBe(1);
      expect(userStats.teamMemberships).toBe(1);

      // Step 10: Check personalized recommendations
      const recommendations = await recommendationService.getPersonalizedEvents(userId);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.every(event => event.sport === 'Basketball')).toBe(true);

      // Step 11: Verify complete user profile
      const finalAchievements = await achievementEngine.getUserAchievements(userId);
      expect(finalAchievements.length).toBeGreaterThan(1);

      const engagementScore = await achievementEngine.calculateEngagementScore(userId);
      expect(engagementScore).toBeGreaterThan(0);

      // Step 12: Verify live feed shows complete journey
      const activities = liveFeedManager.getRecentActivities(mockEventId, 50);
      const userActivities = activities.filter(a => a.userId === userId);
      expect(userActivities.length).toBeGreaterThan(3);
    });
  });

  describe('Advanced User Competition and Leadership Journey', () => {
    it('should handle advanced user becoming team leader and mentor', async () => {
      const userId = mockUsers.advanced;

      // Step 1: Advanced user joins with existing reputation
      await statisticsService.updateUserStats(userId, {
        eventsJoined: 25,
        challengesCompleted: 15,
        challengesWon: 8,
        reactionsReceived: 200,
        participationRate: 95
      });

      // Step 2: User creates and leads a competitive team
      const competitiveTeam = await teamSystem.createTeam({
        name: 'Elite Basketball Squad',
        description: 'High-performance team for advanced players',
        sport: 'Basketball',
        captainId: userId,
        maxMembers: 4,
        isPublic: true
      });

      // Add skilled members
      await teamSystem.addMemberToTeam(competitiveTeam.id, mockUsers.intermediate);
      await teamSystem.addMemberToTeam(competitiveTeam.id, mockUsers.captain);

      // Step 3: Team participates in high-level challenges
      const challenges = await challengeSystem.generateChallenges(mockEventId, 'Basketball');
      const teamChallenge = challenges.find(c => c.type === ChallengeType.TEAM_COLLABORATION);

      await challengeSystem.submitTeamChallengeEntry(teamChallenge!.id, competitiveTeam.id, {
        content: 'Elite team coordination showcase',
        mediaUrl: 'elite-team-performance.mp4',
        submittedBy: userId
      });

      // Step 4: User becomes mentor for newcomers
      await mentorshipSystem.becomeMentor(userId, {
        sports: ['Basketball'],
        skillLevels: [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE],
        availability: 'weekends',
        mentorshipStyle: 'hands-on'
      });

      // Accept mentorship request from newbie
      await mentorshipSystem.requestMentorship(mockUsers.newbie, userId);
      const requests = await mentorshipSystem.getMentorshipRequests(userId);
      await mentorshipSystem.acceptMentorship(requests[0].id);

      // Step 5: User creates educational content
      const educationalPoll = await interactiveEventService.createPoll({
        eventId: mockEventId,
        question: 'What basketball fundamental is most important for beginners?',
        options: ['Shooting Form', 'Ball Handling', 'Footwork', 'Court Vision'],
        type: PollType.EDUCATIONAL,
        duration: 600,
        createdBy: userId
      });

      // Step 6: User hosts Q&A session
      const qaSession = await interactiveEventService.createQASession({
        eventId: mockEventId,
        title: 'Advanced Basketball Techniques',
        description: 'Learn from experienced players',
        moderatorId: userId,
        duration: 900
      });

      // Answer questions from community
      const questions = await interactiveEventService.getQAQuestions(qaSession.id);
      if (questions.length > 0) {
        await interactiveEventService.answerQuestion(questions[0].id, {
          answer: 'Focus on fundamentals first, then build complexity gradually.',
          answeredBy: userId
        });
      }

      // Step 7: Check leadership achievements
      const leadershipAchievements = await achievementEngine.checkAchievements(userId, {
        type: UserActionType.MENTORSHIP_COMPLETED,
        userId,
        data: { menteeId: mockUsers.newbie },
        timestamp: new Date()
      });

      // Step 8: Verify leaderboard positions
      await leaderboardService.updateUserScore(userId, LeaderboardType.ENGAGEMENT_SCORE, 500);
      await leaderboardService.updateUserScore(userId, LeaderboardType.SOCIAL_IMPACT, 300);

      const engagementLeaderboard = await leaderboardService.getLeaderboard(
        LeaderboardType.ENGAGEMENT_SCORE,
        LeaderboardPeriod.ALL_TIME
      );

      const socialLeaderboard = await leaderboardService.getLeaderboard(
        LeaderboardType.SOCIAL_IMPACT,
        LeaderboardPeriod.ALL_TIME
      );

      expect(engagementLeaderboard.entries[0].userId).toBe(userId);
      expect(socialLeaderboard.entries[0].userId).toBe(userId);

      // Step 9: Verify community impact
      const userInsights = await recommendationService.generateInsights(userId);
      expect(userInsights.influenceScore).toBeGreaterThan(50);
      expect(userInsights.collaborationStyle).toBe('leader');

      // Step 10: Check team performance
      const teamStats = await teamSystem.getTeamStats(competitiveTeam.id);
      expect(teamStats.challengesParticipated).toBeGreaterThan(0);
      expect(teamStats.averageEngagement).toBeGreaterThan(70);
    });
  });

  describe('Multi-User Event Simulation', () => {
    it('should handle realistic multi-user event with all features active', async () => {
      const eventStartTime = Date.now();

      // Step 1: All users join the event
      for (const [role, userId] of Object.entries(mockUsers)) {
        await liveFeedManager.publishActivity({
          id: `join-${userId}`,
          eventId: mockEventId,
          userId,
          type: ActivityType.USER_JOINED,
          data: { userName: role, userAvatar: `${role}.jpg` },
          timestamp: new Date(),
          priority: 'medium'
        });
      }

      // Step 2: Create multiple teams
      const teams = [];
      teams.push(await teamSystem.createTeam({
        name: 'Team Alpha',
        description: 'Competitive team',
        sport: 'Basketball',
        captainId: mockUsers.captain,
        maxMembers: 3,
        isPublic: true
      }));

      teams.push(await teamSystem.createTeam({
        name: 'Team Beta',
        description: 'Learning team',
        sport: 'Basketball',
        captainId: mockUsers.advanced,
        maxMembers: 3,
        isPublic: true
      }));

      // Distribute users across teams
      await teamSystem.addMemberToTeam(teams[0].id, mockUsers.intermediate);
      await teamSystem.addMemberToTeam(teams[0].id, mockUsers.mentor);
      await teamSystem.addMemberToTeam(teams[1].id, mockUsers.newbie);

      // Step 3: Launch multiple interactive features simultaneously
      const poll = await interactiveEventService.createPoll({
        eventId: mockEventId,
        question: 'Which team will win the upcoming challenge?',
        options: ['Team Alpha', 'Team Beta', 'Tie'],
        type: PollType.PREDICTION,
        duration: 300,
        createdBy: mockUsers.mentor
      });

      const qaSession = await interactiveEventService.createQASession({
        eventId: mockEventId,
        title: 'Live Basketball Q&A',
        description: 'Ask anything about basketball',
        moderatorId: mockUsers.mentor,
        duration: 600
      });

      // Step 4: Generate and launch challenges
      const challenges = await challengeSystem.generateChallenges(mockEventId, 'Basketball');
      
      // Individual challenges
      for (const userId of Object.values(mockUsers)) {
        const skillChallenge = challenges.find(c => c.type === ChallengeType.SKILL_SHOWCASE);
        if (skillChallenge) {
          await challengeSystem.submitChallengeEntry(skillChallenge.id, userId, {
            content: `Skill demonstration by ${userId}`,
            mediaUrl: `skill-${userId}.mp4`
          });
        }
      }

      // Team challenges
      const teamChallenge = challenges.find(c => c.type === ChallengeType.TEAM_COLLABORATION);
      if (teamChallenge) {
        for (const team of teams) {
          await challengeSystem.submitTeamChallengeEntry(teamChallenge.id, team.id, {
            content: `Team ${team.name} collaboration`,
            mediaUrl: `team-${team.id}.mp4`,
            submittedBy: team.captainId
          });
        }
      }

      // Step 5: Simulate active participation
      // Users vote in poll
      await interactiveEventService.submitPollVote(poll.id, mockUsers.newbie, ['Team Alpha']);
      await interactiveEventService.submitPollVote(poll.id, mockUsers.intermediate, ['Team Beta']);
      await interactiveEventService.submitPollVote(poll.id, mockUsers.advanced, ['Team Alpha']);

      // Users ask questions
      await interactiveEventService.submitQuestion(qaSession.id, {
        userId: mockUsers.newbie,
        question: 'How do I improve my shooting accuracy?',
        category: 'technique'
      });

      await interactiveEventService.submitQuestion(qaSession.id, {
        userId: mockUsers.intermediate,
        question: 'What are the best team communication strategies?',
        category: 'teamwork'
      });

      // Step 6: Social interactions
      const reactionTargets = [
        'event-highlight-1',
        'challenge-submission-1',
        'team-performance-1'
      ];

      for (const target of reactionTargets) {
        for (const userId of Object.values(mockUsers)) {
          const reactions = ['🔥', '💪', '👏', '⚡'];
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
          await reactionSystem.addReaction(target, userId, randomReaction);
        }
      }

      // Step 7: Mentorship connections
      await mentorshipSystem.requestMentorship(mockUsers.newbie, mockUsers.mentor);
      await mentorshipSystem.requestMentorship(mockUsers.intermediate, mockUsers.advanced);

      const mentorRequests = await mentorshipSystem.getMentorshipRequests(mockUsers.mentor);
      const advancedRequests = await mentorshipSystem.getMentorshipRequests(mockUsers.advanced);

      if (mentorRequests.length > 0) {
        await mentorshipSystem.acceptMentorship(mentorRequests[0].id);
      }
      if (advancedRequests.length > 0) {
        await mentorshipSystem.acceptMentorship(advancedRequests[0].id);
      }

      // Step 8: Complete challenges and update leaderboards
      const challengeResults = await challengeSystem.endChallenge(challenges[0].id);
      if (teamChallenge) {
        const teamResults = await challengeSystem.endTeamChallenge(teamChallenge.id);
      }

      // Update all leaderboards
      for (const userId of Object.values(mockUsers)) {
        await leaderboardService.updateUserScore(userId, LeaderboardType.PARTICIPATION, 50);
        await leaderboardService.updateUserScore(userId, LeaderboardType.ENGAGEMENT_SCORE, 100);
      }

      // Step 9: Verify system consistency
      const activities = liveFeedManager.getRecentActivities(mockEventId, 100);
      expect(activities.length).toBeGreaterThan(20);

      const participantCount = liveFeedManager.getParticipantCount(mockEventId);
      expect(participantCount).toBe(Object.keys(mockUsers).length);

      // Check all users have updated statistics
      for (const userId of Object.values(mockUsers)) {
        const stats = await statisticsService.getUserStats(userId);
        expect(stats.eventsJoined).toBeGreaterThan(0);
        
        const achievements = await achievementEngine.getUserAchievements(userId);
        expect(achievements.length).toBeGreaterThan(0);
      }

      // Step 10: Verify leaderboard accuracy
      const participationLeaderboard = await leaderboardService.getLeaderboard(
        LeaderboardType.PARTICIPATION,
        LeaderboardPeriod.ALL_TIME
      );

      expect(participationLeaderboard.entries.length).toBe(Object.keys(mockUsers).length);
      expect(participationLeaderboard.entries.every(entry => entry.score > 0)).toBe(true);

      // Step 11: Check team leaderboards
      const teamLeaderboard = await leaderboardService.getTeamLeaderboard(
        LeaderboardType.TEAM_PERFORMANCE,
        LeaderboardPeriod.ALL_TIME
      );

      expect(teamLeaderboard.entries.length).toBe(teams.length);

      // Step 12: Verify performance metrics
      const eventEndTime = Date.now();
      const totalProcessingTime = eventEndTime - eventStartTime;
      
      // Should handle complex multi-user event within reasonable time (< 5 seconds)
      expect(totalProcessingTime).toBeLessThan(5000);

      // Step 13: Generate insights for all users
      for (const userId of Object.values(mockUsers)) {
        const insights = await recommendationService.generateInsights(userId);
        expect(insights.userId).toBe(userId);
        expect(insights.engagementPatterns.length).toBeGreaterThan(0);
      }

      // Step 14: Verify cross-system data consistency
      const pollResults = await interactiveEventService.getPollResults(poll.id);
      expect(pollResults.totalVotes).toBe(3);

      const qaQuestions = await interactiveEventService.getQAQuestions(qaSession.id);
      expect(qaQuestions.length).toBe(2);

      // Final verification: All systems operational and consistent
      expect(true).toBe(true); // Test completed successfully
    });
  });

  describe('System Recovery and Error Handling', () => {
    it('should handle system errors gracefully and maintain data consistency', async () => {
      // Step 1: Simulate WebSocket disconnection
      webSocketService.disconnect();
      
      // System should continue functioning without real-time updates
      await liveFeedManager.publishActivity({
        id: 'offline-activity',
        eventId: mockEventId,
        userId: mockUsers.newbie,
        type: ActivityType.USER_JOINED,
        data: { userName: 'Offline User' },
        timestamp: new Date(),
        priority: 'medium'
      });

      const activities = liveFeedManager.getRecentActivities(mockEventId, 10);
      expect(activities.some(a => a.id === 'offline-activity')).toBe(true);

      // Step 2: Reconnect and verify sync
      await webSocketService.connect(mockUsers.newbie);
      
      // Step 3: Simulate achievement calculation error
      try {
        await achievementEngine.checkAchievements('invalid-user', {
          type: UserActionType.EVENT_JOINED,
          userId: 'invalid-user',
          eventId: mockEventId,
          timestamp: new Date()
        });
      } catch (error) {
        expect(error).toBeDefined();
      }

      // System should continue working for valid users
      const validAchievements = await achievementEngine.checkAchievements(mockUsers.newbie, {
        type: UserActionType.EVENT_JOINED,
        userId: mockUsers.newbie,
        eventId: mockEventId,
        timestamp: new Date()
      });

      expect(Array.isArray(validAchievements)).toBe(true);

      // Step 4: Test leaderboard consistency after errors
      await leaderboardService.updateUserScore(mockUsers.newbie, LeaderboardType.PARTICIPATION, 10);
      
      const leaderboard = await leaderboardService.getLeaderboard(
        LeaderboardType.PARTICIPATION,
        LeaderboardPeriod.ALL_TIME
      );

      expect(leaderboard.entries.length).toBeGreaterThan(0);

      // Step 5: Verify system stability
      const finalActivities = liveFeedManager.getRecentActivities(mockEventId, 20);
      expect(finalActivities.length).toBeGreaterThan(0);
    });
  });
});