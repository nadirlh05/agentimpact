
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { analytics } from './lib/analytics.ts'

// Initialize analytics
if (typeof window !== 'undefined') {
  // Track app start
  analytics.track('app_start', {
    timestamp: Date.now(),
    user_agent: navigator.userAgent,
    language: navigator.language,
  });
}

createRoot(document.getElementById("root")!).render(<App />);
