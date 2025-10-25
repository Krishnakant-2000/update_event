/**
 * Development tools for testing
 * These functions are exposed to window for easy testing in browser console
 */

import { eventService } from '../services/eventService';

export const devTools = {
  /**
   * Clear all events from localStorage
   */
  clearEvents: () => {
    eventService.clearAllEvents();
    console.log('✅ All events cleared from localStorage');
    window.location.reload();
  },

  /**
   * Seed sample data
   */
  seedData: async () => {
    console.log('🌱 Seeding sample data...');
    await eventService.seedSampleData();
    console.log('✅ Sample data loaded successfully!');
    window.location.reload();
  },

  /**
   * View all events in localStorage
   */
  viewEvents: () => {
    const data = localStorage.getItem('events_data');
    if (!data) {
      console.log('No events found in localStorage');
      return [];
    }
    const events = JSON.parse(data);
    console.table(events.map((e: any) => ({
      id: e.id,
      title: e.title,
      sport: e.sport,
      status: e.status,
      startDate: e.startDate,
    })));
    return events;
  },

  /**
   * Get localStorage stats
   */
  getStats: () => {
    const data = localStorage.getItem('events_data');
    const events = data ? JSON.parse(data) : [];
    const counter = localStorage.getItem('events_counter');
    
    console.log('📊 LocalStorage Stats:');
    console.log(`  Total Events: ${events.length}`);
    console.log(`  Next ID Counter: ${counter}`);
    console.log(`  Storage Size: ${new Blob([data || '']).size} bytes`);
    
    return {
      totalEvents: events.length,
      nextId: counter,
      storageSize: new Blob([data || '']).size,
    };
  },

  /**
   * Reset everything
   */
  reset: async () => {
    console.log('🔄 Resetting application...');
    localStorage.clear();
    await eventService.seedSampleData();
    console.log('✅ Application reset complete!');
    window.location.reload();
  },
};

// Expose to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).devTools = devTools;
  console.log('🛠️ Dev tools loaded! Use window.devTools in console');
  console.log('Available commands:');
  console.log('  - devTools.clearEvents()');
  console.log('  - devTools.seedData()');
  console.log('  - devTools.viewEvents()');
  console.log('  - devTools.getStats()');
  console.log('  - devTools.reset()');
}
