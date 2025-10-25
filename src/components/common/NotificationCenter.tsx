import React, { useState, useEffect, useRef } from 'react';
import { Notification, NotificationType, NotificationPriority } from '../../types/notification.types';
import { notificationService } from '../../services/notificationService';

interface NotificationCenterProps {
  userId: string;
  className?: string;
  maxDisplay?: number;
}

/**
 * NotificationCenter Component
 * In-app notification center with categorization and management
 * Requirements: 1.5, 2.5, 4.2, 7.4
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  className = '',
  maxDisplay = 50
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time updates
    const unsubscribe = notificationService.subscribeToNotifications(userId, handleNewNotification);
    
    return () => {
      unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const userNotifications = await notificationService.getUserNotifications(userId, maxDisplay);
      setNotifications(userNotifications);
      
      const unread = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, maxDisplay - 1)]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Handle notification action
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAllNotifications(userId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const getFilteredNotifications = () => {
    if (activeFilter === 'all') {
      return notifications;
    }
    return notifications.filter(n => n.type === activeFilter);
  };

  const getNotificationIcon = (type: NotificationType) => {
    const icons = {
      [NotificationType.ACHIEVEMENT]: '🏆',
      [NotificationType.EVENT_REMINDER]: '📅',
      [NotificationType.CHALLENGE_UPDATE]: '🎯',
      [NotificationType.MENTORSHIP]: '🤝',
      [NotificationType.TEAM_INVITE]: '👥',
      [NotificationType.REACTION]: '❤️',
      [NotificationType.COMMENT]: '💬',
      [NotificationType.SYSTEM]: '⚙️'
    };
    return icons[type] || '📢';
  };

  const getPriorityClass = (priority: NotificationPriority) => {
    const classes = {
      [NotificationPriority.LOW]: 'priority-low',
      [NotificationPriority.MEDIUM]: 'priority-medium',
      [NotificationPriority.HIGH]: 'priority-high',
      [NotificationPriority.URGENT]: 'priority-urgent'
    };
    return classes[priority] || 'priority-medium';
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className={`notification-center ${className}`} ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="header-actions">
              {unreadCount > 0 && (
                <button
                  className="mark-all-read"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                >
                  ✓
                </button>
              )}
              <button
                className="clear-all"
                onClick={handleClearAll}
                title="Clear all notifications"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="notification-filters">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${activeFilter === NotificationType.ACHIEVEMENT ? 'active' : ''}`}
              onClick={() => setActiveFilter(NotificationType.ACHIEVEMENT)}
            >
              🏆 Achievements
            </button>
            <button
              className={`filter-btn ${activeFilter === NotificationType.EVENT_REMINDER ? 'active' : ''}`}
              onClick={() => setActiveFilter(NotificationType.EVENT_REMINDER)}
            >
              📅 Events
            </button>
            <button
              className={`filter-btn ${activeFilter === NotificationType.MENTORSHIP ? 'active' : ''}`}
              onClick={() => setActiveFilter(NotificationType.MENTORSHIP)}
            >
              🤝 Mentorship
            </button>
          </div>

          {/* Notification List */}
          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="loading-spinner"></div>
                <span>Loading notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notification-empty">
                <span className="empty-icon">📭</span>
                <p>No notifications yet</p>
                <span className="empty-subtitle">
                  {activeFilter === 'all' 
                    ? "You're all caught up!" 
                    : `No ${activeFilter} notifications`}
                </span>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                      {notification.priority === NotificationPriority.HIGH && (
                        <span className="priority-indicator high">High Priority</span>
                      )}
                      {notification.priority === NotificationPriority.URGENT && (
                        <span className="priority-indicator urgent">Urgent</span>
                      )}
                    </div>
                  </div>

                  {!notification.read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="notification-footer">
              <button
                className="view-all-btn"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                }}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;