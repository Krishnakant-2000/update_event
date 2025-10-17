import React, { useEffect, useRef } from 'react';
import { Event } from '../../types/event.types';
import { useEventForm } from '../../hooks/useEventForm';
import { VideoUpload } from '../common/VideoUpload';
import { LocationInput } from '../common/LocationInput';
import { SPORTS_LIST } from '../../utils/constants';

interface CreateEventFormProps {
    onCancel: () => void;
    onSuccess?: (event: Event) => void;
    isOpen: boolean;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
    onCancel,
    onSuccess,
    isOpen
}) => {
    const handleSuccess = (event: Event) => {
        // Form submission handled by useEventForm
        // This callback is called after successful creation
        onSuccess?.(event); // Notify parent of success
        onCancel(); // Close the form
    };

    const { formState, updateField, submitForm, resetForm } = useEventForm(handleSuccess);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Focus management: trap focus in modal and restore on close
    useEffect(() => {
        if (isOpen) {
            // Store the element that had focus before modal opened
            previousActiveElement.current = document.activeElement as HTMLElement;

            // Focus the close button when modal opens
            setTimeout(() => {
                closeButtonRef.current?.focus();
            }, 100);
        } else {
            resetForm();

            // Restore focus to the element that opened the modal
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        }
    }, [isOpen, resetForm]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Trap focus within modal
    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (!focusableElements || focusableElements.length === 0) return;

            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitForm();
    };

    const handleCancel = () => {
        resetForm();
        onCancel();
    };

    const formatDateForInput = (date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const parseDateFromInput = (dateString: string): Date | null => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    const characterCount = formState.description.length;
    const isNearLimit = characterCount > 900;
    const isOverLimit = characterCount > 1000;

    if (!isOpen) return null;

    return (
        <div className="create-event-modal" role="dialog" aria-labelledby="create-event-title" aria-modal="true">
            <div className="modal-overlay" onClick={handleCancel} aria-hidden="true" />

            <div className="modal-content" ref={modalRef}>
                <div className="modal-header">
                    <h2 id="create-event-title">Create New Event</h2>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={handleCancel}
                        className="modal-close-button"
                        aria-label="Close create event form"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="create-event-form">
                    <div className="form-group">
                        <label htmlFor="event-title" className="form-label">
                            Event Title <span className="required">*</span>
                        </label>
                        <input
                            id="event-title"
                            type="text"
                            value={formState.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className={`form-input ${formState.errors.title ? 'form-input-error' : ''}`}
                            placeholder="Enter event title"
                            aria-required="true"
                            aria-invalid={!!formState.errors.title}
                            aria-describedby={formState.errors.title ? 'title-error' : undefined}
                        />
                        {formState.errors.title && (
                            <div id="title-error" className="form-error" role="alert" aria-live="assertive">
                                {formState.errors.title}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-description" className="form-label">
                            Description <span className="required">*</span>
                        </label>
                        <textarea
                            id="event-description"
                            value={formState.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            className={`form-textarea ${formState.errors.description ? 'form-input-error' : ''}`}
                            placeholder="Describe your event (minimum 10 characters)"
                            rows={5}
                            aria-required="true"
                            aria-invalid={!!formState.errors.description}
                            aria-describedby={formState.errors.description ? 'description-error' : 'description-count'}
                        />
                        <div
                            id="description-count"
                            className={`character-count ${isNearLimit ? 'character-count-warning' : ''} ${isOverLimit ? 'character-count-error' : ''}`}
                            aria-live="polite"
                        >
                            {characterCount} / 1000 characters
                        </div>
                        {formState.errors.description && (
                            <div id="description-error" className="form-error" role="alert" aria-live="assertive">
                                {formState.errors.description}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-sport" className="form-label">
                            Sport <span className="required">*</span>
                        </label>
                        <select
                            id="event-sport"
                            value={formState.sport}
                            onChange={(e) => updateField('sport', e.target.value)}
                            className={`form-select ${formState.errors.sport ? 'form-input-error' : ''}`}
                            aria-required="true"
                            aria-invalid={!!formState.errors.sport}
                            aria-describedby={formState.errors.sport ? 'sport-error' : undefined}
                        >
                            <option value="">Select a sport</option>
                            {SPORTS_LIST.map((sport) => (
                                <option key={sport} value={sport}>
                                    {sport}
                                </option>
                            ))}
                        </select>
                        {formState.errors.sport && (
                            <div id="sport-error" className="form-error" role="alert" aria-live="assertive">
                                {formState.errors.sport}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-location" className="form-label">
                            Location <span className="required">*</span>
                        </label>
                        <LocationInput
                            value={formState.location}
                            onChange={(value) => updateField('location', value)}
                            placeholder="Enter event location"
                            error={formState.errors.location}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="event-start-date" className="form-label">
                                Start Date <span className="required">*</span>
                            </label>
                            <input
                                id="event-start-date"
                                type="date"
                                value={formatDateForInput(formState.startDate)}
                                onChange={(e) => updateField('startDate', parseDateFromInput(e.target.value))}
                                className={`form-input ${formState.errors.startDate ? 'form-input-error' : ''}`}
                                aria-required="true"
                                aria-invalid={!!formState.errors.startDate}
                                aria-describedby={formState.errors.startDate ? 'start-date-error' : undefined}
                            />
                            {formState.errors.startDate && (
                                <div id="start-date-error" className="form-error" role="alert" aria-live="assertive">
                                    {formState.errors.startDate}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="event-end-date" className="form-label">
                                End Date
                            </label>
                            <input
                                id="event-end-date"
                                type="date"
                                value={formatDateForInput(formState.endDate)}
                                onChange={(e) => updateField('endDate', parseDateFromInput(e.target.value))}
                                className={`form-input ${formState.errors.endDate ? 'form-input-error' : ''}`}
                                aria-invalid={!!formState.errors.endDate}
                                aria-describedby={formState.errors.endDate ? 'end-date-error' : undefined}
                            />
                            {formState.errors.endDate && (
                                <div id="end-date-error" className="form-error" role="alert" aria-live="assertive">
                                    {formState.errors.endDate}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Event Video (Optional)
                        </label>
                        <VideoUpload
                            onFileSelect={(file) => updateField('videoFile', file)}
                            onFileRemove={() => updateField('videoFile', null)}
                            currentFile={formState.videoFile || undefined}
                            error={formState.errors.videoFile}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="button button-secondary"
                            disabled={formState.isSubmitting}
                            aria-label="Cancel event creation"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="button button-primary"
                            disabled={formState.isSubmitting}
                            aria-busy={formState.isSubmitting}
                            aria-label={formState.isSubmitting ? 'Creating event, please wait' : 'Submit and create event'}
                        >
                            {formState.isSubmitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
