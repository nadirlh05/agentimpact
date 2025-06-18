
interface ExampleGenerationRequest {
  businessType: string;
  challenge: string;
  budget?: string;
}

interface ExampleGenerationResponse {
  solution: string;
  benefits: string[];
  implementation: string[];
  pricing: string;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildPrompt(request: ExampleGenerationRequest): string {
    let prompt = `En tant qu'expert en solutions IA, génère un exemple concret d'accompagnement pour une entreprise avec les caractéristiques suivantes :

Type d'entreprise : ${request.businessType}
Défi principal : ${request.challenge}`;

    if (request.budget) {
      prompt += `\nBudget approximatif : ${request.budget}`;
    }

    prompt += `

Génère une réponse structurée au format JSON avec les clés suivantes :
- "solution" : Une description détaillée de la solution IA recommandée (2-3 phrases)
- "benefits" : Un tableau de 3-4 bénéfices concrets
- "implementation" : Un tableau de 3-4 étapes d'implémentation
- "pricing" : Une estimation de prix réaliste

Assure-toi que la solution soit spécifique au secteur et au défi mentionné.`;

    return prompt;
  }

  async generateExample(request: ExampleGenerationRequest): Promise<ExampleGenerationResponse> {
    const prompt = this.buildPrompt(request);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Générateur d\'Exemples IA'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert consultant en solutions d\'intelligence artificielle. Tu génères des exemples concrets et réalistes d\'accompagnement IA pour les entreprises.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erreur API (${response.status}): ${errorData.error?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Aucun exemple généré par l\'API');
    }

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      // Si le JSON n'est pas valide, on tente de parser manuellement
      return {
        solution: content,
        benefits: ["Amélioration de l'efficacité", "Réduction des coûts", "Automatisation des tâches"],
        implementation: ["Analyse des besoins", "Développement de la solution", "Formation des équipes", "Déploiement"],
        pricing: "Sur mesure"
      };
    }
  }
}
