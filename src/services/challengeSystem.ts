import { 
  Challenge, 
  ChallengeType, 
  ChallengeStatus, 
  ChallengeSubmission, 
  Reward, 
  RewardType,
  Leaderboard,
  LeaderboardEntry,
  LeaderboardType,
  LeaderboardPeriod,
  RankChange
} from '../types/engagement.types';

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

// Challenge result interface for completion tracking
export interface ChallengeResult {
  challengeId: string;
  winnerId: string;
  winnerName: string;
  winnerScore: number;
  totalParticipants: number;
  completedAt: Date;
}

// LocalStorage keys
const CHALLENGES_STORAGE_KEY = 'challenges_data';
const CHALLENGE_SUBMISSIONS_STORAGE_KEY = 'challenge_submissions_data';
const CHALLENGE_COUNTER_KEY = 'challenge_counter';

class ChallengeSystem {
  private sportChallengeTemplates: Record<string, ChallengeType[]> = {
    'Basketball': [ChallengeType.SKILL_SHOWCASE, ChallengeType.CREATIVITY, ChallengeType.PHOTO_CONTEST],
    'Soccer': [ChallengeType.SKILL_SHOWCASE, ChallengeType.ENDURANCE, ChallengeType.TEAM_COLLABORATION],
    'Tennis': [ChallengeType.SKILL_SHOWCASE, ChallengeType.ENDURANCE, ChallengeType.KNOWLEDGE_QUIZ],
    'Volleyball': [ChallengeType.TEAM_COLLABORATION, ChallengeType.SKILL_SHOWCASE, ChallengeType.CREATIVITY],
    'Athletics': [ChallengeType.ENDURANCE, ChallengeType.PHOTO_CONTEST, ChallengeType.SKILL_SHOWCASE],
    'Swimming': [ChallengeType.ENDURANCE, ChallengeType.SKILL_SHOWCASE, ChallengeType.PHOTO_CONTEST],
    'Baseball': [ChallengeType.SKILL_SHOWCASE, ChallengeType.TEAM_COLLABORATION, ChallengeType.KNOWLEDGE_QUIZ],
    'Football': [ChallengeType.SKILL_SHOWCASE, ChallengeType.TEAM_COLLABORATION, ChallengeType.ENDURANCE]
  };

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize localStorage with default data
   */
  private initializeStorage(): void {
    if (!localStorage.getItem(CHALLENGES_STORAGE_KEY)) {
      localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(CHALLENGE_SUBMISSIONS_STORAGE_KEY)) {
      localStorage.setItem(CHALLENGE_SUBMISSIONS_STORAGE_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(CHALLENGE_COUNTER_KEY)) {
      localStorage.setItem(CHALLENGE_COUNTER_KEY, '1');
    }
  }

  /**
   * Generate next challenge ID
   */
  private getNextId(): string {
    const counter = parseInt(localStorage.getItem(CHALLENGE_COUNTER_KEY) || '1');
    localStorage.setItem(CHALLENGE_COUNTER_KEY, (counter + 1).toString());
    return `challenge_${counter}`;
  }

  /**
   * Get stored challenges
   */
  private getStoredChallenges(): Challenge[] {
    const data = localStorage.getItem(CHALLENGES_STORAGE_KEY);
    if (!data) return [];

    const challenges = JSON.parse(data);
    return challenges.map((challenge: any) => ({
      ...challenge,
      startDate: new Date(challenge.startDate),
      endDate: new Date(challenge.endDate),
      createdAt: new Date(challenge.createdAt)
    }));
  }

  /**
   * Save challenges to storage
   */
  private saveChallenges(challenges: Challenge[]): void {
    localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challenges));
  }

  /**
   * Get stored challenge submissions
   */
  private getStoredSubmissions(): ChallengeSubmission[] {
    const data = localStorage.getItem(CHALLENGE_SUBMISSIONS_STORAGE_KEY);
    if (!data) return [];

    const submissions = JSON.parse(data);
    return submissions.map((submission: any) => ({
      ...submission,
      submittedAt: new Date(submission.submittedAt)
    }));
  }

  /**
   * Save challenge submissions to storage
   */
  private saveSubmissions(submissions: ChallengeSubmission[]): void {
    localStorage.setItem(CHALLENGE_SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
  }

  /**
   * Generate challenge title and description based on type and sport
   */
  private generateChallengeContent(type: ChallengeType, sport: string): { title: string; description: string } {
    const templates = {
      [ChallengeType.SKILL_SHOWCASE]: {
        title: `${sport} Skills Showcase`,
        description: `Show off your best ${sport.toLowerCase()} skills! Upload a video demonstrating your technique and creativity.`
      },
      [ChallengeType.ENDURANCE]: {
        title: `${sport} Endurance Challenge`,
        description: `Test your stamina and endurance in this ${sport.toLowerCase()} challenge. Push your limits!`
      },
      [ChallengeType.CREATIVITY]: {
        title: `Creative ${sport} Challenge`,
        description: `Get creative with ${sport.toLowerCase()}! Show us something unique and innovative.`
      },
      [ChallengeType.TEAM_COLLABORATION]: {
        title: `${sport} Team Challenge`,
        description: `Work together with your team to complete this ${sport.toLowerCase()} collaboration challenge.`
      },
      [ChallengeType.KNOWLEDGE_QUIZ]: {
        title: `${sport} Knowledge Quiz`,
        description: `Test your knowledge about ${sport.toLowerCase()} rules, history, and techniques.`
      },
      [ChallengeType.PHOTO_CONTEST]: {
        title: `${sport} Photo Contest`,
        description: `Capture the perfect ${sport.toLowerCase()} moment! Submit your best action shots or creative photos.`
      }
    };

    return templates[type] || { title: `${sport} Challenge`, description: `Participate in this ${sport.toLowerCase()} challenge!` };
  }

  /**
   * Generate rewards based on challenge type and sport
   */
  private generateRewards(type: ChallengeType): Reward[] {
    const baseRewards: Reward[] = [
      {
        type: RewardType.POINTS,
        value: 50,
        description: 'Challenge completion points'
      }
    ];

    // Add type-specific rewards
    switch (type) {
      case ChallengeType.SKILL_SHOWCASE:
        baseRewards.push({
          type: RewardType.BADGE,
          value: 1,
          description: 'Skill Master badge',
          iconUrl: '/icons/badges/skill-master.svg'
        });
        break;
      case ChallengeType.ENDURANCE:
        baseRewards.push({
          type: RewardType.BADGE,
          value: 1,
          description: 'Endurance Champion badge',
          iconUrl: '/icons/badges/endurance-champion.svg'
        });
        break;
      case ChallengeType.CREATIVITY:
        baseRewards.push({
          type: RewardType.BADGE,
          value: 1,
          description: 'Creative Genius badge',
          iconUrl: '/icons/badges/creative-genius.svg'
        });
        break;
      case ChallengeType.TEAM_COLLABORATION:
        baseRewards.push({
          type: RewardType.BADGE,
          value: 1,
          description: 'Team Player badge',
          iconUrl: '/icons/badges/team-player.svg'
        });
        break;
      case ChallengeType.KNOWLEDGE_QUIZ:
        baseRewards.push({
          type: RewardType.TITLE,
          value: 1,
          description: 'Sport Scholar title'
        });
        break;
      case ChallengeType.PHOTO_CONTEST:
        baseRewards.push({
          type: RewardType.FEATURE,
          value: 1,
          description: 'Featured photo on event page'
        });
        break;
    }

    return baseRewards;
  }

  /**
   * Generate challenges based on sport types
   * Requirements: 3.1 - Challenge generation logic based on sport types
   */
  async generateChallenges(eventId: string, sport: string): Promise<Challenge[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const challengeTypes = this.sportChallengeTemplates[sport] || [
        ChallengeType.SKILL_SHOWCASE,
        ChallengeType.CREATIVITY,
        ChallengeType.PHOTO_CONTEST
      ];

      const challenges: Challenge[] = [];
      const now = new Date();
      const eventStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Start tomorrow
      
      challengeTypes.forEach((type, index) => {
        const content = this.generateChallengeContent(type, sport);
        const startDate = new Date(eventStart.getTime() + index * 2 * 24 * 60 * 60 * 1000); // Stagger starts
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days duration

        const challenge: Challenge = {
          id: this.getNextId(),
          eventId,
          title: content.title,
          description: content.description,
          type,
          sport,
          startDate,
          endDate,
          maxParticipants: type === ChallengeType.TEAM_COLLABORATION ? 50 : 100,
          rewards: this.generateRewards(type),
          participants: [],
          submissions: [],
          status: ChallengeStatus.UPCOMING,
          createdAt: now
        };

        challenges.push(challenge);
      });

      // Store generated challenges
      const existingChallenges = this.getStoredChallenges();
      const updatedChallenges = [...existingChallenges, ...challenges];
      this.saveChallenges(updatedChallenges);

      return challenges;
    } catch (error) {
      throw new APIError(500, 'Failed to generate challenges', error);
    }
  }

  /**
   * Handle challenge participation and submission
   * Requirements: 3.2 - Challenge participation and submission handling
   */
  async submitChallengeEntry(challengeId: string, userId: string, entry: any): Promise<void> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const challenges = this.getStoredChallenges();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);

      if (challengeIndex === -1) {
        throw new APIError(404, 'Challenge not found');
      }

      const challenge = challenges[challengeIndex];

      // Check if challenge is active
      const now = new Date();
      if (challenge.status !== ChallengeStatus.ACTIVE && 
          (now < challenge.startDate || now > challenge.endDate)) {
        throw new APIError(400, 'Challenge is not currently active');
      }

      // Check if user already participated
      if (challenge.participants.includes(userId)) {
        throw new APIError(400, 'User already participated in this challenge');
      }

      // Check max participants
      if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
        throw new APIError(400, 'Challenge has reached maximum participants');
      }

      // Create submission
      const submission: ChallengeSubmission = {
        id: `submission_${Date.now()}_${userId}`,
        challengeId,
        userId,
        userName: entry.userName || `User ${userId}`,
        userAvatar: entry.userAvatar,
        content: entry.content || '',
        mediaUrl: entry.mediaUrl,
        submittedAt: now,
        votes: 0,
        voterIds: []
      };

      // Update challenge
      challenge.participants.push(userId);
      challenge.submissions.push(submission);
      challenge.status = ChallengeStatus.ACTIVE;

      // Save updates
      challenges[challengeIndex] = challenge;
      this.saveChallenges(challenges);

      // Also store submission separately for easier querying
      const submissions = this.getStoredSubmissions();
      submissions.push(submission);
      this.saveSubmissions(submissions);

    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, 'Failed to submit challenge entry', error);
    }
  }

  /**
   * Get challenge leaderboard with real-time updates
   * Requirements: 3.3 - Challenge leaderboard with real-time updates
   */
  async getChallengeLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 150));

      const challenges = this.getStoredChallenges();
      const challenge = challenges.find(c => c.id === challengeId);

      if (!challenge) {
        throw new APIError(404, 'Challenge not found');
      }

      // Calculate scores for each submission
      const scoredSubmissions = challenge.submissions.map(submission => {
        // Score calculation based on votes and submission quality
        let score = submission.votes * 10; // Base score from votes
        
        // Bonus points for early submission
        const submissionTime = new Date(submission.submittedAt).getTime();
        const challengeStart = new Date(challenge.startDate).getTime();
        const challengeDuration = new Date(challenge.endDate).getTime() - challengeStart;
        const submissionDelay = submissionTime - challengeStart;
        const earlyBonus = Math.max(0, 20 - (submissionDelay / challengeDuration) * 20);
        score += earlyBonus;

        // Content quality bonus (simplified - in real app would use AI/ML)
        if (submission.content && submission.content.length > 50) {
          score += 5;
        }
        if (submission.mediaUrl) {
          score += 10;
        }

        return {
          ...submission,
          calculatedScore: Math.round(score)
        };
      });

      // Sort by score and create leaderboard entries
      const sortedSubmissions = scoredSubmissions.sort((a, b) => b.calculatedScore - a.calculatedScore);

      const leaderboardEntries: LeaderboardEntry[] = sortedSubmissions.map((submission, index) => ({
        userId: submission.userId,
        userName: submission.userName,
        userAvatar: submission.userAvatar,
        score: submission.calculatedScore,
        rank: index + 1,
        change: RankChange.SAME, // Would track changes in real implementation
        badges: [], // Would fetch user badges in real implementation
        level: Math.floor(submission.calculatedScore / 100) + 1
      }));

      return leaderboardEntries;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, 'Failed to get challenge leaderboard', error);
    }
  }

  /**
   * End challenge and determine winners
   * Requirements: 3.4 - Challenge completion tracking and scoring
   */
  async endChallenge(challengeId: string): Promise<ChallengeResult[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const challenges = this.getStoredChallenges();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);

      if (challengeIndex === -1) {
        throw new APIError(404, 'Challenge not found');
      }

      const challenge = challenges[challengeIndex];

      if (challenge.status === ChallengeStatus.COMPLETED) {
        throw new APIError(400, 'Challenge already completed');
      }

      // Get final leaderboard
      const leaderboard = await this.getChallengeLeaderboard(challengeId);

      if (leaderboard.length === 0) {
        throw new APIError(400, 'No participants to determine winners');
      }

      // Determine winners (top 3)
      const winners = leaderboard.slice(0, 3);
      const results: ChallengeResult[] = winners.map((winner, index) => ({
        challengeId,
        winnerId: winner.userId,
        winnerName: winner.userName,
        winnerScore: winner.score,
        totalParticipants: challenge.participants.length,
        completedAt: new Date()
      }));

      // Update challenge status
      challenge.status = ChallengeStatus.COMPLETED;
      challenges[challengeIndex] = challenge;
      this.saveChallenges(challenges);

      // Update submission ranks in both places
      const submissions = this.getStoredSubmissions();
      challenge.submissions.forEach((challengeSubmission, index) => {
        const submissionIndex = submissions.findIndex(s => s.id === challengeSubmission.id);
        const leaderboardEntry = leaderboard.find(entry => entry.userId === challengeSubmission.userId);
        
        if (leaderboardEntry) {
          // Update in separate submissions storage
          if (submissionIndex !== -1) {
            submissions[submissionIndex].rank = leaderboardEntry.rank;
            submissions[submissionIndex].score = leaderboardEntry.score;
          }
          
          // Update in challenge submissions array
          challengeSubmission.rank = leaderboardEntry.rank;
          challengeSubmission.score = leaderboardEntry.score;
        }
      });
      
      // Save both storages
      this.saveSubmissions(submissions);
      challenges[challengeIndex] = challenge;
      this.saveChallenges(challenges);

      return results;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, 'Failed to end challenge', error);
    }
  }

  /**
   * Get all challenges for an event
   */
  async getEventChallenges(eventId: string): Promise<Challenge[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const challenges = this.getStoredChallenges();
      return challenges.filter(c => c.eventId === eventId);
    } catch (error) {
      throw new APIError(500, 'Failed to get event challenges', error);
    }
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(challengeId: string): Promise<Challenge> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const challenges = this.getStoredChallenges();
      const challenge = challenges.find(c => c.id === challengeId);

      if (!challenge) {
        throw new APIError(404, 'Challenge not found');
      }

      return challenge;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, 'Failed to get challenge', error);
    }
  }

  /**
   * Vote on a challenge submission
   */
  async voteOnSubmission(submissionId: string, userId: string): Promise<void> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const submissions = this.getStoredSubmissions();
      const submissionIndex = submissions.findIndex(s => s.id === submissionId);

      if (submissionIndex === -1) {
        throw new APIError(404, 'Submission not found');
      }

      const submission = submissions[submissionIndex];

      // Check if user already voted
      if (submission.voterIds.includes(userId)) {
        throw new APIError(400, 'User already voted on this submission');
      }

      // Add vote
      submission.votes += 1;
      submission.voterIds.push(userId);

      submissions[submissionIndex] = submission;
      this.saveSubmissions(submissions);

      // Also update the submission in the challenge
      const challenges = this.getStoredChallenges();
      const challengeIndex = challenges.findIndex(c => c.id === submission.challengeId);
      if (challengeIndex !== -1) {
        const challenge = challenges[challengeIndex];
        const challengeSubmissionIndex = challenge.submissions.findIndex(s => s.id === submissionId);
        if (challengeSubmissionIndex !== -1) {
          challenge.submissions[challengeSubmissionIndex] = submission;
          challenges[challengeIndex] = challenge;
          this.saveChallenges(challenges);
        }
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, 'Failed to vote on submission', error);
    }
  }

  /**
   * Update challenge status based on current time
   */
  updateChallengeStatuses(): void {
    const challenges = this.getStoredChallenges();
    const now = new Date();
    let updated = false;

    challenges.forEach(challenge => {
      let newStatus = challenge.status;

      if (now >= challenge.startDate && now <= challenge.endDate && challenge.status === ChallengeStatus.UPCOMING) {
        newStatus = ChallengeStatus.ACTIVE;
        updated = true;
      } else if (now > challenge.endDate && challenge.status === ChallengeStatus.ACTIVE) {
        newStatus = ChallengeStatus.COMPLETED;
        updated = true;
      }

      challenge.status = newStatus;
    });

    if (updated) {
      this.saveChallenges(challenges);
    }
  }

  /**
   * Utility method to clear all challenge data (for testing)
   */
  clearAllChallengeData(): void {
    localStorage.removeItem(CHALLENGES_STORAGE_KEY);
    localStorage.removeItem(CHALLENGE_SUBMISSIONS_STORAGE_KEY);
    localStorage.removeItem(CHALLENGE_COUNTER_KEY);
    this.initializeStorage();
  }

  /**
   * Get featured challenges for display on main page
   */
  async getFeaturedChallenges(limit: number = 5): Promise<Challenge[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const challenges = this.getStoredChallenges();
      
      // Update statuses first
      this.updateChallengeStatuses();
      
      // Filter for active and upcoming challenges, sort by priority
      const featuredChallenges = challenges
        .filter(c => c.status === ChallengeStatus.ACTIVE || c.status === ChallengeStatus.UPCOMING)
        .sort((a, b) => {
          // Prioritize active challenges
          if (a.status === ChallengeStatus.ACTIVE && b.status !== ChallengeStatus.ACTIVE) return -1;
          if (b.status === ChallengeStatus.ACTIVE && a.status !== ChallengeStatus.ACTIVE) return 1;
          
          // Then by participant count (more popular first)
          return b.participants.length - a.participants.length;
        })
        .slice(0, limit);

      return featuredChallenges;
    } catch (error) {
      throw new APIError(500, 'Failed to get featured challenges', error);
    }
  }

  /**
   * Participate in a challenge (without submission)
   */
  async participateInChallenge(challengeId: string, userId: string): Promise<void> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 150));

      const challenges = this.getStoredChallenges();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);

      if (challengeIndex === -1) {
        throw new APIError(404, 'Challenge not found');
      }

      const challenge = challenges[challengeIndex];

      // Check if user already participated
      if (challenge.participants.includes(userId)) {
        throw new APIError(400, 'User already participating in this challenge');
      }

      // Check max participants
      if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
        throw new APIError(400, 'Challenge has reached maximum participants');
      }

      // Add user to participants
      challenge.participants.push(userId);
      
      // Update challenge status if it was upcoming
      if (challenge.status === ChallengeStatus.UPCOMING) {
        const now = new Date();
        if (now >= challenge.startDate) {
          challenge.status = ChallengeStatus.ACTIVE;
        }
      }

      // Save updates
      challenges[challengeIndex] = challenge;
      this.saveChallenges(challenges);

    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, 'Failed to participate in challenge', error);
    }
  }

  /**
   * Utility method to seed sample challenge data (for testing)
   */
  async seedSampleChallengeData(eventId: string = 'event_1', sport: string = 'Basketball'): Promise<void> {
    // Clear existing data first
    this.clearAllChallengeData();

    // Generate sample challenges
    const challenges = await this.generateChallenges(eventId, sport);

    // Add some sample submissions
    for (const challenge of challenges.slice(0, 2)) { // Only add submissions to first 2 challenges
      const sampleUsers = [
        { id: 'user_1', name: 'Alex Johnson', avatar: '/avatars/alex.jpg' },
        { id: 'user_2', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg' },
        { id: 'user_3', name: 'Mike Rodriguez', avatar: '/avatars/mike.jpg' }
      ];

      for (const user of sampleUsers) {
        await this.submitChallengeEntry(challenge.id, user.id, {
          userName: user.name,
          userAvatar: user.avatar,
          content: `This is my submission for the ${challenge.title}. I've been practicing this skill for months!`,
          mediaUrl: `/videos/submission_${user.id}_${challenge.id}.mp4`
        });

        // Add some votes
        const otherUsers = sampleUsers.filter(u => u.id !== user.id);
        for (const voter of otherUsers) {
          try {
            await this.voteOnSubmission(`submission_${Date.now()}_${user.id}`, voter.id);
          } catch (error) {
            // Ignore voting errors for sample data
          }
        }
      }
    }

    // Update challenge statuses
    this.updateChallengeStatuses();
  }
}

// Export singleton instance
export const challengeSystem = new ChallengeSystem();
export default challengeSystem;