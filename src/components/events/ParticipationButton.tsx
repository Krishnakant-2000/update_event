import React, { useState, useEffect } from 'react';
import { ParticipationType } from '../../types/event.types';
import { participationService, currentMockUser } from '../../services/participationService';

interface ParticipationButtonProps {
  eventId: string;
  maxParticipants?: number;
  onParticipationChange?: (type: ParticipationType | null) => void;
  className?: string;
  userId?: string; // Will come from parent app auth
}

/**
 * ParticipationButton Component
 * Allows users to indicate their participation status for an event
 * Three states: Going, Interested, Not participating
 */
export const ParticipationButton: React.FC<ParticipationButtonProps> = ({
  eventId,
  maxParticipants,
  onParticipationChange,
  className = '',
  userId = currentMockUser.id, // Use mock user for now
}) => {
  const [currentType, setCurrentType] = useState<ParticipationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    loadParticipation();
    checkCapacity();
  }, [eventId, userId]);

  const loadParticipation = async () => {
    try {
      const participation = await participationService.getParticipation(eventId, userId);
      setCurrentType(participation?.type || null);
    } catch (error) {
      console.error('Failed to load participation:', error);
    }
  };

  const checkCapacity = async () => {
    if (!maxParticipants) {
      setIsFull(false);
      return;
    }

    try {
      const full = await participationService.isEventFull(eventId, maxParticipants);
      setIsFull(full);
    } catch (error) {
      console.error('Failed to check capacity:', error);
    }
  };

  const handleParticipationClick = async (type: ParticipationType) => {
    // If clicking the same type, remove participation
    if (currentType === type) {
      await handleRemoveParticipation();
      return;
    }

    // Check if event is full when trying to mark as "Going"
    if (type === ParticipationType.GOING && isFull && currentType !== ParticipationType.GOING) {
      alert('This event is at full capacity');
      return;
    }

    setLoading(true);

    try {
      await participationService.joinEvent(eventId, userId, type);
      setCurrentType(type);
      onParticipationChange?.(type);
      await checkCapacity();
    } catch (error) {
      console.error('Failed to update participation:', error);
      alert('Failed to update participation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipation = async () => {
    setLoading(true);

    try {
      await participationService.leaveEvent(eventId, userId);
      setCurrentType(null);
      onParticipationChange?.(null);
      await checkCapacity();
    } catch (error) {
      console.error('Failed to remove participation:', error);
      alert('Failed to remove participation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`participation-button-group ${className}`}>
      <button
        className={`participation-btn going ${currentType === ParticipationType.GOING ? 'active' : ''}`}
        onClick={() => handleParticipationClick(ParticipationType.GOING)}
        disabled={loading || (isFull && currentType !== ParticipationType.GOING)}
        aria-label={currentType === ParticipationType.GOING ? 'Remove Going status' : 'Mark as Going'}
        aria-pressed={currentType === ParticipationType.GOING}
      >
        <span className="btn-icon" aria-hidden="true">✓</span>
        <span className="btn-text">
          {currentType === ParticipationType.GOING ? "I'm Going" : 'Going'}
        </span>
      </button>

      <button
        className={`participation-btn interested ${currentType === ParticipationType.INTERESTED ? 'active' : ''}`}
        onClick={() => handleParticipationClick(ParticipationType.INTERESTED)}
        disabled={loading}
        aria-label={currentType === ParticipationType.INTERESTED ? 'Remove Interested status' : 'Mark as Interested'}
        aria-pressed={currentType === ParticipationType.INTERESTED}
      >
        <span className="btn-icon" aria-hidden="true">⭐</span>
        <span className="btn-text">
          {currentType === ParticipationType.INTERESTED ? 'Interested' : 'Interested'}
        </span>
      </button>

      <button
        className={`participation-btn maybe ${currentType === ParticipationType.MAYBE ? 'active' : ''}`}
        onClick={() => handleParticipationClick(ParticipationType.MAYBE)}
        disabled={loading}
        aria-label={currentType === ParticipationType.MAYBE ? 'Remove Maybe status' : 'Mark as Maybe'}
        aria-pressed={currentType === ParticipationType.MAYBE}
      >
        <span className="btn-icon" aria-hidden="true">?</span>
        <span className="btn-text">Maybe</span>
      </button>

      {isFull && currentType !== ParticipationType.GOING && (
        <span className="capacity-warning" role="status">
          Event is at full capacity
        </span>
      )}
    </div>
  );
};

export default ParticipationButton;
