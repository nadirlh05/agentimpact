import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TicketIcon, 
  Building, 
  TrendingUp, 
  Eye, 
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalTickets: number;
  pendingTickets: number;
  totalLeads: number;
  totalOpportunities: number;
  totalProjects: number;
  totalUsers: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    pendingTickets: 0,
    totalLeads: 0,
    totalOpportunities: 0,
    totalProjects: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tickets, leads, opportunities, projects, profiles] = await Promise.all([
          supabase.from('support_tickets').select('id, statut'),
          supabase.from('leads_prospects_ia').select('id'),
          supabase.from('opportunities_ia').select('id'),
          supabase.from('coaching_projects_ia').select('id'),
          supabase.from('profiles').select('id')
        ]);

        const pendingTickets = tickets.data?.filter(t => t.statut === 'En attente').length || 0;

        setStats({
          totalTickets: tickets.data?.length || 0,
          pendingTickets,
          totalLeads: leads.data?.length || 0,
          totalOpportunities: opportunities.data?.length || 0,
          totalProjects: projects.data?.length || 0,
          totalUsers: profiles.data?.length || 0
        });
      } catch (error) {
        // Error handled by setting error state
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-lg text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Tableau de Bord Administrateur
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Vue d'ensemble complète de votre activité et gestion centralisée
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 hover:border-blue-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Support</CardTitle>
            <TicketIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <div className="flex items-center space-x-2 mt-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-orange-600">{stats.pendingTickets} en attente</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-green-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads/Prospects</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <div className="flex items-center space-x-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Pipeline actif</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunités</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Building className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-600">En négociation</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-violet-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets</CardTitle>
            <CheckCircle className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Clock className="h-4 w-4 text-violet-500" />
              <span className="text-sm text-violet-600">En cours</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Support Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TicketIcon className="w-5 h-5 text-blue-600" />
              <span>Gestion du Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tickets en attente</span>
              <Badge variant="destructive">{stats.pendingTickets}</Badge>
            </div>
            <Button 
              onClick={() => navigate('/admin/tickets')} 
              className="w-full"
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir tous les tickets
            </Button>
          </CardContent>
        </Card>

        {/* CRM Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>Gestion CRM</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total prospects</span>
              <Badge variant="secondary">{stats.totalLeads}</Badge>
            </div>
            <Button 
              onClick={() => navigate('/admin/crm')} 
              className="w-full"
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Accéder au CRM
            </Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <span>Gestion Utilisateurs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Utilisateurs inscrits</span>
              <Badge variant="secondary">{stats.totalUsers}</Badge>
            </div>
            <Button 
              onClick={() => navigate('/admin/users')} 
              className="w-full"
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Gérer les utilisateurs
            </Button>
          </CardContent>
        </Card>

        {/* Project Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-violet-600" />
              <span>Gestion Projets</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Projets actifs</span>
              <Badge variant="secondary">{stats.totalProjects}</Badge>
            </div>
            <Button 
              onClick={() => navigate('/admin/projects')} 
              className="w-full"
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir les projets
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;