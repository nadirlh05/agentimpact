
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Zap, Star, Check } from 'lucide-react';

const Credits = () => {
  const [creditsActuels] = useState(1250);
  
  const forfaits = [
    {
      nom: "Starter",
      credits: 500,
      prix: 9.99,
      populaire: false,
      avantages: [
        "500 crédits",
        "Support par email",
        "Projets illimités",
        "Export PDF"
      ]
    },
    {
      nom: "Pro",
      credits: 1500,
      prix: 24.99,
      populaire: true,
      avantages: [
        "1500 crédits",
        "Support prioritaire",
        "Projets illimités",
        "Export PDF & Word",
        "Templates premium"
      ]
    },
    {
      nom: "Business",
      credits: 5000,
      prix: 79.99,
      populaire: false,
      avantages: [
        "5000 crédits",
        "Support dédié",
        "Projets illimités",
        "Tous les exports",
        "Templates premium",
        "API access"
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Acheter des Crédits</h1>
        <p className="text-gray-600 mt-2">Rechargez votre compte pour continuer à créer des projets</p>
      </div>

      {/* Solde actuel */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Solde actuel</h3>
              <p className="text-3xl font-bold">{creditsActuels.toLocaleString()} crédits</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forfaits */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choisir un forfait</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forfaits.map((forfait) => (
            <Card 
              key={forfait.nom} 
              className={`relative ${forfait.populaire ? 'ring-2 ring-blue-500 scale-105' : ''}`}
            >
              {forfait.populaire && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Populaire
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{forfait.nom}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{forfait.prix}€</span>
                  <span className="text-gray-500 ml-1">/ mois</span>
                </div>
                <p className="text-blue-600 font-medium">{forfait.credits.toLocaleString()} crédits</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {forfait.avantages.map((avantage, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{avantage}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${forfait.populaire ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={forfait.populaire ? 'default' : 'outline'}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Choisir ce forfait
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
              <p className="text-gray-500">Vos achats de crédits apparaîtront ici</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Credits;
