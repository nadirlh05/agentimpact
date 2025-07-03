import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIAssistantTriggerProps {
  onClick: () => void;
  className?: string;
}

export const AIAssistantTrigger = ({ onClick, className = '' }: AIAssistantTriggerProps) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-4 right-4 z-[9998] h-14 w-14 rounded-full bg-gradient-primary text-primary-foreground shadow-large hover:scale-105 transition-all duration-300 ${className}`}
      size="sm"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  );
};