import { useState } from "react";
import { 
  Brain, 
  Sparkles, 
  Zap, 
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Send,
  User,
  Building,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
      // Simuler l'envoi du formulaire
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Digital Future Agents
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Button 
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Accueil
            </Button>
            <Button 
              variant="ghost"
              onClick={() => navigate('/services')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Services
            </Button>
            <Button 
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Connexion
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Consultation <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Gratuite</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discutons de vos besoins en IA et découvrons ensemble comment transformer votre entreprise.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Formulaire de contact */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Planifier ma consultation
              </CardTitle>
              <p className="text-gray-600">
                Remplissez ce formulaire et nous vous contacterons sous 24h
              </p>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Informations et avantages */}
          <div className="space-y-8">
            {/* Contact direct */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Contact Direct
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">contact@digitalfutureagents.fr</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-gray-600">+33 6 XX XX XX XX</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ce que vous obtiendrez */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Ce que vous obtiendrez
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "Analyse gratuite de vos processus actuels",
                    "Identification des opportunités d'automatisation",
                    "Estimation de ROI personnalisée",
                    "Roadmap d'implémentation détaillée",
                    "Démonstration de solutions similaires"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Processus */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Déroulement de la consultation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Prise de contact", desc: "Sous 24h par email ou téléphone" },
                    { step: "2", title: "Consultation", desc: "45-60 min par visio ou téléphone" },
                    { step: "3", title: "Proposition", desc: "Devis détaillé sous 48h" }
                  ].map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {step.step}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{step.title}</p>
                        <p className="text-gray-600 text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;