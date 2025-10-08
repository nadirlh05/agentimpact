import { useState } from "react";
import { ArrowLeft, Bot, Users, Zap, CheckCircle, Star, MessageSquare, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import UserProfile from "@/components/UserProfile";
import { useToast } from "@/hooks/use-toast";
import { ExampleGenerator } from "@/components/ExampleGenerator";
import { useAuth } from "@/contexts/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { CalendlyWidget } from "@/components/calendly/CalendlyWidget";

const ProductGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const exemplesSolutions = [
    {
      titre: "Agent IA Prospection Immobilière",
      description: "Automatisation complète de votre prospection vendeurs",
      icon: Bot,
      couleur: "bg-blue-500",
      exemples: [
        "Identification automatique de prospects",
        "Scripts de prospection personnalisés",
        "Suivi automatique des contacts",
        "Prédiction des vendeurs potentiels"
      ],
      solution: "Agent Prospection Pro"
    },
    {
      titre: "Agent IA Gestion Biens Immobiliers",
      description: "Optimisez la gestion de votre portefeuille immobilier",
      icon: MessageSquare,
      avantages: [
        "Estimation automatique des biens",
        "Suivi intelligent des mandats",
        "Diffusion multi-portails automatique",
        "Alertes visites et signatures",
        "Analyse du marché local"
      ],
      solution: "Agent IA Gestion Biens"
    },
    {
      titre: "CRM Client Intelligence",
      description: "Gestion automatisée des relations clients",
      icon: Users,
      couleur: "bg-purple-500",
      exemples: [
        "Segmentation client automatique",
        "Prédiction des besoins clients",
        "Gestion des réclamations IA",
        "Suivi satisfaction temps réel"
      ],
      solution: "CRM IA Enterprise"
    }
  ];

  const processusAide = [
    {
      etape: "1",
      titre: "Analyse de vos besoins",
      description: "Nous étudions en détail vos processus actuels et identifions les opportunités d'automatisation"
    },
    {
      etape: "2", 
      titre: "Conception sur mesure",
      description: "Nous concevons une solution IA parfaitement adaptée à votre secteur et vos contraintes"
    },
    {
      etape: "3",
      titre: "Développement & formation",
      description: "Nos experts développent votre IA et forment vos équipes pour une adoption optimale"
    },
    {
      etape: "4",
      titre: "Déploiement & suivi",
      description: "Mise en production sécurisée avec support continu et optimisations régulières"
    }
  ];

  const handleContactSolution = async (solution: string) => {
    setIsLoading(solution);
    
    try {
      console.log("Début de handleContactSolution pour:", solution);
      console.log("User:", user);
      
      // Récupérer les détails de la solution
      const solutionDetails = exemplesSolutions.find(s => s.solution === solution);
      
      // Appeler la fonction Edge pour envoyer l'email et créer l'opportunité
      console.log("Appel de la fonction send-quote-request...");
      const { data, error } = await supabase.functions.invoke('send-quote-request', {
        body: {
          solutionName: solution,
          solutionPrice: 'Prix sur demande',
          userEmail: user?.email,
          userId: user?.id
        }
      });
      
      console.log("Réponse de la fonction:", { data, error });

      if (error) {
        // Error handled by user feedback
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'envoi de votre demande.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Demande envoyée !",
          description: `Nous avons bien reçu votre demande pour ${solution}. Nous vous recontacterons sous 24h.`,
        });
      }
    } catch (error) {
      // Error handled by user feedback
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande.",
        variant: "destructive",
      });
    }
    
    setIsLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Solutions IA Sur Mesure
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <UserProfile />
            <Button 
              onClick={() => navigate('/credits')}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Voir nos tarifs
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Section d'introduction */}
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Agents IA pour Agents Immobiliers & Mandataires
            </h1>
            <p className="text-gray-600 mb-8">
              Solutions spécialisées pour automatiser votre prospection, gérer vos biens et optimiser votre relation client. 
              Gagnez 70% de temps sur vos tâches administratives.
            </p>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="examples" className="mb-16">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="examples">Exemples de solutions</TabsTrigger>
            <TabsTrigger value="generator">Générateur personnalisé</TabsTrigger>
          </TabsList>

          <TabsContent value="examples" className="space-y-16">
            {/* Exemples de solutions */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Exemples de solutions que nous créons
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {exemplesSolutions.map((solution, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 ${solution.couleur} rounded-xl flex items-center justify-center mb-4`}>
                        <solution.icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl text-gray-900">{solution.titre}</CardTitle>
                      <p className="text-gray-600">{solution.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {solution.solution}
                        </Badge>
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => handleContactSolution(solution.solution)}
                        disabled={isLoading === solution.solution}
                      >
                        {isLoading === solution.solution ? 'En cours...' : 'Demander un devis'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Notre processus */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Notre processus d'accompagnement
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {processusAide.map((etape, index) => (
                  <Card key={index} className="text-center border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-lg">{etape.etape}</span>
                      </div>
                      <CardTitle className="text-lg">{etape.titre}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">{etape.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generator">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Générez un exemple personnalisé
              </h2>
              <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Décrivez votre entreprise et vos défis, notre IA vous proposera un exemple concret 
                d'accompagnement adapté à vos besoins.
              </p>
              <ExampleGenerator />
            </div>
          </TabsContent>
        </Tabs>

        {/* Section CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-violet-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-4">
              Prêt à transformer votre entreprise avec l'IA ?
            </h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Nos experts analysent gratuitement vos besoins et vous proposent une solution 
              d'intelligence artificielle parfaitement adaptée à votre activité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CalendlyWidget
                type="button"
                buttonText="Consultation gratuite"
                buttonVariant="secondary"
                size="lg"
                className="bg-white text-primary hover:bg-gray-100"
                url="https://calendly.com/nadir-lahyani11/30min"
              />
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/credits')}
                className="border-white text-white hover:bg-white/10"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Voir tous nos tarifs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductGenerator;
