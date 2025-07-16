
import React from 'react';
import { ArrowRight, Star, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOptimizedAnalytics } from '@/lib/analytics-optimized';

interface ConversionOptimizerProps {
  variant?: 'primary' | 'secondary';
  showTestimonials?: boolean;
  showTrustSignals?: boolean;
}

export const ConversionOptimizer: React.FC<ConversionOptimizerProps> = ({
  variant = 'primary',
  showTestimonials = true,
  showTrustSignals = true
}) => {
  const { trackUserAction } = useOptimizedAnalytics();

  const handleCTAClick = (ctaType: string) => {
    trackUserAction('conversion_cta_click', {
      cta_type: ctaType,
      variant,
      location: 'conversion_optimizer'
    });
  };

  const testimonials = [
    {
      name: "Marie D.",
      company: "Startup Tech",
      text: "L'automatisation IA a réduit nos erreurs de facturation de 95%",
      rating: 5
    },
    {
      name: "Thomas L.",
      company: "PME Services",
      text: "ROI de 300% en 6 mois grâce à l'optimisation fournisseurs",
      rating: 5
    },
    {
      name: "Sophie M.",
      company: "E-commerce",
      text: "Agent IA clients : +40% de satisfaction, -60% temps traitement",
      rating: 5
    }
  ];

  const trustSignals = [
    { icon: CheckCircle, text: "99,9% de fiabilité", color: "text-green-600" },
    { icon: TrendingUp, text: "ROI moyen 250%", color: "text-blue-600" },
    { icon: Star, text: "4.9/5 satisfaction client", color: "text-yellow-600" }
  ];

  return (
    <div className="space-y-8">

      {/* CTA principal optimisé */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardContent className="p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Transformez votre entreprise avec l'IA
          </h3>
          <p className="text-gray-600 mb-6">
            Audit gratuit de 45 minutes pour identifier vos opportunités d'automatisation
          </p>
          
          <div className="space-y-4">
            <Button 
              size="lg" 
              className={`w-full ${variant === 'primary' ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-4 text-lg`}
              onClick={() => handleCTAClick('primary_consultation')}
            >
              Réserver ma consultation gratuite
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>✓ Sans engagement</span>
              <span>✓ Audit personnalisé</span>
              <span>✓ Recommandations concrètes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signaux de confiance */}
      {showTrustSignals && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trustSignals.map((signal, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-4">
                <signal.icon className={`w-8 h-8 mx-auto mb-2 ${signal.color}`} />
                <p className="font-medium text-gray-900">{signal.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Témoignages sociaux */}
      {showTestimonials && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-center text-gray-900">
            Ce que disent nos clients
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">"{testimonial.text}"</p>
                  <div className="text-xs">
                    <span className="font-medium">{testimonial.name}</span>
                    <span className="text-gray-500"> - {testimonial.company}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CTA secondaire */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h4 className="font-semibold text-gray-900 mb-2">
          Pas encore prêt pour une consultation ?
        </h4>
        <p className="text-gray-600 mb-4">
          Découvrez nos services et cas d'usage en détail
        </p>
        <Button 
          variant="outline" 
          onClick={() => handleCTAClick('secondary_services')}
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          Explorer nos services
        </Button>
      </div>
    </div>
  );
};

export default ConversionOptimizer;
