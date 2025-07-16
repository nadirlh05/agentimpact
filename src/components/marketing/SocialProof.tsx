
import React from 'react';
import { Star, Users, TrendingUp, Award, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SocialProofProps {
  variant?: 'compact' | 'detailed';
}

export const SocialProof: React.FC<SocialProofProps> = ({ variant = 'detailed' }) => {
  const stats = [
    { icon: Users, value: "50+", label: "Clients accompagnés", color: "text-blue-600" },
    { icon: TrendingUp, value: "85%", label: "Gain de productivité", color: "text-green-600" },
    { icon: Award, value: "4.8/5", label: "Note moyenne", color: "text-yellow-600" },
    { icon: Building2, value: "8", label: "Secteurs d'activité", color: "text-purple-600" }
  ];

  const testimonials = [
    {
      name: "Jean M.",
      role: "Directeur administratif",
      company: "Entreprise familiale",
      sector: "Commerce",
      content: "L'automatisation de nos factures nous fait gagner environ 10h par semaine. Plus d'erreurs de saisie et les relances se font automatiquement.",
      rating: 5,
      results: "10h gagnées/semaine"
    },
    {
      name: "Claire R.",
      role: "Responsable achats",
      company: "PME industrielle",
      sector: "Industrie",
      content: "Le suivi de nos fournisseurs est maintenant centralisé. On compare plus facilement les prix et on évite les ruptures de stock.",
      rating: 4,
      results: "Meilleur suivi"
    },
    {
      name: "Marc D.",
      role: "Gérant",
      company: "Start-up tech",
      sector: "Technologie",
      content: "Notre site web créé par l'IA nous a permis d'avoir une présence professionnelle rapidement, sans développeur externe.",
      rating: 5,
      results: "Site en 2 semaines"
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
            4.8/5 basé sur 50+ avis clients
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

      {/* Témoignages détaillés */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center text-gray-900">
          Témoignages clients
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {testimonial.results}
                  </Badge>
                </div>

                {/* Témoignage */}
                <p className="text-gray-700 text-sm mb-4 italic">
                  "{testimonial.content}"
                </p>

                {/* Auteur */}
                <div className="border-t pt-4">
                  <div className="font-medium text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-gray-500">
                    {testimonial.company} • {testimonial.sector}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Certifications et labels */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 text-center mb-4">
          Certifications et Garanties
        </h4>
        <div className="flex flex-wrap justify-center gap-3">
          {certifications.map((cert, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {cert}
            </Badge>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">
          Sécurité et conformité garanties
        </p>
      </div>

      {/* Logos clients (placeholder) */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Ils nous font confiance
        </p>
        <div className="flex justify-center items-center space-x-8 opacity-60">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-16 h-8 bg-gray-200 rounded flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialProof;
