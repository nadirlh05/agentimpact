
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQ = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const faqItems = [
    {
      id: "credits",
      question: "Comment fonctionnent les crédits ?",
      reponse: "Chaque action dans l'application consomme des crédits. La génération d'un produit coûte entre 50 et 200 crédits selon la complexité. Vous pouvez acheter des crédits supplémentaires à tout moment."
    },
    {
      id: "projets",
      question: "Combien de projets puis-je créer ?",
      reponse: "Il n'y a pas de limite au nombre de projets que vous pouvez créer. Seule la consommation de crédits est limitée par votre solde disponible."
    },
    {
      id: "export",
      question: "Dans quels formats puis-je exporter mes projets ?",
      reponse: "Vous pouvez exporter vos projets en PDF avec tous les forfaits, et en Word avec les forfaits Pro et Business. Les templates premium sont également disponibles avec ces forfaits."
    },
    {
      id: "support",
      question: "Comment contacter le support ?",
      reponse: "Le support par email est disponible pour tous les utilisateurs. Les utilisateurs Pro bénéficient d'un support prioritaire, et les utilisateurs Business ont un support dédié."
    },
    {
      id: "remboursement",
      question: "Puis-je être remboursé ?",
      reponse: "Les crédits non utilisés ne sont pas remboursables, mais ils n'expirent jamais. Vous pouvez annuler votre abonnement à tout moment."
    },
    {
      id: "api",
      question: "Y a-t-il un accès API ?",
      reponse: "L'accès API est disponible uniquement avec le forfait Business. Il vous permet d'intégrer notre service dans vos propres applications."
    },
    {
      id: "securite",
      question: "Mes données sont-elles sécurisées ?",
      reponse: "Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Nous respectons le RGPD et ne partageons jamais vos informations avec des tiers."
    },
    {
      id: "templates",
      question: "Qu'est-ce que les templates premium ?",
      reponse: "Les templates premium sont des modèles avancés et personnalisables qui vous permettent de créer des projets plus sophistiqués et professionnels."
    }
  ];

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centre d'aide</h1>
          <p className="text-muted-foreground mt-2">Trouvez rapidement les réponses à vos questions sur nos solutions IA</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {faqItems.map((item) => (
          <Card key={item.id} className="border border-border bg-card shadow-soft hover:shadow-medium transition-all duration-200">
            <Collapsible 
              open={openItems.includes(item.id)}
              onOpenChange={() => toggleItem(item.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                  <CardTitle className="flex justify-between items-center text-left">
                    <span className="text-lg font-medium text-foreground">{item.question}</span>
                    <div className="ml-4 flex-shrink-0">
                      <ChevronDown 
                        className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                          openItems.includes(item.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-6">
                  <div className="border-t border-border pt-4">
                    <p className="text-muted-foreground leading-relaxed">{item.reponse}</p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-secondary border-0 shadow-large max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Une autre question ?
          </h3>
          <p className="text-muted-foreground mb-6">
            Notre équipe d'experts en IA est là pour vous accompagner
          </p>
          <Button 
            onClick={() => navigate('/support')}
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium shadow-medium"
          >
            Contacter le support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;
