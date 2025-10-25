# Event App Testing Guide

## 🚀 Running the Application

The app is now running on **http://localhost:3007** (port 3006 was in use, so Vite automatically used 3007)

## ✅ Fixed Issues

### 1. **Duplicate Declaration Error** - FIXED ✓
- **Issue**: `LiveDiscussion` component had a naming conflict with the imported type
- **Fix**: Renamed the imported type to `LiveDiscussionType` to avoid conflict
- **File**: `events/src/components/common/LiveDiscussion.tsx`

### 2. **Blurred Form Issue** - FIXED ✓
- **Issue**: Modal content had low z-index (1) causing it to appear behind the overlay
- **Fix**: Increased z-index to 1001 for `.modal-content`
- **File**: `events/src/styles/index.css` (line 599)

### 3. **LocalStorage Setup** - CONFIGURED ✓
- **Status**: Event service already uses localStorage
- **Location**: `events/src/services/eventService.ts`
- **Features**:
  - Automatic initialization
  - Sample data seeding
  - CRUD operations
  - Persistent storage

### 4. **Test Files** - FIXED ✓
- **Issue**: Duplicate `vi` imports in setup.ts
- **Fix**: Removed duplicate imports
- **Status**: All 26 performance and mobile tests passing ✓

## 🎮 Using the Application

### Creating Events

1. Click the **"Create Event"** button in the top right
2. Fill in the form:
   - **Title** (required)
   - **Description** (required, min 10 chars)
   - **Sport** (required, dropdown)
   - **Location** (required)
   - **Start Date** (required)
   - **End Date** (optional)
   - **Video** (optional, max 50MB)
3. Click **"Create Event"** to save

### Sample Data

The app automatically loads 5 sample events on first run:
- AmaPlayer Talent Hunt - Basketball Edition
- Community Soccer Match
- Spring Tennis Tournament
- Beach Volleyball Championship
- Morning Running Club

## 🛠️ Developer Tools

Open the browser console and use these commands:

```javascript
// View all events
devTools.viewEvents()

// Get storage statistics
devTools.getStats()

// Clear all events
devTools.clearEvents()

// Seed sample data
devTools.seedData()

// Reset everything (clear + seed)
devTools.reset()
```

## 📊 Testing

### Run All Tests
```bash
cd events
npm test
```

### Run Specific Test Suites
```bash
# Performance and mobile tests
npm test -- src/test/integration/performanceAndMobile.test.ts

# All integration tests
npm run test:integration

# Unit tests only
npm run test:unit

# Watch mode
npm run test:watch
```

### Test Results
✅ **26/26 tests passing** in performance and mobile suite:
- High concurrent user load (4 tests)
- Mobile responsiveness (5 tests)
- Touch interactions (5 tests)
- PWA functionality (6 tests)
- Performance monitoring (4 tests)
- Accessibility integration (2 tests)

## 🗄️ LocalStorage Structure

### Keys Used
- `events_data` - Array of all events
- `events_counter` - Auto-increment ID counter

### Event Object Structure
```typescript
{
  id: string,
  title: string,
  description: string,
  sport: string,
  location: string,
  startDate: Date,
  endDate?: Date,
  status: 'upcoming' | 'ongoing' | 'completed',
  category: string,
  createdBy: string,
  videoUrl?: string,
  thumbnailUrl?: string,
  participantCount: number,
  // ... more fields
}
```

## 🔧 Configuration

### Port Configuration
- **File**: `events/vite.config.ts`
- **Current Port**: 3006 (configured)
- **Actual Port**: 3007 (auto-selected by Vite)
- **Change**: Edit `server.port` in vite.config.ts

### Authentication
- **Current**: Set to `true` in main.tsx
- **Location**: `<EventPage isAuthenticated={true} />`
- **Change**: Modify in `events/src/main.tsx`

## 🐛 Troubleshooting

### Form Not Appearing
1. Check browser console for errors
2. Verify z-index in DevTools (should be 1001)
3. Try `devTools.reset()` in console

### No Events Showing
1. Run `devTools.viewEvents()` to check localStorage
2. Run `devTools.seedData()` to load sample data
3. Check browser console for API errors

### Tests Failing
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check test setup: `events/src/test/setup.ts`
3. Run with verbose: `npm test -- --reporter=verbose`

## 📝 Next Steps

### To Connect to Database Later

1. **Create API Service**
   - Replace localStorage calls in `eventService.ts`
   - Add API endpoints (POST /api/events, GET /api/events, etc.)
   - Keep the same interface for easy migration

2. **Update Event Service**
   ```typescript
   // Instead of:
   localStorage.setItem('events_data', JSON.stringify(events));
   
   // Use:
   await fetch('/api/events', {
     method: 'POST',
     body: JSON.stringify(event)
   });
   ```

3. **Environment Variables**
   - Create `.env` file
   - Add `VITE_API_URL=http://your-api-url`
   - Use `import.meta.env.VITE_API_URL`

## 🎯 Features Working

✅ Create events (localStorage)
✅ View events (all categories)
✅ Event filtering by category
✅ Sample data seeding
✅ Form validation
✅ Video upload (base64 storage)
✅ Responsive design
✅ Modal with proper z-index
✅ Dev tools for testing
✅ Hot module reloading

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Use `devTools.getStats()` to verify data
3. Try `devTools.reset()` to start fresh
4. Check the network tab for failed requests
