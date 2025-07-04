import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const WhatsAppTest = () => {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('Test depuis l\'app');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testWhatsApp = async () => {
    if (!to || !message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-handler', {
        body: { to, message }
      });

      if (error) {
        console.error('Erreur WhatsApp:', error);
        toast({
          title: "Erreur",
          description: `Erreur: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Succès WhatsApp:', data);
        toast({
          title: "Succès",
          description: "Message WhatsApp envoyé avec succès !",
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi du message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Test WhatsApp</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Numéro (avec +)</label>
          <Input
            placeholder="+33123456789"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Message</label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button
          onClick={testWhatsApp}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Envoi...' : 'Envoyer Test WhatsApp'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WhatsAppTest;