
import { useEffect, useRef, useCallback } from 'react';
import { useOptimizedAnalytics } from '@/lib/analytics-optimized';

// Hook pour optimiser les performances des composants
export const usePerformanceOptimizations = () => {
  const { track } = useOptimizedAnalytics();

  // Debounce utility
  const useDebounce = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T => {
    const timeoutRef = useRef<NodeJS.Timeout>();

    return useCallback(
      ((...args: Parameters<T>) => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => callback(...args), delay);
      }) as T,
      [callback, delay]
    );
  };

  // Throttle utility
  const useThrottle = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T => {
    const lastCallRef = useRef<number>(0);

    return useCallback(
      ((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCallRef.current >= delay) {
          lastCallRef.current = now;
          callback(...args);
        }
      }) as T,
      [callback, delay]
    );
  };

  // Intersection Observer hook for lazy loading
  const useIntersectionObserver = (
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ) => {
    const observerRef = useRef<IntersectionObserver>();
    const elementsRef = useRef<Set<Element>>(new Set());

    useEffect(() => {
      observerRef.current = new IntersectionObserver(callback, {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      });

      return () => {
        observerRef.current?.disconnect();
      };
    }, [callback]);

    const observe = useCallback((element: Element) => {
      if (observerRef.current && element) {
        observerRef.current.observe(element);
        elementsRef.current.add(element);
      }
    }, []);

    const unobserve = useCallback((element: Element) => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
        elementsRef.current.delete(element);
      }
    }, []);

    return { observe, unobserve };
  };

  // Memory leak prevention
  const useMemoryLeakPrevention = () => {
    const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());
    const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

    const addTimer = useCallback((timer: NodeJS.Timeout) => {
      timersRef.current.add(timer);
    }, []);

    const addInterval = useCallback((interval: NodeJS.Timeout) => {
      intervalsRef.current.add(interval);
    }, []);

    useEffect(() => {
      return () => {
        // Clear all timers and intervals
        timersRef.current.forEach(clearTimeout);
        intervalsRef.current.forEach(clearInterval);
      };
    }, []);

    return { addTimer, addInterval };
  };

  // Performance monitoring for components
  const useComponentPerformance = (componentName: string) => {
    const renderStartRef = useRef<number>();
    const mountTimeRef = useRef<number>();

    useEffect(() => {
      mountTimeRef.current = performance.now();
      
      return () => {
        if (mountTimeRef.current) {
          track('component_unmount', {
            component_name: componentName,
            mount_duration: performance.now() - mountTimeRef.current
          });
        }
      };
    }, [componentName, track]);

    const trackRenderStart = useCallback(() => {
      renderStartRef.current = performance.now();
    }, []);

    const trackRenderEnd = useCallback(() => {
      if (renderStartRef.current) {
        const renderTime = performance.now() - renderStartRef.current;
        if (renderTime > 16) { // Only track slow renders (>16ms)
          track('slow_render', {
            component_name: componentName,
            render_time: renderTime
          });
        }
      }
    }, [componentName, track]);

    return { trackRenderStart, trackRenderEnd };
  };

  // Image lazy loading optimization
  const useLazyImage = () => {
    const { observe, unobserve } = useIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              unobserve(img);
              
              track('image_lazy_loaded', {
                src: src,
                loading_time: performance.now()
              });
            }
          }
        });
      }
    );

    const setupLazyImage = useCallback((img: HTMLImageElement, src: string) => {
      img.dataset.src = src;
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+';
      observe(img);
    }, [observe]);

    return { setupLazyImage };
  };

  return {
    useDebounce,
    useThrottle,
    useIntersectionObserver,
    useMemoryLeakPrevention,
    useComponentPerformance,
    useLazyImage
  };
};

// Hook pour optimiser les requêtes API
export const useApiOptimizations = () => {
  const requestCacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const { track } = useOptimizedAnalytics();

  const cachedFetch = useCallback(async (
    url: string, 
    options?: RequestInit, 
    cacheTime = 300000 // 5 minutes par défaut
  ) => {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const cached = requestCacheRef.current.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      track('api_cache_hit', { url });
      return cached.data;
    }

    const startTime = performance.now();
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      requestCacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      track('api_request', {
        url,
        status: response.status,
        duration: performance.now() - startTime,
        cache_hit: false
      });

      return data;
    } catch (error) {
      track('api_error', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - startTime
      });
      throw error;
    }
  }, [track]);

  const clearCache = useCallback(() => {
    requestCacheRef.current.clear();
  }, []);

  return { cachedFetch, clearCache };
};
