import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EnvTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testEnvironment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('debug-env');
      
      console.log('Environment test result:', data, error);
      
      if (error) {
        console.error('Erreur environment:', error);
        toast({
          title: "Erreur",
          description: `Erreur: ${error.message}`,
          variant: "destructive",
        });
      } else {
        setResult(data);
        const missingVars = Object.entries(data.environment || {})
          .filter(([key, value]) => value === 'MISSING')
          .map(([key]) => key);
          
        if (missingVars.length > 0) {
          toast({
            title: "Variables manquantes",
            description: `Variables non configurées: ${missingVars.join(', ')}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Configuration OK",
            description: "Toutes les variables sont configurées !",
          });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du test d'environnement",
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
          <Settings className="w-5 h-5" />
          <span>Test Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testEnvironment}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Test en cours...' : 'Tester la Configuration'}
        </Button>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">Variables d'environnement :</h4>
            {Object.entries(result.environment || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span>{key}:</span>
                <span className={value === 'CONFIGURED' ? 'text-green-600' : 'text-red-600'}>
                  {value as string}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnvTest;