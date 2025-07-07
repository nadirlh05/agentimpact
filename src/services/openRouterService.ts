import { supabase } from '@/integrations/supabase/client';

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
  async generateExample(request: ExampleGenerationRequest): Promise<ExampleGenerationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-generation', {
        body: {
          type: 'example-generation',
          data: request
        }
      });

      if (error) {
        console.error('Error calling ai-generation function:', error);
        throw new Error('Erreur lors de la génération. Veuillez réessayer.');
      }

      return data;
    } catch (error) {
      console.error('Error generating example:', error);
      throw new Error('Erreur lors de la génération de l\'exemple. Veuillez réessayer.');
    }
  }
}