import React from 'react'
import ReactDOM from 'react-dom/client'
import { EventPage } from './pages/EventPage'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EventPage isAuthenticated={true} />
  </React.StrictMode>,
)
