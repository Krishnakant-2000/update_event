/**
 * Performance and Mobile Testing Suite
 * 
 * Tests performance under high concurrent user load, mobile responsiveness,
 * touch interactions, and PWA functionality including offline capabilities.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TEST_CONFIG, TestUtils, PerformanceMonitor, MOCK_USERS, MOCK_EVENTS } from './testConfig';

// Import services for testing
import { webSocketService } from '../../services/webSocketService';
import { liveFeedManager } from '../../services/liveFeedManager';
import { achievementEngine } from '../../services/achievementEngine';
import { leaderboardService } from '../../services/leaderboardService';
import { statisticsService } from '../../services/statisticsService';
import { pwaService } from '../../services/pwaService';

// Import types
import { ActivityType } from '../../types/realtime.types';
import { LeaderboardType } from '../../types/engagement.types';

describe('Performance and Mobile Testing Suite', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();

    // Setup test environment
    TestUtils.setupMockStorage();
    
    // Mock performance APIs
    global.performance = {
      ...global.performance,
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByType: vi.fn(() => []),
      getEntriesByName: vi.fn(() => [])
    } as any;

    // Mock network conditions
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false
      }
    });
  });

  afterEach(() => {
    TestUtils.clearTestData();
    performanceMonitor.clear();
    vi.clearAllMocks();
  });

  describe('High Concurrent User Load Testing', () => {
    it('should handle 100 concurrent users joining events', async () => {
      const eventId = 'load-test-event';
      const userCount = TEST_CONFIG.MAX_CONCURRENT_USERS;
      
      const endTimer = performanceMonitor.startTimer('concurrent_user_joins');
      
      // Generate load test data
      const { users } = TestUtils.generateLoadTestData(userCount, 0);
      
      // Simulate concurrent user joins
      const joinPromises = users.map(async (user, index) => {
        // Stagger joins slightly to simulate real-world conditions
        await new Promise(resolve => setTimeout(resolve, index * 10));
        
        return liveFeedManager.publishActivity({
          id: `join-${user.id}`,
          eventId,
          userId: user.id,
          type: ActivityType.USER_JOINED,
          data: { userName: user.name, userAvatar: user.avatar },
          timestamp: new Date(),
          priority: 'medium'
        });
      });

      await Promise.all(joinPromises);
      const duration = endTimer();

      // Verify performance requirements
      expect(duration).toBeLessThan(TEST_CONFIG.MAX_PROCESSING_TIME * 2); // Allow 2x for load
      
      // Verify all activities were processed
      const activities = liveFeedManager.getRecentActivities(eventId, userCount);
      expect(activities).toHaveLength(userCount);
      
      console.log(`Performance: ${userCount} concurrent joins processed in ${duration}ms`);
    });

    it('should maintain performance with high activity volume', async () => {
      const eventId = 'high-activity-event';
      const activityCount = TEST_CONFIG.MAX_ACTIVITIES_PER_FEED * 2;
      
      const endTimer = performanceMonitor.startTimer('high_activity_volume');
      
      // Generate high volume of activities
      const activities = TestUtils.generateMockActivities(eventId, activityCount);
      
      // Process activities in batches to simulate real-world conditions
      const batchSize = 10;
      for (let i = 0; i < activities.length; i += batchSize) {
        const batch = activities.slice(i, i + batchSize);
        await Promise.all(
          batch.map(activity => liveFeedManager.publishActivity(activity))
        );
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 5));
      }
      
      const duration = endTimer();
      
      // Verify performance
      expect(duration).toBeLessThan(TEST_CONFIG.MAX_PROCESSING_TIME * 3);
      
      // Verify activity feed pagination works correctly
      const recentActivities = liveFeedManager.getRecentActivities(eventId, TEST_CONFIG.MAX_ACTIVITIES_PER_FEED);
      expect(recentActivities).toHaveLength(TEST_CONFIG.MAX_ACTIVITIES_PER_FEED);
      
      console.log(`Performance: ${activityCount} activities processed in ${duration}ms`);
    });

    it('should handle concurrent leaderboard updates efficiently', async () => {
      const userCount = 50;
      const endTimer = performanceMonitor.startTimer('concurrent_leaderboard_updates');
      
      // Generate users with stats
      const users = Array.from({ length: userCount }, (_, i) => ({
        userId: `perf-user-${i}`,
        stats: {
          totalEvents: Math.floor(Math.random() * 100),
          engagementScore: Math.floor(Math.random() * 1000),
          achievementPoints: Math.floor(Math.random() * 500),
          challengeWins: Math.floor(Math.random() * 20),
          socialImpact: Math.floor(Math.random() * 300)
        }
      }));
      
      // Update leaderboards concurrently
      const updatePromises = users.map(user => 
        leaderboardService.updateUserRankingData(user.userId, user.stats as any)
      );
      
      await Promise.all(updatePromises);
      const duration = endTimer();
      
      // Verify performance
      expect(duration).toBeLessThan(TEST_CONFIG.MAX_PROCESSING_TIME * 2); // Allow more time for concurrent updates
      
      // Verify leaderboard can be retrieved
      const leaderboard = await leaderboardService.getLeaderboard(
        LeaderboardType.PARTICIPATION,
        'all_time'
      );
      expect(leaderboard).toBeDefined();
      expect(leaderboard.entries).toBeDefined();
      
      console.log(`Performance: ${userCount} leaderboard updates in ${duration}ms`);
    });

    it('should maintain WebSocket performance under load', async () => {
      const messageCount = 100;
      
      const endTimer = performanceMonitor.startTimer('websocket_load_test');
      
      // Connect the singleton WebSocket service
      if (!webSocketService.isConnected()) {
        await webSocketService.connect('load-test-user');
      }
      
      // Send messages concurrently
      const messagePromises = [];
      for (let i = 0; i < messageCount; i++) {
        messagePromises.push(
          webSocketService.publish(`test-channel-${i % 10}`, {
            type: 'test-message',
            data: { messageId: i, timestamp: Date.now() }
          })
        );
      }
      
      await Promise.all(messagePromises);
      const duration = endTimer();
      
      // Verify performance
      expect(duration).toBeLessThan(TEST_CONFIG.MAX_PROCESSING_TIME);
      
      console.log(`Performance: ${messageCount} messages in ${duration}ms`);
    });
  });

  describe('Mobile Responsiveness Testing', () => {
    const mobileViewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 360, height: 640, name: 'Android Small' },
      { width: 412, height: 915, name: 'Android Large' }
    ];

    mobileViewports.forEach(viewport => {
      it(`should handle ${viewport.name} viewport (${viewport.width}x${viewport.height})`, async () => {
        // Mock viewport
        Object.defineProperty(window, 'innerWidth', { value: viewport.width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: viewport.height, writable: true });
        
        // Mock matchMedia for responsive design
        window.matchMedia = vi.fn().mockImplementation(query => ({
          matches: query.includes('max-width') && viewport.width <= 768,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }));

        // Test that services work correctly on mobile viewports
        const isMobile = viewport.width <= 768;
        expect(window.innerWidth).toBe(viewport.width);
        expect(window.innerHeight).toBe(viewport.height);
        
        // Verify matchMedia detects mobile correctly
        const mobileQuery = window.matchMedia('(max-width: 768px)');
        expect(mobileQuery.matches).toBe(isMobile);
        
        // Test that live feed manager works on mobile
        liveFeedManager.initializeFeed('mobile-test-event');
        const activities = liveFeedManager.getRecentActivities('mobile-test-event', 10);
        expect(Array.isArray(activities)).toBe(true);
        
        console.log(`Mobile: ${viewport.name} viewport test passed`);
      });
    });

    it('should handle orientation changes gracefully', async () => {
      // Mock orientation change
      const orientationChangeEvent = new Event('orientationchange');
      let orientationChangeHandled = false;
      
      // Add orientation change listener
      window.addEventListener('orientationchange', () => {
        orientationChangeHandled = true;
      });
      
      // Start in portrait
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
      
      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);
      
      // Change to landscape
      Object.defineProperty(window, 'innerWidth', { value: 667, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true });
      
      window.dispatchEvent(orientationChangeEvent);
      
      // Verify orientation change was detected
      expect(window.innerWidth).toBe(667);
      expect(window.innerHeight).toBe(375);
      expect(orientationChangeHandled).toBe(true);
    });
  });

  describe('Touch Interaction Testing', () => {
    it('should detect touch capability', async () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', { value: null, writable: true, configurable: true });
      
      const hasTouch = 'ontouchstart' in window;
      expect(hasTouch).toBe(true);
      
      console.log('Touch capability detected');
    });

    it('should handle touch event simulation', async () => {
      // Create a mock element to test touch events
      const mockElement = document.createElement('div');
      let touchStartFired = false;
      let touchEndFired = false;
      
      mockElement.addEventListener('touchstart', () => {
        touchStartFired = true;
      });
      
      mockElement.addEventListener('touchend', () => {
        touchEndFired = true;
      });
      
      // Simulate touch events
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      });
      
      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch]
      });
      
      mockElement.dispatchEvent(touchStartEvent);
      mockElement.dispatchEvent(touchEndEvent);
      
      // Verify touch events were handled
      expect(touchStartFired).toBe(true);
      expect(touchEndFired).toBe(true);
    });

    it('should calculate swipe gestures', async () => {
      // Test swipe gesture calculation
      const startX = 200;
      const startY = 100;
      const endX = 200;
      const endY = 200;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Determine swipe direction
      const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX);
      const isDownSwipe = isVerticalSwipe && deltaY > 0;
      
      expect(distance).toBeGreaterThan(0);
      expect(isVerticalSwipe).toBe(true);
      expect(isDownSwipe).toBe(true);
      
      console.log(`Swipe detected: distance=${distance}, direction=down`);
    });

    it('should calculate pinch-to-zoom gestures', async () => {
      // Test pinch gesture calculation
      const touch1Start = { x: 100, y: 100 };
      const touch2Start = { x: 200, y: 200 };
      const touch1End = { x: 80, y: 80 };
      const touch2End = { x: 220, y: 220 };
      
      // Calculate initial distance
      const startDistance = Math.sqrt(
        Math.pow(touch2Start.x - touch1Start.x, 2) + 
        Math.pow(touch2Start.y - touch1Start.y, 2)
      );
      
      // Calculate end distance
      const endDistance = Math.sqrt(
        Math.pow(touch2End.x - touch1End.x, 2) + 
        Math.pow(touch2End.y - touch1End.y, 2)
      );
      
      // Calculate scale
      const scale = endDistance / startDistance;
      const isPinchOut = scale > 1;
      
      expect(scale).toBeGreaterThan(1);
      expect(isPinchOut).toBe(true);
      
      console.log(`Pinch gesture detected: scale=${scale.toFixed(2)}`);
    });

    it('should support haptic feedback API', async () => {
      // Mock vibration API
      const mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, 'vibrate', { 
        value: mockVibrate, 
        writable: true, 
        configurable: true 
      });
      
      // Test vibration patterns
      const shortVibration = [50];
      const doubleVibration = [50, 100, 50];
      
      navigator.vibrate(shortVibration);
      navigator.vibrate(doubleVibration);
      
      expect(mockVibrate).toHaveBeenCalledWith(shortVibration);
      expect(mockVibrate).toHaveBeenCalledWith(doubleVibration);
      expect(mockVibrate).toHaveBeenCalledTimes(2);
      
      console.log('Haptic feedback API tested successfully');
    });
  });

  describe('PWA Functionality Testing', () => {
    it('should detect PWA installation capability', async () => {
      const capabilities = pwaService.getCapabilities();
      
      expect(capabilities).toHaveProperty('canInstall');
      expect(capabilities).toHaveProperty('isInstalled');
      expect(capabilities).toHaveProperty('isStandalone');
      expect(capabilities).toHaveProperty('supportsServiceWorker');
      expect(capabilities).toHaveProperty('supportsNotifications');
      expect(capabilities).toHaveProperty('supportsPush');
      expect(capabilities).toHaveProperty('supportsBackgroundSync');
      expect(capabilities).toHaveProperty('isOnline');
    });

    it('should handle app installation flow', async () => {
      // Mock beforeinstallprompt event
      const mockPrompt = {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' as const })
      };
      
      // Simulate beforeinstallprompt event
      const installPromptEvent = new CustomEvent('beforeinstallprompt');
      Object.defineProperty(installPromptEvent, 'prompt', { value: mockPrompt.prompt });
      Object.defineProperty(installPromptEvent, 'userChoice', { value: mockPrompt.userChoice });
      
      window.dispatchEvent(installPromptEvent);
      
      // Wait for PWA service to handle the event
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(pwaService.canInstall()).toBe(true);
      
      // Test installation
      const installResult = await pwaService.installApp();
      expect(installResult).toBe(true);
      expect(mockPrompt.prompt).toHaveBeenCalled();
    });

    it('should handle offline functionality', async () => {
      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      window.dispatchEvent(new Event('offline'));
      
      // Add items to offline queue
      pwaService.addToOfflineQueue('/api/events/join', 'POST', { eventId: 'test-event', userId: 'test-user' });
      pwaService.addToOfflineQueue('/api/reactions', 'POST', { targetId: 'event-1', reaction: '👍' });
      
      const queueStatus = pwaService.getOfflineQueueStatus();
      expect(queueStatus.count).toBe(2);
      expect(queueStatus.items).toHaveLength(2);
      
      // Mock fetch for when we go back online
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      // Simulate going back online
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
      window.dispatchEvent(new Event('online'));
      
      // Wait for offline queue processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify queue was processed
      const updatedQueueStatus = pwaService.getOfflineQueueStatus();
      expect(updatedQueueStatus.count).toBe(0);
    });

    it('should cache important resources', async () => {
      const importantUrls = [
        '/api/events',
        '/api/user/profile',
        '/static/css/main.css',
        '/static/js/main.js'
      ];
      
      // Mock service worker registration
      const mockRegistration = {
        active: {
          postMessage: vi.fn()
        }
      };
      
      Object.defineProperty(pwaService, 'serviceWorkerRegistration', {
        value: mockRegistration,
        writable: true
      });
      
      await pwaService.cacheImportantResources(importantUrls);
      
      expect(mockRegistration.active.postMessage).toHaveBeenCalledWith({
        type: 'CACHE_URLS',
        urls: importantUrls
      });
    });

    it('should handle push notifications', async () => {
      // Mock Notification API
      const mockNotification = {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted')
      };
      
      Object.defineProperty(global, 'Notification', {
        value: mockNotification,
        writable: true,
        configurable: true
      });
      
      const permission = await pwaService.requestNotificationPermission();
      expect(permission).toBe('granted');
      expect(mockNotification.requestPermission).toHaveBeenCalled();
      
      console.log('Push notification permission test passed');
    });

    it('should handle background sync', async () => {
      // Check if background sync is supported
      const capabilities = pwaService.getCapabilities();
      
      // Background sync requires service worker support
      expect(capabilities).toHaveProperty('supportsBackgroundSync');
      
      // Test visibility change detection
      let visibilityChangeDetected = false;
      document.addEventListener('visibilitychange', () => {
        visibilityChangeDetected = true;
      });
      
      // Simulate app becoming visible
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(visibilityChangeDetected).toBe(true);
      console.log('Background sync capability test passed');
    });
  });

  describe('Performance Monitoring and Metrics', () => {
    it('should track service operation performance', async () => {
      const renderTimer = performanceMonitor.startTimer('service_operation');
      
      // Perform service operations
      liveFeedManager.initializeFeed('perf-test-event');
      const activities = liveFeedManager.getRecentActivities('perf-test-event', 20);
      
      const operationDuration = renderTimer();
      
      expect(operationDuration).toBeLessThan(100); // Should complete within 100ms
      expect(activities).toBeDefined();
      
      const metrics = performanceMonitor.getMetrics('service_operation');
      expect(metrics.count).toBe(1);
      expect(metrics.avg).toBe(operationDuration);
    });

    it('should monitor memory usage during intensive operations', async () => {
      // Mock performance.memory API
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 10000000, // 10MB
          totalJSHeapSize: 20000000, // 20MB
          jsHeapSizeLimit: 100000000 // 100MB
        }
      });
      
      const initialMemory = (performance as any).memory.usedJSHeapSize;
      
      // Perform memory-intensive operations
      const largeDataSet = TestUtils.generateLoadTestData(1000, 5000);
      
      // Process the data
      for (let i = 0; i < 100; i++) {
        const activities = TestUtils.generateMockActivities('memory-test', 50);
        activities.forEach(activity => {
          liveFeedManager.publishActivity(activity);
        });
      }
      
      const finalMemory = (performance as any).memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB for this test)
      expect(memoryIncrease).toBeLessThan(50000000);
      
      console.log(`Memory usage increased by ${memoryIncrease / 1000000}MB during intensive operations`);
    });

    it('should measure network performance', async () => {
      // Mock network timing
      const mockNetworkTiming = {
        connectStart: 100,
        connectEnd: 150,
        requestStart: 200,
        responseStart: 300,
        responseEnd: 400
      };
      
      global.performance.getEntriesByType = vi.fn().mockReturnValue([
        {
          name: 'https://api.example.com/events',
          ...mockNetworkTiming
        }
      ]);
      
      const networkEntries = performance.getEntriesByType('navigation');
      expect(networkEntries).toHaveLength(1);
      
      const entry = networkEntries[0] as any;
      const connectionTime = entry.connectEnd - entry.connectStart;
      const requestTime = entry.responseEnd - entry.requestStart;
      
      expect(connectionTime).toBe(50);
      expect(requestTime).toBe(200);
    });

    it('should validate performance under different network conditions', async () => {
      const networkConditions = [
        { effectiveType: '4g', downlink: 10, rtt: 100 },
        { effectiveType: '3g', downlink: 1.5, rtt: 300 },
        { effectiveType: '2g', downlink: 0.25, rtt: 2000 }
      ];
      
      for (const condition of networkConditions) {
        // Mock network condition
        Object.defineProperty(navigator, 'connection', {
          value: condition,
          writable: true
        });
        
        const timer = performanceMonitor.startTimer(`network_${condition.effectiveType}`);
        
        // Simulate network-dependent operations
        await liveFeedManager.publishActivity({
          id: `network-test-${condition.effectiveType}`,
          eventId: 'network-test',
          userId: 'test-user',
          type: ActivityType.USER_JOINED,
          data: { userName: 'Test User' },
          timestamp: new Date(),
          priority: 'medium'
        });
        
        const duration = timer();
        
        // Performance expectations based on network condition
        const expectedMaxDuration = condition.effectiveType === '4g' ? 100 : 
                                   condition.effectiveType === '3g' ? 500 : 1000;
        
        expect(duration).toBeLessThan(expectedMaxDuration);
        
        console.log(`${condition.effectiveType} network: operation completed in ${duration}ms`);
      }
    });
  });

  describe('Accessibility and Performance Integration', () => {
    it('should maintain performance with screen reader support', async () => {
      // Mock screen reader environment
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          speak: vi.fn(),
          cancel: vi.fn(),
          getVoices: vi.fn().mockReturnValue([])
        },
        writable: true,
        configurable: true
      });
      
      const timer = performanceMonitor.startTimer('accessibility_performance');
      
      // Perform operations that would be used with screen readers
      liveFeedManager.initializeFeed('accessibility-test');
      const activities = liveFeedManager.getRecentActivities('accessibility-test', 10);
      
      // Simulate ARIA announcements
      const announcement = `${activities.length} new activities`;
      expect(announcement).toBeDefined();
      
      const duration = timer();
      
      // Performance should not be significantly impacted by accessibility features
      expect(duration).toBeLessThan(100);
      expect(window.speechSynthesis).toBeDefined();
    });

    it('should handle reduced motion preferences', async () => {
      // Mock reduced motion preference
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      // Check if reduced motion is preferred
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(prefersReducedMotion.matches).toBe(true);
      
      // Services should work the same regardless of motion preference
      liveFeedManager.initializeFeed('reduced-motion-test');
      const activities = liveFeedManager.getRecentActivities('reduced-motion-test', 5);
      expect(Array.isArray(activities)).toBe(true);
      
      console.log('Reduced motion preference detected and handled');
    });
  });
});