
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { optimizedAnalytics } from './lib/analytics-optimized.ts'

// Initialize optimized analytics
if (typeof window !== 'undefined') {
  // Track app start with enhanced metrics
  optimizedAnalytics.track('app_start', {
    timestamp: Date.now(),
    user_agent: navigator.userAgent,
    language: navigator.language,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connection_type: (navigator as any).connection?.effectiveType || 'unknown'
  });

  // Track initial performance metrics
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          optimizedAnalytics.track('initial_load', {
            page_load_time: navigation.loadEventEnd - navigation.fetchStart,
            dom_ready_time: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            first_byte_time: navigation.responseStart - navigation.requestStart
          });
        }
      }, 0);
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
