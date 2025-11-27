import { 
  Brain, 
  Sparkles, 
  Bot, 
  TrendingUp, 
  Shield, 
  Users, 
  MessageCircle, 
  ChevronRight,
  ArrowRight,
  Zap,
  Target,
  Rocket,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { CalendlyWidget } from '@/components/calendly/CalendlyWidget';

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">
              Générateur IA
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Se connecter
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-primary">
              Transformez votre entreprise
            </span>
            <br />
            <span className="text-foreground">avec l'Intelligence Artificielle</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Découvrez comment nos solutions IA personnalisées peuvent automatiser vos processus, 
            optimiser vos performances et propulser votre croissance.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="relative overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Assistants IA Personnalisés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Développement d'assistants virtuels intelligents adaptés à vos besoins spécifiques.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Support client automatisé 24/7</li>
                <li>• Traitement du langage naturel</li>
                <li>• Intégration multi-canaux</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Analyse Prédictive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Anticipez les tendances et optimisez vos décisions grâce à l'analyse de données avancée.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Prévisions de ventes</li>
                <li>• Détection d'anomalies</li>
                <li>• Optimisation des stocks</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-500/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Automatisation Intelligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Automatisez vos processus métier avec des workflows intelligents et adaptatifs.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Traitement automatique de documents</li>
                <li>• Workflows personnalisés</li>
                <li>• Intégration système</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-xl">Personnalisation Avancée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Créez des expériences utilisateur personnalisées grâce à l'apprentissage automatique.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Recommandations intelligentes</li>
                <li>• Segmentation comportementale</li>
                <li>• Optimisation continue</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-pink-500/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle className="text-xl">Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Transformez vos données en insights actionables avec des tableaux de bord intelligents.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Dashboards temps réel</li>
                <li>• Métriques personnalisées</li>
                <li>• Rapports automatisés</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Sécurité & Conformité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Protégez vos données avec des solutions IA sécurisées et conformes aux réglementations.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Chiffrement avancé</li>
                <li>• Conformité RGPD</li>
                <li>• Audit et traçabilité</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-[hsl(173,80%,25%)] rounded-2xl p-8 md:p-12 text-center text-white mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à transformer votre entreprise ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Créez votre compte pour accéder à nos outils de configuration et commencer votre projet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-muted px-8 py-3 text-lg font-semibold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Créer mon compte
              </Button>
            </Link>
            <CalendlyWidget
              type="button"
              buttonText="Consultation gratuite"
              buttonVariant="default"
              size="lg"
              className="bg-white/10 text-white hover:bg-white/20 border-2 border-white/20 px-8 py-3 text-lg font-semibold shadow-lg"
              url="https://calendly.com/nadir-lahyani-agentimpact/30min"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
