import { Event, EventFilters, CreateEventDTO, EventCategory, EventStatus, EventType, HostType } from '../types/event.types';

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

// LocalStorage keys
const STORAGE_KEY = 'events_data';
const STORAGE_COUNTER_KEY = 'events_counter';

class EventService {
    /**
     * Initialize localStorage with empty array if not exists
     */
    private initializeStorage(): void {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_COUNTER_KEY)) {
            localStorage.setItem(STORAGE_COUNTER_KEY, '1');
        }
    }

    /**
     * Get all events from localStorage
     */
    private getStoredEvents(): Event[] {
        this.initializeStorage();
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];

        const events = JSON.parse(data);
        // Convert date strings back to Date objects
        return events.map((event: any) => ({
            ...event,
            startDate: new Date(event.startDate),
            endDate: event.endDate ? new Date(event.endDate) : undefined,
            createdAt: new Date(event.createdAt),
            updatedAt: new Date(event.updatedAt),
        }));
    }

    /**
     * Save events to localStorage
     */
    private saveEvents(events: Event[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }

    /**
     * Generate next ID
     */
    private getNextId(): string {
        const counter = parseInt(localStorage.getItem(STORAGE_COUNTER_KEY) || '1');
        localStorage.setItem(STORAGE_COUNTER_KEY, (counter + 1).toString());
        return `event_${counter}`;
    }

    /**
     * Convert File to base64 for storage
     */
    private async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Determine event status based on dates
     */
    private determineStatus(startDate: Date, endDate?: Date): EventStatus {
        const now = new Date();
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : start;

        if (now < start) {
            return EventStatus.UPCOMING;
        } else if (now > end) {
            return EventStatus.COMPLETED;
        } else {
            return EventStatus.ONGOING;
        }
    }

    /**
     * Filter events based on criteria
     */
    private filterEvents(events: Event[], filters: EventFilters): Event[] {
        return events.filter(event => {
            // Category filter
            if (filters.category && event.category !== filters.category) {
                return false;
            }

            // Sport filter
            if (filters.sport && event.sport.toLowerCase() !== filters.sport.toLowerCase()) {
                return false;
            }

            // Location filter
            if (filters.location && !event.location.toLowerCase().includes(filters.location.toLowerCase())) {
                return false;
            }

            // Date range filter
            if (filters.dateRange) {
                const eventStart = new Date(event.startDate);
                const filterStart = new Date(filters.dateRange.start);
                const filterEnd = new Date(filters.dateRange.end);

                if (eventStart < filterStart || eventStart > filterEnd) {
                    return false;
                }
            }

            return true;
        });
    }

    async getEvents(filters: EventFilters): Promise<Event[]> {
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));

            const allEvents = this.getStoredEvents();
            const filteredEvents = this.filterEvents(allEvents, filters);

            return filteredEvents;
        } catch (error) {
            throw new APIError(500, 'Failed to retrieve events from storage.', error);
        }
    }

    async getEventById(id: string): Promise<Event> {
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 200));

            const events = this.getStoredEvents();
            const event = events.find(e => e.id === id);

            if (!event) {
                throw new APIError(404, 'Event not found');
            }

            return event;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(500, 'Failed to retrieve event from storage.', error);
        }
    }

    async createEvent(data: CreateEventDTO): Promise<Event> {
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const events = this.getStoredEvents();
            const now = new Date();

            // Handle video file
            let videoUrl: string | undefined;
            let thumbnailUrl: string | undefined;

            if (data.videoFile) {
                // Convert video to base64 for storage
                videoUrl = await this.fileToBase64(data.videoFile);
                // Create a simple thumbnail (in real app, you'd generate from video)
                thumbnailUrl = videoUrl;
            }

            // Determine category based on status and dates
            const status = this.determineStatus(data.startDate, data.endDate);
            let category: EventCategory;

            if (status === EventStatus.UPCOMING) {
                category = EventCategory.UPCOMING;
            } else if (status === EventStatus.ONGOING) {
                category = EventCategory.ONGOING_TOURNAMENT;
            } else {
                category = EventCategory.AMAPLAYER;
            }

            // Determine event type and host type
            const eventType = data.eventType || EventType.COMMUNITY;
            const hostType = eventType === EventType.TALENT_HUNT ? HostType.AMAPLAYER_OFFICIAL : HostType.USER;

            const newEvent: Event = {
                id: this.getNextId(),
                title: data.title,
                description: data.description,
                sport: data.sport,
                location: data.location,
                startDate: data.startDate,
                endDate: data.endDate,
                status,
                category,
                createdBy: 'test-user',
                videoUrl,
                thumbnailUrl,
                participantCount: 0,
                isOfficial: eventType === EventType.TALENT_HUNT,
                createdAt: now,
                updatedAt: now,

                // New fields with defaults
                eventType,
                hostType,
                participantIds: [],
                interestedIds: [],
                maybeIds: [],
                reactions: [],
                viewCount: 0,
                shareCount: 0,
                commentCount: 0,
                isTrending: false,
                maxParticipants: data.maxParticipants,
                prizes: data.prizes,
                rules: data.rules,
                submissionDeadline: data.submissionDeadline,
                votingDeadline: data.votingDeadline,
                submissionCount: 0,
            };

            events.push(newEvent);
            this.saveEvents(events);

            return newEvent;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(500, 'Failed to create event.', error);
        }
    }

    async updateEvent(id: string, data: Partial<CreateEventDTO>): Promise<Event> {
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const events = this.getStoredEvents();
            const eventIndex = events.findIndex(e => e.id === id);

            if (eventIndex === -1) {
                throw new APIError(404, 'Event not found');
            }

            const existingEvent = events[eventIndex];

            // Handle video file if provided
            let videoUrl = existingEvent.videoUrl;
            let thumbnailUrl = existingEvent.thumbnailUrl;

            if (data.videoFile) {
                videoUrl = await this.fileToBase64(data.videoFile);
                thumbnailUrl = videoUrl;
            }

            // Update event
            const updatedEvent: Event = {
                ...existingEvent,
                title: data.title ?? existingEvent.title,
                description: data.description ?? existingEvent.description,
                sport: data.sport ?? existingEvent.sport,
                location: data.location ?? existingEvent.location,
                startDate: data.startDate ?? existingEvent.startDate,
                endDate: data.endDate ?? existingEvent.endDate,
                videoUrl,
                thumbnailUrl,
                updatedAt: new Date(),
            };

            // Update status based on new dates
            updatedEvent.status = this.determineStatus(updatedEvent.startDate, updatedEvent.endDate);

            events[eventIndex] = updatedEvent;
            this.saveEvents(events);

            return updatedEvent;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(500, 'Failed to update event.', error);
        }
    }

    async deleteEvent(id: string): Promise<void> {
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));

            const events = this.getStoredEvents();
            const filteredEvents = events.filter(e => e.id !== id);

            if (events.length === filteredEvents.length) {
                throw new APIError(404, 'Event not found');
            }

            this.saveEvents(filteredEvents);
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(500, 'Failed to delete event.', error);
        }
    }

    /**
     * Utility method to clear all events (for testing)
     */
    clearAllEvents(): void {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_COUNTER_KEY);
        this.initializeStorage();
    }

    /**
     * Increment view count for an event
     */
    async incrementViewCount(eventId: string): Promise<void> {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const events = this.getStoredEvents();
            const eventIndex = events.findIndex(e => e.id === eventId);

            if (eventIndex !== -1) {
                events[eventIndex].viewCount += 1;
                this.saveEvents(events);
            }
        } catch (error) {
            console.error('Failed to increment view count:', error);
        }
    }

    /**
     * Update event metrics
     */
    async updateEventMetrics(eventId: string, updates: Partial<Event>): Promise<void> {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const events = this.getStoredEvents();
            const eventIndex = events.findIndex(e => e.id === eventId);

            if (eventIndex !== -1) {
                events[eventIndex] = { ...events[eventIndex], ...updates, updatedAt: new Date() };
                this.saveEvents(events);
            }
        } catch (error) {
            throw new APIError(500, 'Failed to update event metrics.', error);
        }
    }

    /**
     * Calculate and mark trending events
     */
    markTrendingEvents(): void {
        const events = this.getStoredEvents();
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        events.forEach(event => {
            // Calculate engagement score
            const recentEngagement = event.viewCount +
                                    (event.reactions.length * 2) +
                                    (event.commentCount * 3) +
                                    (event.participantIds.length * 5);

            // Mark as trending if engagement score is high and event is within last 7 days
            const eventAge = now.getTime() - new Date(event.createdAt).getTime();
            const isRecent = eventAge < 7 * 24 * 60 * 60 * 1000;

            event.isTrending = isRecent && recentEngagement > 50;
        });

        this.saveEvents(events);
    }

    /**
     * Utility method to seed sample data (for testing)
     */
    async seedSampleData(): Promise<void> {
        const sampleEvents: CreateEventDTO[] = [
            {
                title: 'AmaPlayer Talent Hunt - Basketball Edition',
                description: 'Show us your best basketball skills! Submit your highlight reel for a chance to win amazing prizes and get featured on AmaPlayer.',
                sport: 'Basketball',
                location: 'Online Competition',
                startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                eventType: EventType.TALENT_HUNT,
                prizes: ['$1000 Cash Prize', 'AmaPlayer Pro Membership', 'Featured Profile'],
                rules: '1. Video must be under 50MB\n2. Showcase your best skills\n3. Original content only',
                submissionDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                votingDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Community Soccer Match',
                description: 'Join us for a friendly soccer match this weekend! All skill levels welcome.',
                sport: 'Soccer',
                location: 'Central Park Soccer Field',
                startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                eventType: EventType.COMMUNITY,
                maxParticipants: 22,
            },
            {
                title: 'Spring Tennis Tournament',
                description: 'Competitive tennis tournament for intermediate to advanced players.',
                sport: 'Tennis',
                location: 'City Tennis Club',
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
                eventType: EventType.TOURNAMENT,
            },
            {
                title: 'Beach Volleyball Championship',
                description: 'Annual beach volleyball championship. Form your team and compete for glory!',
                sport: 'Volleyball',
                location: 'Santa Monica Beach',
                startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Ongoing
                endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                eventType: EventType.TOURNAMENT,
                maxParticipants: 64,
            },
            {
                title: 'Morning Running Club',
                description: 'Join our running club for a refreshing morning run. All paces welcome!',
                sport: 'Athletics',
                location: 'Riverside Trail',
                startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                eventType: EventType.COMMUNITY,
            },
        ];

        for (const event of sampleEvents) {
            const createdEvent = await this.createEvent(event);

            // Add some mock engagement data
            const events = this.getStoredEvents();
            const eventIndex = events.findIndex(e => e.id === createdEvent.id);

            if (eventIndex !== -1) {
                // Add mock views and reactions
                events[eventIndex].viewCount = Math.floor(Math.random() * 200) + 50;
                events[eventIndex].commentCount = Math.floor(Math.random() * 15);
                events[eventIndex].shareCount = Math.floor(Math.random() * 10);

                // Add some mock participants
                const participantCount = Math.floor(Math.random() * 30) + 5;
                for (let i = 0; i < participantCount; i++) {
                    events[eventIndex].participantIds.push(`user_${i}`);
                }

                const interestedCount = Math.floor(Math.random() * 20);
                for (let i = 0; i < interestedCount; i++) {
                    events[eventIndex].interestedIds.push(`user_${100 + i}`);
                }

                this.saveEvents(events);
            }
        }

        // Mark trending events
        this.markTrendingEvents();
    }
}

// Export singleton instance
export const eventService = new EventService();
export default eventService;
