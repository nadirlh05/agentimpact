import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ContactFormData {
  nom: string;
  prenom: string;
  email: string;
  entreprise: string;
  secteur: string;
  typeConsultation: string;
  budget: string;
  message: string;
  telephone: string;
}

interface ContactFormProps {
  onSubmitSuccess?: () => void;
}

export const ContactForm = ({ onSubmitSuccess }: ContactFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    nom: "",
    prenom: "",
    email: "",
    entreprise: "",
    secteur: "",
    typeConsultation: "",
    budget: "",
    message: "",
    telephone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sending consultation request
      
      const { data, error } = await supabase.functions.invoke('contact-consultation', {
        body: formData
      });

      if (error) {
        // Supabase error handled
        throw new Error(error.message || "Erreur lors de l'envoi");
      }

      // Function response received
      
      toast({
        title: "Demande envoyée !",
        description: "Nous vous contacterons sous 24h pour planifier votre consultation gratuite.",
      });
      
      // Reset form
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        entreprise: "",
        secteur: "",
        typeConsultation: "",
        budget: "",
        message: "",
        telephone: ""
      });

      onSubmitSuccess?.();
      
    } catch (error: any) {
      // Complete error handled
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter directement.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            value={formData.prenom}
            onChange={(e) => handleInputChange("prenom", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => handleInputChange("nom", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email professionnel *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone</Label>
        <Input
          id="telephone"
          type="tel"
          value={formData.telephone}
          onChange={(e) => handleInputChange("telephone", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entreprise">Entreprise *</Label>
          <Input
            id="entreprise"
            value={formData.entreprise}
            onChange={(e) => handleInputChange("entreprise", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secteur">Secteur d'activité</Label>
          <Select onValueChange={(value) => handleInputChange("secteur", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="sante">Santé</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Éducation</SelectItem>
              <SelectItem value="logistique">Logistique</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="typeConsultation">Type de consultation</Label>
          <Select onValueChange={(value) => handleInputChange("typeConsultation", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decouverte">Découverte IA</SelectItem>
              <SelectItem value="automatisation">Automatisation</SelectItem>
              <SelectItem value="chatbot">Chatbot/Assistant</SelectItem>
              <SelectItem value="agents">Agents spécialisés</SelectItem>
              <SelectItem value="strategie">Stratégie IA</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Budget approximatif</Label>
          <Select onValueChange={(value) => handleInputChange("budget", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="moins-5k">Moins de 5 000€</SelectItem>
              <SelectItem value="5k-15k">5 000€ - 15 000€</SelectItem>
              <SelectItem value="15k-50k">15 000€ - 50 000€</SelectItem>
              <SelectItem value="plus-50k">Plus de 50 000€</SelectItem>
              <SelectItem value="non-defini">Non défini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Décrivez votre projet ou vos besoins</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleInputChange("message", e.target.value)}
          rows={4}
          placeholder="Expliquez-nous votre situation actuelle et vos objectifs..."
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-lg py-3"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Demander ma consultation gratuite
          </>
        )}
      </Button>
    </form>
  );
};