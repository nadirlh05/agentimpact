import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, X, CheckCircle } from 'lucide-react';

const TicketForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    subject: '',
    description: '',
    priority: 'Moyenne'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale autorisée est de 5MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('ticket-attachments')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour créer un ticket.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create ticket in database (without file upload for now)
      const { data: ticket, error: dbError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          email_from: formData.clientEmail,
          sujet: formData.subject,
          message: formData.description,
          priorite: formData.priority.toLowerCase(),
          statut: 'En attente'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      // Send notification emails
      try {
        const { error: emailError } = await supabase.functions.invoke('send-ticket-notification', {
          body: {
            ticketId: ticket.id,
            clientName: formData.clientName,
            clientEmail: formData.clientEmail,
            subject: formData.subject,
            description: formData.description,
            priority: formData.priority
          }
        });

        if (emailError) {
          console.error('Email notification error:', emailError);
          // Don't fail the whole process if email fails
        }
      } catch (emailError) {
        console.error('Email function error:', emailError);
        // Continue anyway
      }

      setSubmitted(true);
      toast({
        title: "Ticket créé avec succès",
        description: `Votre ticket #${ticket.id.slice(-8)} a été créé. Vous recevrez une confirmation par email.`,
      });

    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Erreur",
        description: `Erreur: ${error.message || 'Impossible de créer le ticket'}. Veuillez réessayer.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Ticket créé avec succès !</h2>
          <p className="text-muted-foreground mb-6">
            Votre demande de support a été enregistrée. Notre équipe vous contactera rapidement.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Créer un nouveau ticket
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Créer un Ticket de Support</CardTitle>
        <CardDescription>
          Décrivez votre problème ou votre demande. Notre équipe d'experts en automatisation IA vous répondra rapidement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nom Complet *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                required
                placeholder="Votre nom complet"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Adresse E-mail *</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                required
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Sujet du Ticket *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              required
              placeholder="Résumé bref de votre demande"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priorité</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez la priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basse">🟢 Basse</SelectItem>
                <SelectItem value="Moyenne">🟡 Moyenne</SelectItem>
                <SelectItem value="Haute">🟠 Haute</SelectItem>
                <SelectItem value="Urgente">🔴 Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description Détaillée *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              placeholder="Décrivez votre problème ou demande en détail..."
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label>Pièce Jointe (optionnel)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Fonctionnalité de pièce jointe temporairement désactivée
                </span>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création du ticket...
              </>
            ) : (
              'Créer le Ticket'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;