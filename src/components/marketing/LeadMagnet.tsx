
import React, { useState } from 'react';
import { Download, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOptimizedAnalytics } from '@/lib/analytics-optimized';
import { useToast } from '@/hooks/use-toast';

interface LeadMagnetProps {
  type?: 'checklist' | 'guide' | 'template';
  title?: string;
  description?: string;
}

export const LeadMagnet: React.FC<LeadMagnetProps> = ({
  type = 'checklist',
  title,
  description
}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { trackUserAction, trackConversion } = useOptimizedAnalytics();
  const { toast } = useToast();

  const leadMagnets = {
    checklist: {
      title: "Checklist : 15 Points pour Automatiser votre Facturation",
      description: "Guide pratique pour identifier et automatiser vos processus de facturation",
      icon: CheckCircle,
      benefits: [
        "Réduisez les erreurs de facturation de 90%",
        "Automatisez les relances clients",
        "Gagnez 10h par semaine",
        "Améliorez votre trésorerie"
      ]
    },
    guide: {
      title: "Guide Complet : IA pour PME (50 pages)",
      description: "Tout ce que vous devez savoir sur l'IA pour transformer votre entreprise",
      icon: FileText,
      benefits: [
        "Cas d'usage concrets par secteur",
        "ROI et retours d'expérience",
        "Étapes d'implémentation détaillées",
        "Éviter les pièges courants"
      ]
    },
    template: {
      title: "Template : Cahier des Charges IA",
      description: "Modèle complet pour définir votre projet d'automatisation",
      icon: Download,
      benefits: [
        "Structure éprouvée",
        "Questions essentielles à se poser",
        "Critères de sélection des outils IA",
        "Planning type de déploiement"
      ]
    }
  };

  const currentMagnet = leadMagnets[type];
  const IconComponent = currentMagnet.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName) return;

    setIsLoading(true);
    
    try {
      // Track conversion
      trackConversion('lead_magnet_download', 1, {
        type,
        email,
        first_name: firstName
      });

      trackUserAction('lead_magnet_submit', {
        type,
        email,
        first_name: firstName
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      toast({
        title: "Téléchargement en cours",
        description: "Votre ressource va être envoyée par email dans quelques instants.",
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Merci {firstName} !
          </h3>
          <p className="text-green-700 mb-4">
            Votre ressource sera envoyée à <strong>{email}</strong> dans les prochaines minutes.
          </p>
          <p className="text-sm text-green-600">
            N'oubliez pas de vérifier vos spams si vous ne recevez rien.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 shadow-lg">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {title || currentMagnet.title}
        </CardTitle>
        <p className="text-gray-600">
          {description || currentMagnet.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Bénéfices */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Ce que vous allez obtenir :</h4>
          <ul className="space-y-1">
            {currentMagnet.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Votre prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="border-gray-300"
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Votre email professionnel"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-300"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              "Préparation..."
            ) : (
              <>
                Télécharger gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          ✓ Aucun spam • ✓ Désinscription facile • ✓ Données sécurisées
        </p>
      </CardContent>
    </Card>
  );
};

export default LeadMagnet;
