import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Plus,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  priority: string;
  created_at: string;
}

interface Opportunity {
  id: string;
  title: string;
  estimated_value?: number;
  probability?: number;
  stage: string;
  expected_close_date?: string;
}

interface CoachingProject {
  id: string;
  project_name: string;
  status: string;
  progress_percentage?: number;
  budget?: number;
}

const CRMDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [coachingProjects, setCoachingProjects] = useState<CoachingProject[]>([]);

  const fetchCRMData = async () => {
    if (!user) return;

    try {
      const [leadsResult, opportunitiesResult, projectsResult] = await Promise.all([
        supabase
          .from('leads_prospects_ia')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('opportunities_ia')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('coaching_projects_ia')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (leadsResult.error) throw leadsResult.error;
      if (opportunitiesResult.error) throw opportunitiesResult.error;
      if (projectsResult.error) throw projectsResult.error;

      setLeads(leadsResult.data || []);
      setOpportunities(opportunitiesResult.data || []);
      setCoachingProjects(projectsResult.data || []);
    } catch (error) {
      console.error('Error fetching CRM data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données CRM.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'nouveau':
      case 'prospection':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'qualifie':
      case 'qualification':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'negocie':
      case 'negociation':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'gagne':
      case 'en cours':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'perdu':
      case 'termine':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'haute':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'normale':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'basse':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const totalOpportunityValue = opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  const totalProjectBudget = coachingProjects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const avgProgress = coachingProjects.length > 0 
    ? coachingProjects.reduce((sum, project) => sum + (project.progress_percentage || 0), 0) / coachingProjects.length 
    : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du tableau de bord CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord CRM</h1>
          <p className="text-muted-foreground mt-2">Vue d'ensemble de vos prospects, opportunités et projets</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/configurator')} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle opportunité
          </Button>
          <Button onClick={() => navigate('/generator')} className="bg-gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
        </div>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-border bg-card shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Nouveaux prospects</p>
                <p className="text-3xl font-bold text-foreground">{leads.filter(l => l.status === 'nouveau').length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Opportunités actives</p>
                <p className="text-3xl font-bold text-foreground">{opportunities.filter(o => o.stage !== 'gagne' && o.stage !== 'perdu').length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Valeur pipeline</p>
                <p className="text-3xl font-bold text-foreground">{totalOpportunityValue.toLocaleString('fr-FR')}€</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Progression moyenne</p>
                <p className="text-3xl font-bold text-foreground">{Math.round(avgProgress)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prospects récents */}
        <Card className="border border-border bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Prospects récents</span>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{lead.first_name} {lead.last_name}</p>
                      <Badge className={`${getPriorityColor(lead.priority)} text-xs`} variant="secondary">
                        {lead.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(lead.status)} text-xs`} variant="secondary">
                    {lead.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun prospect récent</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunités */}
        <Card className="border border-border bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Opportunités en cours</span>
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunities.length > 0 ? (
              opportunities.map((opportunity) => (
                <div key={opportunity.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">{opportunity.title}</p>
                    <Badge className={`${getStatusColor(opportunity.stage)} text-xs`} variant="secondary">
                      {opportunity.stage}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Valeur: {opportunity.estimated_value?.toLocaleString('fr-FR') || 'N/A'}€</span>
                    <span>Probabilité: {opportunity.probability || 0}%</span>
                  </div>
                  {opportunity.expected_close_date && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Clôture prévue: {new Date(opportunity.expected_close_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune opportunité en cours</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projets de coaching */}
      <Card className="border border-border bg-card shadow-soft">
        <CardHeader>
          <CardTitle>Projets de coaching en cours</CardTitle>
        </CardHeader>
        <CardContent>
          {coachingProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coachingProjects.map((project) => (
                <div key={project.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">{project.project_name}</h4>
                    <Badge className={`${getStatusColor(project.status)} text-xs`} variant="secondary">
                      {project.status}
                    </Badge>
                  </div>
                  
                  {project.progress_percentage !== null && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="text-foreground font-medium">{project.progress_percentage}%</span>
                      </div>
                      <Progress value={project.progress_percentage} className="h-2" />
                    </div>
                  )}
                  
                  {project.budget && (
                    <div className="text-sm text-muted-foreground">
                      Budget: {project.budget.toLocaleString('fr-FR')}€
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Aucun projet de coaching</p>
              <p className="text-sm">Créez votre premier projet pour commencer</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMDashboard;