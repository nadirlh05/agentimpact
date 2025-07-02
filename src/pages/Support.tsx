
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
  const [gmailAccessToken, setGmailAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Charger les tickets au montage du composant
  useEffect(() => {
    loadTickets();
    
    // Vérifier si on revient de la synchronisation Gmail
    const urlParams = new URLSearchParams(window.location.search);
    const gmailSync = urlParams.get('gmail_sync');
    const processedCount = urlParams.get('processed_count');
    const userEmail = urlParams.get('user_email');
    const gmailError = urlParams.get('gmail_error');
    
    if (gmailSync === 'success' && processedCount) {
      toast({
        title: "Gmail synchronisé",
        description: `${processedCount} tickets créés depuis Gmail (${userEmail})`,
      });
      // Nettoyer l'URL et recharger les tickets
      window.history.replaceState({}, document.title, window.location.pathname);
      loadTickets();
    } else if (gmailError) {
      toast({
        title: "Erreur Gmail",
        description: "La synchronisation Gmail a échoué",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Charger uniquement les tickets de l'utilisateur connecté
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Tickets loaded successfully:', data);
      setTickets(data || []);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Erreur de chargement",
        description: `Impossible de charger les tickets: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateGmail = async () => {
    try {
      // Appeler directement l'URL de la fonction pour obtenir l'URL d'auth
      const authUrl = `https://cxcdfurwsefllhxucjnz.supabase.co/functions/v1/gmail-support`;
      
      const response = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Rediriger vers l'URL d'authentification Google dans la même fenêtre
      window.location.href = data.authUrl;
      
    } catch (error: any) {
      console.error('Error starting Gmail auth:', error);
      toast({
        title: "Erreur d'authentification",
        description: `Impossible de démarrer l'authentification Gmail: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const refreshGmailTickets = async () => {
    // Pour cette version simplifiée, on redirige vers l'auth Gmail
    authenticateGmail();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sujet || !formData.categorie || !formData.message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un ticket.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          email_from: user.email || '',
          sujet: formData.sujet,
          categorie: formData.categorie,
          message: formData.message,
          priorite: formData.priorite,
          statut: 'En attente'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        throw error;
      }

      toast({
        title: "Ticket créé avec succès",
        description: `Votre ticket #${data.id.slice(0, 8)} a été créé. Nous vous répondrons sous 24h.`,
      });

      // Réinitialiser le formulaire
      setFormData({
        sujet: '',
        categorie: '',
        message: '',
        priorite: 'normale'
      });

      // Recharger les tickets
      await loadTickets();

    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Erreur lors de la création",
        description: `Impossible de créer le ticket: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support technique</h1>
          <p className="text-muted-foreground mt-2">Notre équipe d'experts est là pour vous accompagner dans votre transformation IA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de contact */}
        <Card className="border border-border bg-card shadow-soft">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground">Créer un nouveau ticket</span>
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Création en cours...' : 'Envoyer le ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Mes tickets */}
        <Card className="border border-border bg-card shadow-soft">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">Mes tickets de support</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={authenticateGmail}
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
      <Card className="bg-gradient-secondary border-0 shadow-large">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">Autres moyens de nous contacter</h3>
            <p className="text-muted-foreground">Choisissez le canal qui vous convient le mieux</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Email</h4>
              <p className="text-sm text-muted-foreground mb-1">support@digitalfuture.ai</p>
              <p className="text-xs text-muted-foreground">Réponse sous 24h</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Horaires</h4>
              <p className="text-sm text-muted-foreground mb-1">Lun-Ven 9h-18h</p>
              <p className="text-xs text-muted-foreground">Heure de Paris</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Support prioritaire</h4>
              <p className="text-sm text-muted-foreground mb-1">Disponible pour Pro+</p>
              <p className="text-xs text-muted-foreground">Réponse immédiate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
