
interface GenerationRequest {
  productName: string;
  productDescription?: string;
  language: string;
  boldWords: string[];
  wordCount: number;
  includeBenefits: boolean;
  writingStyle: string;
}

interface GenerationResponse {
  description: string;
}

export class AIService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildPrompt(request: GenerationRequest): string {
    const languageMap: Record<string, string> = {
      'français': 'français',
      'anglais': 'anglais',
      'espagnol': 'espagnol',
      'allemand': 'allemand',
      'italien': 'italien'
    };

    const styleMap: Record<string, string> = {
      'professionnel': 'un style professionnel et formel',
      'créatif': 'un style créatif et engageant',
      'technique': 'un style technique et détaillé',
      'commercial': 'un style commercial et persuasif',
      'décontracté': 'un style décontracté et accessible'
    };

    let prompt = `Génère une description de produit en ${languageMap[request.language]} pour "${request.productName}".`;
    
    if (request.productDescription) {
      prompt += ` Informations sur le produit : ${request.productDescription}.`;
    }

    prompt += ` La description doit faire environ ${request.wordCount} mots et utiliser ${styleMap[request.writingStyle]}.`;

    if (request.includeBenefits) {
      prompt += ` Inclus les bénéfices et avantages du produit.`;
    }

    if (request.boldWords.length > 0) {
      prompt += ` Mets en gras les mots suivants quand ils apparaissent : ${request.boldWords.join(', ')}.`;
    }

    prompt += ` Réponds uniquement avec la description, sans introduction ni conclusion.`;

    return prompt;
  }

  async generateDescription(request: GenerationRequest): Promise<GenerationResponse> {
    const prompt = this.buildPrompt(request);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Générateur de Descriptions Produits'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en marketing et rédaction de descriptions produits. Crée des descriptions attractives et persuasives.'
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
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      throw new Error('Aucune description générée par l\'API');
    }

    return { description };
  }
}
