
import React from 'react';
import './AmaPlayerChallenges.css';

/**
 * A component to display the AmaPlayer Challenges promotional content.
 * Requirement: Add a new section to the EventPage to promote the challenges feature.
 */
export const AmaPlayerChallenges: React.FC = () => {
  return (
    <div className="amaplayer-challenges-promo">
      <div className="promo-content">
        <h2 className="promo-title">AmaPlayer Challenges</h2>
        <p className="promo-subtitle">Show your skills, your energy, your best move — every week on AmaPlayer!</p>
        <p>Join fun national challenges like “10 Pushups Saturday” or “Best Goal of the Week.”</p>
        <p>Upload your video, get likes and cheers from players across India.</p>
        <p>Win badges, climb leaderboards, and get noticed by coaches and sponsors.</p>
        <p className="promo-footer">Every move counts — make India see your talent!</p>
        <p className="promo-tagline">Mera Desh, Mera Khel.</p>
      </div>
    </div>
  );
};
