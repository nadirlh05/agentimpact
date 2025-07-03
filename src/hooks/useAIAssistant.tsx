import { useState, useEffect, useCallback } from 'react';

interface UseAIAssistantConfig {
  enableExitIntent?: boolean;
  enableTimer?: boolean;
  enableInactivity?: boolean;
  timerDelay?: number; // milliseconds
  inactivityDelay?: number; // milliseconds
}

export const useAIAssistant = (config: UseAIAssistantConfig = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerSource, setTriggerSource] = useState<'manual' | 'timer' | 'exit-intent' | 'inactivity'>('manual');
  const [hasTriggeredBefore, setHasTriggeredBefore] = useState(false);

  const {
    enableExitIntent = true,
    enableTimer = true,
    enableInactivity = true,
    timerDelay = 30000, // 30 seconds
    inactivityDelay = 60000 // 60 seconds
  } = config;

  // Check if user has already seen the assistant in this session
  useEffect(() => {
    const hasSeenAssistant = sessionStorage.getItem('ai_assistant_triggered');
    if (hasSeenAssistant) {
      setHasTriggeredBefore(true);
    }
  }, []);

  // Timer trigger
  useEffect(() => {
    if (!enableTimer || hasTriggeredBefore || isOpen) return;

    const timer = setTimeout(() => {
      triggerAssistant('timer');
    }, timerDelay);

    return () => clearTimeout(timer);
  }, [enableTimer, timerDelay, hasTriggeredBefore, isOpen]);

  // Inactivity trigger
  useEffect(() => {
    if (!enableInactivity || hasTriggeredBefore || isOpen) return;

    let inactivityTimer: NodeJS.Timeout;
    
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        triggerAssistant('inactivity');
      }, inactivityDelay);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Set initial timer
    resetInactivityTimer();
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, [enableInactivity, inactivityDelay, hasTriggeredBefore, isOpen]);

  // Exit intent trigger
  useEffect(() => {
    if (!enableExitIntent || hasTriggeredBefore || isOpen) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        triggerAssistant('exit-intent');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [enableExitIntent, hasTriggeredBefore, isOpen]);

  const triggerAssistant = useCallback((source: typeof triggerSource) => {
    if (hasTriggeredBefore || isOpen) return;
    
    setTriggerSource(source);
    setIsOpen(true);
    setHasTriggeredBefore(true);
    sessionStorage.setItem('ai_assistant_triggered', 'true');
  }, [hasTriggeredBefore, isOpen]);

  const openAssistant = useCallback(() => {
    setTriggerSource('manual');
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    triggerSource,
    openAssistant,
    closeAssistant,
    hasTriggeredBefore
  };
};