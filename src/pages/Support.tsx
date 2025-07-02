
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';

const Support = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    sujet: '',
    categorie: '',
    message: '',
    priorite: 'normale'
  });

  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les tickets au montage du composant
  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .or(`user_id.eq.${user.id},email_from.eq.${user.email}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshGmailTickets = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-support');
      
      if (error) throw error;
      
      toast({
        title: "Synchronisation réussie",
        description: `${data.processed} messages Gmail traités`,
      });
      
      // Recharger les tickets après synchronisation
      await loadTickets();
    } catch (error: any) {
      console.error('Error refreshing Gmail tickets:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser avec Gmail",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sujet || !formData.categorie || !formData.message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ticket créé",
      description: "Votre demande a été envoyée. Nous vous répondrons sous 24h.",
    });

    setFormData({
      sujet: '',
      categorie: '',
      message: '',
      priorite: 'normale'
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "En cours":
        return "bg-blue-100 text-blue-800";
      case "Résolu":
        return "bg-green-100 text-green-800";
      case "En attente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Support Client</h1>
        <p className="text-gray-600 mt-2">Nous sommes là pour vous aider</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Créer un ticket</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet *
                </label>
                <Input
                  placeholder="Décrivez brièvement votre problème"
                  value={formData.sujet}
                  onChange={(e) => setFormData(prev => ({ ...prev, sujet: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <Select 
                  value={formData.categorie} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categorie: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technique">Problème technique</SelectItem>
                    <SelectItem value="facturation">Facturation</SelectItem>
                    <SelectItem value="credits">Crédits</SelectItem>
                    <SelectItem value="compte">Compte utilisateur</SelectItem>
                    <SelectItem value="fonctionnalite">Demande de fonctionnalité</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <Select 
                  value={formData.priorite} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priorite: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faible">Faible</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="elevee">Élevée</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <Textarea
                  placeholder="Décrivez votre problème en détail..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full">
                Envoyer le ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Mes tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Mes tickets</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshGmailTickets}
                disabled={isRefreshing}
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Synchroniser Gmail</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">Chargement des tickets...</p>
              </div>
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{ticket.sujet}</h4>
                      <p className="text-sm text-gray-500">#{ticket.id.slice(0, 8)}</p>
                      {ticket.email_from && (
                        <p className="text-xs text-gray-400">De: {ticket.email_from}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getStatutColor(ticket.statut)} variant="secondary">
                        {ticket.statut}
                      </Badge>
                      {ticket.priorite && ticket.priorite !== 'normale' && (
                        <Badge variant="outline" className="text-xs">
                          {ticket.priorite}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {ticket.message}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Créé le {new Date(ticket.created_at).toLocaleDateString('fr-FR')}</span>
                    <span className="text-xs">{ticket.categorie || 'Non catégorisé'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun ticket</h3>
                <p className="text-gray-500">Vous n'avez pas encore créé de ticket de support</p>
                <p className="text-xs text-gray-400 mt-2">
                  Utilisez le bouton "Synchroniser Gmail" pour récupérer les tickets envoyés par email
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informations de contact */}
      <Card className="bg-blue-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Email</h3>
              <p className="text-sm text-gray-600">support@productgenerator.com</p>
              <p className="text-xs text-gray-500 mt-1">Réponse sous 24h</p>
            </div>
            <div>
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Horaires</h3>
              <p className="text-sm text-gray-600">Lun-Ven 9h-18h</p>
              <p className="text-xs text-gray-500 mt-1">Heure de Paris</p>
            </div>
            <div>
              <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Chat en direct</h3>
              <p className="text-sm text-gray-600">Disponible pour Pro+</p>
              <p className="text-xs text-gray-500 mt-1">Réponse immédiate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
