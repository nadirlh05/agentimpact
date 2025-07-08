import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  CalendarCheck
} from 'lucide-react';

interface CalendlyEvent {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  lead_source: string;
  status: string;
  priority: string;
  notes: string;
  created_at: string;
  opportunities_ia?: Array<{
    id: string;
    title: string;
    stage: string;
    probability: number;
    estimated_value: number;
  }>;
}

interface CalendlyStats {
  total_events: number;
  this_month: number;
  conversion_rate: number;
  total_value: number;
}

export const CalendlyManager: React.FC = () => {
  const [events, setEvents] = useState<CalendlyEvent[]>([]);
  const [stats, setStats] = useState<CalendlyStats>({
    total_events: 0,
    this_month: 0,
    conversion_rate: 0,
    total_value: 0
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCalendlyEvents();
    calculateStats();
  }, []);

  const loadCalendlyEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads_prospects_ia')
        .select(`
          *,
          opportunities_ia (
            id,
            title,
            stage,
            probability,
            estimated_value
          )
        `)
        .eq('lead_source', 'calendly')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEvents(data || []);
      toast({
        title: "Événements chargés",
        description: `${data?.length || 0} événements Calendly trouvés`,
      });
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements Calendly",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      // Calculer les statistiques
      const { data: allEvents } = await supabase
        .from('leads_prospects_ia')
        .select('*, opportunities_ia(*)')
        .eq('lead_source', 'calendly');

      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const { data: monthEvents } = await supabase
        .from('leads_prospects_ia')
        .select('*')
        .eq('lead_source', 'calendly')
        .gte('created_at', thisMonth.toISOString());

      const totalEvents = allEvents?.length || 0;
      const monthlyEvents = monthEvents?.length || 0;
      
      // Calculer le taux de conversion (leads avec opportunités)
      const eventsWithOpportunities = allEvents?.filter(e => 
        e.opportunities_ia && e.opportunities_ia.length > 0
      ).length || 0;
      
      const conversionRate = totalEvents > 0 ? (eventsWithOpportunities / totalEvents) * 100 : 0;
      
      // Calculer la valeur totale des opportunités
      const totalValue = allEvents?.reduce((sum, event) => {
        const eventValue = event.opportunities_ia?.reduce((opSum, op) => 
          opSum + (op.estimated_value || 0), 0) || 0;
        return sum + eventValue;
      }, 0) || 0;

      setStats({
        total_events: totalEvents,
        this_month: monthlyEvents,
        conversion_rate: Math.round(conversionRate),
        total_value: totalValue
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const syncWithCalendly = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendly-integration', {
        body: {
          action: 'sync_events'
        }
      });

      if (error) throw error;

      toast({
        title: "Synchronisation terminée",
        description: `${data.events_count} événements synchronisés`,
      });
      
      // Recharger les données
      await loadCalendlyEvents();
      await calculateStats();
    } catch (error) {
      console.error('Error syncing with Calendly:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser avec Calendly",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'nouveau': { variant: 'default' as const, color: 'bg-blue-500' },
      'qualifié': { variant: 'secondary' as const, color: 'bg-green-500' },
      'annulé': { variant: 'destructive' as const, color: 'bg-red-500' },
      'converti': { variant: 'default' as const, color: 'bg-purple-500' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.nouveau;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      'haute': 'bg-red-100 text-red-800',
      'moyenne': 'bg-yellow-100 text-yellow-800',
      'basse': 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors] || colors.moyenne}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion Calendly</h2>
          <p className="text-gray-600">Suivi des consultations et événements Calendly</p>
        </div>
        <Button 
          onClick={syncWithCalendly}
          disabled={syncing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Synchronisation...' : 'Synchroniser'}</span>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Événements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_events}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ce Mois</p>
                <p className="text-2xl font-bold text-gray-900">{stats.this_month}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversion_rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Valeur Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_value.toLocaleString()}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des événements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Événements Calendly Récents</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadCalendlyEvents}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Chargement...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun événement Calendly trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {event.first_name} {event.last_name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{event.email}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(event.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {getStatusBadge(event.status)}
                        {getPriorityBadge(event.priority)}
                      </div>

                      {event.notes && (
                        <p className="text-sm text-gray-600 mb-2">{event.notes}</p>
                      )}

                      {event.opportunities_ia && event.opportunities_ia.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {event.opportunities_ia.map((opp) => (
                            <Badge key={opp.id} variant="outline" className="text-xs">
                              {opp.title} - {opp.stage} ({opp.probability}%)
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendlyManager;