import { useEffect } from 'react';
import { useAnalytics } from '@/lib/analytics';

// Core Web Vitals monitoring component
export const SEOPerformanceMonitor = () => {
  const { track } = useAnalytics();

  useEffect(() => {
    // Monitor Core Web Vitals
    const monitorPerformance = () => {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            track('core_web_vitals', {
              metric: 'LCP',
              value: lastEntry.startTime,
              rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs_improvement' : 'poor'
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            const fidValue = entry.processingStart - entry.startTime;
            track('core_web_vitals', {
              metric: 'FID',
              value: fidValue,
              rating: fidValue <= 100 ? 'good' : fidValue <= 300 ? 'needs_improvement' : 'poor'
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const layoutShiftEntry = entry as any;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
          track('core_web_vitals', {
            metric: 'CLS',
            value: clsValue,
            rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs_improvement' : 'poor'
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Cleanup function
        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      }
    };

    monitorPerformance();

    // Page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            track('page_performance', {
              load_time: navigation.loadEventEnd - navigation.loadEventStart,
              dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              first_byte: navigation.responseStart - navigation.requestStart,
              page_url: window.location.href
            });
          }
        }, 0);
      });
    }
  }, [track]);

  // Monitor scroll depth for engagement
  useEffect(() => {
    let maxScrollDepth = 0;
    
    const trackScrollDepth = () => {
      const scrollDepth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollDepth)) {
          track('scroll_depth', {
            depth: scrollDepth,
            page_url: window.location.href
          });
        }
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      
      // Track final scroll depth on unmount
      if (maxScrollDepth > 0) {
        track('session_scroll_depth', {
          max_depth: maxScrollDepth,
          page_url: window.location.href
        });
      }
    };
  }, [track]);

  return null; // This component doesn't render anything
};

export default SEOPerformanceMonitor;