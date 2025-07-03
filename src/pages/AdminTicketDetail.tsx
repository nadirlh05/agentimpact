import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Send,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type Ticket = Tables<'support_tickets'>;

const AdminTicketDetail = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (error) throw error;
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le ticket.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (newStatus: string) => {
    if (!ticket) return;
    
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ statut: newStatus })
        .eq('id', ticket.id);

      if (error) throw error;

      // Send status update email
      await supabase.functions.invoke('send-ticket-email', {
        body: {
          type: 'status_update',
          ticketId: ticket.id,
          clientName: 'Client', // You might want to get this from profiles
          clientEmail: ticket.email_from,
          subject: ticket.sujet,
          message: ticket.message,
          priority: ticket.priorite || 'normale',
          status: newStatus
        }
      });

      setTicket({ ...ticket, statut: newStatus });
      toast({
        title: "Statut mis à jour",
        description: `Le ticket est maintenant "${newStatus}". Le client a été notifié par email.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const sendResponse = async () => {
    if (!ticket || !responseText.trim()) return;

    setSendingResponse(true);
    try {
      // Send response email
      const { error } = await supabase.functions.invoke('send-ticket-email', {
        body: {
          type: 'admin_response',
          ticketId: ticket.id,
          clientName: 'Client', // You might want to get this from profiles
          clientEmail: ticket.email_from,
          subject: ticket.sujet,
          message: ticket.message,
          priority: ticket.priorite || 'normale',
          adminResponse: responseText,
          adminName: 'Nadir Lahyani'
        }
      });

      if (error) throw error;

      // Update ticket status to "En cours" if it was pending
      if (ticket.statut === 'En attente') {
        await updateTicketStatus('En cours');
      }

      setResponseText('');
      toast({
        title: "Réponse envoyée",
        description: "Votre réponse a été envoyée au client par email.",
      });
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la réponse.",
        variant: "destructive",
      });
    } finally {
      setSendingResponse(false);
    }
  };

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
      case 'haute':
        return <Badge className="bg-orange-500">Haute</Badge>;
      case 'moyenne':
        return <Badge variant="secondary">Moyenne</Badge>;
      case 'basse':
        return <Badge variant="outline">Basse</Badge>;
      default:
        return <Badge variant="secondary">Normale</Badge>;
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'En attente':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'En cours':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'Résolu':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Chargement du ticket...
          </h1>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Ticket non trouvé
          </h1>
          <Button onClick={() => navigate('/admin/tickets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/tickets')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux tickets
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Ticket #{ticket.id.slice(-8)}
            </h1>
            <p className="text-muted-foreground">
              Créé le {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusIcon(ticket.statut)}
          {getStatusBadge(ticket.statut)}
          {getPriorityBadge(ticket.priorite)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Détails du ticket</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold">Sujet</Label>
                <p className="text-lg mt-1">{ticket.sujet}</p>
              </div>
              
              <div>
                <Label className="font-semibold">Message</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{ticket.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Répondre au client</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="response">Votre réponse</Label>
                <Textarea
                  id="response"
                  placeholder="Tapez votre réponse ici..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="min-h-32 mt-2"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={sendResponse}
                  disabled={!responseText.trim() || sendingResponse}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {sendingResponse ? 'Envoi...' : 'Envoyer par email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Informations client</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{ticket.email_from}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="w-5 h-5" />
                <span>Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticket.statut !== 'En cours' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => updateTicketStatus('En cours')}
                  disabled={updatingStatus}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Marquer "En cours"
                </Button>
              )}
              
              {ticket.statut !== 'Résolu' && (
                <Button
                  className="w-full"
                  onClick={() => updateTicketStatus('Résolu')}
                  disabled={updatingStatus}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer "Résolu"
                </Button>
              )}

              {ticket.statut === 'Résolu' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => updateTicketStatus('En attente')}
                  disabled={updatingStatus}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Rouvrir le ticket
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketDetail;