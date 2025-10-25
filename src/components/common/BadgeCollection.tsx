import React, { useState } from 'react';
import { Achievement } from '../../types/engagement.types';
import BadgeDisplay from './BadgeDisplay';

interface BadgeCollectionProps {
  achievements: Achievement[];
  title?: string;
  maxVisible?: number;
  showFilters?: boolean;
  showStats?: boolean;
  className?: string;
}

type FilterType = 'all' | 'common' | 'rare' | 'epic' | 'legendary';
type SortType = 'recent' | 'rarity' | 'points' | 'name';

/**
 * BadgeCollection Component
 * Displays a collection of achievement badges with filtering and sorting
 * Requirements: 2.4 - Badge collection and profile display
 */
export const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  achievements,
  title = 'Achievements',
  maxVisible = 12,
  showFilters = true,
  showStats = true,
  className = ''
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('recent');
  const [showAll, setShowAll] = useState(false);

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    return achievement.rarity === filter;
  });

  // Sort achievements
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (sort) {
      case 'recent':
        if (!a.unlockedAt || !b.unlockedAt) return 0;
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      case 'rarity':
        const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
        return rarityOrder[b.rarity as keyof typeof rarityOrder] - rarityOrder[a.rarity as keyof typeof rarityOrder];
      case 'points':
        return b.points - a.points;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Limit visible achievements
  const visibleAchievements = showAll 
    ? sortedAchievements 
    : sortedAchievements.slice(0, maxVisible);

  // Calculate stats
  const stats = {
    total: achievements.length,
    common: achievements.filter(a => a.rarity === 'common').length,
    rare: achievements.filter(a => a.rarity === 'rare').length,
    epic: achievements.filter(a => a.rarity === 'epic').length,
    legendary: achievements.filter(a => a.rarity === 'legendary').length,
    totalPoints: achievements.reduce((sum, a) => sum + a.points, 0)
  };

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') return achievements.length;
    return achievements.filter(a => a.rarity === filterType).length;
  };

  return (
    <div className={`badge-collection ${className}`}>
      {/* Header */}
      <div className="collection-header">
        <h3 className="collection-title">{title}</h3>
        {showStats && (
          <div className="collection-stats">
            <span className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </span>
            <span className="stat-item">
              <span className="stat-value">{stats.totalPoints}</span>
              <span className="stat-label">Points</span>
            </span>
          </div>
        )}
      </div>

      {/* Filters and Controls */}
      {showFilters && (
        <div className="collection-controls">
          <div className="filter-tabs">
            {(['all', 'legendary', 'epic', 'rare', 'common'] as FilterType[]).map(filterType => (
              <button
                key={filterType}
                className={`filter-tab ${filter === filterType ? 'active' : ''}`}
                onClick={() => setFilter(filterType)}
                aria-pressed={filter === filterType}
              >
                <span className="filter-label">
                  {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </span>
                <span className="filter-count">({getFilterCount(filterType)})</span>
              </button>
            ))}
          </div>

          <div className="sort-controls">
            <label htmlFor="sort-select" className="sort-label">Sort by:</label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="sort-select"
            >
              <option value="recent">Most Recent</option>
              <option value="rarity">Rarity</option>
              <option value="points">Points</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      )}

      {/* Achievement Grid */}
      {visibleAchievements.length > 0 ? (
        <div className="achievements-grid">
          {visibleAchievements.map((achievement) => (
            <BadgeDisplay
              key={achievement.id}
              achievement={achievement}
              size="medium"
              showAnimation={true}
              showTooltip={true}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏅</div>
          <h4 className="empty-title">No achievements yet</h4>
          <p className="empty-description">
            {filter === 'all' 
              ? 'Start participating in events to earn your first achievement!'
              : `No ${filter} achievements earned yet. Keep participating to unlock them!`
            }
          </p>
        </div>
      )}

      {/* Show More/Less Button */}
      {sortedAchievements.length > maxVisible && (
        <div className="collection-actions">
          <button
            className="btn-secondary show-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll 
              ? `Show Less` 
              : `Show All (${sortedAchievements.length - maxVisible} more)`
            }
          </button>
        </div>
      )}

      {/* Rarity Legend */}
      {showStats && achievements.length > 0 && (
        <div className="rarity-legend">
          <h4 className="legend-title">Rarity Breakdown</h4>
          <div className="legend-items">
            {stats.legendary > 0 && (
              <div className="legend-item legendary">
                <span className="legend-icon">👑</span>
                <span className="legend-label">Legendary</span>
                <span className="legend-count">{stats.legendary}</span>
              </div>
            )}
            {stats.epic > 0 && (
              <div className="legend-item epic">
                <span className="legend-icon">🥇</span>
                <span className="legend-label">Epic</span>
                <span className="legend-count">{stats.epic}</span>
              </div>
            )}
            {stats.rare > 0 && (
              <div className="legend-item rare">
                <span className="legend-icon">🥈</span>
                <span className="legend-label">Rare</span>
                <span className="legend-count">{stats.rare}</span>
              </div>
            )}
            {stats.common > 0 && (
              <div className="legend-item common">
                <span className="legend-icon">🥉</span>
                <span className="legend-label">Common</span>
                <span className="legend-count">{stats.common}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;