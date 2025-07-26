import { useState, useEffect } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIAssistant } from './AIAssistant';

interface AIAssistantTriggerProps {
  autoTriggerEnabled?: boolean;
  timerDelay?: number; // in milliseconds
  inactivityDelay?: number; // in milliseconds  
  className?: string;
}

export const AIAssistantTrigger = ({ 
  autoTriggerEnabled = true, 
  timerDelay = 30000, // 30 seconds
  inactivityDelay = 45000, // 45 seconds
  className = ''
}: AIAssistantTriggerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerSource, setTriggerSource] = useState<'manual' | 'timer' | 'exit-intent' | 'inactivity'>('manual');
  const [showPulse, setShowPulse] = useState(false);
  const [hasTriggeredTimer, setHasTriggeredTimer] = useState(false);
  const [hasTriggeredInactivity, setHasTriggeredInactivity] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  // Timer-based trigger
  useEffect(() => {
    if (!autoTriggerEnabled || hasTriggeredTimer || isOpen) return;

    const timer = setTimeout(() => {
      setTriggerSource('timer');
      setIsOpen(true);
      setHasTriggeredTimer(true);
      setShowPulse(false);
    }, timerDelay);

    // Show pulse animation 5 seconds before auto-trigger
    const pulseTimer = setTimeout(() => {
      setShowPulse(true);
    }, Math.max(0, timerDelay - 5000));

    return () => {
      clearTimeout(timer);
      clearTimeout(pulseTimer);
    };
  }, [autoTriggerEnabled, timerDelay, hasTriggeredTimer, isOpen]);

  // Inactivity-based trigger
  useEffect(() => {
    if (!autoTriggerEnabled || hasTriggeredInactivity || isOpen) return;

    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      
      if (timeSinceLastActivity >= inactivityDelay) {
        setTriggerSource('inactivity');
        setIsOpen(true);
        setHasTriggeredInactivity(true);
        setShowPulse(false);
      }
    };

    const interval = setInterval(checkInactivity, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [autoTriggerEnabled, inactivityDelay, lastActivity, hasTriggeredInactivity, isOpen]);

  // Exit intent trigger
  useEffect(() => {
    if (!autoTriggerEnabled || isOpen) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from the top of the page
      if (e.clientY <= 0 && e.relatedTarget === null) {
        setTriggerSource('exit-intent');
        setIsOpen(true);
        setShowPulse(false);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [autoTriggerEnabled, isOpen]);

  const handleManualOpen = () => {
    setTriggerSource('manual');
    setIsOpen(true);
    setShowPulse(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9998]">
          <Button
            onClick={handleManualOpen}
            className={`
              relative rounded-full w-14 h-14 p-0
              bg-gradient-to-r from-blue-600 to-violet-600 
              hover:from-blue-700 hover:to-violet-700
              text-white shadow-lg border-0
              transition-all duration-300 hover:scale-105
              ${showPulse ? 'animate-pulse scale-110' : ''}
              ${className}
            `}
            size="sm"
          >
            <div className="relative">
              <Sparkles className="w-6 h-6" />
              
              {/* Notification badge for auto-triggers */}
              {showPulse && (
                <Badge 
                  className="absolute -top-2 -right-2 w-3 h-3 p-0 bg-orange-500 border-2 border-white animate-bounce"
                >
                  <span className="sr-only">Notification</span>
                </Badge>
              )}
              
              {/* Ripple animation */}
              {showPulse && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 animate-ping opacity-30" />
              )}
            </div>
          </Button>
          
          {/* Helper tooltip */}
          {showPulse && (
            <div className="absolute bottom-16 right-0 bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap animate-fade-in border">
              💬 Besoin d'aide ? Cliquez ici !
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
            </div>
          )}
        </div>
      )}

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={isOpen}
        onClose={handleClose}
        triggerSource={triggerSource}
      />
    </>
  );
};