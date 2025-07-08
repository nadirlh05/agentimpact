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
  url = 'https://calendly.com/agentimpact/consultation-gratuite',
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
    console.log('Clic sur le bouton Calendly...');
    console.log('window.Calendly existe:', !!window.Calendly);
    
    if (window.Calendly) {
      const prefillData = {
        name: prefill?.name || user?.user_metadata?.full_name || '',
        email: prefill?.email || user?.email || '',
        phone: prefill?.phone || '',
        ...prefill
      };

      console.log('Ouverture du popup Calendly avec les données:', prefillData);
      
      try {
        window.Calendly.initPopupWidget({
          url: url,
          prefill: prefillData,
          utm: {
            utmCampaign: 'AgentImpact Website',
            utmSource: 'website',
            utmMedium: 'widget'
          }
        });
      } catch (error) {
        console.error('Erreur lors de l\'ouverture du popup Calendly:', error);
      }
    } else {
      console.error('window.Calendly n\'est pas disponible');
      // Fallback: ouvrir dans un nouvel onglet
      window.open(url, '_blank');
    }
  };

  const renderInlineWidget = () => (
    <div 
      className={`calendly-inline-widget ${className}`}
      data-url={url}
      style={{ minWidth: '320px', height: '630px' }}
    />
  );

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
    url="https://calendly.com/agentimpact/consultation-gratuite"
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
    url="https://calendly.com/agentimpact/suivi-projet"
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
    url="https://calendly.com/agentimpact/demo-solution"
    buttonText="Demander une démo"
    buttonVariant="secondary"
    size={size}
    className={className}
  />
);

export default CalendlyWidget;