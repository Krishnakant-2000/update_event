# 🏆 AmaPlayer Events App

A comprehensive sports events platform with gamification, real-time features, and social engagement for athletes and sports enthusiasts.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple.svg)
![Tests](https://img.shields.io/badge/tests-26%20passing-green.svg)

## 🚀 Features

### 🎯 Core Event Management
- **Create Events** - Host sports events with detailed information
- **Browse Events** - Filter by upcoming, ongoing, and official events
- **Join Events** - Participate in events with one click
- **Event Categories** - Community events, tournaments, and talent hunts

### 🏅 Gamification System
- **Achievement Badges** - Earn badges for participation and performance
- **Leaderboards** - Compete across multiple ranking categories
- **Engagement Points** - Point system for all activities
- **Streak Tracking** - Daily participation streaks with bonuses

### 🎮 Challenge System
- **Mini Challenges** - Skill showcases, team collaboration, creativity
- **Real-time Leaderboards** - Live challenge rankings
- **Submission System** - Video and content submissions
- **Rewards** - Points and badges for challenge completion

### 💬 Social Features
- **Reactions** - Sport-specific emojis and reactions
- **Mentorship** - Connect experienced athletes with newcomers
- **Live Activity Feed** - Real-time updates and notifications
- **Team Formation** - Create and join teams for events

### ⚡ Real-time Features
- **WebSocket Integration** - Live updates and notifications
- **Activity Broadcasting** - Real-time activity feed
- **Live Discussions** - Event-specific chat and Q&A
- **Participant Tracking** - Live participant counts

### 📱 PWA Features
- **Offline Support** - Queue actions when offline
- **Push Notifications** - Event reminders and updates
- **App Installation** - Install as native app
- **Background Sync** - Sync data when connection restored

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest + Testing Library
- **Styling**: CSS3 with CSS Variables
- **Storage**: LocalStorage (ready for database migration)
- **Real-time**: WebSocket simulation
- **PWA**: Service Worker + Web App Manifest

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/amaplayer-events-app.git
cd amaplayer-events-app/events

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3006
```

### Available Scripts
```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:integration  # Run integration tests only

# Code Quality
npm run lint         # Run ESLint
```

## 🎮 Usage

### Quick Start
1. **Browse Events** - View available events in different categories
2. **Join Events** - Click "Join Event" to participate
3. **Earn Points** - Get 10 points for joining, 25 for completing
4. **Unlock Badges** - Earn achievements for various activities
5. **Climb Leaderboards** - Compete with other athletes
6. **Participate in Challenges** - Join mini-challenges within events

### Developer Tools
Open browser console and use:
```javascript
// View all events
devTools.viewEvents()

// Check storage stats
devTools.getStats()

// Reset app data
devTools.reset()

// Seed sample data
devTools.seedData()
```

## 📊 Testing

The app includes comprehensive testing with **26 passing tests**:

- **Performance Testing** - High concurrent user load, WebSocket performance
- **Mobile Testing** - Responsive design, touch interactions
- **PWA Testing** - Offline functionality, push notifications
- **Integration Testing** - End-to-end user workflows

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- src/test/integration/performanceAndMobile.test.ts

# View test coverage
npm run test:coverage
```

## 🏗️ Architecture

### Project Structure
```
events/
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Reusable components
│   │   └── events/         # Event-specific components
│   ├── services/           # Business logic services
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── styles/             # CSS stylesheets
│   └── test/               # Test files
├── public/                 # Static assets
├── docs/                   # Documentation
└── package.json
```

### Key Services
- **EventService** - Event CRUD operations
- **ParticipationService** - User participation management
- **AchievementEngine** - Badge and achievement system
- **LeaderboardService** - Ranking and leaderboard management
- **ChallengeSystem** - Mini-challenge functionality
- **LiveFeedManager** - Real-time activity feed
- **PWAService** - Progressive Web App features

## 🎯 Key Features Deep Dive

### Event Participation System
```typescript
// Join an event
await participationService.joinEvent("event_123", "user_456");

// Automatic benefits:
// - 10 engagement points
// - Progress toward badges
// - Leaderboard update
// - Real-time activity broadcast
```

### Achievement System
```typescript
// Check for achievements
const achievements = await achievementEngine.checkAchievements("user_123", {
  type: "event_joined",
  eventId: "event_456"
});

// Available badge categories:
// - Participation (First Step, Regular, Champion)
// - Streaks (Streak Master, Streak Legend)
// - Performance (Winner, Dominator)
// - Social (Community Favorite, Mentor)
```

### Leaderboard System
```typescript
// View leaderboards
const leaderboard = await leaderboardService.getLeaderboard(
  LeaderboardType.ENGAGEMENT_SCORE,
  LeaderboardPeriod.WEEKLY
);

// Leaderboard types:
// - Engagement Score
// - Participation Count
// - Achievement Points
// - Challenge Wins
// - Social Impact
```

## 🔧 Configuration

### Environment Variables
Create `.env` file for custom configuration:
```env
VITE_APP_TITLE=AmaPlayer Events
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
VITE_VAPID_PUBLIC_KEY=your_vapid_key
```

### Customization
- **Sports List** - Edit `src/utils/constants.ts`
- **Achievement Rules** - Modify `src/services/achievementEngine.ts`
- **Point Values** - Update scoring in service files
- **UI Theme** - Customize CSS variables in `src/styles/index.css`

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔄 Database Migration

Currently uses localStorage. To migrate to a database:

1. **Replace EventService methods**:
```typescript
// Instead of localStorage
const events = JSON.parse(localStorage.getItem('events_data') || '[]');

// Use API calls
const events = await fetch('/api/events').then(res => res.json());
```

2. **Update service endpoints**:
- `POST /api/events` - Create event
- `GET /api/events` - List events
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/join` - Join event

3. **Add authentication**:
```typescript
const token = localStorage.getItem('auth_token');
const response = await fetch('/api/events', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## 📚 Documentation

- **[Feature Documentation](./FEATURE_DOCUMENTATION.md)** - Complete feature guide
- **[Join Events Guide](./JOIN_EVENTS_GUIDE.md)** - How to participate
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing and development
- **[API Reference](./docs/)** - Service documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Use conventional commit messages
- Ensure accessibility compliance

## 🐛 Known Issues

- [ ] Video upload limited to base64 (will be replaced with proper file upload)
- [ ] WebSocket simulation (will be replaced with real WebSocket server)
- [ ] LocalStorage limitation (will be migrated to database)

## 🔮 Roadmap

### Phase 1 - Current ✅
- [x] Event management system
- [x] Gamification features
- [x] Real-time simulation
- [x] PWA capabilities
- [x] Comprehensive testing

### Phase 2 - Next
- [ ] Database integration
- [ ] User authentication
- [ ] Real WebSocket server
- [ ] File upload service
- [ ] Push notification server

### Phase 3 - Future
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] Video streaming integration
- [ ] Payment system for events

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Development** - React + TypeScript implementation
- **Backend Architecture** - Service layer design
- **Testing** - Comprehensive test suite
- **UI/UX** - Responsive design and accessibility

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite for lightning-fast development
- Testing Library for excellent testing utilities
- All contributors and testers

## 📞 Support

- **Issues** - [GitHub Issues](https://github.com/yourusername/amaplayer-events-app/issues)
- **Discussions** - [GitHub Discussions](https://github.com/yourusername/amaplayer-events-app/discussions)
- **Documentation** - Check the `/docs` folder

---

**Made with ❤️ for the sports community**