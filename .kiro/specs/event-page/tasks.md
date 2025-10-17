# Implementation Plan

- [x] 1. Set up project structure and TypeScript types




  - Create directory structure for components, services, hooks, types, and utils
  - Define core TypeScript interfaces and enums in `types/event.types.ts` and `types/form.types.ts`
  - Set up constants file with sports list, file size limits, and accepted video formats
  - _Requirements: 1.1, 5.1, 6.1, 7.1, 8.1, 9.1_

- [x] 2. Implement validation utilities





  - Create form validation functions in `utils/validation.ts` for description, sport, location, and video file
  - Implement video file validation (format and size checks)
  - Add validation error message constants
  - _Requirements: 6.2, 6.3, 7.4, 8.2, 9.3, 9.4, 10.2_

- [x] 3. Create API service layer





- [x] 3.1 Implement event service


  - Create `services/eventService.ts` with methods for fetching events by category, creating events, and getting event details
  - Implement API error handling with typed error responses
  - Add request/response type definitions
  - _Requirements: 2.1, 3.1, 4.1, 10.3, 10.6_

- [x] 3.2 Implement upload service


  - Create `services/uploadService.ts` with video upload functionality
  - Add upload progress tracking
  - Implement file validation in the service layer
  - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [x] 3.3 Implement location service


  - Create `services/locationService.ts` with location search functionality
  - Add debouncing for autocomplete requests
  - _Requirements: 8.3_
-

- [x] 4. Build custom hooks


- [x] 4.1 Create useEvents hook


  - Implement `hooks/useEvents.ts` for fetching events by category
  - Add loading, error, and refetch states
  - Handle empty state scenarios
  - _Requirements: 2.1, 2.3, 3.1, 3.3, 4.1, 4.3_

- [x] 4.2 Create useEventForm hook


  - Implement `hooks/useEventForm.ts` for managing form state
  - Add field update handlers and form validation
  - Implement form submission logic with error handling
  - _Requirements: 6.1, 6.2, 6.4, 7.3, 8.2, 10.1, 10.2, 10.4_

- [x] 4.3 Create useVideoUpload hook


  - Implement `hooks/useVideoUpload.ts` for handling video uploads
  - Add upload progress tracking and cancellation
  - Handle upload errors
  - _Requirements: 9.2, 9.5_

- [x] 5. Build reusable UI components





- [x] 5.1 Create EventCard component


  - Implement `components/events/EventCard.tsx` to display individual event information
  - Add click handler for navigation to event details
  - Style card with event title, sport, location, date, and optional official badge
  - _Requirements: 2.2, 3.2, 4.2_

- [x] 5.2 Create EventList component


  - Implement `components/events/EventList.tsx` to render list of EventCard components
  - Add loading state display
  - Add empty state message when no events exist
  - Handle error state display
  - _Requirements: 2.1, 2.3, 2.4, 3.1, 3.3, 3.4, 4.1, 4.3, 4.4_

- [x] 5.3 Create EventTabs component


  - Implement `components/events/EventTabs.tsx` for category navigation
  - Add three tabs: Upcoming Events, Ongoing Tournaments, Events from AmaPlayer
  - Handle active tab state and tab change callbacks
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 5.4 Create VideoUpload component


  - Implement `components/common/VideoUpload.tsx` with file selection dialog
  - Add file validation and error display
  - Show upload preview or progress indicator
  - Add remove uploaded file functionality
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 5.5 Create LocationInput component


  - Implement `components/common/LocationInput.tsx` with text input
  - Add autocomplete suggestions dropdown
  - Handle location selection from suggestions
  - Display validation errors
  - _Requirements: 8.1, 8.2, 8.3, 8.4_
-

- [x] 6. Build event creation components



- [x] 6.1 Create CreateEventButton component


  - Implement `components/events/CreateEventButton.tsx` as a prominent CTA
  - Add click handler to open event creation form
  - Handle disabled state for unauthenticated users
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6.2 Create CreateEventForm component


  - Implement `components/events/CreateEventForm.tsx` with all form fields
  - Add description textarea with character count
  - Add sport selection dropdown
  - Integrate LocationInput component
  - Integrate VideoUpload component
  - Add date pickers for start and end dates
  - Add form submission and cancel buttons
  - Display validation errors for each field
  - Handle form submission with loading state
  - Show success message and redirect on successful creation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 8.1, 8.4, 9.1, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 7. Build main EventPage container





  - Implement `pages/EventPage.tsx` as the main container component
  - Add state management for active tab and create form visibility
  - Integrate EventTabs component with tab change handler
  - Integrate EventList component with category-based filtering
  - Integrate CreateEventButton component
  - Integrate CreateEventForm component with modal/overlay display
  - Handle navigation to event detail pages on event click
  - _Requirements: 1.1, 1.2, 1.3, 2.4, 3.4, 4.4, 5.1, 5.2_
-

- [x] 8. Add error handling and edge cases




  - Implement authentication check before showing create event form
  - Add network error handling with retry options
  - Handle API timeout scenarios
  - Add form validation error display for all fields
  - Implement graceful degradation for location autocomplete failures
  - _Requirements: 5.3, 10.4, 10.6_

- [x] 9. Implement accessibility features





  - Add ARIA labels to all interactive elements (tabs, buttons, form fields)
  - Ensure keyboard navigation works for tabs and form
  - Add focus management for modal form open/close
  - Implement ARIA live regions for validation errors
  - Test and fix color contrast issues
  - _Requirements: All requirements (accessibility is cross-cutting)_





- [ ] 10. Add performance optimizations

  - Implement lazy loading for event images and videos in EventCard
  - Add debouncing to location autocomplete search
  - Implement pagination or infinite scroll for EventList
  - Add caching for event list data
  - Optimize bundle size with code splitting for CreateEventForm
  - _Requirements: 2.1, 3.1, 4.1, 8.3_
