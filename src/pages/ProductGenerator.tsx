
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

const ProductGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const exemplesSolutions = [
    {
      titre: "Agent IA Facturation Intelligente",
      description: "Automatisation complète de votre processus de facturation",
      icon: Bot,
      couleur: "bg-blue-500",
      exemples: [
        "Génération automatique de factures",
        "Relances clients personnalisées",
        "Détection d'anomalies de paiement",
        "Intégration comptabilité automatique"
      ],
      solution: "Agent Facturation Pro",
      prix: "À partir de 3 500€"
    },
    {
      titre: "Gestionnaire IA Fournisseurs",
      description: "Optimisez vos relations et négociations fournisseurs",
      icon: MessageSquare,
      couleur: "bg-green-500",
      exemples: [
        "Suivi automatique des commandes",
        "Négociation de prix intelligente",
        "Évaluation performance fournisseurs",
        "Prédiction des ruptures de stock"
      ],
      solution: "Gestionnaire Fournisseurs IA",
      prix: "À partir de 4 000€"
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
      solution: "CRM IA Enterprise",
      prix: "À partir de 3 000€"
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
    
    // Simuler une action de contact
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Demande envoyée !",
      description: `Nous vous recontacterons sous 24h pour discuter de la solution ${solution}.`,
    });
    
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
              Agents IA pour Facturation & Gestion Clients/Fournisseurs
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Solutions spécialisées pour automatiser votre gestion administrative, optimiser vos relations
              clients/fournisseurs et réduire vos coûts de 70%.
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
                    
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Ce que nous mettons en place :</h4>
                        <ul className="space-y-2">
                          {solution.exemples.map((exemple, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{exemple}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {solution.solution}
                          </Badge>
                          <span className="font-bold text-lg text-gray-900">{solution.prix}</span>
                        </div>
                        
                        <Button 
                          className="w-full"
                          onClick={() => handleContactSolution(solution.solution)}
                          disabled={isLoading === solution.solution}
                        >
                          {isLoading === solution.solution ? 'En cours...' : 'Demander un devis'}
                        </Button>
                      </div>
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
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/contact')}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Consultation gratuite
              </Button>
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
