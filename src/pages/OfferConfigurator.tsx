import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Filter, 
  GitCompare, 
  ShoppingCart,
  CheckCircle, 
  Star, 
  Clock, 
  TrendingUp,
  Zap,
  Users,
  Building2,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';

interface AISolution {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
  benefits: string[];
  implementation_time: string;
  complexity_level: string;
  price_min: number;
  price_max: number;
  pricing_model: string;
  target_company_size: string[];
  target_industries: string[];
  roi_estimate: string;
}

interface ConfigurationFilters {
  industry: string;
  companySize: string;
  budget: string;
  complexity: string;
  category: string;
  timeframe: string;
}

const OfferConfigurator = () => {
  const [solutions, setSolutions] = useState<AISolution[]>([]);
  const [filteredSolutions, setFilteredSolutions] = useState<AISolution[]>([]);
  const [selectedSolutions, setSelectedSolutions] = useState<AISolution[]>([]);
  const [filters, setFilters] = useState<ConfigurationFilters>({
    industry: '',
    companySize: '',
    budget: '',
    complexity: '',
    category: '',
    timeframe: ''
  });
  const [loading, setLoading] = useState(true);
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const industries = [
    'e-commerce', 'services', 'finance', 'sante', 'tech', 'manufacturing', 
    'retail', 'marketing', 'immobilier', 'assurance', 'juridique', 'rh',
    'conseil', 'media', 'entertainment', 'formation', 'saas'
  ];

  const companySizes = [
    { value: 'startup', label: 'Startup (1-10 employés)' },
    { value: 'pme', label: 'PME (11-250 employés)' },
    { value: 'entreprise', label: 'Entreprise (251-1000 employés)' },
    { value: 'grand_groupe', label: 'Grand Groupe (1000+ employés)' }
  ];

  const categories = [
    { value: 'chatbot', label: 'Chatbots Conversationnels', icon: '💬' },
    { value: 'rpa', label: 'Automatisation RPA', icon: '🤖' },
    { value: 'analyse_predictive', label: 'Analyse Prédictive', icon: '📊' },
    { value: 'generation_contenu', label: 'Génération de Contenu', icon: '✍️' },
    { value: 'assistant_virtuel', label: 'Assistant Virtuel', icon: '🎯' },
    { value: 'recommandation', label: 'Recommandation IA', icon: '🎯' }
  ];

  useEffect(() => {
    loadSolutions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, solutions]);

  const loadSolutions = async () => {
    try {
      const { data, error } = await supabase
        .from('client_ai_solutions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setSolutions(data || []);
    } catch (error) {
      // Error handled by user feedback
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les solutions IA.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...solutions];

    if (filters.industry) {
      filtered = filtered.filter(s => s.target_industries.includes(filters.industry));
    }

    if (filters.companySize) {
      filtered = filtered.filter(s => s.target_company_size.includes(filters.companySize));
    }

    if (filters.category) {
      filtered = filtered.filter(s => s.category === filters.category);
    }

    if (filters.complexity) {
      filtered = filtered.filter(s => s.complexity_level === filters.complexity);
    }

    if (filters.budget) {
      const [min, max] = filters.budget.split('-').map(Number);
      filtered = filtered.filter(s => {
        const avgPrice = (s.price_min + s.price_max) / 2;
        return avgPrice >= min && avgPrice <= max;
      });
    }

    setFilteredSolutions(filtered);
  };

  const toggleSolutionSelection = (solution: AISolution) => {
    const isSelected = selectedSolutions.find(s => s.id === solution.id);
    if (isSelected) {
      setSelectedSolutions(prev => prev.filter(s => s.id !== solution.id));
    } else {
      setSelectedSolutions(prev => [...prev, solution]);
    }
  };

  const calculateTotalPrice = () => {
    return selectedSolutions.reduce((total, solution) => {
      const avgPrice = (solution.price_min + solution.price_max) / 2;
      return total + avgPrice;
    }, 0);
  };

  const generateCustomOffer = async () => {
    if (selectedSolutions.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins une solution IA.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour générer une offre personnalisée.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingOffer(true);
    try {
      // Create opportunity with configured solutions
      const { data: opportunity, error: opportunityError } = await supabase
        .from('opportunities_ia')
        .insert({
          user_id: user.id,
          title: `Offre IA personnalisée - ${new Date().toLocaleDateString()}`,
          description: `Configuration personnalisée de ${selectedSolutions.length} solution(s) IA`,
          estimated_value: Math.round(calculateTotalPrice()),
          total_estimated_price: Math.round(calculateTotalPrice()),
          configured_solutions: selectedSolutions.map(sol => ({
            id: sol.id,
            name: sol.name,
            category: sol.category,
            estimated_price: Math.round((sol.price_min + sol.price_max) / 2)
          })),
          stage: 'proposition',
          probability: 80,
          expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 days
        })
        .select()
        .single();

      if (opportunityError) throw opportunityError;

      // Create Stripe payment session for the configured offer
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
        body: {
          planName: `Offre IA Personnalisée - ${selectedSolutions.length} solution(s)`,
          amount: Math.round(calculateTotalPrice()),
          opportunityId: opportunity.id
        }
      });

      if (paymentError) throw paymentError;

      // Update opportunity with Stripe session
      await supabase
        .from('opportunities_ia')
        .update({ stripe_session_id: paymentData.sessionId })
        .eq('id', opportunity.id);

      if (paymentData?.url) {
        // Open Stripe checkout in new tab
        window.open(paymentData.url, '_blank');
        
        toast({
          title: "Offre générée avec succès !",
          description: `Votre offre personnalisée de ${calculateTotalPrice()}€ a été créée. Fenêtre de paiement ouverte.`
        });
      }

    } catch (error) {
      // Error handled by user feedback
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer l'offre personnalisée.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingOffer(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      industry: '',
      companySize: '',
      budget: '',
      complexity: '',
      category: '',
      timeframe: ''
    });
  };

  const SolutionCard = ({ solution, isSelected }: { solution: AISolution; isSelected: boolean }) => (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-medium ${isSelected ? 'ring-2 ring-primary shadow-medium' : ''}`}
          onClick={() => toggleSolutionSelection(solution)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>{solution.name}</span>
              {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {categories.find(c => c.value === solution.category)?.label}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {solution.complexity_level}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{solution.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{solution.implementation_time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-green-600 font-medium">{solution.roi_estimate}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">À partir de </span>
            <span className="font-bold text-lg">{solution.price_min}€</span>
            <span className="text-muted-foreground">/{solution.pricing_model}</span>
          </div>
          <Button 
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="transition-all"
          >
            {isSelected ? 'Sélectionné' : 'Sélectionner'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto">
          <Settings className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurateur d'Offres IA</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Sélectionnez et comparez les solutions d'IA les plus adaptées à votre entreprise. 
            Créez une offre personnalisée en quelques clics.
          </p>
        </div>
      </div>

      <Tabs defaultValue="configurator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configurator" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configurateur</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center space-x-2">
            <GitCompare className="w-4 h-4" />
            <span>Comparaison ({selectedSolutions.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configurator" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filtres de Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Secteur d'activité</Label>
                  <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({...prev, industry: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry.charAt(0).toUpperCase() + industry.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Taille d'entreprise</Label>
                  <Select value={filters.companySize} onValueChange={(value) => setFilters(prev => ({...prev, companySize: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Budget mensuel</Label>
                  <Select value={filters.budget} onValueChange={(value) => setFilters(prev => ({...prev, budget: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-500">0€ - 500€</SelectItem>
                      <SelectItem value="500-1500">500€ - 1500€</SelectItem>
                      <SelectItem value="1500-3000">1500€ - 3000€</SelectItem>
                      <SelectItem value="3000-10000">3000€ - 10000€</SelectItem>
                      <SelectItem value="10000-999999">10000€+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie de solution</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Complexité</Label>
                  <Select value={filters.complexity} onValueChange={(value) => setFilters(prev => ({...prev, complexity: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes complexités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="avance">Avancé</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-sm text-muted-foreground">
                  {filteredSolutions.length} solution(s) trouvée(s)
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSolutions.map(solution => (
              <SolutionCard 
                key={solution.id} 
                solution={solution} 
                isSelected={!!selectedSolutions.find(s => s.id === solution.id)}
              />
            ))}
          </div>

          {filteredSolutions.length === 0 && (
            <Card className="text-center p-12">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucune solution trouvée</h3>
              <p className="text-muted-foreground mb-4">
                Essayez d'ajuster vos filtres pour voir plus de solutions.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {selectedSolutions.length > 0 ? (
            <>
              {/* Summary Card */}
              <Card className="bg-gradient-secondary border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Votre Configuration Personnalisée
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{selectedSolutions.length} solution(s) sélectionnée(s)</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="flex items-center space-x-1">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-medium text-foreground">{Math.round(calculateTotalPrice())}€/mois</span>
                        </span>
                      </div>
                    </div>
                    <Button 
                      onClick={generateCustomOffer}
                      disabled={isGeneratingOffer}
                      className="bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {isGeneratingOffer ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Générer l'Offre
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Table */}
              <div className="grid grid-cols-1 gap-6">
                {selectedSolutions.map(solution => (
                  <Card key={solution.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{solution.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {categories.find(c => c.value === solution.category)?.label}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleSolutionSelection(solution)}
                        >
                          Retirer
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{solution.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Fonctionnalités</h4>
                          <ul className="text-sm space-y-1">
                            {solution.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Bénéfices</h4>
                          <ul className="text-sm space-y-1">
                            {solution.benefits.slice(0, 3).map((benefit, idx) => (
                              <li key={idx} className="flex items-center space-x-2">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Détails</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Implémentation:</span>
                              <span>{solution.implementation_time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ROI estimé:</span>
                              <span className="text-green-600">{solution.roi_estimate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Prix moyen:</span>
                              <span className="font-medium">
                                {Math.round((solution.price_min + solution.price_max) / 2)}€
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="text-center p-12">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GitCompare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucune solution sélectionnée</h3>
              <p className="text-muted-foreground mb-4">
                Retournez au configurateur pour sélectionner des solutions à comparer.
              </p>
              <Button variant="outline" onClick={() => {
                const tab = document.querySelector('[value="configurator"]') as HTMLElement;
                tab?.click();
              }}>
                Retour au configurateur
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OfferConfigurator;