import { useEffect } from 'react';

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Optimize images loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
      if (!img.decoding) {
        img.decoding = 'async';
      }
    });

    // Preload critical resources
    const linkElements = [
      { rel: 'preload', href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    ];

    linkElements.forEach(linkAttrs => {
      const existingLink = document.querySelector(`link[href="${linkAttrs.href}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        Object.entries(linkAttrs).forEach(([key, value]) => {
          if (key === 'crossorigin' && value) {
            link.setAttribute(key, value === 'anonymous' ? '' : value as string);
          } else {
            link.setAttribute(key, value as string);
          }
        });
        document.head.appendChild(link);
      }
    });

    // Optimize scroll performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Scroll optimizations
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resource hints for better loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.classList.add('will-change-transform');
          
          // Remove will-change after animation
          setTimeout(() => {
            element.classList.remove('will-change-transform');
          }, 1000);
        }
      });
    });

    // Observe cards and interactive elements
    const interactiveElements = document.querySelectorAll('.card, .button, [class*="hover:"]');
    interactiveElements.forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return null;
};

export default PerformanceOptimizer;