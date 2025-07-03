import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  triggerSource?: 'manual' | 'timer' | 'exit-intent' | 'inactivity';
}

export const AIAssistant = ({ isOpen, onClose, triggerSource = 'manual' }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Welcome message based on trigger source
  const getWelcomeMessage = () => {
    switch (triggerSource) {
      case 'exit-intent':
        return "👋 Je vois que vous vous apprêtez à partir ! Puis-je vous aider à trouver ce que vous cherchez ?";
      case 'timer':
        return "👋 Bonjour ! Je suis votre assistant IA. Puis-je vous aider à découvrir nos solutions d'automatisation ?";
      case 'inactivity':
        return "👋 Besoin d'aide pour naviguer sur notre site ? Je suis là pour vous accompagner !";
      default:
        return "👋 Bonjour ! Je suis l'assistant IA de Digital Future Agents. Comment puis-je vous aider aujourd'hui ?";
    }
  };

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: crypto.randomUUID(),
        text: getWelcomeMessage(),
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, triggerSource]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: userMessage.text,
          sessionId,
          userId: user?.id
        }
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        text: data.response || "Je suis désolé, je n'ai pas pu traiter votre demande.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show human support suggestion if needed
      if (data.needsHumanSupport) {
        setTimeout(() => {
          const supportMessage: Message = {
            id: crypto.randomUUID(),
            text: "💬 Souhaitez-vous être mis en relation avec notre équipe support pour une assistance personnalisée ?",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, supportMessage]);
        }, 1000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Je rencontre des difficultés techniques. Veuillez réessayer ou contacter notre support directement.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erreur de connexion",
        description: "Impossible de contacter l'assistant IA.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleContactSupport = () => {
    onClose();
    // Navigate to support page
    window.location.href = '/support';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 md:w-96">
      <Card className={`shadow-large border-primary/20 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
        <CardHeader className="p-4 bg-gradient-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>Assistant IA</span>
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 text-primary-foreground hover:bg-white/20"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(500px-64px)]">
            {/* Messages area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        message.isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Support quick actions */}
                {messages.some(m => m.text.includes('équipe support')) && (
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      onClick={handleContactSupport}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Contacter le support
                    </Button>
                  </div>
                )}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-muted-foreground">Assistant réfléchit...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input area */}
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  placeholder="Tapez votre message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Propulsé par Gemini AI • Vos données sont sécurisées
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};