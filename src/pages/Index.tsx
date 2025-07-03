import { Search, Star, ArrowRight, Zap, Shield, Users, TrendingUp, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { AIAssistant } from "@/components/AIAssistant";
import { AIAssistantTrigger } from "@/components/AIAssistantTrigger";
import { useAIAssistant } from "@/hooks/useAIAssistant";

const Index = () => {
  const navigate = useNavigate();
  const { isOpen, triggerSource, openAssistant, closeAssistant } = useAIAssistant({
    enableExitIntent: true,
    enableTimer: true,
    enableInactivity: true,
    timerDelay: 15000, // 15 seconds on homepage
    inactivityDelay: 45000 // 45 seconds of inactivity
  });

  const aiCategories = [
    { name: "Chatbots Conversationnels", icon: "💬", count: "127 solutions" },
    { name: "Automatisation RPA", icon: "🤖", count: "89 solutions" },
    { name: "Analyse Prédictive", icon: "📊", count: "156 solutions" },
    { name: "Génération de Contenu", icon: "✍️", count: "203 solutions" },
    { name: "Assistant Virtuel", icon: "🎯", count: "94 solutions" },
    { name: "Recommandation IA", icon: "🎯", count: "112 solutions" }
  ];

  const trendingSolutions = [
    {
      name: "ChatGPT Enterprise",
      category: "Assistant IA",
      rating: 4.8,
      reviews: 2341,
      description: "Assistant IA conversationnel pour la productivité d'entreprise",
      badge: "Populaire"
    },
    {
      name: "UiPath",
      category: "RPA",
      rating: 4.6,
      reviews: 1876,
      description: "Plateforme d'automatisation robotique des processus",
      badge: "Leader"
    },
    {
      name: "Salesforce Einstein",
      category: "CRM IA",
      rating: 4.7,
      reviews: 3201,
      description: "Intelligence artificielle intégrée pour la relation client",
      badge: "Recommandé"
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Directrice Innovation",
      company: "TechCorp",
      comment: "Cette plateforme nous a fait gagner 3 mois dans notre recherche de solutions IA.",
      avatar: "MD"
    },
    {
      name: "Pierre Martin",
      role: "DSI",
      company: "InnovateCo",
      comment: "Enfin une source fiable pour comparer objectivement les agents IA du marché.",
      avatar: "PM"
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
              Nadir AI automation
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Solutions</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Catégories</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Ressources</a>
            <Button 
              variant="ghost"
              onClick={() => navigate('/generator')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Générateur IA
            </Button>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Connexion</Button>
            <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700">
              Inscription Fournisseur
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Trouvez l'<span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Agent IA</span> parfait pour votre transformation digitale
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Découvrez, comparez et choisissez parmi plus de 800 solutions d'intelligence artificielle. 
              Accélérez votre digitalisation avec des avis vérifiés et des recommandations expertes.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  placeholder="Rechercher une solution IA (ex: chatbot, automatisation, analyse...)"
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-lg"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700">
                  Rechercher
                </Button>
              </div>
            </div>

            {/* Call to Action for Generator */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/generator')}
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg px-8 py-4"
              >
                <Zap className="w-5 h-5 mr-2" />
                Essayer le Générateur IA
              </Button>
              <Button
                onClick={() => navigate('/configurator')}
                size="lg"
                variant="outline"
                className="border-violet-600 text-violet-600 hover:bg-violet-50 text-lg px-8 py-4"
              >
                <Settings className="w-5 h-5 mr-2" />
                Configurateur d'Offres
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>800+ solutions vérifiées</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>25k+ avis authentiques</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-violet-600" />
                <span>98% de satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explorez par catégorie d'Agent IA
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trouvez la solution parfaite selon votre cas d'usage spécifique
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiCategories.map((category, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{category.icon}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Solutions */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Solutions IA Tendances
            </h2>
            <p className="text-gray-600">
              Les solutions les mieux notées par notre communauté
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingSolutions.map((solution, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {solution.badge}
                      </Badge>
                      <h3 className="font-bold text-lg text-gray-900">{solution.name}</h3>
                      <p className="text-sm text-blue-600 font-medium">{solution.category}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">{solution.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(solution.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{solution.rating}</span>
                      <span className="text-sm text-gray-500">({solution.reviews})</span>
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:text-blue-600">
                      Voir plus <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-l-4 border-blue-600">
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role} • {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à transformer votre entreprise avec l'IA ?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Rejoignez plus de 10 000 entreprises qui ont déjà trouvé leur solution IA idéale
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                Commencer ma recherche
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Devenir fournisseur
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Nadir AI automation</span>
              </div>
              <p className="text-gray-400 text-sm">
                La plateforme de référence pour choisir vos solutions d'intelligence artificielle
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Catégories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Chatbots</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Automatisation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analyse Prédictive</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Génération de Contenu</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Webinaires</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Études de cas</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Presse</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Nadir AI automation. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
      
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
