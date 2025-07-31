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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Transformez votre entreprise
            </span>
            <br />
            avec l'Intelligence Artificielle
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Découvrez comment nos solutions IA personnalisées peuvent automatiser vos processus, 
            optimiser vos performances et propulser votre croissance.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-primary/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Assistants IA Personnalisés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Développement d'assistants virtuels intelligents adaptés à vos besoins spécifiques.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Support client automatisé 24/7</li>
                <li>• Traitement du langage naturel</li>
                <li>• Intégration multi-canaux</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
              <CardTitle className="text-xl">Analyse Prédictive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Anticipez les tendances et optimisez vos décisions grâce à l'analyse de données avancée.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Prévisions de ventes</li>
                <li>• Détection d'anomalies</li>
                <li>• Optimisation des stocks</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Automatisation Intelligente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Automatisez vos processus métier avec des workflows intelligents et adaptatifs.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Traitement automatique de documents</li>
                <li>• Workflows personnalisés</li>
                <li>• Intégration système</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Personnalisation Avancée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Créez des expériences utilisateur personnalisées grâce à l'apprentissage automatique.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Recommandations intelligentes</li>
                <li>• Segmentation comportementale</li>
                <li>• Optimisation continue</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-pink-600" />
              </div>
              <CardTitle className="text-xl">Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Transformez vos données en insights actionables avec des tableaux de bord intelligents.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Dashboards temps réel</li>
                <li>• Métriques personnalisées</li>
                <li>• Rapports automatisés</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10"></div>
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle className="text-xl">Sécurité & Conformité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Protégez vos données avec des solutions IA sécurisées et conformes aux réglementations.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Chiffrement avancé</li>
                <li>• Conformité RGPD</li>
                <li>• Audit et traçabilité</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-white mb-16">
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
                className="bg-white text-primary hover:bg-gray-50 px-8 py-3 text-lg font-semibold"
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
              className="bg-accent text-white hover:bg-accent/90 border-2 border-white/20 px-8 py-3 text-lg font-semibold shadow-lg"
              url="https://calendly.com/nadir-lahyani11/30min"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
