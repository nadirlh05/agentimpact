
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Key, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
  hasValidKey: boolean;
}

export const ApiKeyInput = ({ onApiKeyChange, hasValidKey }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isStored, setIsStored] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Charger la clé depuis le localStorage au démarrage
    const storedKey = localStorage.getItem('ai_generator_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      onApiKeyChange(storedKey);
      setIsStored(true);
    }
  }, [onApiKeyChange]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('ai_generator_api_key', apiKey.trim());
      onApiKeyChange(apiKey.trim());
      setIsStored(true);
      toast({
        title: "Clé API sauvegardée",
        description: "Votre clé API a été sauvegardée localement de manière sécurisée.",
      });
    }
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    setIsStored(false);
    if (value.trim()) {
      onApiKeyChange(value.trim());
    }
  };

  const clearKey = () => {
    localStorage.removeItem('ai_generator_api_key');
    setApiKey("");
    onApiKeyChange("");
    setIsStored(false);
    toast({
      title: "Clé API supprimée",
      description: "Votre clé API a été supprimée du stockage local.",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-blue-600" />
          <span>Configuration API</span>
          {hasValidKey && (
            <span className="text-sm font-normal text-green-600">✓ Configurée</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">Clé API OpenRouter</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => handleKeyChange(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {!isStored && apiKey.trim() && (
              <Button onClick={handleSaveKey} size="sm">
                <Save className="w-4 h-4 mr-1" />
                Sauvegarder
              </Button>
            )}
            {isStored && (
              <Button onClick={clearKey} variant="outline" size="sm">
                Effacer
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Votre clé API est stockée localement dans votre navigateur et n'est jamais envoyée à nos serveurs.
          <br />
          Obtenez votre clé sur{" "}
          <a 
            href="https://openrouter.ai/keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            OpenRouter.ai
          </a>
        </p>
      </CardContent>
    </Card>
  );
};
