import React from 'react';
import { Event } from '../../types/event.types';
import { LazyImage } from '../common/LazyImage';
import { LazyVideo } from '../common/LazyVideo';

interface EventCardProps {
  event: Event;
  onClick: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="event-card"
      onClick={() => onClick(event.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(event.id);
        }
      }}
      aria-label={`Event: ${event.title}`}
    >
      {/* Lazy load thumbnail if available */}
      {event.thumbnailUrl && (
        <div className="event-card-media">
          <LazyImage
            src={event.thumbnailUrl}
            alt={`${event.title} thumbnail`}
            className="event-card-thumbnail"
          />
        </div>
      )}
      
      {/* Lazy load video preview if available and no thumbnail */}
      {!event.thumbnailUrl && event.videoUrl && (
        <div className="event-card-media">
          <LazyVideo
            src={event.videoUrl}
            className="event-card-video"
            controls={false}
          />
        </div>
      )}
      
      <div className="event-card-content">
        <div className="event-card-header">
          <h3 className="event-card-title">{event.title}</h3>
          {event.isOfficial && (
            <span className="event-card-badge" aria-label="Official event">
              Official
            </span>
          )}
        </div>
        
        <div className="event-card-details">
          <div className="event-card-detail">
            <span className="event-card-label">Sport:</span>
            <span className="event-card-value">{event.sport}</span>
          </div>
          
          <div className="event-card-detail">
            <span className="event-card-label">Location:</span>
            <span className="event-card-value">{event.location}</span>
          </div>
          
          <div className="event-card-detail">
            <span className="event-card-label">Date:</span>
            <span className="event-card-value">{formatDate(event.startDate)}</span>
          </div>
          
          {event.participantCount !== undefined && (
            <div className="event-card-detail">
              <span className="event-card-label">Participants:</span>
              <span className="event-card-value">{event.participantCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
