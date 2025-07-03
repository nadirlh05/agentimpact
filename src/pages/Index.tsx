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
import { AIAssistant } from "@/components/AIAssistant";
import { AIAssistantTrigger } from "@/components/AIAssistantTrigger";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import heroImage from "@/assets/hero-supplier-management.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { isOpen, triggerSource, openAssistant, closeAssistant } = useAIAssistant({
    enableExitIntent: true,
    enableTimer: true,
    enableInactivity: true,
    timerDelay: 15000,
    inactivityDelay: 45000
  });

  const aiServices = [
    { 
      name: "Automatisation Intelligente", 
      icon: Bot, 
      description: "Robots et assistants IA personnalisés pour votre métier",
      benefit: "Jusqu'à 80% de gain de temps"
    },
    { 
      name: "Consultation IA", 
      icon: Lightbulb, 
      description: "Accompagnement stratégique et intégration d'IA",
      benefit: "Solutions sur-mesure"
    },
    { 
      name: "Développement d'Agents", 
      icon: Code, 
      description: "Création d'agents IA spécialisés et workflows",
      benefit: "ROI de 300% en moyenne"
    }
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
              Transformez votre entreprise avec <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">l'Intelligence Artificielle</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Auto-entrepreneur expert en IA, je vous accompagne dans l'intégration d'agents intelligents et l'automatisation de vos processus métier. 
              Gagnez en efficacité et en compétitivité.
            </p>
            
            <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/services')}
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg px-8 py-4"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Découvrir mes Services
              </Button>
              <Button
                onClick={() => navigate('/contact')}
                size="lg"
                variant="outline"
                className="border-violet-600 text-violet-600 hover:bg-violet-50 text-lg px-8 py-4"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Consultation Gratuite
              </Button>
            </div>

            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Expert certifié IA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>50+ projets réalisés</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-violet-600" />
                <span>ROI moyen de 300%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mes Services d'Intelligence Artificielle
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des solutions IA personnalisées pour automatiser et optimiser votre activité
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-4">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <Badge className="bg-green-100 text-green-700 font-medium">
                      {service.benefit}
                    </Badge>
                  </CardContent>
                </Card>
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
              Prêt à intégrer l'IA dans votre entreprise ?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Transformez vos processus avec des solutions d'IA sur-mesure et gagnez en compétitivité
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
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => navigate('/support')}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Discuter de mon besoin
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant */}
      <AIAssistant 
        isOpen={isOpen} 
        onClose={closeAssistant} 
        triggerSource={triggerSource} 
      />
      <AIAssistantTrigger onClick={openAssistant} />
    </div>
  );
};

export default Index;