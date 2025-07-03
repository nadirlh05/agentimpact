import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type Ticket = Tables<'support_tickets'>;

const AdminTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ statut: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      
      // Refresh tickets
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) return;
    
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;
      
      // Refresh tickets
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.email_from.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'En attente':
        return <Badge variant="destructive">En attente</Badge>;
      case 'En cours':
        return <Badge className="bg-orange-500">En cours</Badge>;
      case 'Résolu':
        return <Badge className="bg-green-500">Résolu</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    switch (priority) {
      case 'urgente':
        return <Badge variant="destructive">Urgente</Badge>;
      case 'élevée':
        return <Badge className="bg-orange-500">Élevée</Badge>;
      case 'normale':
        return <Badge variant="secondary">Normale</Badge>;
      case 'basse':
        return <Badge variant="outline">Basse</Badge>;
      default:
        return <Badge variant="secondary">Normale</Badge>;
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'En attente':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'En cours':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'Résolu':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Gestion des Tickets
          </h1>
          <p className="text-lg text-muted-foreground">Chargement des tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Gestion des Tickets de Support
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Administrez tous les tickets de support de vos clients
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtres</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par sujet ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="En cours">En cours</option>
                <option value="Résolu">Résolu</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(ticket.statut)}
                      <h3 className="font-semibold text-lg">{ticket.sujet}</h3>
                      {getStatusBadge(ticket.statut)}
                      {getPriorityBadge(ticket.priorite)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{ticket.email_from}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(ticket.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {ticket.categorie && (
                        <Badge variant="outline">{ticket.categorie}</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2">
                      {ticket.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir détails
                    </Button>
                    {ticket.statut !== 'Résolu' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTicketStatus(ticket.id, 'En cours')}
                          disabled={ticket.statut === 'En cours'}
                        >
                          En cours
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateTicketStatus(ticket.id, 'Résolu')}
                        >
                          Résoudre
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTicket(ticket.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun ticket trouvé
              </h3>
              <p className="text-gray-500">
                Aucun ticket ne correspond à vos critères de recherche.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;