import { EventParticipation, ParticipationType, MockUser } from '../types/event.types';
import { eventService } from './eventService';

// LocalStorage key for participation data
const PARTICIPATION_STORAGE_KEY = 'event_participations';

// Mock users for testing (will be replaced by parent app auth)
export const mockUsers: MockUser[] = [
    { id: 'user_1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', email: 'john@example.com' },
    { id: 'user_2', name: 'Sarah Smith', avatar: 'https://i.pravatar.cc/150?img=2', email: 'sarah@example.com' },
    { id: 'user_3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3', email: 'mike@example.com' },
    { id: 'user_4', name: 'Emily Davis', avatar: 'https://i.pravatar.cc/150?img=4', email: 'emily@example.com' },
    { id: 'user_5', name: 'Alex Wilson', avatar: 'https://i.pravatar.cc/150?img=5', email: 'alex@example.com' },
    { id: 'user_6', name: 'Jessica Brown', avatar: 'https://i.pravatar.cc/150?img=6', email: 'jessica@example.com' },
    { id: 'user_7', name: 'David Lee', avatar: 'https://i.pravatar.cc/150?img=7', email: 'david@example.com' },
    { id: 'user_8', name: 'Maria Garcia', avatar: 'https://i.pravatar.cc/150?img=8', email: 'maria@example.com' },
    { id: 'user_9', name: 'Chris Taylor', avatar: 'https://i.pravatar.cc/150?img=9', email: 'chris@example.com' },
    { id: 'user_10', name: 'Lisa Anderson', avatar: 'https://i.pravatar.cc/150?img=10', email: 'lisa@example.com' },
];

// Current user (will be passed from parent app)
export const currentMockUser: MockUser = mockUsers[0];

class ParticipationService {
    /**
     * Initialize localStorage for participations
     */
    private initializeStorage(): void {
        if (!localStorage.getItem(PARTICIPATION_STORAGE_KEY)) {
            localStorage.setItem(PARTICIPATION_STORAGE_KEY, JSON.stringify([]));
        }
    }

    /**
     * Get all participations from localStorage
     */
    private getStoredParticipations(): EventParticipation[] {
        this.initializeStorage();
        const data = localStorage.getItem(PARTICIPATION_STORAGE_KEY);
        if (!data) return [];

        const participations = JSON.parse(data);
        return participations.map((p: any) => ({
            ...p,
            timestamp: new Date(p.timestamp),
        }));
    }

    /**
     * Save participations to localStorage
     */
    private saveParticipations(participations: EventParticipation[]): void {
        localStorage.setItem(PARTICIPATION_STORAGE_KEY, JSON.stringify(participations));
    }

    /**
     * Get mock user by ID
     */
    private getMockUser(userId: string): MockUser | undefined {
        return mockUsers.find(u => u.id === userId);
    }

    /**
     * Join an event or update participation type
     */
    async joinEvent(
        eventId: string,
        userId: string,
        type: ParticipationType
    ): Promise<EventParticipation> {
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));

            const participations = this.getStoredParticipations();

            // Check if user already has a participation for this event
            const existingIndex = participations.findIndex(
                p => p.eventId === eventId && p.userId === userId
            );

            const user = this.getMockUser(userId) || currentMockUser;

            const participation: EventParticipation = {
                userId,
                userName: user.name,
                userAvatar: user.avatar,
                eventId,
                type,
                timestamp: new Date(),
            };

            if (existingIndex >= 0) {
                // Update existing participation
                participations[existingIndex] = participation;
            } else {
                // Add new participation
                participations.push(participation);
            }

            this.saveParticipations(participations);

            // Update event participant counts
            await this.updateEventCounts(eventId);

            return participation;
        } catch (error) {
            throw new Error('Failed to join event');
        }
    }

    /**
     * Leave an event (remove participation)
     */
    async leaveEvent(eventId: string, userId: string): Promise<void> {
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));

            const participations = this.getStoredParticipations();
            const filteredParticipations = participations.filter(
                p => !(p.eventId === eventId && p.userId === userId)
            );

            this.saveParticipations(filteredParticipations);

            // Update event participant counts
            await this.updateEventCounts(eventId);
        } catch (error) {
            throw new Error('Failed to leave event');
        }
    }

    /**
     * Get all participants for an event
     */
    async getParticipants(eventId: string): Promise<EventParticipation[]> {
        try {
            await new Promise(resolve => setTimeout(resolve, 200));

            const participations = this.getStoredParticipations();
            return participations.filter(p => p.eventId === eventId);
        } catch (error) {
            throw new Error('Failed to get participants');
        }
    }

    /**
     * Get participants by type
     */
    async getParticipantsByType(
        eventId: string,
        type: ParticipationType
    ): Promise<EventParticipation[]> {
        const participants = await this.getParticipants(eventId);
        return participants.filter(p => p.type === type);
    }

    /**
     * Get user's participation for an event
     */
    async getParticipation(
        eventId: string,
        userId: string
    ): Promise<EventParticipation | null> {
        const participations = this.getStoredParticipations();
        const participation = participations.find(
            p => p.eventId === eventId && p.userId === userId
        );

        return participation || null;
    }

    /**
     * Check if user is participating in an event
     */
    async isParticipating(eventId: string, userId: string): Promise<boolean> {
        const participation = await this.getParticipation(eventId, userId);
        return participation !== null;
    }

    /**
     * Get participation counts for an event
     */
    async getParticipationCounts(eventId: string): Promise<{
        going: number;
        interested: number;
        maybe: number;
        total: number;
    }> {
        const participants = await this.getParticipants(eventId);

        const going = participants.filter(p => p.type === ParticipationType.GOING).length;
        const interested = participants.filter(p => p.type === ParticipationType.INTERESTED).length;
        const maybe = participants.filter(p => p.type === ParticipationType.MAYBE).length;

        return {
            going,
            interested,
            maybe,
            total: going + interested + maybe,
        };
    }

    /**
     * Update event participant counts in event service
     */
    private async updateEventCounts(eventId: string): Promise<void> {
        const participations = await this.getParticipants(eventId);

        const goingIds = participations
            .filter(p => p.type === ParticipationType.GOING)
            .map(p => p.userId);

        const interestedIds = participations
            .filter(p => p.type === ParticipationType.INTERESTED)
            .map(p => p.userId);

        const maybeIds = participations
            .filter(p => p.type === ParticipationType.MAYBE)
            .map(p => p.userId);

        const participantCount = goingIds.length + interestedIds.length + maybeIds.length;

        await eventService.updateEventMetrics(eventId, {
            participantIds: goingIds,
            interestedIds,
            maybeIds,
            participantCount,
        });
    }

    /**
     * Get all events a user is participating in
     */
    async getUserEvents(userId: string): Promise<EventParticipation[]> {
        const participations = this.getStoredParticipations();
        return participations.filter(p => p.userId === userId);
    }

    /**
     * Check if event is at capacity
     */
    async isEventFull(eventId: string, maxParticipants?: number): Promise<boolean> {
        if (!maxParticipants) return false;

        const counts = await this.getParticipationCounts(eventId);
        return counts.going >= maxParticipants;
    }

    /**
     * Clear all participations (for testing)
     */
    clearAllParticipations(): void {
        localStorage.removeItem(PARTICIPATION_STORAGE_KEY);
        this.initializeStorage();
    }
}

// Export singleton instance
export const participationService = new ParticipationService();
export default participationService;
