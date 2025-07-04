-- Créer la table pour la base de connaissances de l'assistant IA
CREATE TABLE IF NOT EXISTS public.ai_assistant_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  sentiment TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.ai_assistant_conversations ENABLE ROW LEVEL SECURITY;

-- Politiques pour l'assistant IA
CREATE POLICY "Tous peuvent créer des conversations assistant"
ON public.ai_assistant_conversations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Utilisateurs peuvent voir leurs conversations"
ON public.ai_assistant_conversations
FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

-- Table pour la base de connaissances
CREATE TABLE IF NOT EXISTS public.ai_assistant_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.ai_assistant_knowledge ENABLE ROW LEVEL SECURITY;

-- Politique publique pour la lecture de la base de connaissances
CREATE POLICY "Base de connaissances accessible à tous"
ON public.ai_assistant_knowledge
FOR SELECT
USING (is_active = true);

-- Insérer des données initiales dans la base de connaissances
INSERT INTO public.ai_assistant_knowledge (title, content, category, keywords) VALUES
('Services IA disponibles', 'Digital Future Agents propose des solutions d''automatisation avec IA : chatbots, assistants virtuels, automatisation RPA, agents spécialisés, analyse prédictive et optimisation des processus métier.', 'services', ARRAY['services', 'ia', 'automatisation', 'chatbot', 'rpa']),
('Processus de consultation', 'Nous offrons une consultation gratuite de 45-60 minutes pour analyser vos besoins, suivi d''une proposition détaillée sous 48h. Contactez-nous via le formulaire ou par email.', 'consultation', ARRAY['consultation', 'gratuite', 'processus', 'contact']),
('Tarification', 'Nos solutions s''adaptent à tous les budgets : de moins de 5k€ pour les petits projets à plus de 50k€ pour les transformations complètes. Devis personnalisé après analyse.', 'prix', ARRAY['tarif', 'prix', 'budget', 'devis']),
('Technologies utilisées', 'Nous utilisons les dernières technologies IA : OpenAI GPT, Google Gemini, Claude, LLaMA et autres modèles selon vos besoins spécifiques.', 'technologie', ARRAY['technologie', 'openai', 'gemini', 'claude', 'llama']),
('Secteurs d''activité', 'Nous accompagnons tous les secteurs : e-commerce, santé, finance, éducation, logistique, services et industrie.', 'secteurs', ARRAY['secteur', 'ecommerce', 'sante', 'finance', 'education', 'logistique']);

-- Trigger pour updated_at
CREATE TRIGGER update_ai_assistant_knowledge_updated_at
BEFORE UPDATE ON public.ai_assistant_knowledge
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();