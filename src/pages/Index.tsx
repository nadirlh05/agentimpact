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
  Bot,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
        title="AgentImpact.fr - Solutions IA pour Agents Immobiliers | Automatisation & Prospection"
        description="🚀 Solutions IA dédiées aux agents immobiliers et mandataires : prospection automatique, gestion de biens, CRM intelligent. Consultation gratuite ✅ +60% de productivité 📈"
        canonical="https://agentimpact.fr"
      />
      
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">
              AgentImpact.fr
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Button 
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Connexion
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section - IA Services */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-[hsl(210,29%,8%)] to-secondary">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-secondary/50 backdrop-blur-md px-4 py-2 rounded-full border border-border/30">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Spécialiste IA & Automatisation</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Boostez votre activité immobilière avec <span className="text-primary">l'Intelligence Artificielle</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Solutions IA spécialisées pour automatiser votre prospection, gérer vos biens et optimiser votre relation client. 
              Gagnez 70% de temps sur vos tâches administratives.
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
                className="text-lg px-8 py-4"
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
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4"
              >
                Consultation gratuite
              </Button>
            </div>

            <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Solutions personnalisées</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Accompagnement dédié</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Optimisation des processus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Spécialisées Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Solutions spécialisées
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Agents IA dédiés à votre activité immobilière : prospection, gestion et relation client
            </p>
          </div>
          
          {/* Grid with 4 services */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
              {/* Agent IA Prospection */}
              <Card className="border border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Agent IA prospection</h3>
                    <p className="text-muted-foreground text-sm">Automatise votre recherche de mandats</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-foreground text-sm">Fonctionnalités :</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Identification prospects vendeurs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Scripts personnalisés</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Relances automatiques</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Suivi des contacts</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        +300% de mandats
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>2-3 semaines</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent IA Gestion Biens Immobiliers */}
              <Card className="border border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
                      <Lightbulb className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Agent IA gestion biens</h3>
                    <p className="text-muted-foreground text-sm">Gère et optimise votre portefeuille immobilier</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-foreground text-sm">Fonctionnalités :</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Estimation automatique</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Suivi des mandats</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Alertes visites & signatures</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Diffusion multi-portails</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-primary border-primary text-xs">
                        Gain de temps : 60%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>2-4 semaines</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent IA Création Site internet */}
              <Card className="border border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
                      <Code className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Agent IA création site internet</h3>
                    <p className="text-muted-foreground text-sm">Crée votre site web professionnel automatiquement</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-foreground text-sm">Fonctionnalités :</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Design responsive automatique</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Génération de contenu IA</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Optimisation SEO intégrée</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Hébergement inclus</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-primary border-primary text-xs">
                        ROI : +200%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>1-2 semaines</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Agent IA Gestion Emails */}
              <Card className="border border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Agent IA gestion emails</h3>
                    <p className="text-muted-foreground text-sm">Automatise et optimise vos communications email</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-foreground text-sm">Fonctionnalités :</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Tri automatique des emails</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Réponses automatiques intelligentes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Planification d'envois</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Suivi d'engagement</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                        Productivité : +60%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>1-3 semaines</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Preuve Sociale Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <SocialProof variant="detailed" />
        </div>
      </section>


      {/* Conversion Optimizer Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <ConversionOptimizer 
            variant="primary"
            showTestimonials={true}
            showTrustSignals={true}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary via-[hsl(173,80%,25%)] to-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">
              Automatisez votre gestion administrative aujourd'hui
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/80">
              Automatisez votre prospection et multipliez vos transactions immobilières avec l'IA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-muted font-semibold"
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

      </div>
    </>
  );
};

export default Index;
