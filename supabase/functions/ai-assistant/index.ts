import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssistantRequest {
  message: string;
  sessionId: string;
  userId?: string;
}

interface KnowledgeItem {
  category: string;
  title: string;
  content: string;
  keywords: string[];
}

const serve_handler = async (req: Request): Promise<Response> => {
  console.log('AI Assistant function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, sessionId, userId }: AssistantRequest = await req.json();
    
    if (!message || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Message and sessionId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing message from user ${userId || 'anonymous'}: ${message}`);

    // Retrieve relevant knowledge from the knowledge base
    const { data: knowledgeData, error: knowledgeError } = await supabaseClient
      .from('ai_assistant_knowledge')
      .select('category, title, content, keywords')
      .eq('is_active', true);

    if (knowledgeError) {
      console.error('Error fetching knowledge base:', knowledgeError);
    }

    const knowledgeBase = knowledgeData || [];
    
    // Find relevant knowledge based on keywords
    const relevantKnowledge = findRelevantKnowledge(message, knowledgeBase);
    
    // Build context for Gemini
    const systemPrompt = buildSystemPrompt(relevantKnowledge);
    
    // Call Gemini API
    const geminiResponse = await callGeminiAPI(geminiApiKey, systemPrompt, message);
    
    if (!geminiResponse.success) {
      console.error('Gemini API error:', geminiResponse.error);
      return new Response(
        JSON.stringify({ 
          response: "Je suis désolé, je rencontre actuellement des difficultés techniques. Pouvez-vous reformuler votre question ou contacter notre support ?",
          needsHumanSupport: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const assistantResponse = geminiResponse.content;
    
    // Analyze if the user needs human support
    const needsHumanSupport = analyzeNeedForHumanSupport(message, assistantResponse);
    
    // Save conversation to database
    try {
      const { error: saveError } = await supabaseClient
        .from('ai_assistant_conversations')
        .insert({
          user_id: userId || null,
          session_id: sessionId,
          user_message: message,
          assistant_response: assistantResponse,
          sentiment: analyzeSentiment(message),
          resolved: !needsHumanSupport
        });

      if (saveError) {
        console.error('Error saving conversation:', saveError);
      }
    } catch (saveError) {
      console.error('Failed to save conversation:', saveError);
    }

    console.log('Assistant response generated successfully');
    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        needsHumanSupport,
        sessionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI assistant function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        response: "Je suis désolé, une erreur technique s'est produite. Veuillez réessayer ou contacter notre support."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

function findRelevantKnowledge(message: string, knowledgeBase: KnowledgeItem[]): KnowledgeItem[] {
  const messageLower = message.toLowerCase();
  const relevant: Array<KnowledgeItem & { score: number }> = [];

  for (const item of knowledgeBase) {
    let score = 0;
    
    // Check keywords
    for (const keyword of item.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }
    
    // Check title and content
    if (messageLower.includes(item.title.toLowerCase())) {
      score += 3;
    }
    
    // Check for category matches
    if (messageLower.includes(item.category.toLowerCase())) {
      score += 1;
    }

    if (score > 0) {
      relevant.push({ ...item, score });
    }
  }

  // Sort by relevance and return top 3
  return relevant
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...item }) => item);
}

function buildSystemPrompt(relevantKnowledge: KnowledgeItem[]): string {
  let prompt = `Tu es l'assistant IA de Digital Future Agents, une plateforme spécialisée dans l'automatisation IA pour entreprises.

Ton rôle est d'aider les visiteurs du site en répondant à leurs questions sur nos services, tarifs, et processus.

INSTRUCTIONS:
- Réponds de manière professionnelle et bienveillante
- Sois concis mais informatif (maximum 200 mots par réponse)
- Si tu ne connais pas la réponse exacte, propose de contacter notre équipe
- Encourage les utilisateurs à découvrir nos solutions d'automatisation IA
- Guide-les vers la prise de contact ou vers les pages appropriées du site

INFORMATIONS DISPONIBLES:`;

  for (const item of relevantKnowledge) {
    prompt += `\n\n${item.category.toUpperCase()}: ${item.title}\n${item.content}`;
  }

  prompt += `\n\nRéponds maintenant à la question de l'utilisateur en utilisant ces informations.`;

  return prompt;
}

async function callGeminiAPI(apiKey: string, systemPrompt: string, userMessage: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: `Question de l'utilisateur: ${userMessage}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      return { success: false, error: `API Error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response structure:', data);
      return { success: false, error: 'Invalid API response structure' };
    }

    const content = data.candidates[0].content.parts[0].text;
    return { success: true, content };

  } catch (error) {
    console.error('Gemini API call failed:', error);
    return { success: false, error: error.message };
  }
}

function analyzeNeedForHumanSupport(userMessage: string, assistantResponse: string): boolean {
  const userLower = userMessage.toLowerCase();
  const responseLower = assistantResponse.toLowerCase();
  
  // Keywords that indicate need for human support
  const supportKeywords = [
    'problème urgent', 'ne fonctionne pas', 'bug', 'erreur',
    'contacter', 'parler à quelqu\'un', 'support', 'aide urgente',
    'réclamation', 'remboursement', 'insatisfait'
  ];
  
  // Check if user message contains support keywords
  for (const keyword of supportKeywords) {
    if (userLower.includes(keyword)) {
      return true;
    }
  }
  
  // Check if assistant response suggests contacting support
  if (responseLower.includes('contacter') || 
      responseLower.includes('équipe') || 
      responseLower.includes('support')) {
    return true;
  }
  
  return false;
}

function analyzeSentiment(message: string): string {
  const messageLower = message.toLowerCase();
  
  const positiveKeywords = ['merci', 'super', 'parfait', 'excellent', 'satisfait', 'content'];
  const negativeKeywords = ['problème', 'erreur', 'bug', 'déçu', 'insatisfait', 'nul', 'mauvais'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const keyword of positiveKeywords) {
    if (messageLower.includes(keyword)) positiveCount++;
  }
  
  for (const keyword of negativeKeywords) {
    if (messageLower.includes(keyword)) negativeCount++;
  }
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

serve(serve_handler);