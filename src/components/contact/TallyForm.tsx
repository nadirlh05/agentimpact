import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink, Settings } from "lucide-react";

interface TallyFormProps {
  tallyUrl?: string;
  onUrlChange?: (url: string) => void;
}

export const TallyForm = ({ tallyUrl, onUrlChange }: TallyFormProps) => {
  const [isConfiguring, setIsConfiguring] = useState(!tallyUrl);
  const [tempUrl, setTempUrl] = useState(tallyUrl || "");

  // Charger l'URL depuis localStorage au montage
  useEffect(() => {
    const savedUrl = localStorage.getItem("tally-form-url");
    if (savedUrl && !tallyUrl) {
      onUrlChange?.(savedUrl);
      setIsConfiguring(false);
    }
  }, [tallyUrl, onUrlChange]);

  const handleSaveUrl = () => {
    if (tempUrl.trim()) {
      const cleanUrl = tempUrl.trim();
      onUrlChange?.(cleanUrl);
      localStorage.setItem("tally-form-url", cleanUrl);
      setIsConfiguring(false);
    }
  };

  const handleConfigureNew = () => {
    setIsConfiguring(true);
    setTempUrl(tallyUrl || "");
  };

  if (isConfiguring) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configuration Tally
          </CardTitle>
          <p className="text-gray-600">
            Collez l'URL d'intégration de votre formulaire Tally
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Comment obtenir l'URL Tally :</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Allez sur <a href="https://tally.so" target="_blank" rel="noopener noreferrer" className="underline">tally.so</a></li>
                <li>Créez ou ouvrez votre formulaire</li>
                <li>Cliquez sur "Share" ou "Partager"</li>
                <li>Sélectionnez "Embed" puis "Standard embed"</li>
                <li>Copiez l'URL qui ressemble à : https://tally.so/embed/YOUR-FORM-ID</li>
              </ol>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tallyUrl">URL du formulaire Tally</Label>
              <Input
                id="tallyUrl"
                type="url"
                placeholder="https://tally.so/embed/YOUR-FORM-ID"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveUrl}
                disabled={!tempUrl.trim()}
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
              >
                Intégrer le formulaire
              </Button>
              {tallyUrl && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsConfiguring(false)}
                >
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tallyUrl) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-12">
          <p className="text-gray-600 mb-4">Aucun formulaire Tally configuré</p>
          <Button onClick={() => setIsConfiguring(true)}>
            Configurer Tally
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Planifier ma consultation
          </CardTitle>
          <p className="text-gray-600">
            Remplissez ce formulaire et nous vous contacterons sous 24h
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(tallyUrl.replace('/embed/', '/r/'), '_blank')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            Ouvrir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleConfigureNew}
            className="flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
            Modifier
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <iframe
            src={tallyUrl}
            width="100%"
            height="600"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Formulaire de consultation"
            className="rounded-b-lg"
            style={{ 
              minHeight: '600px',
              background: 'transparent'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};