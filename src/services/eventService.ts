import { Event, EventFilters, CreateEventDTO } from '../types/event.types';

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

// API response types
interface APIResponse<T> {
    data: T;
    message?: string;
}

interface APIErrorResponse {
    error: string;
    message: string;
    details?: any;
}

// Base API configuration
const API_BASE_URL = '/api';
const API_TIMEOUT_MS = 30000; // 30 seconds timeout

class EventService {
    /**
     * Creates a fetch request with timeout support
     * Requirement 10.6: Handle API timeout scenarios
     */
    private async fetchWithTimeout(
        url: string,
        options: RequestInit,
        timeoutMs: number = API_TIMEOUT_MS
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new APIError(
                    408,
                    'Request timeout. Please check your connection and try again.',
                    { timeout: true }
                );
            }
            throw error;
        }
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData: APIErrorResponse = await response.json().catch(() => ({
                error: 'Unknown error',
                message: 'An unexpected error occurred'
            }));

            throw new APIError(
                response.status,
                errorData.message || 'An error occurred',
                errorData.details
            );
        }

        const result: APIResponse<T> = await response.json();
        return result.data;
    }

    private buildQueryString(filters: Partial<EventFilters>): string {
        const params = new URLSearchParams();

        if (filters.category) {
            params.append('category', filters.category);
        }
        if (filters.sport) {
            params.append('sport', filters.sport);
        }
        if (filters.location) {
            params.append('location', filters.location);
        }
        if (filters.dateRange) {
            params.append('startDate', filters.dateRange.start.toISOString());
            params.append('endDate', filters.dateRange.end.toISOString());
        }

        return params.toString();
    }

    async getEvents(filters: EventFilters): Promise<Event[]> {
        try {
            const queryString = this.buildQueryString(filters);
            const url = `${API_BASE_URL}/events${queryString ? `?${queryString}` : ''}`;

            const response = await this.fetchWithTimeout(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const events = await this.handleResponse<Event[]>(response);

            // Convert date strings to Date objects
            return events.map(event => ({
                ...event,
                startDate: new Date(event.startDate),
                endDate: event.endDate ? new Date(event.endDate) : undefined,
                createdAt: new Date(event.createdAt),
                updatedAt: new Date(event.updatedAt),
            }));
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(500, 'Network error occurred. Please check your connection.', error);
        }
    }

    async getEventById(id: string): Promise<Event> {
        try {
            const response = await this.fetchWithTimeout(`${API_BASE_URL}/events/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const event = await this.handleResponse<Event>(response);

            // Convert date strings to Date objects
            return {
                ...event,
                startDate: new Date(event.startDate),
                endDate: event.endDate ? new Date(event.endDate) : undefined,
                createdAt: new Date(event.createdAt),
                updatedAt: new Date(event.updatedAt),
            };
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(500, 'Network error occurred. Please check your connection.', error);
        }
    }

    async createEvent(data: CreateEventDTO): Promise<Event> {
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('sport', data.sport);
            formData.append('location', data.location);
            formData.append('startDate', data.startDate.toISOString());

            if (data.endDate) {
                formData.append('endDate', data.endDate.toISOString());
            }

            if (data.videoFile) {
                formData.append('video', data.videoFile);
            }

            // Use longer timeout for file uploads
            const timeout = data.videoFile ? 120000 : API_TIMEOUT_MS; // 2 minutes for video uploads
            const response = await this.fetchWithTimeout(`${API_BASE_URL}/events`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            }, timeout);

            const event = await this.handleResponse<Event>(response);

            // Convert date strings to Date objects
            return {
                ...event,
                startDate: new Date(event.startDate),
                endDate: event.endDate ? new Date(event.endDate) : undefined,
                createdAt: new Date(event.createdAt),
                updatedAt: new Date(event.updatedAt),
            };
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(500, 'Network error occurred. Please check your connection.', error);
        }
    }

    async updateEvent(id: string, data: Partial<CreateEventDTO>): Promise<Event> {
        try {
            const formData = new FormData();

            if (data.title) formData.append('title', data.title);
            if (data.description) formData.append('description', data.description);
            if (data.sport) formData.append('sport', data.sport);
            if (data.location) formData.append('location', data.location);
            if (data.startDate) formData.append('startDate', data.startDate.toISOString());
            if (data.endDate) formData.append('endDate', data.endDate.toISOString());
            if (data.videoFile) formData.append('video', data.videoFile);

            // Use longer timeout for file uploads
            const timeout = data.videoFile ? 120000 : API_TIMEOUT_MS;
            const response = await this.fetchWithTimeout(`${API_BASE_URL}/events/${id}`, {
                method: 'PATCH',
                body: formData,
                credentials: 'include',
            }, timeout);

            const event = await this.handleResponse<Event>(response);

            // Convert date strings to Date objects
            return {
                ...event,
                startDate: new Date(event.startDate),
                endDate: event.endDate ? new Date(event.endDate) : undefined,
                createdAt: new Date(event.createdAt),
                updatedAt: new Date(event.updatedAt),
            };
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(500, 'Network error occurred. Please check your connection.', error);
        }
    }

    async deleteEvent(id: string): Promise<void> {
        try {
            const response = await this.fetchWithTimeout(`${API_BASE_URL}/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData: APIErrorResponse = await response.json().catch(() => ({
                    error: 'Unknown error',
                    message: 'An unexpected error occurred'
                }));

                throw new APIError(
                    response.status,
                    errorData.message || 'Failed to delete event',
                    errorData.details
                );
            }
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(500, 'Network error occurred. Please check your connection.', error);
        }
    }
}

// Export singleton instance
export const eventService = new EventService();
export default eventService;
