
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Wand2, CheckCircle, ArrowRight, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OpenRouterService } from "@/services/openRouterService";
import { useNavigate } from "react-router-dom";

interface GeneratedExample {
  solution: string;
  benefits: string[];
  implementation: string[];
  pricing: string;
}

export const ExampleGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedExample, setGeneratedExample] = useState<GeneratedExample | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessType: "",
    challenge: "",
    budget: ""
  });

  const businessTypes = [
    "PME/TPE",
    "E-commerce", 
    "Services B2B",
    "Distribution/Négoce",
    "Consulting/Services",
    "Manufacturing/Production",
    "SaaS/Tech",
    "Retail/Commerce",
    "Agence/Freelance",
    "Autre"
  ];

  const budgetRanges = [
    "< 5 000€",
    "5 000€ - 15 000€", 
    "15 000€ - 50 000€",
    "50 000€ - 100 000€",
    "> 100 000€"
  ];

  const handleGenerate = async () => {
    if (!formData.businessType || !formData.challenge.trim()) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir le type d'entreprise et le défi.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const service = new OpenRouterService();
      const example = await service.generateExample(formData);
      setGeneratedExample(example);
      
      toast({
        title: "Exemple généré !",
        description: "Votre exemple d'accompagnement IA a été créé avec succès.",
      });
    } catch (error) {
      // Error handled by user feedback
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedExample(null);
    setFormData({
      businessType: "",
      challenge: "",
      budget: ""
    });
  };

  return (
    <div className="space-y-6">

      {/* Formulaire de génération */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span>Générateur de solutions IA Facturation & Gestion</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type d'entreprise</Label>
              <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre secteur" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Budget approximatif (optionnel)</Label>
              <Select value={formData.budget} onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une fourchette" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((budget) => (
                    <SelectItem key={budget} value={budget}>
                      {budget}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Défis en facturation/gestion clients-fournisseurs</Label>
            <Textarea
              placeholder="Ex: Nous perdons du temps sur la facturation manuelle et les relances clients, ou nos relations fournisseurs sont mal organisées..."
              value={formData.challenge}
              onChange={(e) => setFormData(prev => ({ ...prev, challenge: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Génération...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Générer un exemple
                </>
              )}
            </Button>
            
            {generatedExample && (
              <Button variant="outline" onClick={handleReset}>
                Nouveau exemple
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Résultat généré */}
      {generatedExample && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-green-700">Exemple d'accompagnement généré</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Solution */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Solution recommandée :</h4>
              <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{generatedExample.solution}</p>
            </div>

            {/* Bénéfices */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Bénéfices attendus :</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {generatedExample.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Étapes d'implémentation */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Étapes d'implémentation :</h4>
              <div className="space-y-3">
                {generatedExample.implementation.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prix */}
            <div className="bg-gradient-to-r from-blue-50 to-violet-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Estimation tarifaire :</span>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600 font-bold">
                  {generatedExample.pricing}
                </Badge>
              </div>
            </div>

            {/* CTA */}
            <div className="border-t pt-4">
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                onClick={() => navigate('/contact')}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Discuter de cette solution
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
