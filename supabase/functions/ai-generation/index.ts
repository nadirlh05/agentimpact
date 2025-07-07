import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerationRequest {
  productName: string;
  wordCount: number;
  language: string;
  writingStyle: string;
  includeBenefits: boolean;
  boldWords?: string[];
}

interface ExampleGenerationRequest {
  businessType: string;
  challenge: string;
  budget?: string;
  industry?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    let prompt = '';
    let model = 'gpt-4.1-mini-2025-04-14';

    if (type === 'product-description') {
      prompt = buildProductPrompt(data);
    } else if (type === 'example-generation') {
      prompt = buildExamplePrompt(data);
    } else {
      throw new Error('Invalid generation type');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agentimpact.fr',
        'X-Title': 'AgentImpact.fr - AI Solutions'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: type === 'product-description' ? 500 : 800,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (type === 'product-description') {
      const description = responseData.choices[0].message.content.trim();
      return new Response(JSON.stringify({ description }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (type === 'example-generation') {
      const content = responseData.choices[0].message.content.trim();
      // Parse the structured response
      const example = parseExampleResponse(content);
      return new Response(JSON.stringify(example), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in ai-generation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildProductPrompt(request: any): string {
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

  let prompt = `Génère une description de produit en ${languageMap[request.language] || 'français'} pour "${request.productName}".`;
  
  if (request.productDescription) {
    prompt += ` Informations sur le produit : ${request.productDescription}.`;
  }

  prompt += ` La description doit faire environ ${request.wordCount} mots et utiliser ${styleMap[request.writingStyle] || 'un style professionnel'}.`;

  if (request.includeBenefits) {
    prompt += ` Inclus les bénéfices et avantages du produit.`;
  }

  if (request.boldWords && request.boldWords.length > 0) {
    prompt += ` Mets en gras les mots suivants quand ils apparaissent : ${request.boldWords.join(', ')}.`;
  }

  prompt += ` Réponds uniquement avec la description, sans introduction ni conclusion.`;

  return prompt;
}

function buildExamplePrompt(request: ExampleGenerationRequest): string {
  let prompt = `En tant qu'expert en solutions IA, génère un exemple concret d'accompagnement pour une entreprise avec les caractéristiques suivantes :

Type d'entreprise : ${request.businessType}
Défi principal : ${request.challenge}`;

  if (request.budget) {
    prompt += `
Budget approximatif : ${request.budget}`;
  }

  if (request.industry) {
    prompt += `
Secteur d'activité : ${request.industry}`;
  }

  prompt += `

Réponds EXCLUSIVEMENT au format JSON suivant (sans \`\`\`json ni texte supplémentaire) :
{
  "solution": "Nom de la solution IA proposée",
  "benefits": ["Bénéfice 1", "Bénéfice 2", "Bénéfice 3"],
  "implementation": ["Étape 1", "Étape 2", "Étape 3"],
  "pricing": "Tarification estimée"
}

Assure-toi que :
- La solution soit spécifique au défi mentionné
- Les bénéfices soient mesurables et concrets
- Les étapes d'implémentation soient claires et réalisables
- La tarification soit réaliste par rapport au budget indiqué`;

  return prompt;
}

function parseExampleResponse(content: string): any {
  try {
    // Clean the response to extract JSON
    let jsonStr = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing example response:', error);
    // Fallback response
    return {
      solution: "Solution IA personnalisée",
      benefits: ["Automatisation des processus", "Réduction des coûts", "Amélioration de l'efficacité"],
      implementation: ["Analyse des besoins", "Développement sur mesure", "Déploiement et formation"],
      pricing: "Prix sur demande"
    };
  }
}