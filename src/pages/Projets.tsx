
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Settings, Loader2, Users, Bot, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  user_id: string;
}

const Projets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos projets de coaching.",
          variant: "destructive",
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "En cours":
        return "bg-primary/10 text-primary border-primary/20";
      case "Terminé":
        return "bg-green-100 text-green-700 border-green-200";
      case "En attente":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getProjectIcon = (name: string) => {
    if (name.toLowerCase().includes('coaching')) return Users;
    if (name.toLowerCase().includes('bot') || name.toLowerCase().includes('ia')) return Bot;
    return Target;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header avec statistiques */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground mt-2">Vue d'ensemble de vos projets et automatisations IA</p>
          </div>
          <Button onClick={() => navigate('/generator')} className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-medium">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border bg-card shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Projets actifs</p>
                  <p className="text-3xl font-bold text-foreground">{projects.filter(p => p.status === 'En cours').length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Projets terminés</p>
                  <p className="text-3xl font-bold text-foreground">{projects.filter(p => p.status === 'Terminé').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total projets</p>
                  <p className="text-3xl font-bold text-foreground">{projects.length}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Mes Projets</h2>
          {projects.length > 0 && (
            <p className="text-sm text-muted-foreground">{projects.length} projet{projects.length > 1 ? 's' : ''}</p>
          )}
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((projet) => {
              const IconComponent = getProjectIcon(projet.name);
              return (
                <Card key={projet.id} className="group border border-border bg-card shadow-soft hover:shadow-medium transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground">{projet.name}</CardTitle>
                          <Badge 
                            className={`${getStatusColor(projet.status)} text-xs`} 
                            variant="secondary"
                          >
                            {projet.status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">{projet.description || "Description du projet à ajouter"}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Créé le {new Date(projet.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <Button variant="outline" size="sm" className="w-full group-hover:border-primary group-hover:text-primary transition-colors">
                        Voir le projet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border border-dashed border-border bg-muted/30">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Créez votre premier projet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Commencez votre transformation digitale en créant un projet d'automatisation IA personnalisé
              </p>
              <Button onClick={() => navigate('/generator')} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Créer un projet
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Projets;
