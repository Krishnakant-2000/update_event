import { Challenge, Leaderboard } from './engagement.types';
import { ActivityEvent } from './realtime.types';
import { MentorshipOpportunity, Poll, QASession, LiveDiscussion } from './social.types';

export enum EventCategory {
  UPCOMING = 'upcoming',
  ONGOING_TOURNAMENT = 'ongoing_tournament',
  AMAPLAYER = 'amaplayer'
}

export enum EventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum EventType {
  TALENT_HUNT = 'talent_hunt',
  COMMUNITY = 'community',
  TOURNAMENT = 'tournament'
}

export enum HostType {
  AMAPLAYER_OFFICIAL = 'amaplayer_official',
  USER = 'user'
}

export enum ParticipationType {
  GOING = 'going',
  INTERESTED = 'interested',
  MAYBE = 'maybe'
}

export type ReactionType = '🔥' | '💪' | '⚡' | '👏' | '❤️';

export interface Event {
  id: string;
  title: string;
  description: string;
  sport: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  status: EventStatus;
  category: EventCategory;
  createdBy: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  participantCount?: number;
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;

  // New fields for Week 1
  eventType: EventType;
  hostType: HostType;
  participantIds: string[];
  interestedIds: string[];
  maybeIds: string[];
  reactions: EventReaction[];
  viewCount: number;
  shareCount: number;
  commentCount: number;
  isTrending: boolean;
  maxParticipants?: number;

  // Talent Hunt specific
  prizes?: string[];
  rules?: string;
  submissionDeadline?: Date;
  votingDeadline?: Date;
  submissionCount?: number;
}

// Enhanced Event with Engagement Features
export interface EnhancedEvent extends Event {
  // Real-time engagement
  liveParticipants: string[];
  activityFeed: ActivityEvent[];
  
  // Gamification
  challenges: Challenge[];
  leaderboards: Leaderboard[];
  
  // Social features
  mentorshipOpportunities: MentorshipOpportunity[];
  polls: Poll[];
  qaSessions: QASession[];
  liveDiscussions: LiveDiscussion[];
  
  // Analytics and engagement metrics
  engagementMetrics: EngagementMetrics;
  trendingScore: number;
  peakConcurrentUsers: number;
  averageEngagementTime: number;
  
  // Enhanced social features
  customEmojis: string[]; // IDs of available custom emojis for this event
  celebrationGifs: string[]; // URLs of celebration GIFs
  motivationalMessages: string[]; // Template IDs for motivational messages
}

export interface EventReaction {
  userId: string;
  userName: string;
  userAvatar?: string;
  reactionType: ReactionType;
  timestamp: Date;
}

export interface EventParticipation {
  userId: string;
  userName: string;
  userAvatar?: string;
  eventId: string;
  type: ParticipationType;
  timestamp: Date;
}

export interface EventComment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  likedBy: string[];
  replyTo?: string;
}

export interface Submission {
  id: string;
  eventId: string;
  athleteId: string;
  athleteName: string;
  athleteAvatar?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  sport: string;
  uploadDate: Date;
  voteCount: number;
  voterIds: string[];
  rank?: number;
  isWinner: boolean;
  videoSize: number; // bytes (max 50MB)
}

export interface CreateEventDTO {
  title: string;
  description: string;
  sport: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  videoFile?: File;

  // New fields
  eventType?: EventType;
  maxParticipants?: number;
  prizes?: string[];
  rules?: string;
  submissionDeadline?: Date;
  votingDeadline?: Date;
}

export interface EventFilters {
  category: EventCategory;
  sport?: string;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  eventType?: EventType;
  isTrending?: boolean;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Mock user for testing (will be replaced by parent app auth)
export interface MockUser {
  id: string;
  name: string;
  avatar: string;
  email?: string;
}

// Reaction summary for displaying counts (deprecated - use ReactionSummary from social.types.ts)
export interface ReactionSummary {
  [key: string]: number; // reactionType -> count
  total: number;
}

// Event metrics for display
export interface EventMetrics {
  views: number;
  reactions: number;
  comments: number;
  shares: number;
  participants: number;
}

// Enhanced engagement metrics
export interface EngagementMetrics {
  // Basic metrics
  views: number;
  reactions: number;
  comments: number;
  shares: number;
  participants: number;
  
  // Advanced engagement metrics
  averageEngagementTime: number;
  peakConcurrentUsers: number;
  totalInteractions: number;
  uniqueInteractors: number;
  
  // Real-time metrics
  currentActiveUsers: number;
  activitiesPerMinute: number;
  
  // Gamification metrics
  challengeParticipation: number;
  achievementsEarned: number;
  badgesAwarded: number;
  
  // Social metrics
  mentorshipConnections: number;
  teamFormations: number;
  pollParticipation: number;
  qaParticipation: number;
  
  // Quality metrics
  averageRating?: number;
  completionRate: number;
  returnVisitorRate: number;
}
