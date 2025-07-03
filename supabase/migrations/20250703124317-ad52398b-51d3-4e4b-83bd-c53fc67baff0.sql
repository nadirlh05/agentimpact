-- Create ai_assistant_knowledge table for the AI assistant knowledge base
CREATE TABLE public.ai_assistant_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_assistant_conversations table to store user interactions
CREATE TABLE public.ai_assistant_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  sentiment TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_assistant_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistant_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_assistant_knowledge (read-only for all authenticated users)
CREATE POLICY "Everyone can view active knowledge" 
  ON public.ai_assistant_knowledge 
  FOR SELECT 
  USING (is_active = true);

-- RLS Policies for ai_assistant_conversations (users can only see their own conversations)
CREATE POLICY "Users can view their own conversations" 
  ON public.ai_assistant_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create conversations" 
  ON public.ai_assistant_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for better performance
CREATE INDEX idx_ai_knowledge_category ON public.ai_assistant_knowledge(category);
CREATE INDEX idx_ai_knowledge_keywords ON public.ai_assistant_knowledge USING GIN(keywords);
CREATE INDEX idx_ai_conversations_user_session ON public.ai_assistant_conversations(user_id, session_id);
CREATE INDEX idx_ai_conversations_created_at ON public.ai_assistant_conversations(created_at DESC);

-- Insert initial knowledge base data
INSERT INTO public.ai_assistant_knowledge (category, title, content, keywords) VALUES
('services', 'Solutions IA disponibles', 'Nous proposons des solutions d''automatisation IA incluant des chatbots conversationnels, des systèmes RPA, de l''analyse prédictive, de la génération de contenu, des assistants virtuels et des systèmes de recommandation IA.', ARRAY['solutions', 'ia', 'automatisation', 'chatbot', 'rpa', 'analyse']),
('pricing', 'Tarifs des solutions', 'Nous proposons trois offres principales : Assistant IA Basic à 29€/mois, Assistant IA Pro à 227€/mois et Crew AI Enterprise sur mesure. Chaque offre inclut différents niveaux de fonctionnalités et de support.', ARRAY['prix', 'tarifs', 'abonnement', 'basic', 'pro', 'enterprise']),
('support', 'Support technique', 'Notre équipe support est disponible du lundi au vendredi de 9h à 18h. Les clients Pro+ bénéficient d''un support prioritaire avec réponse immédiate. Vous pouvez nous contacter via le système de tickets ou par email à support@digitalfuture.ai.', ARRAY['support', 'aide', 'contact', 'ticket', 'assistance']),
('implementation', 'Processus d''implémentation', 'Notre processus comprend 4 étapes : 1) Analyse de vos besoins, 2) Conception sur mesure, 3) Développement et formation, 4) Déploiement et suivi. Nous accompagnons nos clients tout au long du processus.', ARRAY['implémentation', 'processus', 'déploiement', 'accompagnement']),
('company', 'À propos de Digital Future Agents', 'Digital Future Agents est une plateforme spécialisée dans l''automatisation IA pour entreprises. Nous aidons plus de 10 000 entreprises à transformer leurs processus grâce à l''intelligence artificielle.', ARRAY['entreprise', 'digital future agents', 'automatisation', 'transformation']);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_ai_knowledge_updated_at 
    BEFORE UPDATE ON public.ai_assistant_knowledge 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();