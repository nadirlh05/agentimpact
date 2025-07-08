
// Service d'analytics optimisé avec gestion d'erreurs améliorée
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  session_id: string;
  user_id?: string;
  page_url: string;
  user_agent: string;
}

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

class OptimizedAnalyticsService {
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];
  private batchSize = 5; // Réduit pour moins de latence
  private flushInterval = 15000; // 15 secondes
  private flushTimer?: NodeJS.Timeout;
  private isOnline = true;
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupNetworkDetection();
    this.startBatchFlush();
    this.setupPerformanceMonitoring();
    this.trackPageView();
    this.setupPageViewTracking();
    this.setupErrorTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupNetworkDetection() {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flush(); // Flush events when back online
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  private setupPerformanceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Web Vitals monitoring
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.handlePerformanceEntry(entry);
        });
      });

      // Observe different types of performance entries
      const entryTypes = ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint'];
      
      entryTypes.forEach(entryType => {
        try {
          this.performanceObserver?.observe({ entryTypes: [entryType] });
        } catch (e) {
          console.warn(`Cannot observe ${entryType}:`, e);
        }
      });
    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry) {
    const properties: Record<string, any> = {
      entry_type: entry.entryType,
      start_time: entry.startTime,
      duration: entry.duration,
    };

    switch (entry.entryType) {
      case 'largest-contentful-paint':
        properties.lcp = entry.startTime;
        properties.rating = entry.startTime <= 2500 ? 'good' : entry.startTime <= 4000 ? 'needs_improvement' : 'poor';
        break;
      
      case 'first-input':
        const fidEntry = entry as any;
        const fidValue = fidEntry.processingStart - fidEntry.startTime;
        properties.fid = fidValue;
        properties.rating = fidValue <= 100 ? 'good' : fidValue <= 300 ? 'needs_improvement' : 'poor';
        break;
      
      case 'layout-shift':
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput) {
          properties.cls = clsEntry.value;
          properties.rating = clsEntry.value <= 0.1 ? 'good' : clsEntry.value <= 0.25 ? 'needs_improvement' : 'poor';
        }
        break;
      
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          properties.fcp = entry.startTime;
        }
        break;
    }

    this.track('performance_metric', properties);
  }

  private setupPageViewTracking() {
    let currentPath = window.location.pathname;
    
    // Debounced path change detection
    let pathChangeTimeout: NodeJS.Timeout;
    
    const checkPathChange = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView();
      }
    };

    // MutationObserver with throttling
    const observer = new MutationObserver(() => {
      clearTimeout(pathChangeTimeout);
      pathChangeTimeout = setTimeout(checkPathChange, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Enhanced history tracking
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => checkPathChange(), 0);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => checkPathChange(), 0);
    };

    window.addEventListener('popstate', () => {
      setTimeout(() => checkPathChange(), 0);
    });
  }

  private setupErrorTracking() {
    // Enhanced error tracking
    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        type: 'javascript_error'
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(String(event.reason)), {
        type: 'unhandled_promise_rejection',
        reason: event.reason
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as any;
        this.track('resource_error', {
          resource_type: target.tagName?.toLowerCase(),
          resource_src: target.src || target.href,
          error_type: 'load_failed'
        });
      }
    }, true);
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  clearUserId() {
    this.userId = undefined;
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.shouldTrack()) return;

    try {
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
      
      // Auto-flush if batch size reached or critical event
      if (this.events.length >= this.batchSize || this.isCriticalEvent(event)) {
        this.flush();
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  private isCriticalEvent(event: string): boolean {
    const criticalEvents = ['error', 'user_action', 'conversion', 'purchase'];
    return criticalEvents.includes(event);
  }

  trackPageView() {
    const properties = {
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      title: document.title,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      connection: this.getConnectionInfo()
    };

    this.track('page_view', properties);
  }

  private getConnectionInfo() {
    const nav = navigator as any;
    if (nav.connection) {
      return {
        effective_type: nav.connection.effectiveType,
        downlink: nav.connection.downlink,
        rtt: nav.connection.rtt
      };
    }
    return null;
  }

  trackUserAction(action: string, properties?: Record<string, any>) {
    this.track('user_action', {
      action,
      timestamp: Date.now(),
      ...properties,
    });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      context,
      url: window.location.href,
      user_agent: navigator.userAgent
    });
  }

  trackConversion(type: string, value?: number, properties?: Record<string, any>) {
    this.track('conversion', {
      conversion_type: type,
      value,
      currency: 'EUR',
      ...properties
    });
  }

  private shouldTrack(): boolean {
    // Respect DNT
    if (navigator.doNotTrack === '1') return false;
    
    // Don't track in development
    if (window.location.hostname === 'localhost') return false;
    
    // Don't track if explicitly disabled
    if (localStorage.getItem('analytics_disabled') === 'true') return false;
    
    return true;
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined;

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      if (this.isSensitiveKey(key)) continue;
      
      // Limit string values
      if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '...';
      } else if (typeof value === 'object' && value !== null) {
        // Sanitize nested objects
        sanitized[key] = JSON.parse(JSON.stringify(value).substring(0, 2000));
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'credit_card', 'ssn'];
    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    );
  }

  private startBatchFlush() {
    this.flushTimer = setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush() {
    if (this.events.length === 0 || !this.isOnline) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // Development mode
      if (window.location.hostname === 'localhost') {
        console.group('📊 Analytics Events');
        eventsToSend.forEach(event => {
          console.log(`${event.event}:`, event);
        });
        console.groupEnd();
        return;
      }

      // Production: send to Supabase with retry logic
      await this.sendWithRetry(eventsToSend);
    } catch (error) {
      // Re-queue events on failure
      this.events.unshift(...eventsToSend);
      console.warn('Analytics flush failed:', error);
    }
  }

  private async sendWithRetry(events: AnalyticsEvent[], retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch('https://cxcdfurwsefllhxucjnz.supabase.co/functions/v1/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Y2RmdXJ3c2VmbGxoeHVjam56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MzE1NTAsImV4cCI6MjA2NTQwNzU1MH0.7N280pwCrxSuWY1_fJhicTLKVGgYnnRWp9T14edhyJM`,
          },
          body: JSON.stringify({ events }),
        });

        if (response.ok) {
          return; // Success
        }
        
        if (response.status === 429) {
          // Rate limited, wait and retry
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          continue;
        }
        
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.flush(); // Final flush
  }
}

// Singleton instance
export const optimizedAnalytics = new OptimizedAnalyticsService();

// React hook
export const useOptimizedAnalytics = () => {
  return {
    track: optimizedAnalytics.track.bind(optimizedAnalytics),
    trackUserAction: optimizedAnalytics.trackUserAction.bind(optimizedAnalytics),
    trackError: optimizedAnalytics.trackError.bind(optimizedAnalytics),
    trackConversion: optimizedAnalytics.trackConversion.bind(optimizedAnalytics),
    setUserId: optimizedAnalytics.setUserId.bind(optimizedAnalytics),
    clearUserId: optimizedAnalytics.clearUserId.bind(optimizedAnalytics),
  };
};
