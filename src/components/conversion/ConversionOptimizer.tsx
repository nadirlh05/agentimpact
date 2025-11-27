
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
      company: "Agence MDL Immobilier",
      text: "L'automatisation IA a multiplié nos prises de mandats par 3",
      rating: 5
    },
    {
      name: "Thomas L.",
      company: "Agence Immobilière L&P",
      text: "ROI de 300% en 6 mois grâce à l'automatisation de la prospection",
      rating: 5
    },
    {
      name: "Sophie M.",
      company: "Mandataire Immobilier Premium",
      text: "Agent IA : +40% de satisfaction acquéreurs, -60% temps traitement",
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
      <Card className="border-2 border-primary/30 shadow-lg">
        <CardContent className="p-6 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Transformez votre agence immobilière avec l'IA
          </h3>
          <p className="text-muted-foreground mb-6">
            Audit gratuit de 45 minutes pour identifier vos opportunités d'automatisation immobilière
          </p>
          
          <div className="space-y-4">
            <Button 
              size="lg" 
              className={`w-full ${variant === 'primary' ? '' : 'bg-green-600 hover:bg-green-700'} font-semibold py-4 text-lg`}
              onClick={() => {
                handleCTAClick('primary_consultation');
                window.location.href = '/contact';
              }}
            >
              Réserver ma consultation gratuite
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
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
