
import React from 'react';
import { Star, Users, TrendingUp, Award, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SocialProofProps {
  variant?: 'compact' | 'detailed';
}

export const SocialProof: React.FC<SocialProofProps> = ({ variant = 'detailed' }) => {
  const stats = [
    { icon: Users, value: "100%", label: "Satisfaction garantie", color: "text-blue-600" },
    { icon: TrendingUp, value: "85%", label: "Gain de productivité possible", color: "text-green-600" },
    { icon: Award, value: "24h", label: "Support réactif", color: "text-yellow-600" },
    { icon: Building2, value: "8+", label: "Secteurs d'activité", color: "text-purple-600" }
  ];

  const benefits = [
    {
      title: "Automatisation des processus",
      description: "Gagnez du temps sur vos tâches répétitives",
      impact: "Jusqu'à 10h/semaine"
    },
    {
      title: "Centralisation des données",
      description: "Tous vos outils connectés en un seul endroit",
      impact: "Vision globale"
    },
    {
      title: "Solutions sur mesure",
      description: "Adaptées à votre secteur d'activité",
      impact: "ROI optimisé"
    }
  ];

  const certifications = [
    "Conformité RGPD",
    "Hébergement français",
    "Support technique",
    "Garantie satisfaction"
  ];

  if (variant === 'compact') {
    return (
      <div className="space-y-6">
        {/* Stats compactes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="font-bold text-lg">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Étoiles et avis */}
        <div className="text-center">
          <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Solutions IA sur mesure
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bénéfices et promesses */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center text-gray-900">
          Ce que vous pouvez attendre
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 mb-2">{benefit.title}</div>
                  <p className="text-gray-700 text-sm mb-3">{benefit.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {benefit.impact}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SocialProof;
