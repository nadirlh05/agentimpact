
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
    { icon: TrendingUp, text: "ROI moyen 250%", color: "text-primary" },
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
              className={`w-full ${variant === 'primary' ? 'bg-gradient-primary hover:brightness-110' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-4 text-lg`}
              onClick={() => {
                handleCTAClick('primary_consultation');
                window.location.href = '/contact';
              }}
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


    </div>
  );
};

export default ConversionOptimizer;
