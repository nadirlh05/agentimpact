import React, { useEffect } from 'react';

interface CalendlyInlineWidgetProps {
  url?: string;
  minWidth?: string;
  height?: string;
  className?: string;
}

export const CalendlyInlineWidget: React.FC<CalendlyInlineWidgetProps> = ({
  url = 'https://calendly.com/nadir-lahyani11/30min',
  minWidth = '320px',
  height = '700px',
  className = ''
}) => {
  useEffect(() => {
    // Charger le script Calendly si pas déjà chargé
    if (!document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className={className}>
      <div 
        className="calendly-inline-widget" 
        data-url={url}
        style={{ 
          minWidth, 
          height,
          width: '100%'
        }}
      />
    </div>
  );
};

export default CalendlyInlineWidget;