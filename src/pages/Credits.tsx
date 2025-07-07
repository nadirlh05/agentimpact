
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Zap, Star, Check, Bot, Users, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Credits = () => {
  const [creditsActuels] = useState(1250);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();
  
  const forfaits = [
    {
      nom: "Assistant IA Basic",
      prix: 29,
      prixOriginal: null,
      populaire: false,
      icon: Bot,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonStyle: "variant-outline",
      avantages: [
        "Réponses automatiques 24/7",
        "Gestion des demandes simples",
        "Intégration site web & email",
        "Support par email"
      ],
      garanties: [
        "Configuration personnalisée",
        "Support réactif",
        "Satisfaction garantie"
      ]
    },
    {
      nom: "Assistant IA Pro",
      prix: 227,
      prixOriginal: 320,
      populaire: true,
      icon: Zap,
      iconBg: "bg-blue-600",
      iconColor: "text-white",
      buttonStyle: "default",
      placesRestantes: "2 places restantes !",
      avantages: [
        "Automatisation complète",
        "Gestion intelligente des emails",
        "Génération de devis",
        "Support prioritaire 24/7",
        "Intégration CRM avancée",
        "Analyses et rapports détaillés"
      ],
      garanties: [
        "Configuration personnalisée",
        "Support réactif",
        "Satisfaction garantie"
      ]
    },
    {
      nom: "Crew AI Enterprise",
      prix: "Sur mesure",
      prixOriginal: null,
      populaire: false,
      icon: Users,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      buttonStyle: "variant-outline",
      avantages: [
        "Équipe d'agents IA spécialisés",
        "Automatisation sur mesure",
        "Intégration complète",
        "Support dédié 24/7",
        "Formation personnalisée",
        "Solutions sur mesure"
      ],
      garanties: [
        "Configuration personnalisée",
        "Support réactif",
        "Satisfaction garantie"
      ]
    }
  ];

  useEffect(() => {
    // Check for payment success/cancel in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const plan = urlParams.get('plan');

    if (success === 'true' && plan) {
      toast({
        title: "Paiement réussi !",
        description: `Votre abonnement ${plan} a été activé avec succès.`,
      });
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      toast({
        title: "Paiement annulé",
        description: "Votre paiement a été annulé. Vous pouvez réessayer à tout moment.",
        variant: "destructive",
      });
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handlePayment = async (forfait: typeof forfaits[0]) => {
    if (typeof forfait.prix !== 'number') {
      toast({
        title: "Contact requis",
        description: "Pour ce forfait, veuillez nous contacter directement.",
      });
      return;
    }

    setIsLoading(forfait.nom);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          planName: forfait.nom,
          amount: forfait.prix,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      // Error handled by user feedback
      toast({
        title: "Erreur de paiement",
        description: "Une erreur s'est produite lors du traitement du paiement. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Solutions & Tarifs</h1>
        <p className="text-muted-foreground mt-2">Choisissez l'offre qui correspond le mieux à vos besoins d'automatisation IA</p>
      </div>

      {/* Solde actuel */}
      <Card className="bg-gradient-primary text-primary-foreground shadow-large">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Solde actuel</h3>
              <p className="text-3xl font-bold">{creditsActuels.toLocaleString()} crédits</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forfaits */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choisir un forfait</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {forfaits.map((forfait) => (
            <Card 
              key={forfait.nom} 
              className={`relative ${forfait.populaire ? 'ring-2 ring-blue-500 scale-105 shadow-2xl' : 'shadow-lg'} transition-all duration-300 hover:shadow-xl`}
            >
              {forfait.populaire && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Recommandé
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${forfait.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <forfait.icon className={`w-8 h-8 ${forfait.iconColor}`} />
                </div>
                
                <CardTitle className="text-xl text-gray-900">{forfait.nom}</CardTitle>
                
                <div className="mt-4">
                  {forfait.prixOriginal && (
                    <div className="text-gray-400 line-through text-lg">{forfait.prixOriginal}€</div>
                  )}
                  <div className="flex items-center justify-center">
                    {typeof forfait.prix === 'number' ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900">{forfait.prix}€</span>
                        <span className="text-gray-500 ml-1">/mois</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">{forfait.prix}</span>
                    )}
                  </div>
                  {forfait.placesRestantes && (
                    <p className="text-red-500 font-medium text-sm mt-2">{forfait.placesRestantes}</p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Fonctionnalités incluses :</h4>
                  <ul className="space-y-2">
                    {forfait.avantages.map((avantage, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{avantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Garanties :</h4>
                  <ul className="space-y-2">
                    {forfait.garanties.map((garantie, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-blue-600">{garantie}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className={`w-full ${
                    forfait.populaire 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                  variant={forfait.buttonStyle === 'default' ? 'default' : 'outline'}
                  onClick={() => handlePayment(forfait)}
                  disabled={isLoading === forfait.nom}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isLoading === forfait.nom ? 'Traitement...' : 'Commencer maintenant'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Historique des achats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Historique des achats</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun achat</h3>
              <p className="text-gray-500">Vos achats d'abonnements apparaîtront ici</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Credits;
