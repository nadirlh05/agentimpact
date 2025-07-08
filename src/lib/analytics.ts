// Service d'analytics léger et respectueux de la vie privée
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  session_id: string;
  user_id?: string;
  page_url: string;
  user_agent: string;
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 secondes
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startBatchFlush();
    this.trackPageView();
    
    // Écouter les changements de page
    this.setupPageViewTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPageViewTracking() {
    // Tracker les changements de route SPA
    let currentPath = window.location.pathname;
    
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Tracker les changements d'historique
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => analytics.trackPageView(), 0);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => analytics.trackPageView(), 0);
    };

    window.addEventListener('popstate', () => {
      setTimeout(() => this.trackPageView(), 0);
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  clearUserId() {
    this.userId = undefined;
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.shouldTrack()) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
      session_id: this.sessionId,
      user_id: this.userId,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    };

    this.events.push(analyticsEvent);
    
    // Flush si on atteint la taille de batch
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  trackPageView() {
    this.track('page_view', {
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      title: document.title,
      referrer: document.referrer,
    });
  }

  trackUserAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      context,
    });
  }

  trackPerformance() {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.track('performance', {
        load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: this.getFirstPaint(),
        connection_type: (navigator as any).connection?.effectiveType,
      });
    }
  }

  private getFirstPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint?.startTime;
  }

  private shouldTrack(): boolean {
    // Respecter DNT (Do Not Track)
    if (navigator.doNotTrack === '1') return false;
    
    // Ne pas tracker en mode développement (optionnel)
    if (window.location.hostname === 'localhost') return false;
    
    return true;
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined;

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      // Éviter de tracker des données sensibles
      if (this.isSensitiveKey(key)) continue;
      
      // Limiter la taille des valeurs
      if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '...';
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'email', 'phone'];
    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    );
  }

  private startBatchFlush() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // En mode développement, juste logger
      if (window.location.hostname === 'localhost') {
        console.log('Analytics Events:', eventsToSend);
        return;
      }

      // Envoyer à l'endpoint Supabase analytics
      const response = await fetch('https://cxcdfurwsefllhxucjnz.supabase.co/functions/v1/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Y2RmdXJ3c2VmbGxoeHVjam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MzE1NTAsImV4cCI6MjA2NTQwNzU1MH0.7N280pwCrxSuWY1_fJhicTLKVGgYnnRWp9T14edhyJM`,
        },
        body: JSON.stringify({ events: eventsToSend }),
      });

      if (!response.ok) {
        // Remettre les événements en queue en cas d'erreur
        this.events.unshift(...eventsToSend);
      }
    } catch (error) {
      // Remettre les événements en queue en cas d'erreur réseau
      this.events.unshift(...eventsToSend);
      console.warn('Analytics flush failed:', error);
    }
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(); // Flush final
  }
}

// Instance globale
export const analytics = new AnalyticsService();

// Hook React pour utiliser l'analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    clearUserId: analytics.clearUserId.bind(analytics),
  };
};

// Auto-tracking des erreurs
window.addEventListener('error', (event) => {
  analytics.trackError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  analytics.trackError(new Error(event.reason), {
    type: 'unhandled_promise_rejection',
  });
});

// Auto-tracking des performances
window.addEventListener('load', () => {
  // Attendre un peu pour que les métriques se stabilisent
  setTimeout(() => {
    analytics.trackPerformance();
  }, 1000);
});