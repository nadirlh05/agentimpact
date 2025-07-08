
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useOptimizedAnalytics } from '@/lib/analytics-optimized';

export const usePageTracking = () => {
  const location = useLocation();
  const { track, trackUserAction } = useOptimizedAnalytics();

  useEffect(() => {
    // Track page view
    track('page_view', {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now()
    });

    // Track time spent on page
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Date.now() - startTime;
      if (timeSpent > 1000) { // Only track if spent more than 1 second
        track('page_exit', {
          path: location.pathname,
          time_spent: timeSpent
        });
      }
    };
  }, [location, track]);

  // Track scroll depth
  useEffect(() => {
    let maxScrollDepth = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollDepth = Math.round(
          ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
        );
        
        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;
          
          // Track milestone scroll depths
          if ([25, 50, 75, 90, 100].includes(scrollDepth)) {
            track('scroll_milestone', {
              depth: scrollDepth,
              path: location.pathname
            });
          }
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      
      // Track final scroll depth
      if (maxScrollDepth > 0) {
        track('final_scroll_depth', {
          max_depth: maxScrollDepth,
          path: location.pathname
        });
      }
    };
  }, [location.pathname, track]);

  // Track user interactions
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Track clicks on important elements
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button, a')) {
        const element = target.closest('button, a') || target;
        trackUserAction('click', {
          element_type: element.tagName.toLowerCase(),
          element_text: element.textContent?.trim().substring(0, 100),
          element_id: element.id,
          element_class: element.className,
          path: location.pathname
        });
      }
    };

    const handleFormSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      if (form) {
        trackUserAction('form_submit', {
          form_id: form.id,
          form_class: form.className,
          path: location.pathname
        });
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleFormSubmit);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleFormSubmit);
    };
  }, [location.pathname, trackUserAction]);

  return {
    trackCustomEvent: track,
    trackUserAction
  };
};
