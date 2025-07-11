
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';

interface CalendlyWidgetProps {
  type?: 'inline' | 'popup' | 'button';
  url?: string;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  className?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
}

declare global {
  interface Window {
    Calendly: any;
  }
}

export const CalendlyWidget: React.FC<CalendlyWidgetProps> = ({
  type = 'button',
  url = 'https://calendly.com/nadir-lahyani11/30min',
  prefill,
  className = '',
  buttonText = 'Planifier une consultation',
  buttonVariant = 'default',
  size = 'default'
}) => {
  const { user } = useAuth();

  useEffect(() => {
    // Charger le script Calendly si pas déjà chargé
    if (!window.Calendly) {
      console.log('Chargement du script Calendly...');
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        console.log('Script Calendly chargé avec succès');
      };
      script.onerror = (error) => {
        console.error('Erreur lors du chargement du script Calendly:', error);
      };
      document.head.appendChild(script);
    } else {
      console.log('Script Calendly déjà chargé');
    }
  }, []);

  const handleCalendlyClick = () => {
    const calendlyUrl = url || 'https://calendly.com/nadir-lahyani11/30min';
    window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
  };

  const renderInlineWidget = () => {
    useEffect(() => {
      // Initialiser le widget inline une fois que Calendly est chargé
      const initializeWidget = () => {
        if (window.Calendly) {
          const container = document.querySelector('.calendly-inline-widget');
          if (container) {
            container.innerHTML = ''; // Clear any existing content
            window.Calendly.initInlineWidget({
              url: url,
              parentElement: container,
              prefill: prefill || {},
              utm: {}
            });
          }
        }
      };

      // Si Calendly est déjà chargé, initialiser immédiatement
      if (window.Calendly) {
        initializeWidget();
      } else {
        // Sinon, attendre que le script soit chargé
        const checkCalendly = setInterval(() => {
          if (window.Calendly) {
            clearInterval(checkCalendly);
            initializeWidget();
          }
        }, 100);

        return () => clearInterval(checkCalendly);
      }
    }, [url, prefill]);

    return (
      <div 
        className={`calendly-inline-widget ${className}`}
        style={{ minWidth: '320px', height: '630px' }}
      />
    );
  };

  const renderButton = () => (
    <Button
      onClick={handleCalendlyClick}
      variant={buttonVariant}
      size={size}
      className={`${className} flex items-center space-x-2`}
    >
      <Calendar className="w-4 h-4" />
      <span>{buttonText}</span>
    </Button>
  );

  if (type === 'inline') {
    return renderInlineWidget();
  }

  return renderButton();
};

// Composant spécialisé pour la consultation gratuite
export const ConsultationButton: React.FC<{
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}> = ({ className, size = 'default', variant = 'default' }) => (
  <CalendlyWidget
    type="button"
    url="https://calendly.com/nadir-lahyani11/30min"
    buttonText="Consultation gratuite"
    buttonVariant={variant}
    size={size}
    className={className}
  />
);

// Composant spécialisé pour planifier un suivi
export const SuiviButton: React.FC<{
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}> = ({ className, size = 'default' }) => (
  <CalendlyWidget
    type="button"
    url="https://calendly.com/nadir-lahyani11/30min"
    buttonText="Planifier un suivi"
    buttonVariant="outline"
    size={size}
    className={className}
  />
);

// Composant pour la démonstration
export const DemoButton: React.FC<{
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}> = ({ className, size = 'default' }) => (
  <CalendlyWidget
    type="button"
    url="https://calendly.com/nadir-lahyani11/30min"
    buttonText="Demander une démo"
    buttonVariant="secondary"
    size={size}
    className={className}
  />
);

export default CalendlyWidget;
