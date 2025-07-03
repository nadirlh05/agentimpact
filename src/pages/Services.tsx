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
  Target,
  Cog,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      category: "Automatisation Intelligente",
      icon: Bot,
      description: "Robots et assistants IA personnalisés pour votre métier",
      features: [
        "Chatbots intelligents et contextuels",
        "Automatisation de processus métier (RPA)",
        "Intégration avec vos outils existants",
        "Formation et déploiement personnalisés"
      ],
      benefits: "Jusqu'à 80% de gain de temps",
      priceRange: "À partir de 2 000€",
      duration: "2-6 semaines"
    },
    {
      category: "Consultation IA",
      icon: Lightbulb,
      description: "Accompagnement stratégique et intégration d'IA",
      features: [
        "Audit de vos processus actuels",
        "Stratégie d'implémentation IA",
        "Formation de vos équipes",
        "Suivi et optimisation continue"
      ],
      benefits: "Solutions sur-mesure",
      priceRange: "500€ - 1 500€/jour",
      duration: "1-4 semaines"
    },
    {
      category: "Développement d'Agents",
      icon: Code,
      description: "Création d'agents IA spécialisés et workflows",
      features: [
        "Agents IA pour tâches spécifiques",
        "Intégration API et bases de données",
        "Interface utilisateur dédiée",
        "Maintenance et évolutions"
      ],
      benefits: "ROI de 300% en moyenne",
      priceRange: "À partir de 5 000€",
      duration: "4-12 semaines"
    }
  ];

  const industries = [
    { name: "E-commerce", icon: Target, description: "Automatisation du support client et des ventes" },
    { name: "Services", icon: Cog, description: "Optimisation des processus opérationnels" },
    { name: "Santé", icon: Shield, description: "Assistance médicale et gestion administrative" },
    { name: "Finance", icon: BarChart3, description: "Analyse de données et conformité" },
    { name: "Éducation", icon: Brain, description: "Tuteurs IA et gestion pédagogique" },
    { name: "Logistique", icon: Database, description: "Optimisation des chaînes d'approvisionnement" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Digital Future Agents
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Button 
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Accueil
            </Button>
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

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Mes Services <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Intelligence Artificielle</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Découvrez comment l'IA peut transformer votre entreprise avec des solutions personnalisées et performantes.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Services Disponibles
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des solutions IA complètes adaptées à vos besoins spécifiques
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-200">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-center">{service.category}</CardTitle>
                    <p className="text-gray-600 text-center">{service.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Fonctionnalités :</h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-100 text-green-700 font-medium">
                        {service.benefits}
                      </Badge>
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {service.priceRange}
                      </Badge>
                      <Badge variant="outline" className="text-violet-600 border-violet-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {service.duration}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Secteurs d'Activité
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Solutions adaptées à votre industrie
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {industries.map((industry, index) => {
              const IconComponent = industry.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{industry.name}</h3>
                    <p className="text-sm text-gray-600">{industry.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Consultation", description: "Échange sur vos besoins et objectifs", icon: MessageSquare },
              { step: "02", title: "Analyse", description: "Audit de vos processus actuels", icon: BarChart3 },
              { step: "03", title: "Développement", description: "Création de votre solution IA", icon: Code },
              { step: "04", title: "Déploiement", description: "Formation et mise en production", icon: Rocket }
            ].map((process, index) => {
              const IconComponent = process.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{process.step}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{process.title}</h3>
                  <p className="text-gray-600">{process.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à transformer votre entreprise ?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Créez votre compte pour accéder à nos outils de configuration et commencer votre projet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Créer mon compte
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => navigate('/contact')}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Consultation gratuite
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;