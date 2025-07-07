import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  Mail, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  client_name?: string;
  email_from: string;
  sujet: string;
  message: string;
  priorite?: string;
  statut?: string;
  categorie?: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
}

const TicketManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [priorityFilter, setPriorityFilter] = useState('tous');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      // Error handled by user feedback
      toast({
        title: "Erreur",
        description: "Impossible de charger les tickets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email_from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'tous' || ticket.statut === statusFilter;
    const matchesPriority = priorityFilter === 'tous' || ticket.priorite === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'ouvert':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'en cours':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'résolu':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'fermé':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgente':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'haute':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'basse':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'ouvert':
        return <AlertCircle className="w-4 h-4" />;
      case 'en cours':
        return <Clock className="w-4 h-4" />;
      case 'résolu':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const stats = {
    total: tickets.length,
    ouvert: tickets.filter(t => t.statut === 'Ouvert').length,
    enCours: tickets.filter(t => t.statut === 'En cours').length,
    resolu: tickets.filter(t => t.statut === 'Résolu').length,
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ouverts</p>
                <p className="text-2xl font-bold text-blue-600">{stats.ouvert}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.enCours}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Résolus</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolu}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par sujet, email ou nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="Ouvert">Ouvert</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Résolu">Résolu</SelectItem>
                <SelectItem value="Fermé">Fermé</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes priorités</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
                <SelectItem value="Haute">Haute</SelectItem>
                <SelectItem value="Moyenne">Moyenne</SelectItem>
                <SelectItem value="Basse">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-medium transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{ticket.sujet}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${getStatusColor(ticket.statut)} text-xs`} variant="secondary">
                        {getStatusIcon(ticket.statut)}
                        <span className="ml-1">{ticket.statut || 'Ouvert'}</span>
                      </Badge>
                      {ticket.priorite && (
                        <Badge className={`${getPriorityColor(ticket.priorite)} text-xs`} variant="secondary">
                          {ticket.priorite}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{ticket.email_from}</span>
                    {ticket.client_name && <span>({ticket.client_name})</span>}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ticket.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(ticket.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <span className="text-xs">#{ticket.id.slice(-8)}</span>
                  </div>
                  
                  {ticket.attachment_url && (
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-primary" />
                      <span className="text-xs text-primary">Pièce jointe disponible</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun ticket trouvé</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'tous' || priorityFilter !== 'tous' 
                ? 'Modifiez vos critères de recherche pour voir plus de résultats.'
                : 'Aucun ticket de support n\'a été créé pour le moment.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de détail du ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedTicket.sujet}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ticket #{selectedTicket.id.slice(-8)}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedTicket.client_name || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedTicket.email_from}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <Badge className={`${getStatusColor(selectedTicket.statut)} text-xs`} variant="secondary">
                    {selectedTicket.statut || 'Ouvert'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priorité</p>
                  <Badge className={`${getPriorityColor(selectedTicket.priorite)} text-xs`} variant="secondary">
                    {selectedTicket.priorite || 'Non spécifiée'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>
              
              {selectedTicket.attachment_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Pièce jointe</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(selectedTicket.attachment_url, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              )}
              
              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>Créé le {new Date(selectedTicket.created_at).toLocaleString('fr-FR')}</p>
                <p>Mis à jour le {new Date(selectedTicket.updated_at).toLocaleString('fr-FR')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;