import { 
  Leaderboard, 
  LeaderboardEntry, 
  LeaderboardType, 
  LeaderboardPeriod, 
  RankChange 
} from '../types/engagement.types';
import { AthleteStats } from '../types/user.types';
import { achievementEngine } from './achievementEngine';

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

// Leaderboard calculation configuration
export interface LeaderboardConfig {
  maxEntries: number;
  updateInterval: number; // in milliseconds
  cacheTimeout: number; // in milliseconds
  enableRealTimeUpdates: boolean;
}

// User ranking data for calculations
export interface UserRankingData {
  userId: string;
  userName: string;
  userAvatar?: string;
  stats: AthleteStats;
  engagementScore: number;
  level: number;
  badges: any[];
}

// LocalStorage keys
const LEADERBOARDS_STORAGE_KEY = 'leaderboards_data';
const USER_RANKINGS_STORAGE_KEY = 'user_rankings_data';
const LEADERBOARD_CONFIG_KEY = 'leaderboard_config';
const RANKING_HISTORY_KEY = 'ranking_history_data';

interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number;
}

interface QueryOptimization {
  useIndexes: boolean;
  batchSize: number;
  cacheResults: boolean;
  cacheTTL: number;
}

class LeaderboardService {
  private config: LeaderboardConfig;
  private updateTimers: Map<string, number> = new Map();
  private subscribers: Map<string, Set<(leaderboard: Leaderboard) => void>> = new Map();
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private queryOptimization: QueryOptimization = {
    useIndexes: true,
    batchSize: 100,
    cacheResults: true,
    cacheTTL: 300000 // 5 minutes
  };
  private backgroundJobs: Map<string, number> = new Map();

  constructor() {
    this.config = this.loadConfig();
    this.initializeStorage();
  }

  /**
   * Load configuration from storage or use defaults
   */
  private loadConfig(): LeaderboardConfig {
    const stored = localStorage.getItem(LEADERBOARD_CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    const defaultConfig: LeaderboardConfig = {
      maxEntries: 100,
      updateInterval: 5 * 60 * 1000, // 5 minutes
      cacheTimeout: 10 * 60 * 1000, // 10 minutes
      enableRealTimeUpdates: true
    };

    localStorage.setItem(LEADERBOARD_CONFIG_KEY, JSON.stringify(defaultConfig));
    return defaultConfig;
  }

  /**
   * Initialize localStorage with default data
   */
  private initializeStorage(): void {
    if (!localStorage.getItem(LEADERBOARDS_STORAGE_KEY)) {
      localStorage.setItem(LEADERBOARDS_STORAGE_KEY, JSON.stringify({}));
    }
    if (!localStorage.getItem(USER_RANKINGS_STORAGE_KEY)) {
      localStorage.setItem(USER_RANKINGS_STORAGE_KEY, JSON.stringify({}));
    }
    if (!localStorage.getItem(RANKING_HISTORY_KEY)) {
      localStorage.setItem(RANKING_HISTORY_KEY, JSON.stringify({}));
    }
  }

  /**
   * Get leaderboard from storage
   */
  private getStoredLeaderboard(key: string): Leaderboard | null {
    const allLeaderboards = JSON.parse(localStorage.getItem(LEADERBOARDS_STORAGE_KEY) || '{}');
    const stored = allLeaderboards[key];
    
    if (!stored) return null;

    // Check if cache is still valid
    const lastUpdated = new Date(stored.lastUpdated);
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdated.getTime();

    if (timeDiff > this.config.cacheTimeout) {
      return null; // Cache expired
    }

    return stored;
  }

  /**
   * Save leaderboard to storage
   */
  private saveLeaderboard(key: string, leaderboard: Leaderboard): void {
    const allLeaderboards = JSON.parse(localStorage.getItem(LEADERBOARDS_STORAGE_KEY) || '{}');
    allLeaderboards[key] = leaderboard;
    localStorage.setItem(LEADERBOARDS_STORAGE_KEY, JSON.stringify(allLeaderboards));
  }

  /**
   * Get user ranking data from storage
   */
  private getUserRankingData(): Map<string, UserRankingData> {
    const stored = localStorage.getItem(USER_RANKINGS_STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : {};
    
    const rankingMap = new Map<string, UserRankingData>();
    Object.entries(data).forEach(([userId, userData]) => {
      rankingMap.set(userId, userData as UserRankingData);
    });

    return rankingMap;
  }

  /**
   * Save user ranking data to storage
   */
  private saveUserRankingData(data: Map<string, UserRankingData>): void {
    const obj: Record<string, UserRankingData> = {};
    data.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(USER_RANKINGS_STORAGE_KEY, JSON.stringify(obj));
  }

  /**
   * Get ranking history for change detection
   */
  private getRankingHistory(leaderboardKey: string): Map<string, number> {
    const allHistory = JSON.parse(localStorage.getItem(RANKING_HISTORY_KEY) || '{}');
    const history = allHistory[leaderboardKey] || {};
    
    const historyMap = new Map<string, number>();
    Object.entries(history).forEach(([userId, rank]) => {
      historyMap.set(userId, rank as number);
    });

    return historyMap;
  }

  /**
   * Save ranking history
   */
  private saveRankingHistory(leaderboardKey: string, rankings: Map<string, number>): void {
    const allHistory = JSON.parse(localStorage.getItem(RANKING_HISTORY_KEY) || '{}');
    
    const obj: Record<string, number> = {};
    rankings.forEach((rank, userId) => {
      obj[userId] = rank;
    });
    
    allHistory[leaderboardKey] = obj;
    localStorage.setItem(RANKING_HISTORY_KEY, JSON.stringify(allHistory));
  }

  /**
   * Calculate score based on leaderboard type
   * Requirements: 4.1 - Multi-category leaderboard calculations
   */
  private calculateScore(type: LeaderboardType, userData: UserRankingData): number {
    const { stats, engagementScore } = userData;

    switch (type) {
      case LeaderboardType.ENGAGEMENT_SCORE:
        return engagementScore;

      case LeaderboardType.PARTICIPATION:
        // Weight completed events more than just joined
        return (stats.eventsCompleted * 2) + stats.eventsJoined + (stats.participationRate / 10);

      case LeaderboardType.ACHIEVEMENTS:
        // Weight rare achievements more heavily
        return stats.achievementPoints + (stats.rareAchievements * 50);

      case LeaderboardType.CHALLENGE_WINS:
        return (stats.challengesWon * 10) + (stats.challengesCompleted * 2) + (stats.challengeWinRate / 5);

      case LeaderboardType.SOCIAL_IMPACT:
        return (
          stats.reactionsReceived * 2 +
          stats.commentsReceived * 3 +
          stats.mentorshipsCompleted * 15 +
          stats.menteesHelped * 10 +
          stats.teamContributions * 5
        );

      case LeaderboardType.TEAM_PERFORMANCE:
        return (stats.eventsWon * 15) + (stats.teamContributions * 8) + (stats.challengesWon * 5);

      default:
        return engagementScore;
    }
  }

  /**
   * Filter user data based on time period
   * Requirements: 4.3 - Weekly, monthly, and all-time leaderboard support
   */
  private filterByPeriod(userData: Map<string, UserRankingData>, period: LeaderboardPeriod): Map<string, UserRankingData> {
    // For this implementation, we'll return all data since we don't have time-based filtering
    // In a real implementation, this would filter based on activity within the time period
    
    const filteredData = new Map<string, UserRankingData>();

    userData.forEach((data, userId) => {
      // For demo purposes, we'll include all users but could add time-based filtering here
      // based on when their stats were last updated or when they were active
      
      switch (period) {
        case LeaderboardPeriod.DAILY:
          // Would filter for activity in last 24 hours
          filteredData.set(userId, data);
          break;
        case LeaderboardPeriod.WEEKLY:
          // Would filter for activity in last 7 days
          filteredData.set(userId, data);
          break;
        case LeaderboardPeriod.MONTHLY:
          // Would filter for activity in last 30 days
          filteredData.set(userId, data);
          break;
        case LeaderboardPeriod.ALL_TIME:
          filteredData.set(userId, data);
          break;
        case LeaderboardPeriod.EVENT_SPECIFIC:
          // Would filter for specific event participation
          filteredData.set(userId, data);
          break;
        default:
          filteredData.set(userId, data);
      }
    });

    return filteredData;
  }

  /**
   * Calculate rank changes compared to previous rankings
   */
  private calculateRankChanges(
    currentRankings: LeaderboardEntry[], 
    previousRankings: Map<string, number>
  ): LeaderboardEntry[] {
    return currentRankings.map(entry => {
      const previousRank = previousRankings.get(entry.userId);
      
      if (previousRank === undefined) {
        entry.change = RankChange.NEW;
      } else if (previousRank > entry.rank) {
        entry.change = RankChange.UP;
        entry.previousRank = previousRank;
      } else if (previousRank < entry.rank) {
        entry.change = RankChange.DOWN;
        entry.previousRank = previousRank;
      } else {
        entry.change = RankChange.SAME;
        entry.previousRank = previousRank;
      }

      return entry;
    });
  }

  /**
   * Generate leaderboard key for storage
   */
  private generateLeaderboardKey(
    type: LeaderboardType, 
    period: LeaderboardPeriod, 
    eventId?: string, 
    challengeId?: string
  ): string {
    const parts = [type.toString(), period.toString()];
    if (eventId) parts.push(`event_${eventId}`);
    if (challengeId) parts.push(`challenge_${challengeId}`);
    return parts.join('_');
  }

  /**
   * Get data from memory cache
   */
  private getFromMemoryCache<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const now = new Date();
    if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in memory cache
   */
  private setMemoryCache<T>(key: string, data: T, ttl: number = this.queryOptimization.cacheTTL): void {
    this.memoryCache.set(key, {
      data,
      timestamp: new Date(),
      ttl
    });
  }

  /**
   * Optimized batch processing for large datasets
   */
  private async processBatch<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = this.queryOptimization.batchSize
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Background job for heavy calculations
   */
  private scheduleBackgroundJob(jobId: string, job: () => Promise<void>, delay: number = 0): void {
    // Clear existing job if any
    const existingJob = this.backgroundJobs.get(jobId);
    if (existingJob) {
      clearTimeout(existingJob);
    }

    const timeoutId = setTimeout(async () => {
      try {
        await job();
      } catch (error) {
        console.error(`Background job ${jobId} failed:`, error);
      } finally {
        this.backgroundJobs.delete(jobId);
      }
    }, delay);

    this.backgroundJobs.set(jobId, timeoutId);
  }



  /**
   * Notify subscribers of leaderboard updates
   * Requirements: 4.3 - Real-time ranking updates
   */
  private notifySubscribers(leaderboardKey: string, leaderboard: Leaderboard): void {
    const subscribers = this.subscribers.get(leaderboardKey);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(leaderboard);
        } catch (error) {
          console.error('Error notifying leaderboard subscriber:', error);
        }
      });
    }
  }

  /**
   * Update user ranking data
   * Requirements: 4.3 - Real-time ranking updates
   */
  async updateUserRankingData(userId: string, stats: AthleteStats): Promise<void> {
    try {
      const userData = this.getUserRankingData();
      const engagementScore = await achievementEngine.getEngagementScore(userId);
      const achievements = await achievementEngine.getUserAchievementsAsync(userId);

      // Calculate user level based on engagement score
      const level = Math.floor(engagementScore / 100) + 1;

      const userRankingData: UserRankingData = {
        userId,
        userName: `User ${userId}`, // In real app, would get from user service
        userAvatar: undefined,
        stats,
        engagementScore,
        level,
        badges: achievements
      };

      userData.set(userId, userRankingData);
      this.saveUserRankingData(userData);

      // Trigger leaderboard updates if real-time updates are enabled
      if (this.config.enableRealTimeUpdates) {
        await this.refreshAllLeaderboards();
      }
    } catch (error) {
      throw new APIError(500, 'Failed to update user ranking data', error);
    }
  }

  /**
   * Get leaderboard for specific type and period
   * Requirements: 4.1, 4.3 - Multi-category leaderboard calculations with time periods
   */
  async getLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    eventId?: string,
    challengeId?: string
  ): Promise<Leaderboard> {
    try {
      const leaderboardKey = this.generateLeaderboardKey(type, period, eventId, challengeId);
      
      // Check intelligent cache first
      const { cacheService } = await import('./cacheService');
      const cachedLeaderboard = cacheService.get<Leaderboard>('leaderboards', leaderboardKey);
      if (cachedLeaderboard) {
        return cachedLeaderboard;
      }

      // Check memory cache (fallback)
      if (this.queryOptimization.cacheResults) {
        const memoryCache = this.getFromMemoryCache<Leaderboard>(leaderboardKey);
        if (memoryCache) {
          // Store in intelligent cache for next time
          cacheService.set('leaderboards', leaderboardKey, memoryCache);
          return memoryCache;
        }
      }

      // Check persistent cache (fallback)
      const cached = this.getStoredLeaderboard(leaderboardKey);
      if (cached) {
        // Store in intelligent cache for faster access
        cacheService.set('leaderboards', leaderboardKey, cached);
        if (this.queryOptimization.cacheResults) {
          this.setMemoryCache(leaderboardKey, cached);
        }
        return cached;
      }

      // Generate new leaderboard with optimization
      const leaderboard = await this.generateOptimizedLeaderboard(type, period, eventId, challengeId, leaderboardKey);

      // Cache the leaderboard in all layers
      this.saveLeaderboard(leaderboardKey, leaderboard);
      cacheService.set('leaderboards', leaderboardKey, leaderboard);
      if (this.queryOptimization.cacheResults) {
        this.setMemoryCache(leaderboardKey, leaderboard);
      }

      // Schedule background refresh for next time
      this.scheduleBackgroundJob(
        `refresh_${leaderboardKey}`,
        () => this.refreshLeaderboardInBackground(type, period, eventId, challengeId),
        this.queryOptimization.cacheTTL * 0.8 // Refresh at 80% of TTL
      );

      // Notify subscribers
      this.notifySubscribers(leaderboardKey, leaderboard);

      return leaderboard;
    } catch (error) {
      throw new APIError(500, 'Failed to get leaderboard', error);
    }
  }

  /**
   * Generate optimized leaderboard with batch processing
   */
  private async generateOptimizedLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    eventId?: string,
    challengeId?: string,
    leaderboardKey?: string
  ): Promise<Leaderboard> {
    const key = leaderboardKey || this.generateLeaderboardKey(type, period, eventId, challengeId);

    // Get user data with optimization
    const userData = this.getUserRankingData();
    const filteredData = this.filterByPeriod(userData, period);

    // Process in batches for large datasets
    const userArray = Array.from(filteredData.entries());
    const batchedEntries = await this.processBatch(
      userArray,
      async (batch) => {
        return batch.map(([userId, data]) => {
          const score = this.calculateScore(type, data);
          return {
            userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            score,
            rank: 0, // Will be set after sorting
            change: RankChange.SAME,
            badges: data.badges,
            level: data.level
          };
        });
      }
    );

    // Sort by score (descending) and assign ranks
    batchedEntries.sort((a, b) => b.score - a.score);
    batchedEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Limit to max entries
    const entries = batchedEntries.slice(0, this.config.maxEntries);

    // Get previous rankings for change detection
    const previousRankings = this.getRankingHistory(key);
    const entriesWithChanges = this.calculateRankChanges(entries, previousRankings);

    // Save current rankings for next comparison
    const currentRankings = new Map<string, number>();
    entriesWithChanges.forEach(entry => {
      currentRankings.set(entry.userId, entry.rank);
    });
    this.saveRankingHistory(key, currentRankings);

    return {
      id: key,
      eventId,
      challengeId,
      type,
      period,
      entries: entriesWithChanges,
      lastUpdated: new Date()
    };
  }

  /**
   * Refresh leaderboard in background
   */
  private async refreshLeaderboardInBackground(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    eventId?: string,
    challengeId?: string
  ): Promise<void> {
    try {
      const leaderboardKey = this.generateLeaderboardKey(type, period, eventId, challengeId);
      
      // Generate fresh leaderboard
      const leaderboard = await this.generateOptimizedLeaderboard(type, period, eventId, challengeId, leaderboardKey);
      
      // Update caches
      this.saveLeaderboard(leaderboardKey, leaderboard);
      if (this.queryOptimization.cacheResults) {
        this.setMemoryCache(leaderboardKey, leaderboard);
      }

      // Notify subscribers of the update
      this.notifySubscribers(leaderboardKey, leaderboard);
    } catch (error) {
      console.error('Background leaderboard refresh failed:', error);
    }
  }

  /**
   * Get multiple leaderboards at once
   */
  async getMultipleLeaderboards(requests: Array<{
    type: LeaderboardType;
    period: LeaderboardPeriod;
    eventId?: string;
    challengeId?: string;
  }>): Promise<Leaderboard[]> {
    try {
      const leaderboards = await Promise.all(
        requests.map(req => this.getLeaderboard(req.type, req.period, req.eventId, req.challengeId))
      );
      return leaderboards;
    } catch (error) {
      throw new APIError(500, 'Failed to get multiple leaderboards', error);
    }
  }

  /**
   * Get user's position in specific leaderboard
   */
  async getUserPosition(
    userId: string,
    type: LeaderboardType,
    period: LeaderboardPeriod,
    eventId?: string,
    challengeId?: string
  ): Promise<LeaderboardEntry | null> {
    try {
      const leaderboard = await this.getLeaderboard(type, period, eventId, challengeId);
      return leaderboard.entries.find(entry => entry.userId === userId) || null;
    } catch (error) {
      throw new APIError(500, 'Failed to get user position', error);
    }
  }

  /**
   * Get user's positions across all leaderboard types
   */
  async getUserPositions(userId: string, period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME): Promise<{
    type: LeaderboardType;
    position: LeaderboardEntry | null;
  }[]> {
    try {
      const types = Object.values(LeaderboardType);
      const positions = await Promise.all(
        types.map(async type => ({
          type,
          position: await this.getUserPosition(userId, type, period)
        }))
      );
      return positions;
    } catch (error) {
      throw new APIError(500, 'Failed to get user positions', error);
    }
  }

  /**
   * Subscribe to leaderboard updates
   * Requirements: 4.3 - Real-time ranking updates
   */
  subscribeToLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    callback: (leaderboard: Leaderboard) => void,
    eventId?: string,
    challengeId?: string
  ): () => void {
    const leaderboardKey = this.generateLeaderboardKey(type, period, eventId, challengeId);
    
    if (!this.subscribers.has(leaderboardKey)) {
      this.subscribers.set(leaderboardKey, new Set());
    }
    
    this.subscribers.get(leaderboardKey)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(leaderboardKey);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(leaderboardKey);
        }
      }
    };
  }

  /**
   * Refresh all cached leaderboards
   */
  async refreshAllLeaderboards(): Promise<void> {
    try {
      // Clear cache
      localStorage.setItem(LEADERBOARDS_STORAGE_KEY, JSON.stringify({}));
      
      // Regenerate commonly used leaderboards
      const commonLeaderboards = [
        { type: LeaderboardType.ENGAGEMENT_SCORE, period: LeaderboardPeriod.ALL_TIME },
        { type: LeaderboardType.ENGAGEMENT_SCORE, period: LeaderboardPeriod.WEEKLY },
        { type: LeaderboardType.PARTICIPATION, period: LeaderboardPeriod.ALL_TIME },
        { type: LeaderboardType.ACHIEVEMENTS, period: LeaderboardPeriod.ALL_TIME },
        { type: LeaderboardType.SOCIAL_IMPACT, period: LeaderboardPeriod.ALL_TIME }
      ];

      await Promise.all(
        commonLeaderboards.map(lb => this.getLeaderboard(lb.type, lb.period))
      );
    } catch (error) {
      throw new APIError(500, 'Failed to refresh leaderboards', error);
    }
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(
    type: LeaderboardType,
    period: LeaderboardPeriod
  ): Promise<{
    totalParticipants: number;
    averageScore: number;
    topScore: number;
    scoreDistribution: { range: string; count: number }[];
  }> {
    try {
      const leaderboard = await this.getLeaderboard(type, period);
      const entries = leaderboard.entries;

      if (entries.length === 0) {
        return {
          totalParticipants: 0,
          averageScore: 0,
          topScore: 0,
          scoreDistribution: []
        };
      }

      const scores = entries.map(e => e.score);
      const totalParticipants = entries.length;
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalParticipants;
      const topScore = Math.max(...scores);

      // Create score distribution
      const maxScore = topScore;
      const ranges = 5;
      const rangeSize = Math.ceil(maxScore / ranges);
      const scoreDistribution = [];

      for (let i = 0; i < ranges; i++) {
        const min = i * rangeSize;
        const max = (i + 1) * rangeSize;
        const count = scores.filter(score => score >= min && score < max).length;
        
        scoreDistribution.push({
          range: `${min}-${max - 1}`,
          count
        });
      }

      return {
        totalParticipants,
        averageScore: Math.round(averageScore),
        topScore,
        scoreDistribution
      };
    } catch (error) {
      throw new APIError(500, 'Failed to get leaderboard statistics', error);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LeaderboardConfig>): void {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(LEADERBOARD_CONFIG_KEY, JSON.stringify(this.config));
  }

  /**
   * Utility method to clear all leaderboard data (for testing)
   */
  clearAllLeaderboardData(): void {
    localStorage.removeItem(LEADERBOARDS_STORAGE_KEY);
    localStorage.removeItem(USER_RANKINGS_STORAGE_KEY);
    localStorage.removeItem(RANKING_HISTORY_KEY);
    this.initializeStorage();
    this.subscribers.clear();
    this.updateTimers.forEach(timer => clearTimeout(timer));
    this.updateTimers.clear();
  }

  /**
   * Utility method to seed sample leaderboard data (for testing)
   */
  async seedSampleLeaderboardData(): Promise<void> {
    const sampleUsers = [
      'user1', 'user2', 'user3', 'user4', 'user5',
      'user6', 'user7', 'user8', 'user9', 'user10'
    ];

    const userData = new Map<string, UserRankingData>();

    for (let i = 0; i < sampleUsers.length; i++) {
      const userId = sampleUsers[i];
      const baseScore = 1000 - (i * 100) + Math.floor(Math.random() * 50);
      
      const stats: AthleteStats = {
        eventsJoined: 10 + Math.floor(Math.random() * 20),
        eventsCompleted: 8 + Math.floor(Math.random() * 15),
        eventsWon: 1 + Math.floor(Math.random() * 5),
        participationRate: 70 + Math.floor(Math.random() * 30),
        totalReactions: Math.floor(Math.random() * 50),
        reactionsReceived: 20 + Math.floor(Math.random() * 80),
        commentsPosted: Math.floor(Math.random() * 30),
        commentsReceived: Math.floor(Math.random() * 40),
        totalAchievements: 3 + Math.floor(Math.random() * 10),
        rareAchievements: Math.floor(Math.random() * 3),
        achievementPoints: baseScore,
        challengesCompleted: 5 + Math.floor(Math.random() * 15),
        challengesWon: Math.floor(Math.random() * 8),
        challengeWinRate: Math.floor(Math.random() * 100),
        mentorshipsCompleted: Math.floor(Math.random() * 3),
        menteesHelped: Math.floor(Math.random() * 5),
        teamContributions: Math.floor(Math.random() * 10),
        totalActiveTime: Math.floor(Math.random() * 2000),
        averageSessionTime: 30 + Math.floor(Math.random() * 60),
        longestStreak: Math.floor(Math.random() * 20),
        currentStreak: Math.floor(Math.random() * 10),
        sportRanks: {
          'Basketball': Math.floor(Math.random() * 50) + 1,
          'Soccer': Math.floor(Math.random() * 50) + 1
        }
      };

      userData.set(userId, {
        userId,
        userName: `Athlete ${i + 1}`,
        userAvatar: `/avatars/user${i + 1}.jpg`,
        stats,
        engagementScore: baseScore,
        level: Math.floor(baseScore / 100) + 1,
        badges: []
      });
    }

    this.saveUserRankingData(userData);

    // Generate initial leaderboards
    await this.refreshAllLeaderboards();
  }
}

// Export singleton instance
export const leaderboardService = new LeaderboardService();
export default leaderboardService;