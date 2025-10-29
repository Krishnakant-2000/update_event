# AmaPlayer Events App: Functionality Overview

This document provides a detailed overview of the features and functionalities of the AmaPlayer Events App.

## 1. Core Event Management

The primary purpose of the application is to allow users to discover, join, and manage sports events.

-   **Event Creation**: Authenticated users can create new events, providing details such as title, description, date, and category.
-   **Event Browsing**: Users can browse events through a tab-based interface, filtering by:
    -   **Upcoming**: Events that have not yet started.
    -   **Ongoing**: Events that are currently active.
    -   **Official Events**: Special events hosted by AmaPlayer.
-   **Event Participation**: Users can join an event with a single click. This action is recorded, and the user receives engagement points.
-   **Event Detail Page**: Each event has a dedicated page that provides more detailed information, including associated challenges and participant lists.

## 2. Gamification System

To drive user engagement, the app incorporates a robust gamification system built around points, badges, and leaderboards.

-   **Engagement Points**: Users earn points for performing actions such as joining events, participating in challenges, and receiving reactions on their content.
-   **Achievement Badges**: The `achievementEngine.ts` service awards users badges for reaching milestones (e.g., joining their first event, winning a challenge).
-   **Leaderboards**: The `leaderboardService.ts` service tracks user rankings based on engagement points and other metrics. Leaderboards can be filtered by different categories and time periods (e.g., weekly, all-time).
-   **Streak Tracking**: The system is designed to track daily participation streaks, with bonuses awarded for consistency.

## 3. AmaPlayer Challenges

A central feature of the app, "AmaPlayer Challenges," allows users to showcase their skills.

-   **Challenge Participation**: Within events, users can find and participate in mini-challenges (e.g., "10 Pushups Saturday").
-   **Video Submissions**: To complete a challenge, users can upload a video (or "reel") of themselves performing the required action. This is handled by the `VideoUpload` component.
-   **Real-time Rankings**: Challenges have their own real-time leaderboards, allowing participants to track their standing as they compete.

## 4. Social & Real-time Features

The application includes several features to foster a sense of community and provide a dynamic user experience.

-   **Reactions**: Users can react to video submissions with sports-themed emojis and cheers. This system, managed by `reactionSystem.ts`, provides social validation and contributes to a user's engagement score.
-   **Live Activity Feed**: A real-time feed (`LiveActivityFeed.tsx`) broadcasts important actions across the platform, such as a user joining an event or earning an achievement.
-   **Team Formation**: The app supports the creation and management of teams, allowing users to compete together.
-   **Mentorship**: A mentorship system (`mentorshipSystem.ts`) is in place to connect experienced athletes with newcomers.
-   **WebSocket Integration**: The app uses a simulated WebSocket connection to provide real-time updates for features like live discussions, participant counters, and notifications.

## 5. Progressive Web App (PWA) Capabilities

The application is designed to be a Progressive Web App, offering a near-native experience.

-   **Offline Support**: The app can queue actions performed while the user is offline and sync them once the connection is restored.
-   **Push Notifications**: The system can send push notifications for event reminders and other important updates.
-   **App Installation**: Users can install the application on their mobile or desktop devices for easy access.
