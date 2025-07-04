import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TicketIcon, 
  Plus, 
  Eye, 
  Building, 
  Sparkles,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';

interface ClientStats {
  myTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  myOpportunities: number;
  myProjects: number;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    myTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    myOpportunities: 0,
    myProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const [tickets, opportunities, projects] = await Promise.all([
          supabase
            .from('support_tickets')
            .select('id, statut')
            .eq('user_id', user.id),
          supabase
            .from('opportunities_ia')
            .select('id')
            .eq('user_id', user.id),
          supabase
            .from('coaching_projects_ia')
            .select('id')
            .eq('user_id', user.id)
        ]);

        const pendingTickets = tickets.data?.filter(t => t.statut === 'En attente').length || 0;
        const resolvedTickets = tickets.data?.filter(t => t.statut === 'Résolu').length || 0;

        setStats({
          myTickets: tickets.data?.length || 0,
          pendingTickets,
          resolvedTickets,
          myOpportunities: opportunities.data?.length || 0,
          myProjects: projects.data?.length || 0
        });
      } catch (error) {
        console.error('Error fetching client stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Mon Espace Client
          </h1>
          <p className="text-lg text-muted-foreground">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Mon Espace Client
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Suivez vos projets, tickets de support et configurez vos solutions IA
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Générateur IA</h3>
            <p className="text-sm text-muted-foreground mb-4">Créez du contenu avec l'IA</p>
            <Button 
              onClick={() => navigate('/generator')}
              className="w-full"
            >
              Accéder au générateur
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardContent className="p-6 text-center">
            <Building className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Configurateur</h3>
            <p className="text-sm text-muted-foreground mb-4">Configurez vos solutions</p>
            <Button 
              onClick={() => navigate('/configurator')}
              className="w-full"
              variant="outline"
            >
              Ouvrir configurateur
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Support</h3>
            <p className="text-sm text-muted-foreground mb-4">Contactez notre équipe</p>
            <Button 
              onClick={() => navigate('/support')}
              className="w-full"
              variant="outline"
            >
              Créer un ticket
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/support?tab=manage')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mes Tickets</CardTitle>
            <TicketIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myTickets}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-600">{stats.pendingTickets} en attente</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/support?tab=manage')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads/Prospects</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <div className="flex items-center space-x-2 mt-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Pipeline actif</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/configurator')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunités</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myOpportunities}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-600">En négociation</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/projets')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets</CardTitle>
            <Sparkles className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myProjects}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Clock className="h-4 w-4 text-violet-500" />
              <span className="text-sm text-violet-600">En cours</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <TicketIcon className="w-5 h-5 text-blue-600" />
                <span>Mes Tickets Récents</span>
              </span>
              <Button 
                size="sm" 
                onClick={() => navigate('/support')}
                className="text-xs"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nouveau
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.myTickets > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tickets actifs</span>
                  <Badge variant={stats.pendingTickets > 0 ? "destructive" : "secondary"}>
                    {stats.pendingTickets}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/support?tab=manage')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir mes tickets
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Aucun ticket de support créé
                </p>
                <Button 
                  onClick={() => navigate('/support')}
                  size="sm"
                >
                  Créer mon premier ticket
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-green-600" />
              <span>Mes Solutions IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.myOpportunities > 0 || stats.myProjects > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Projets en cours</span>
                  <Badge variant="secondary">{stats.myProjects}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Offres configurées</span>
                  <Badge variant="secondary">{stats.myOpportunities}</Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/projets')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir mes projets
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Aucun projet configuré
                </p>
                <Button 
                  onClick={() => navigate('/configurator')}
                  size="sm"
                >
                  Configurer ma première solution
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;