import { supabase } from '@/integrations/supabase/client';

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
  async generateDescription(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-generation', {
        body: {
          type: 'product-description',
          data: {
            productName: request.productName,
            productDescription: request.productDescription,
            language: request.language,
            boldWords: request.boldWords,
            wordCount: request.wordCount,
            includeBenefits: request.includeBenefits,
            writingStyle: request.writingStyle
          }
        }
      });

      if (error) {
        console.error('Error calling ai-generation function:', error);
        throw new Error('Erreur lors de la génération. Veuillez réessayer.');
      }

      return { description: data.description };
    } catch (error) {
      console.error('Error generating description:', error);
      throw new Error('Erreur lors de la génération de la description. Veuillez réessayer.');
    }
  }
}