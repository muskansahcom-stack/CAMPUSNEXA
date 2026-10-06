import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { pwaService } from './services/offline/pwaService';

// Initialize Service Worker for offline PWA capabilities
pwaService.registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
