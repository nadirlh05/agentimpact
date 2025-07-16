import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  ChevronRight, 
  Settings,
  BarChart3,
  Lightbulb,
  CheckCircle,
  Rocket,
  Clock,
  DollarSign,
  MessageSquare,
  Code,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AIAssistantTrigger } from "@/components/AIAssistantTrigger";
import { useAnalytics } from "@/lib/analytics";
import ConversionOptimizer from "@/components/conversion/ConversionOptimizer";
import LeadMagnet from "@/components/marketing/LeadMagnet";
import FloatingActionButton from "@/components/ui/floating-action-button";
import SEOHead from "@/components/SEOHead";
import SocialProof from "@/components/marketing/SocialProof";
import heroImage from "@/assets/hero-supplier-management.jpg";
import { CalendlyWidget } from "@/components/calendly/CalendlyWidget";

const Index = () => {
  const navigate = useNavigate();
  const { trackUserAction } = useAnalytics();

  // Track page view
  useEffect(() => {
    trackUserAction('homepage_view', {
      page: 'index',
      timestamp: Date.now()
    });
  }, [trackUserAction]);

  // Check if this is a password reset redirect
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    
    if (hash.includes('access_token') && hash.includes('type=recovery')) {
      // Redirect to auth page with the hash intact
      navigate('/auth' + hash);
    } else if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
      // Handle password reset errors
      navigate('/auth?error=expired');
    } else if (search.includes('type=recovery')) {
      // Direct recovery URL redirect
      navigate('/auth?type=recovery');
    }
  }, [navigate]);

  return (
    <>
      <SEOHead 
        title="AgentImpact.fr - Solutions IA sur mesure | Automatisation & Agents Intelligents"
        description="🚀 Transformez votre entreprise avec nos solutions IA personnalisées : facturation automatique, CRM intelligent, gestion fournisseurs. Consultation gratuite ✅ ROI garanti 📈"
        canonical="https://agentimpact.fr"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              AgentImpact.fr
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Button 
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Connexion
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section - IA Services */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border">
                <Brain className="w-5 h-5 text-violet-600" />
                <span className="text-sm font-medium text-gray-700">Spécialiste IA & Automatisation</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Agents IA pour <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">facturation & gestion clients/fournisseurs</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Spécialiste des solutions IA pour automatiser votre facturation, optimiser la gestion de vos fournisseurs et améliorer vos relations clients. 
              Réduisez vos coûts administratifs de 70%.
            </p>
            
            <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  trackUserAction('cta_services_click', {
                    location: 'hero_section',
                    button_text: 'Découvrir mes Services'
                  });
                  navigate('/services');
                }}
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg px-8 py-4"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Découvrir mes services
              </Button>
              <Button
                onClick={() => {
                  trackUserAction('cta_consultation_click', {
                    location: 'hero_section',
                    button_text: 'Consultation Gratuite'
                  });
                  navigate('/contact');
                }}
                size="lg"
                variant="outline"
                className="border-2 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white text-lg px-8 py-4 bg-white"
              >
                Consultation gratuite
              </Button>
            </div>

            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Solutions personnalisées</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Accompagnement dédié</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-violet-600" />
                <span>Optimisation des processus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Spécialisées Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Solutions spécialisées
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Agents IA dédiés à la gestion financière et administrative de votre entreprise
            </p>
          </div>
          
          {/* Grid with 3 services */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
              {/* Agent IA Facturation */}
              <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Agent IA facturation</h3>
                    <p className="text-gray-600 text-sm">Automatise vos factures et relances clients</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-gray-900 text-sm">Fonctionnalités :</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Création automatique des factures</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Relances clients par email</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Suivi des paiements</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Rapports simplifiés</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        Gain de temps : 80%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>2-3 semaines</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent IA Fournisseurs */}
              <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                      <Lightbulb className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Agent IA fournisseurs</h3>
                    <p className="text-gray-600 text-sm">Optimise la gestion de vos fournisseurs</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-gray-900 text-sm">Fonctionnalités :</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Suivi des commandes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Comparaison des prix</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Alertes de livraison</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Évaluation fournisseurs</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                        Économies : 15-25%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>2-4 semaines</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent IA Création Site internet */}
              <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                      <Code className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Agent IA création site internet</h3>
                    <p className="text-gray-600 text-sm">Crée votre site web professionnel automatiquement</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-gray-900 text-sm">Fonctionnalités :</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Design responsive automatique</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Génération de contenu IA</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Optimisation SEO intégrée</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">Hébergement inclus</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-violet-600 border-violet-600 text-xs">
                        ROI : +200%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>1-2 semaines</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Preuve Sociale Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SocialProof variant="detailed" />
        </div>
      </section>


      {/* Conversion Optimizer Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-violet-50">
        <div className="container mx-auto px-4">
          <ConversionOptimizer 
            variant="primary"
            showTestimonials={true}
            showTrustSignals={true}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">
              Automatisez votre gestion administrative aujourd'hui
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Réduisez vos erreurs de facturation et optimisez vos relations clients/fournisseurs avec l'IA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                onClick={() => navigate('/services')}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Découvrir les services
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20 backdrop-blur-sm bg-white/10"
                onClick={() => navigate('/support')}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Discuter de mon besoin
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <FloatingActionButton />

        {/* AI Assistant */}
        <AIAssistantTrigger autoTriggerEnabled={true} timerDelay={25000} />
      </div>
    </>
  );
};

export default Index;
