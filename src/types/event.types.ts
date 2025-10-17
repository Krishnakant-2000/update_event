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
}

export interface CreateEventDTO {
  title: string;
  description: string;
  sport: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  videoFile?: File;
}

export interface EventFilters {
  category: EventCategory;
  sport?: string;
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
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
