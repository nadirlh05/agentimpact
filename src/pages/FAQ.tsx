
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ = () => {
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
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Questions Fréquentes</h1>
        <p className="text-gray-600 mt-2">Trouvez rapidement les réponses à vos questions</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqItems.map((item) => (
          <Card key={item.id}>
            <Collapsible 
              open={openItems.includes(item.id)}
              onOpenChange={() => toggleItem(item.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex justify-between items-center text-left">
                    <span className="text-lg font-medium">{item.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform ${
                        openItems.includes(item.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <p className="text-gray-600 leading-relaxed">{item.reponse}</p>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      <div className="text-center bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Vous ne trouvez pas votre réponse ?
        </h3>
        <p className="text-gray-600 mb-4">
          Notre équipe support est là pour vous aider
        </p>
        <a 
          href="/support" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Contacter le support
        </a>
      </div>
    </div>
  );
};

export default FAQ;
