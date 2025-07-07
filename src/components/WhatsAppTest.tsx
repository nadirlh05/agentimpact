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
    setIsLoading(true);
    try {
      // Test diagnostic d'abord
      const { data: diagnosticData, error: diagnosticError } = await supabase.functions.invoke('whatsapp-test');
      
      // Diagnostic WhatsApp completed
      
      if (diagnosticError) {
        toast({
          title: "Erreur de diagnostic",
          description: `Erreur: ${diagnosticError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      if (diagnosticData) {
        toast({
          title: "Diagnostic terminé",
          description: `Vérifiez la console pour les détails. Status: ${diagnosticData.environment?.TWILIO_CONNECTION || 'Unknown'}`,
        });
        
        // Si le diagnostic est bon et qu'on a un numéro, tester l'envoi
        if (to && message && diagnosticData.environment?.TWILIO_CONNECTION === 'SUCCESS') {
          const { data: sendData, error: sendError } = await supabase.functions.invoke('whatsapp-handler', {
            body: { to, message }
          });
          
          if (sendError) {
            // Error handled
            toast({
              title: "Erreur d'envoi",
              description: `Erreur: ${sendError.message}`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Message envoyé",
              description: "Message WhatsApp envoyé avec succès !",
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du test",
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