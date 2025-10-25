import { 
  Achievement, 
  Badge, 
  AchievementCategory, 
  RequirementType, 
  AchievementRequirement 
} from '../types/engagement.types';
import { AthleteProfile, AthleteStats, ProgressEntry, ProgressMetric } from '../types/user.types';

// API Error class for typed error responses
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// User action types for achievement checking
export interface UserAction {
  type: UserActionType;
  userId: string;
  eventId?: string;
  challengeId?: string;
  data?: any;
  timestamp: Date;
}

export enum UserActionType {
  EVENT_JOINED = 'event_joined',
  EVENT_COMPLETED = 'event_completed',
  REACTION_RECEIVED = 'reaction_received',
  CHALLENGE_COMPLETED = 'challenge_completed',
  MENTORSHIP_COMPLETED = 'mentorship_completed',
  TEAM_WIN = 'team_win',
  DAILY_LOGIN = 'daily_login',
  COMMENT_POSTED = 'comment_posted',
  PROFILE_UPDATED = 'profile_updated'
}

// LocalStorage keys
const ACHIEVEMENTS_STORAGE_KEY = 'achievements_data';
const USER_ACHIEVEMENTS_STORAGE_KEY = 'user_achievements_data';
const USER_STATS_STORAGE_KEY = 'user_stats_data';

class AchievementEngine {
  private predefinedAchievements: Achievement[] = [];

  constructor() {
    this.initializeStorage();
    this.initializePredefinedAchievements();
  }

  /**
   * Initialize localStorage with default data
   */
  private initializeStorage(): void {
    if (!localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY)) {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(USER_ACHIEVEMENTS_STORAGE_KEY)) {
      localStorage.setItem(USER_ACHIEVEMENTS_STORAGE_KEY, JSON.stringify({}));
    }
    if (!localStorage.getItem(USER_STATS_STORAGE_KEY)) {
      localStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify({}));
    }
  }

  /**
   * Initialize predefined achievements based on requirements
   */
  private initializePredefinedAchievements(): void {
    this.predefinedAchievements = [
      // Requirement 2.1: First Step achievement
      {
        id: 'first_step',
        name: 'First Step',
        description: 'Join your first event and start your athletic journey',
        iconUrl: '/icons/achievements/first-step.svg',
        rarity: 'common',
        points: 10,
        category: AchievementCategory.PARTICIPATION,
        requirements: [
          {
            type: RequirementType.EVENTS_JOINED,
            value: 1,
            description: 'Join 1 event'
          }
        ]
      },
      // Requirement 2.2: Streak Master achievement
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Participate in 5 consecutive events',
        iconUrl: '/icons/achievements/streak-master.svg',
        rarity: 'rare',
        points: 50,
        category: AchievementCategory.CONSISTENCY,
        requirements: [
          {
            type: RequirementType.CONSECUTIVE_EVENTS,
            value: 5,
            description: 'Participate in 5 consecutive events'
          }
        ]
      },
      // Requirement 2.3: Community Favorite achievement
      {
        id: 'community_favorite',
        name: 'Community Favorite',
        description: 'Receive 50 reactions on your event submissions',
        iconUrl: '/icons/achievements/community-favorite.svg',
        rarity: 'epic',
        points: 100,
        category: AchievementCategory.SOCIAL,
        requirements: [
          {
            type: RequirementType.REACTIONS_RECEIVED,
            value: 50,
            description: 'Receive 50 reactions'
          }
        ]
      },
      // Additional achievements for comprehensive system
      {
        id: 'challenge_champion',
        name: 'Challenge Champion',
        description: 'Complete 10 challenges successfully',
        iconUrl: '/icons/achievements/challenge-champion.svg',
        rarity: 'rare',
        points: 75,
        category: AchievementCategory.SKILL,
        requirements: [
          {
            type: RequirementType.CHALLENGES_COMPLETED,
            value: 10,
            description: 'Complete 10 challenges'
          }
        ]
      },
      {
        id: 'mentor_master',
        name: 'Mentor Master',
        description: 'Successfully complete 3 mentorship relationships',
        iconUrl: '/icons/achievements/mentor-master.svg',
        rarity: 'legendary',
        points: 200,
        category: AchievementCategory.LEADERSHIP,
        requirements: [
          {
            type: RequirementType.MENTORSHIPS_COMPLETED,
            value: 3,
            description: 'Complete 3 mentorships'
          }
        ]
      },
      {
        id: 'team_player',
        name: 'Team Player',
        description: 'Win 5 team-based competitions',
        iconUrl: '/icons/achievements/team-player.svg',
        rarity: 'epic',
        points: 150,
        category: AchievementCategory.LEADERSHIP,
        requirements: [
          {
            type: RequirementType.TEAM_WINS,
            value: 5,
            description: 'Win 5 team competitions'
          }
        ]
      },
      {
        id: 'dedicated_athlete',
        name: 'Dedicated Athlete',
        description: 'Stay active for 30 consecutive days',
        iconUrl: '/icons/achievements/dedicated-athlete.svg',
        rarity: 'rare',
        points: 80,
        category: AchievementCategory.CONSISTENCY,
        requirements: [
          {
            type: RequirementType.DAYS_ACTIVE,
            value: 30,
            description: 'Be active for 30 consecutive days'
          }
        ]
      }
    ];

    // Store predefined achievements
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(this.predefinedAchievements));
  }

  /**
   * Get user statistics from storage
   */
  private getUserStats(userId: string): AthleteStats {
    const allStats = JSON.parse(localStorage.getItem(USER_STATS_STORAGE_KEY) || '{}');
    return allStats[userId] || this.getDefaultStats();
  }

  /**
   * Save user statistics to storage
   */
  private saveUserStats(userId: string, stats: AthleteStats): void {
    const allStats = JSON.parse(localStorage.getItem(USER_STATS_STORAGE_KEY) || '{}');
    allStats[userId] = stats;
    localStorage.setItem(USER_STATS_STORAGE_KEY, JSON.stringify(allStats));
  }

  /**
   * Get default statistics for new users
   */
  private getDefaultStats(): AthleteStats {
    return {
      eventsJoined: 0,
      eventsCompleted: 0,
      eventsWon: 0,
      participationRate: 0,
      totalReactions: 0,
      reactionsReceived: 0,
      commentsPosted: 0,
      commentsReceived: 0,
      totalAchievements: 0,
      rareAchievements: 0,
      achievementPoints: 0,
      challengesCompleted: 0,
      challengesWon: 0,
      challengeWinRate: 0,
      mentorshipsCompleted: 0,
      menteesHelped: 0,
      teamContributions: 0,
      totalActiveTime: 0,
      averageSessionTime: 0,
      longestStreak: 0,
      currentStreak: 0,
      sportRanks: {}
    };
  }

  /**
   * Get user achievements from storage
   */
  private getUserAchievements(userId: string): Achievement[] {
    const allUserAchievements = JSON.parse(localStorage.getItem(USER_ACHIEVEMENTS_STORAGE_KEY) || '{}');
    return allUserAchievements[userId] || [];
  }

  /**
   * Save user achievements to storage
   */
  private saveUserAchievements(userId: string, achievements: Achievement[]): void {
    const allUserAchievements = JSON.parse(localStorage.getItem(USER_ACHIEVEMENTS_STORAGE_KEY) || '{}');
    allUserAchievements[userId] = achievements;
    localStorage.setItem(USER_ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(allUserAchievements));
  }

  /**
   * Check if user meets achievement requirements
   */
  private checkAchievementRequirements(achievement: Achievement, stats: AthleteStats): boolean {
    return achievement.requirements.every(requirement => {
      switch (requirement.type) {
        case RequirementType.EVENTS_JOINED:
          return stats.eventsJoined >= requirement.value;
        case RequirementType.CONSECUTIVE_EVENTS:
          return stats.currentStreak >= requirement.value;
        case RequirementType.REACTIONS_RECEIVED:
          return stats.reactionsReceived >= requirement.value;
        case RequirementType.CHALLENGES_COMPLETED:
          return stats.challengesCompleted >= requirement.value;
        case RequirementType.MENTORSHIPS_COMPLETED:
          return stats.mentorshipsCompleted >= requirement.value;
        case RequirementType.TEAM_WINS:
          return stats.eventsWon >= requirement.value; // Using eventsWon as proxy for team wins
        case RequirementType.DAYS_ACTIVE:
          return stats.longestStreak >= requirement.value;
        default:
          return false;
      }
    });
  }

  /**
   * Update user statistics based on action
   */
  private updateUserStats(userId: string, action: UserAction): AthleteStats {
    const stats = this.getUserStats(userId);

    switch (action.type) {
      case UserActionType.EVENT_JOINED:
        stats.eventsJoined += 1;
        stats.currentStreak += 1;
        stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
        break;
      case UserActionType.EVENT_COMPLETED:
        stats.eventsCompleted += 1;
        break;
      case UserActionType.REACTION_RECEIVED:
        stats.reactionsReceived += 1;
        break;
      case UserActionType.CHALLENGE_COMPLETED:
        stats.challengesCompleted += 1;
        break;
      case UserActionType.MENTORSHIP_COMPLETED:
        stats.mentorshipsCompleted += 1;
        break;
      case UserActionType.TEAM_WIN:
        stats.eventsWon += 1;
        break;
      case UserActionType.COMMENT_POSTED:
        stats.commentsPosted += 1;
        break;
    }

    // Update participation rate
    if (stats.eventsJoined > 0) {
      stats.participationRate = (stats.eventsCompleted / stats.eventsJoined) * 100;
    }

    // Update challenge win rate
    if (stats.challengesCompleted > 0) {
      stats.challengeWinRate = (stats.challengesWon / stats.challengesCompleted) * 100;
    }

    this.saveUserStats(userId, stats);
    return stats;
  }

  /**
   * Calculate engagement score based on user statistics and achievements
   * Requirements: 2.5 - Engagement score calculation algorithm
   */
  calculateEngagementScore(userId: string): number {
    const stats = this.getUserStats(userId);
    const achievements = this.getUserAchievements(userId);

    // Base score from participation
    let score = 0;

    // Participation metrics (40% of total score)
    score += stats.eventsJoined * 10;
    score += stats.eventsCompleted * 15;
    score += stats.eventsWon * 25;

    // Social engagement (25% of total score)
    score += stats.reactionsReceived * 2;
    score += stats.commentsPosted * 3;
    score += stats.commentsReceived * 2;

    // Achievement points (20% of total score)
    score += stats.achievementPoints;

    // Challenge performance (10% of total score)
    score += stats.challengesCompleted * 8;
    score += stats.challengesWon * 12;

    // Consistency bonus (5% of total score)
    score += stats.currentStreak * 5;
    score += stats.longestStreak * 2;

    // Rare achievement multiplier
    const rareAchievementMultiplier = 1 + (stats.rareAchievements * 0.1);
    score *= rareAchievementMultiplier;

    return Math.round(score);
  }

  /**
   * Check achievements triggered by user actions
   * Requirements: 2.1, 2.2, 2.3 - Achievement checking system
   */
  async checkAchievements(userId: string, action: UserAction): Promise<Achievement[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Update user statistics based on action
      const updatedStats = this.updateUserStats(userId, action);

      // Get current user achievements
      const currentAchievements = this.getUserAchievements(userId);
      const currentAchievementIds = new Set(currentAchievements.map(a => a.id));

      // Check all predefined achievements
      const newAchievements: Achievement[] = [];

      for (const achievement of this.predefinedAchievements) {
        // Skip if user already has this achievement
        if (currentAchievementIds.has(achievement.id)) {
          continue;
        }

        // Check if user meets requirements
        if (this.checkAchievementRequirements(achievement, updatedStats)) {
          const unlockedAchievement = {
            ...achievement,
            unlockedAt: new Date()
          };
          newAchievements.push(unlockedAchievement);
          currentAchievements.push(unlockedAchievement);
        }
      }

      // Update user achievements and stats
      if (newAchievements.length > 0) {
        this.saveUserAchievements(userId, currentAchievements);
        
        // Update achievement-related stats
        updatedStats.totalAchievements = currentAchievements.length;
        updatedStats.rareAchievements = currentAchievements.filter(a => 
          a.rarity === 'rare' || a.rarity === 'epic' || a.rarity === 'legendary'
        ).length;
        updatedStats.achievementPoints = currentAchievements.reduce((total, a) => total + a.points, 0);
        
        this.saveUserStats(userId, updatedStats);
      }

      return newAchievements;
    } catch (error) {
      throw new APIError(500, 'Failed to check achievements', error);
    }
  }

  /**
   * Award a specific badge to a user
   * Requirements: 2.5 - Badge awarding system
   */
  async awardBadge(userId: string, badgeId: string): Promise<void> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 150));

      const achievement = this.predefinedAchievements.find(a => a.id === badgeId);
      if (!achievement) {
        throw new APIError(404, 'Achievement not found');
      }

      const currentAchievements = this.getUserAchievements(userId);
      const hasAchievement = currentAchievements.some(a => a.id === badgeId);

      if (hasAchievement) {
        throw new APIError(400, 'User already has this achievement');
      }

      const unlockedAchievement = {
        ...achievement,
        unlockedAt: new Date()
      };

      currentAchievements.push(unlockedAchievement);
      this.saveUserAchievements(userId, currentAchievements);

      // Update user stats
      const stats = this.getUserStats(userId);
      stats.totalAchievements = currentAchievements.length;
      stats.rareAchievements = currentAchievements.filter(a => 
        a.rarity === 'rare' || a.rarity === 'epic' || a.rarity === 'legendary'
      ).length;
      stats.achievementPoints = currentAchievements.reduce((total, a) => total + a.points, 0);
      
      this.saveUserStats(userId, stats);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, 'Failed to award badge', error);
    }
  }

  /**
   * Get all achievements for a user
   */
  async getUserAchievementsAsync(userId: string): Promise<Achievement[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getUserAchievements(userId);
    } catch (error) {
      throw new APIError(500, 'Failed to get user achievements', error);
    }
  }

  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.predefinedAchievements;
    } catch (error) {
      throw new APIError(500, 'Failed to get achievements', error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatsAsync(userId: string): Promise<AthleteStats> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getUserStats(userId);
    } catch (error) {
      throw new APIError(500, 'Failed to get user statistics', error);
    }
  }

  /**
   * Get user's current engagement score
   */
  async getEngagementScore(userId: string): Promise<number> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.calculateEngagementScore(userId);
    } catch (error) {
      throw new APIError(500, 'Failed to calculate engagement score', error);
    }
  }

  /**
   * Check for new achievements for a user
   */
  async checkForNewAchievements(userId: string): Promise<Achievement[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 150));

      const userAchievements = this.getUserAchievements(userId);
      const userStats = this.getUserStats(userId);
      const allAchievements = this.getAllAchievementsSync();
      
      const newAchievements: Achievement[] = [];
      const earnedAchievementIds = userAchievements.map(a => a.id);

      // Check each achievement to see if user qualifies
      for (const achievement of allAchievements) {
        if (earnedAchievementIds.includes(achievement.id)) {
          continue; // Already earned
        }

        let qualifies = true;
        
        // Check all requirements
        for (const requirement of achievement.requirements) {
          if (!this.checkRequirement(requirement, userStats)) {
            qualifies = false;
            break;
          }
        }

        if (qualifies) {
          // Award the achievement
          const earnedAchievement: Achievement = {
            ...achievement,
            unlockedAt: new Date()
          };
          
          userAchievements.push(earnedAchievement);
          newAchievements.push(earnedAchievement);
          
          // Update user stats
          userStats.achievementsEarned += 1;
          userStats.totalPoints += achievement.points;
        }
      }

      // Save updated data
      if (newAchievements.length > 0) {
        this.saveUserAchievements(userId, userAchievements);
        this.saveUserStats(userId, userStats);
      }

      return newAchievements;
    } catch (error) {
      throw new APIError(500, 'Failed to check for new achievements', error);
    }
  }

  /**
   * Utility method to clear all user data (for testing)
   */
  clearAllUserData(): void {
    localStorage.removeItem(USER_ACHIEVEMENTS_STORAGE_KEY);
    localStorage.removeItem(USER_STATS_STORAGE_KEY);
    this.initializeStorage();
  }

  /**
   * Utility method to seed sample user data (for testing)
   */
  async seedSampleUserData(userId: string = 'test-user'): Promise<void> {
    // Create sample stats
    const sampleStats: AthleteStats = {
      eventsJoined: 8,
      eventsCompleted: 6,
      eventsWon: 2,
      participationRate: 75,
      totalReactions: 25,
      reactionsReceived: 45,
      commentsPosted: 12,
      commentsReceived: 18,
      totalAchievements: 0,
      rareAchievements: 0,
      achievementPoints: 0,
      challengesCompleted: 7,
      challengesWon: 3,
      challengeWinRate: 42.86,
      mentorshipsCompleted: 1,
      menteesHelped: 2,
      teamContributions: 5,
      totalActiveTime: 1200,
      averageSessionTime: 45,
      longestStreak: 12,
      currentStreak: 5,
      sportRanks: {
        'Basketball': 15,
        'Soccer': 8
      }
    };

    this.saveUserStats(userId, sampleStats);

    // Trigger some achievements based on the sample stats
    const actions: UserAction[] = [
      { type: UserActionType.EVENT_JOINED, userId, timestamp: new Date() },
      { type: UserActionType.REACTION_RECEIVED, userId, timestamp: new Date() },
      { type: UserActionType.CHALLENGE_COMPLETED, userId, timestamp: new Date() }
    ];

    for (const action of actions) {
      await this.checkAchievements(userId, action);
    }
  }
}

// Export singleton instance
export const achievementEngine = new AchievementEngine();
export default achievementEngine;