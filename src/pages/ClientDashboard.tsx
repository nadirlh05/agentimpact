import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Lightbulb, 
  Calendar, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileText,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { CalendlyWidget } from '@/components/calendly/CalendlyWidget';

// Ensure Calendly script is loaded
if (typeof window !== 'undefined' && !document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')) {
  const script = document.createElement('script');
  script.src = 'https://assets.calendly.com/assets/external/widget.js';
  script.async = true;
  document.head.appendChild(script);
}

interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientStats();
  }, [user]);

  const fetchClientStats = async () => {
    if (!user) return;
    
    try {
      const { data: projects, error } = await supabase
        .from('coaching_projects_ia')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const total = projects?.length || 0;
      const active = projects?.filter(p => p.status === 'en_cours').length || 0;
      const completed = projects?.filter(p => p.status === 'terminé').length || 0;

      setStats({
        totalProjects: total,
        activeProjects: active,
        completedProjects: completed
      });
    } catch (error) {
      console.error('Error fetching client stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const solutions = [
    {
      icon: Bot,
      title: "Agent IA Facturation",
      description: "Automatise vos factures et relances clients",
      features: ["Génération automatique", "Relances personnalisées", "Suivi des paiements"],
      color: "bg-blue-500",
      action: () => navigate('/generator')
    },
    {
      icon: Lightbulb,
      title: "Agent IA Fournisseurs", 
      description: "Optimise la gestion de vos fournisseurs",
      features: ["Suivi des commandes", "Comparaison des prix", "Évaluation fournisseurs"],
      color: "bg-green-500",
      action: () => navigate('/generator')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bonjour {user?.user_metadata?.full_name || user?.email?.split('@')[0]} ! 👋
        </h1>
        <p className="text-lg opacity-90">
          Bienvenue sur votre espace client AgentImpact.fr
        </p>
      </div>

      {/* Statistiques des projets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">En Cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solutions disponibles */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Solutions IA Disponibles</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {solutions.map((solution, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={solution.action}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${solution.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <solution.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{solution.title}</h3>
                    <p className="text-gray-600 mb-4">{solution.description}</p>
                    <div className="space-y-2 mb-4">
                      {solution.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Configurer ma solution
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Planifier une consultation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Besoin d'aide ou d'une démonstration ? Réservez un créneau avec nos experts.
            </p>
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/nadir-lahyani11/30min"
                style={{ minWidth: '320px', height: '500px', width: '100%' }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <span>Configurateur d'offres</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Personnalisez vos solutions IA selon vos besoins spécifiques.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/configurator')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Accéder au configurateur
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Prochaines étapes */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Démarrer avec AgentImpact.fr</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Explorez nos solutions</h4>
              <p className="text-sm text-gray-600">Découvrez nos agents IA spécialisés</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Configurez votre solution</h4>
              <p className="text-sm text-gray-600">Adaptez l'IA à vos besoins</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Planifiez le déploiement</h4>
              <p className="text-sm text-gray-600">Réservez votre consultation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;