import React, { useState } from 'react';
import { MessageSquare, X, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOptimizedAnalytics } from '@/lib/analytics-optimized';
import { cn } from '@/lib/utils';
import { CalendlyWidget } from '@/components/calendly/CalendlyWidget';

interface FloatingActionButtonProps {
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trackUserAction } = useOptimizedAnalytics();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    trackUserAction('floating_menu_toggle', { action: isOpen ? 'close' : 'open' });
  };

  const handleActionClick = (action: string) => {
    trackUserAction('floating_action_click', { action });
    setIsOpen(false);
  };

  const actions = [
    {
      icon: Phone,
      label: 'Appeler',
      action: 'call',
      href: 'tel:+33123456789',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Mail,
      label: 'Email',
      action: 'email',
      href: 'mailto:contact@agentimpact.fr',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: MessageSquare,
      label: 'Consultation',
      action: 'consultation',
      href: '#calendly',
      color: 'bg-violet-600 hover:bg-violet-700'
    }
  ];

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Actions menu - apparaît quand ouvert */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {actions.map((action, index) => (
            <div
              key={action.action}
              className="flex items-center space-x-3 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="shadow-lg">
                <CardContent className="p-2">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {action.label}
                  </span>
                </CardContent>
              </Card>
              <Button
                size="sm"
                className={cn("w-12 h-12 rounded-full shadow-lg", action.color)}
                onClick={() => {
                  handleActionClick(action.action);
                  if (action.href === '#calendly') {
                    // Ouvrir Calendly
                    if (window.Calendly) {
                      window.Calendly.initPopupWidget({
                        url: 'https://calendly.com/nadir-lahyani11/30min'
                      });
                    }
                  } else if (action.href.startsWith('#')) {
                    // Handle other internal actions
                  } else {
                    window.location.href = action.href;
                  }
                }}
              >
                <action.icon className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <Button
        size="lg"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          isOpen 
            ? "bg-red-600 hover:bg-red-700 rotate-45" 
            : "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
        )}
        onClick={handleToggle}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </Button>

      {/* Pulse effect when closed */}
      {!isOpen && (
        <div className="absolute inset-0 w-14 h-14 rounded-full bg-blue-400 animate-ping opacity-20"></div>
      )}
    </div>
  );
};

export default FloatingActionButton;
