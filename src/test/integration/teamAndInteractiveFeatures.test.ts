import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { teamSystem } from '../../services/teamSystem';
import { interactiveEventService } from '../../services/interactiveEventService';
import { challengeSystem } from '../../services/challengeSystem';
import { leaderboardService } from '../../services/leaderboardService';
import { liveFeedManager } from '../../services/liveFeedManager';
import { achievementEngine, UserActionType } from '../../services/achievementEngine';
import { webSocketService } from '../../services/webSocketService';
import { TeamRole, LeaderboardType, LeaderboardPeriod } from '../../types/engagement.types';
import { ActivityType } from '../../types/realtime.types';
import { PollType, QAStatus } from '../../types/social.types';

/**
 * Integration Tests for Team-based Features and Interactive Event Functionality
 * 
 * Tests team formation, collaboration, interactive polls, Q&A sessions,
 * and cross-system interactions for team-based challenges and competitions.
 */

describe('Team and Interactive Features - Integration Tests', () => {

  const mockEventId = 'team-event-123';
  const mockCaptainId = 'captain-user-456';
  const mockMember1Id = 'member1-user-789';
  const mockMember2Id = 'member2-user-101';
  const mockMember3Id = 'member3-user-202';

  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear();
    
    // Initialize WebSocket service
    await webSocketService.connect(mockCaptainId);
    
    // Setup test data
    await setupTestData();
  });

  afterEach(() => {
    webSocketService.disconnect();
    localStorage.clear();
  });

  async function setupTestData() {
    // Create test user profiles
    const users = [
      {
        id: mockCaptainId,
        name: 'Team Captain',
        email: 'captain@example.com',
        avatar: 'captain.jpg',
        primarySports: ['Basketball'],
        skillLevel: 'advanced',
        timezone: 'UTC',
        verified: true
      },
      {
        id: mockMember1Id,
        name: 'Team Member 1',
        email: 'member1@example.com',
        avatar: 'member1.jpg',
        primarySports: ['Basketball'],
        skillLevel: 'intermediate',
        timezone: 'UTC',
        verified: false
      },
      {
        id: mockMember2Id,
        name: 'Team Member 2',
        email: 'member2@example.com',
        avatar: 'member2.jpg',
        primarySports: ['Basketball'],
        skillLevel: 'intermediate',
        timezone: 'UTC',
        verified: false
      },
      {
        id: mockMember3Id,
        name: 'Team Member 3',
        email: 'member3@example.com',
        avatar: 'member3.jpg',
        primarySports: ['Basketball'],
        skillLevel: 'beginner',
        timezone: 'UTC',
        verified: false
      }
    ];

    localStorage.setItem('user_profiles', JSON.stringify(users));
    
    // Initialize live feed for test event
    liveFeedManager.initializeFeed(mockEventId);
  }

  describe('Team Formation and Management Workflow', () => {
    it('should handle complete team formation and management workflow', async () => {
      // Step 1: Captain creates a team
      const team = await teamSystem.createTeam({
        name: 'Basketball Champions',
        description: 'Elite basketball team for competitions',
        sport: 'Basketball',
        captainId: mockCaptainId,
        maxMembers: 5,
        isPublic: true
      });

      expect(team.id).toBeDefined();
      expect(team.name).toBe('Basketball Champions');
      expect(team.captainId).toBe(mockCaptainId);
      expect(team.memberIds).toContain(mockCaptainId);

      // Step 2: Members request to join team
      await teamSystem.requestToJoinTeam(team.id, mockMember1Id);
      await teamSystem.requestToJoinTeam(team.id, mockMember2Id);
      await teamSystem.requestToJoinTeam(team.id, mockMember3Id);

      // Step 3: Captain reviews and accepts members
      const joinRequests = await teamSystem.getTeamJoinRequests(team.id);
      expect(joinRequests).toHaveLength(3);

      // Accept first two members
      await teamSystem.acceptJoinRequest(joinRequests[0].id);
      await teamSystem.acceptJoinRequest(joinRequests[1].id);

      // Step 4: Verify team composition
      const updatedTeam = await teamSystem.getTeam(team.id);
      expect(updatedTeam.memberIds).toHaveLength(3); // Captain + 2 members
      expect(updatedTeam.memberIds).toContain(mockMember1Id);
      expect(updatedTeam.memberIds).toContain(mockMember2Id);

      // Step 5: Verify live feed updates for team formation
      const activities = liveFeedManager.getRecentActivities(mockEventId, 10);
      const teamActivities = activities.filter(a => a.type === ActivityType.TEAM_FORMED);
      expect(teamActivities.length).toBeGreaterThanOrEqual(1);

      // Step 6: Check team achievements
      const teamAchievements = await achievementEngine.checkAchievements(mockCaptainId, {
        type: UserActionType.TEAM_WIN,
        userId: mockCaptainId,
        data: { teamId: team.id },
        timestamp: new Date()
      });

      expect(teamAchievements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Team-based Challenge Competition Workflow', () => {
    it('should handle team-based challenge competition from start to finish', async () => {
      // Step 1: Create two competing teams
      const team1 = await teamSystem.createTeam({
        name: 'Team Alpha',
        description: 'First team',
        sport: 'Basketball',
        captainId: mockCaptainId,
        maxMembers: 3,
        isPublic: true
      });

      const team2 = await teamSystem.createTeam({
        name: 'Team Beta',
        description: 'Second team',
        sport: 'Basketball',
        captainId: mockMember1Id,
        maxMembers: 3,
        isPublic: true
      });

      // Add members to teams
      await teamSystem.addMemberToTeam(team1.id, mockMember2Id);
      await teamSystem.addMemberToTeam(team2.id, mockMember3Id);

      // Step 2: Generate team-based challenges
      const challenges = await challengeSystem.generateChallenges(mockEventId, 'Basketball');
      const teamChallenge = challenges.find(c => c.type === 'team_collaboration');
      expect(teamChallenge).toBeDefined();

      // Step 3: Teams participate in challenge
      await challengeSystem.submitTeamChallengeEntry(teamChallenge!.id, team1.id, {
        content: 'Amazing team coordination!',
        mediaUrl: 'team1-video.mp4',
        submittedBy: mockCaptainId
      });

      await challengeSystem.submitTeamChallengeEntry(teamChallenge!.id, team2.id, {
        content: 'Great teamwork display!',
        mediaUrl: 'team2-video.mp4',
        submittedBy: mockMember1Id
      });

      // Step 4: Check team challenge leaderboard
      const leaderboard = await challengeSystem.getTeamChallengeLeaderboard(teamChallenge!.id);
      expect(leaderboard).toHaveLength(2);
      expect(leaderboard.some(entry => entry.teamId === team1.id)).toBe(true);
      expect(leaderboard.some(entry => entry.teamId === team2.id)).toBe(true);

      // Step 5: Complete challenge and determine winner
      const results = await challengeSystem.endTeamChallenge(teamChallenge!.id);
      expect(results).toHaveLength(1); // One winning team

      // Step 6: Update team statistics
      const winningTeamId = results[0].teamId;
      await teamSystem.updateTeamStats(winningTeamId, {
        challengesWon: 1,
        totalScore: 100
      });

      // Step 7: Award team achievements
      const winningTeam = await teamSystem.getTeam(winningTeamId);
      for (const memberId of winningTeam.memberIds) {
        await achievementEngine.checkAchievements(memberId, {
          type: UserActionType.TEAM_WIN,
          userId: memberId,
          data: { teamId: winningTeamId, challengeId: teamChallenge!.id },
          timestamp: new Date()
        });
      }

      // Step 8: Update team leaderboards
      await leaderboardService.updateTeamScore(winningTeamId, LeaderboardType.TEAM_PERFORMANCE, 100);
      
      const teamLeaderboard = await leaderboardService.getTeamLeaderboard(
        LeaderboardType.TEAM_PERFORMANCE,
        LeaderboardPeriod.ALL_TIME
      );
      
      expect(teamLeaderboard.entries[0].teamId).toBe(winningTeamId);

      // Step 9: Verify live feed updates
      const activities = liveFeedManager.getRecentActivities(mockEventId, 20);
      const challengeActivities = activities.filter(a => 
        a.type === ActivityType.CHALLENGE_COMPLETED ||
        a.type === ActivityType.TEAM_ACHIEVEMENT_EARNED
      );
      expect(challengeActivities.length).toBeGreaterThan(0);
    });
  });

  describe('Interactive Event Features Workflow', () => {
    it('should handle complete interactive event features workflow', async () => {
      // Step 1: Create interactive poll during event
      const poll = await interactiveEventService.createPoll({
        eventId: mockEventId,
        question: 'Which basketball technique should we focus on next?',
        options: ['Shooting', 'Dribbling', 'Defense', 'Teamwork'],
        type: PollType.MULTIPLE_CHOICE,
        duration: 300, // 5 minutes
        createdBy: mockCaptainId
      });

      expect(poll.id).toBeDefined();
      expect(poll.options).toHaveLength(4);
      expect(poll.isActive).toBe(true);

      // Step 2: Users participate in poll
      await interactiveEventService.submitPollVote(poll.id, mockMember1Id, ['Shooting']);
      await interactiveEventService.submitPollVote(poll.id, mockMember2Id, ['Dribbling']);
      await interactiveEventService.submitPollVote(poll.id, mockMember3Id, ['Shooting']);

      // Step 3: Check poll results
      const pollResults = await interactiveEventService.getPollResults(poll.id);
      expect(pollResults.totalVotes).toBe(3);
      expect(pollResults.results['Shooting']).toBe(2);
      expect(pollResults.results['Dribbling']).toBe(1);

      // Step 4: Create Q&A session
      const qaSession = await interactiveEventService.createQASession({
        eventId: mockEventId,
        title: 'Basketball Training Q&A',
        description: 'Ask questions about basketball training techniques',
        moderatorId: mockCaptainId,
        duration: 600 // 10 minutes
      });

      expect(qaSession.id).toBeDefined();
      expect(qaSession.isActive).toBe(true);

      // Step 5: Users submit questions
      await interactiveEventService.submitQuestion(qaSession.id, {
        userId: mockMember1Id,
        question: 'How can I improve my free throw accuracy?',
        category: 'technique'
      });

      await interactiveEventService.submitQuestion(qaSession.id, {
        userId: mockMember2Id,
        question: 'What are the best exercises for basketball conditioning?',
        category: 'fitness'
      });

      // Step 6: Users vote on questions
      const questions = await interactiveEventService.getQAQuestions(qaSession.id);
      expect(questions).toHaveLength(2);

      await interactiveEventService.voteOnQuestion(questions[0].id, mockMember3Id);
      await interactiveEventService.voteOnQuestion(questions[0].id, mockCaptainId);

      // Step 7: Moderator answers questions
      await interactiveEventService.answerQuestion(questions[0].id, {
        answer: 'Focus on consistent form and practice daily. Keep your elbow aligned and follow through.',
        answeredBy: mockCaptainId
      });

      // Step 8: Verify Q&A results
      const updatedQuestions = await interactiveEventService.getQAQuestions(qaSession.id);
      const answeredQuestion = updatedQuestions.find(q => q.id === questions[0].id);
      expect(answeredQuestion?.status).toBe(QAStatus.ANSWERED);
      expect(answeredQuestion?.votes).toBe(2);

      // Step 9: Create live discussion
      const discussion = await interactiveEventService.createLiveDiscussion({
        eventId: mockEventId,
        topic: 'Basketball Strategy Discussion',
        moderatorId: mockCaptainId,
        maxParticipants: 10
      });

      // Step 10: Users join discussion
      await interactiveEventService.joinDiscussion(discussion.id, mockMember1Id);
      await interactiveEventService.joinDiscussion(discussion.id, mockMember2Id);

      // Step 11: Post messages in discussion
      await interactiveEventService.postDiscussionMessage(discussion.id, {
        userId: mockMember1Id,
        message: 'I think we should focus more on defensive strategies',
        timestamp: new Date()
      });

      // Step 12: Verify discussion activity
      const messages = await interactiveEventService.getDiscussionMessages(discussion.id);
      expect(messages).toHaveLength(1);
      expect(messages[0].userId).toBe(mockMember1Id);

      // Step 13: Award engagement points for interactive participation
      for (const userId of [mockMember1Id, mockMember2Id, mockMember3Id]) {
        await achievementEngine.checkAchievements(userId, {
          type: UserActionType.COMMENT_POSTED,
          userId,
          eventId: mockEventId,
          data: { interactiveFeature: true },
          timestamp: new Date()
        });
      }

      // Step 14: Verify live feed updates for interactive features
      const activities = liveFeedManager.getRecentActivities(mockEventId, 30);
      const interactiveActivities = activities.filter(a => 
        a.type === ActivityType.POLL_CREATED ||
        a.type === ActivityType.QUESTION_SUBMITTED ||
        a.type === ActivityType.DISCUSSION_MESSAGE
      );
      expect(interactiveActivities.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-System Team and Interactive Integration', () => {
    it('should maintain consistency between team activities and interactive features', async () => {
      // Step 1: Create team and interactive session
      const team = await teamSystem.createTeam({
        name: 'Interactive Team',
        description: 'Team for interactive features testing',
        sport: 'Basketball',
        captainId: mockCaptainId,
        maxMembers: 4,
        isPublic: true
      });

      // Add all members to team
      await teamSystem.addMemberToTeam(team.id, mockMember1Id);
      await teamSystem.addMemberToTeam(team.id, mockMember2Id);
      await teamSystem.addMemberToTeam(team.id, mockMember3Id);

      // Step 2: Create team-specific poll
      const teamPoll = await interactiveEventService.createTeamPoll({
        eventId: mockEventId,
        teamId: team.id,
        question: 'What should be our team strategy?',
        options: ['Aggressive Offense', 'Strong Defense', 'Balanced Approach'],
        type: PollType.SINGLE_CHOICE,
        duration: 300,
        createdBy: mockCaptainId
      });

      // Step 3: All team members vote
      const teamMembers = await teamSystem.getTeamMembers(team.id);
      for (const member of teamMembers) {
        if (member.userId !== mockCaptainId) {
          await interactiveEventService.submitPollVote(teamPoll.id, member.userId, ['Balanced Approach']);
        }
      }

      // Step 4: Check team poll consensus
      const teamPollResults = await interactiveEventService.getPollResults(teamPoll.id);
      expect(teamPollResults.results['Balanced Approach']).toBe(3);

      // Step 5: Update team strategy based on poll
      await teamSystem.updateTeamStrategy(team.id, 'Balanced Approach');

      // Step 6: Create team challenge based on strategy
      const strategyChallenges = await challengeSystem.generateTeamChallenges(mockEventId, team.id, 'Balanced Approach');
      expect(strategyChallenges).toHaveLength(1);

      // Step 7: Team participates in strategy-based challenge
      await challengeSystem.submitTeamChallengeEntry(strategyChallenges[0].id, team.id, {
        content: 'Demonstrating balanced basketball approach',
        mediaUrl: 'balanced-strategy.mp4',
        submittedBy: mockCaptainId
      });

      // Step 8: Verify team statistics update
      const updatedTeam = await teamSystem.getTeam(team.id);
      expect(updatedTeam.stats.challengesParticipated).toBe(1);

      // Step 9: Check individual member achievements
      for (const member of teamMembers) {
        const achievements = await achievementEngine.getUserAchievements(member.userId);
        const teamAchievements = achievements.filter(a => a.category === 'team_collaboration');
        expect(teamAchievements.length).toBeGreaterThanOrEqual(0);
      }

      // Step 10: Verify cross-system data consistency
      const teamLeaderboard = await leaderboardService.getTeamLeaderboard(
        LeaderboardType.TEAM_PERFORMANCE,
        LeaderboardPeriod.WEEKLY
      );
      
      const teamEntry = teamLeaderboard.entries.find(entry => entry.teamId === team.id);
      expect(teamEntry).toBeDefined();
      expect(teamEntry?.score).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability with Teams and Interactive Features', () => {
    it('should handle multiple teams and concurrent interactive sessions', async () => {
      const startTime = Date.now();
      
      // Step 1: Create multiple teams concurrently
      const teamPromises = [];
      for (let i = 0; i < 10; i++) {
        teamPromises.push(
          teamSystem.createTeam({
            name: `Performance Team ${i}`,
            description: `Team ${i} for performance testing`,
            sport: 'Basketball',
            captainId: `captain-${i}`,
            maxMembers: 5,
            isPublic: true
          })
        );
      }

      const teams = await Promise.all(teamPromises);
      expect(teams).toHaveLength(10);

      // Step 2: Create multiple interactive sessions concurrently
      const pollPromises = [];
      for (let i = 0; i < 5; i++) {
        pollPromises.push(
          interactiveEventService.createPoll({
            eventId: mockEventId,
            question: `Performance Poll ${i}?`,
            options: ['Option A', 'Option B', 'Option C'],
            type: PollType.MULTIPLE_CHOICE,
            duration: 300,
            createdBy: mockCaptainId
          })
        );
      }

      const polls = await Promise.all(pollPromises);
      expect(polls).toHaveLength(5);

      // Step 3: Simulate concurrent voting
      const votePromises = [];
      for (let i = 0; i < 50; i++) {
        const pollIndex = i % 5;
        votePromises.push(
          interactiveEventService.submitPollVote(polls[pollIndex].id, `user-${i}`, ['Option A'])
        );
      }

      await Promise.all(votePromises);

      // Step 4: Verify all votes processed
      let totalVotes = 0;
      for (const poll of polls) {
        const results = await interactiveEventService.getPollResults(poll.id);
        totalVotes += results.totalVotes;
      }
      expect(totalVotes).toBe(50);

      // Step 5: Measure performance
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Should handle concurrent operations within reasonable time (< 2 seconds)
      expect(processingTime).toBeLessThan(2000);

      // Step 6: Verify system stability
      const finalPoll = await interactiveEventService.createPoll({
        eventId: mockEventId,
        question: 'System stability check?',
        options: ['Stable', 'Unstable'],
        type: PollType.SINGLE_CHOICE,
        duration: 300,
        createdBy: mockCaptainId
      });

      expect(finalPoll.id).toBeDefined();
      expect(finalPoll.isActive).toBe(true);
    });
  });
});