
import { useEffect, useRef } from 'react';
import { useOptimizedAnalytics } from '@/lib/analytics-optimized';

interface PerformanceMonitorProps {
  trackingEnabled?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  trackingEnabled = true 
}) => {
  const { track } = useOptimizedAnalytics();
  const metricsRef = useRef<{
    startTime: number;
    domLoaded: boolean;
    resourcesLoaded: boolean;
  }>({
    startTime: performance.now(),
    domLoaded: false,
    resourcesLoaded: false
  });

  useEffect(() => {
    if (!trackingEnabled) return;

    const trackNavigationTiming = () => {
      if (!('performance' in window) || !performance.getEntriesByType) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (!navigation) return;

      const metrics = {
        dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp_connect: navigation.connectEnd - navigation.connectStart,
        ssl_negotiation: navigation.connectEnd - navigation.secureConnectionStart,
        time_to_first_byte: navigation.responseStart - navigation.requestStart,
        dom_interactive: navigation.domInteractive - navigation.fetchStart,
        dom_complete: navigation.domComplete - navigation.fetchStart,
        load_complete: navigation.loadEventEnd - navigation.fetchStart,
        page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
        redirect_time: navigation.redirectEnd - navigation.redirectStart,
        unload_time: navigation.unloadEventEnd - navigation.unloadEventStart
      };

      track('page_performance', {
        ...metrics,
        navigation_type: (performance as any).navigation?.type || 'unknown',
        page_url: window.location.href
      });
    };

    const trackResourceTiming = () => {
      if (!performance.getEntriesByType) return;

      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const resourceMetrics = resources.map(resource => ({
        name: resource.name,
        type: resource.initiatorType,
        size: resource.transferSize,
        duration: resource.duration,
        blocked_time: resource.domainLookupStart - resource.fetchStart,
        dns_time: resource.domainLookupEnd - resource.domainLookupStart,
        connect_time: resource.connectEnd - resource.connectStart,
        send_time: resource.responseStart - resource.requestStart,
        receive_time: resource.responseEnd - resource.responseStart
      }));

      // Track slow resources
      const slowResources = resourceMetrics.filter(r => r.duration > 1000);
      if (slowResources.length > 0) {
        track('slow_resources', {
          slow_resources: slowResources,
          total_resources: resourceMetrics.length
        });
      }

      // Track resource summary
      const resourceSummary = resourceMetrics.reduce((acc, resource) => {
        acc[resource.type] = acc[resource.type] || { count: 0, total_size: 0, total_duration: 0 };
        acc[resource.type].count++;
        acc[resource.type].total_size += resource.size;
        acc[resource.type].total_duration += resource.duration;
        return acc;
      }, {} as Record<string, any>);

      track('resource_performance', {
        resource_summary: resourceSummary,
        total_resources: resourceMetrics.length
      });
    };

    const trackMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        track('memory_usage', {
          used_js_heap_size: memory.usedJSHeapSize,
          total_js_heap_size: memory.totalJSHeapSize,
          js_heap_size_limit: memory.jsHeapSizeLimit,
          memory_pressure: memory.usedJSHeapSize / memory.jsHeapSizeLimit
        });
      }
    };

    // Track when DOM is ready
    const handleDOMContentLoaded = () => {
      metricsRef.current.domLoaded = true;
      track('dom_ready', {
        time_to_dom_ready: performance.now() - metricsRef.current.startTime
      });
    };

    // Track when all resources are loaded
    const handleLoad = () => {
      metricsRef.current.resourcesLoaded = true;
      setTimeout(() => {
        trackNavigationTiming();
        trackResourceTiming();
        trackMemoryUsage();
      }, 100);
    };

    // Set up event listeners
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    } else {
      handleDOMContentLoaded();
    }

    if (document.readyState !== 'complete') {
      window.addEventListener('load', handleLoad);
    } else {
      handleLoad();
    }

    // Track performance periodically
    const performanceInterval = setInterval(() => {
      trackMemoryUsage();
    }, 30000); // Every 30 seconds

    // Cleanup
    return () => {
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
      window.removeEventListener('load', handleLoad);
      clearInterval(performanceInterval);
    };
  }, [trackingEnabled, track]);

  return null; // This component renders nothing
};

export default PerformanceMonitor;
