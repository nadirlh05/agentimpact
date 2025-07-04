import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TwilioTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testTwilio = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('twilio-test');
      
      console.log('Twilio test result:', data, error);
      
      if (error) {
        console.error('Erreur Twilio test:', error);
        toast({
          title: "Erreur",
          description: `Erreur: ${error.message}`,
          variant: "destructive",
        });
      } else {
        setResult(data);
        toast({
          title: data.recommendation?.includes('✅') ? "Succès" : "Problème détecté",
          description: data.recommendation || "Test terminé",
          variant: data.recommendation?.includes('✅') ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du test Twilio",
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
          <Phone className="w-5 h-5" />
          <span>Test Twilio API</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testTwilio}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Test en cours...' : 'Tester Connexion Twilio'}
        </Button>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
            <div className="mb-2">
              <strong>Recommandation:</strong>
              <div className={result.recommendation?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {result.recommendation}
              </div>
            </div>
            
            {result.account && (
              <div className="mb-2">
                <strong>Compte Twilio:</strong>
                <div className={result.account.success ? 'text-green-600' : 'text-red-600'}>
                  Status {result.account.status} - {result.account.success ? 'OK' : 'Erreur'}
                </div>
                {result.account.error && (
                  <div className="text-red-600 text-xs mt-1">
                    {result.account.error}
                  </div>
                )}
              </div>
            )}
            
            {result.phoneNumbers && (
              <div>
                <strong>Numéro configuré:</strong>
                <div className="text-gray-700">
                  {result.phoneNumbers.configured}
                </div>
                {result.phoneNumbers.available && (
                  <div className="text-xs text-gray-500 mt-1">
                    Numéros disponibles: {result.phoneNumbers.available.length}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwilioTest;