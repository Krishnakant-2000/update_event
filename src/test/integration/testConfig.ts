/**
 * Integration Test Configuration
 * 
 * Provides shared configuration, utilities, and mock data for integration tests
 */

import { vi } from 'vitest';
import { SkillLevel } from '../../types/user.types';
import { ActivityType } from '../../types/realtime.types';
import { ChallengeType, LeaderboardType } from '../../types/engagement.types';

// Test configuration constants
export const TEST_CONFIG = {
  // Timeouts
  DEFAULT_TIMEOUT: 5000,
  WEBSOCKET_TIMEOUT: 1000,
  ASYNC_OPERATION_TIMEOUT: 2000,
  
  // Performance thresholds
  MAX_PROCESSING_TIME: 1000, // 1 second
  MAX_CONCURRENT_USERS: 100,
  MAX_ACTIVITIES_PER_FEED: 50,
  
  // Test data limits
  MAX_ACHIEVEMENTS_PER_USER: 20,
  MAX_CHALLENGES_PER_EVENT: 10,
  MAX_TEAM_MEMBERS: 5,
  
  // Mock data configuration
  MOCK_EVENT_COUNT: 5,
  MOCK_USER_COUNT: 10,
  MOCK_CHALLENGE_COUNT: 3
};

// Mock user profiles for consistent testing
export const MOCK_USERS = {
  NEWBIE: {
    id: 'test-newbie-001',
    name: 'Alex Newbie',
    email: 'alex.newbie@test.com',
    avatar: 'newbie-avatar.jpg',
    primarySports: ['Basketball'],
    skillLevel: SkillLevel.BEGINNER,
    timezone: 'UTC',
    verified: false,
    joinedAt: new Date('2024-01-01')
  },
  INTERMEDIATE: {
    id: 'test-intermediate-002',
    name: 'Jordan Intermediate',
    email: 'jordan.intermediate@test.com',
    avatar: 'intermediate-avatar.jpg',
    primarySports: ['Basketball', 'Soccer'],
    skillLevel: SkillLevel.INTERMEDIATE,
    timezone: 'UTC',
    verified: false,
    joinedAt: new Date('2023-06-01')
  },
  ADVANCED: {
    id: 'test-advanced-003',
    name: 'Sam Advanced',
    email: 'sam.advanced@test.com',
    avatar: 'advanced-avatar.jpg',
    primarySports: ['Basketball'],
    skillLevel: SkillLevel.ADVANCED,
    timezone: 'UTC',
    verified: true,
    joinedAt: new Date('2022-01-01')
  },
  MENTOR: {
    id: 'test-mentor-004',
    name: 'Coach Mentor',
    email: 'coach.mentor@test.com',
    avatar: 'mentor-avatar.jpg',
    primarySports: ['Basketball', 'Soccer', 'Tennis'],
    skillLevel: SkillLevel.PROFESSIONAL,
    timezone: 'UTC',
    verified: true,
    joinedAt: new Date('2020-01-01')
  },
  CAPTAIN: {
    id: 'test-captain-005',
    name: 'Team Captain',
    email: 'team.captain@test.com',
    avatar: 'captain-avatar.jpg',
    primarySports: ['Basketball'],
    skillLevel: SkillLevel.ADVANCED,
    timezone: 'UTC',
    verified: true,
    joinedAt: new Date('2021-01-01')
  }
};

// Mock events for testing
export const MOCK_EVENTS = [
  {
    id: 'test-event-001',
    title: 'Basketball Skills Challenge',
    description: 'Show off your basketball skills',
    sport: 'Basketball',
    location: 'Test Arena',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-02'),
    status: 'ongoing',
    category: 'amaplayer',
    createdBy: MOCK_USERS.MENTOR.id,
    isOfficial: true,
    eventType: 'talent_hunt',
    hostType: 'amaplayer_official',
    maxParticipants: 50
  },
  {
    id: 'test-event-002',
    title: 'Community Basketball Meetup',
    description: 'Casual basketball meetup for all levels',
    sport: 'Basketball',
    location: 'Community Center',
    startDate: new Date('2024-02-05'),
    status: 'upcoming',
    category: 'upcoming',
    createdBy: MOCK_USERS.CAPTAIN.id,
    isOfficial: false,
    eventType: 'community',
    hostType: 'user',
    maxParticipants: 20
  }
];

// Mock challenges for testing
export const MOCK_CHALLENGES = [
  {
    type: ChallengeType.SKILL_SHOWCASE,
    title: 'Basketball Trick Shot Challenge',
    description: 'Show your most creative basketball shots',
    sport: 'Basketball',
    duration: 300, // 5 minutes
    maxParticipants: 20,
    rewards: [
      { type: 'points', value: 50, description: '50 engagement points' },
      { type: 'badge', value: 1, description: 'Trick Shot Master badge' }
    ]
  },
  {
    type: ChallengeType.TEAM_COLLABORATION,
    title: 'Team Coordination Challenge',
    description: 'Demonstrate perfect team coordination',
    sport: 'Basketball',
    duration: 600, // 10 minutes
    maxParticipants: 12, // 3 teams of 4
    rewards: [
      { type: 'points', value: 100, description: '100 team points' },
      { type: 'badge', value: 1, description: 'Team Player badge' }
    ]
  },
  {
    type: ChallengeType.CREATIVITY,
    title: 'Creative Basketball Video',
    description: 'Create the most creative basketball video',
    sport: 'Basketball',
    duration: 900, // 15 minutes
    maxParticipants: 30,
    rewards: [
      { type: 'points', value: 75, description: '75 creativity points' },
      { type: 'feature', value: 1, description: 'Featured on homepage' }
    ]
  }
];

// Test utilities
export class TestUtils {
  /**
   * Generate mock activity events
   */
  static generateMockActivities(eventId: string, count: number = 10) {
    const activities = [];
    const activityTypes = Object.values(ActivityType);
    const users = Object.values(MOCK_USERS);

    for (let i = 0; i < count; i++) {
      const user = users[i % users.length];
      const activityType = activityTypes[i % activityTypes.length];
      
      activities.push({
        id: `mock-activity-${i}`,
        eventId,
        userId: user.id,
        type: activityType,
        data: this.generateActivityData(activityType, user),
        timestamp: new Date(Date.now() - (count - i) * 60000), // Spread over last hour
        priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low'
      });
    }

    return activities;
  }

  /**
   * Generate appropriate data for activity type
   */
  static generateActivityData(activityType: ActivityType, user: any) {
    switch (activityType) {
      case ActivityType.USER_JOINED:
        return { userName: user.name, userAvatar: user.avatar };
      case ActivityType.USER_REACTED:
        return { reactionType: '🔥', targetId: 'content-1' };
      case ActivityType.CHALLENGE_COMPLETED:
        return { challengeId: 'challenge-1', challengeName: 'Skill Showcase' };
      case ActivityType.ACHIEVEMENT_EARNED:
        return { achievementId: 'achievement-1', achievementName: 'First Step' };
      case ActivityType.COMMENT_POSTED:
        return { content: 'Great event!', targetId: 'event-1' };
      case ActivityType.TEAM_FORMED:
        return { teamId: 'team-1', teamName: 'Test Team' };
      case ActivityType.MENTORSHIP_STARTED:
        return { mentorId: MOCK_USERS.MENTOR.id, menteeId: user.id };
      default:
        return {};
    }
  }

  /**
   * Setup mock localStorage data
   */
  static setupMockStorage() {
    const users = Object.values(MOCK_USERS);
    const events = MOCK_EVENTS;
    
    localStorage.setItem('user_profiles', JSON.stringify(users));
    localStorage.setItem('mock_events', JSON.stringify(events));
    localStorage.setItem('test_initialized', 'true');
  }

  /**
   * Clear all test data
   */
  static clearTestData() {
    localStorage.clear();
  }

  /**
   * Wait for async operations to complete
   */
  static async waitForAsyncOperations(timeout: number = TEST_CONFIG.ASYNC_OPERATION_TIMEOUT) {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  /**
   * Generate performance metrics
   */
  static measurePerformance<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    return new Promise(async (resolve) => {
      const startTime = Date.now();
      const result = await operation();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      resolve({ result, duration });
    });
  }

  /**
   * Validate system consistency
   */
  static async validateSystemConsistency(services: any) {
    const validationResults = {
      achievementsConsistent: true,
      leaderboardsConsistent: true,
      statisticsConsistent: true,
      liveFeedConsistent: true,
      errors: [] as string[]
    };

    try {
      // Validate achievements
      const userAchievements = await services.achievementEngine.getUserAchievements(MOCK_USERS.NEWBIE.id);
      if (!Array.isArray(userAchievements)) {
        validationResults.achievementsConsistent = false;
        validationResults.errors.push('Achievements not returned as array');
      }

      // Validate leaderboards
      const leaderboard = await services.leaderboardService.getLeaderboard(
        LeaderboardType.PARTICIPATION,
        'all_time'
      );
      if (!leaderboard || !Array.isArray(leaderboard.entries)) {
        validationResults.leaderboardsConsistent = false;
        validationResults.errors.push('Leaderboard structure invalid');
      }

      // Validate statistics
      const stats = await services.statisticsService.getUserStats(MOCK_USERS.NEWBIE.id);
      if (typeof stats !== 'object') {
        validationResults.statisticsConsistent = false;
        validationResults.errors.push('Statistics not returned as object');
      }

      // Validate live feed
      const activities = services.liveFeedManager.getRecentActivities('test-event', 10);
      if (!Array.isArray(activities)) {
        validationResults.liveFeedConsistent = false;
        validationResults.errors.push('Live feed activities not returned as array');
      }

    } catch (error) {
      validationResults.errors.push(`Validation error: ${error.message}`);
    }

    return validationResults;
  }

  /**
   * Generate load test data
   */
  static generateLoadTestData(userCount: number, activityCount: number) {
    const users = [];
    const activities = [];

    // Generate users
    for (let i = 0; i < userCount; i++) {
      users.push({
        id: `load-test-user-${i}`,
        name: `Load Test User ${i}`,
        email: `loadtest${i}@test.com`,
        avatar: `avatar${i}.jpg`,
        primarySports: ['Basketball'],
        skillLevel: i % 2 === 0 ? SkillLevel.BEGINNER : SkillLevel.INTERMEDIATE,
        timezone: 'UTC',
        verified: i % 10 === 0,
        joinedAt: new Date()
      });
    }

    // Generate activities
    for (let i = 0; i < activityCount; i++) {
      const user = users[i % users.length];
      activities.push({
        id: `load-test-activity-${i}`,
        eventId: 'load-test-event',
        userId: user.id,
        type: ActivityType.USER_JOINED,
        data: { userName: user.name, userAvatar: user.avatar },
        timestamp: new Date(),
        priority: 'medium'
      });
    }

    return { users, activities };
  }
}

// Mock WebSocket for testing
export class MockWebSocketService {
  private subscribers: Map<string, Function[]> = new Map();
  private connected: boolean = false;

  async connect(userId: string): Promise<void> {
    this.connected = true;
    return Promise.resolve();
  }

  disconnect(): void {
    this.connected = false;
    this.subscribers.clear();
  }

  subscribe(channel: string, callback: Function): void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel)!.push(callback);
  }

  publish(channel: string, data: any): void {
    if (this.connected && this.subscribers.has(channel)) {
      this.subscribers.get(channel)!.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Test helper to simulate message reception
  simulateMessage(channel: string, data: any): void {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel)!.forEach(callback => callback(data));
    }
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(operation: string): () => number {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(operation, duration);
      return duration;
    };
  }

  recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
  }

  getMetrics(operation: string): { avg: number; min: number; max: number; count: number } {
    const durations = this.metrics.get(operation) || [];
    if (durations.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const sum = durations.reduce((a, b) => a + b, 0);
    return {
      avg: sum / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      count: durations.length
    };
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [operation, durations] of this.metrics.entries()) {
      result[operation] = this.getMetrics(operation);
    }
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

// Export singleton instances for shared use
export const testUtils = TestUtils;
export const performanceMonitor = new PerformanceMonitor();