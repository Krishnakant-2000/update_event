import React from 'react'
import ReactDOM from 'react-dom/client'
import { EventPage } from './pages/EventPage'
import { eventService } from './services/eventService'
import './utils/devTools' // Load dev tools
import './styles/index.css'

// Initialize sample data if localStorage is empty
const initializeApp = async () => {
  const existingEvents = localStorage.getItem('events_data');
  
  if (!existingEvents || JSON.parse(existingEvents).length === 0) {
    console.log('Seeding sample event data...');
    await eventService.seedSampleData();
    console.log('Sample data loaded successfully!');
  }
};

// Initialize app
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <EventPage isAuthenticated={true} />
    </React.StrictMode>,
  );
});
