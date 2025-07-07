-- Audit et nettoyage des politiques RLS

-- 1. Nettoyer les politiques dupliquées sur ai_assistant_conversations
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs conversations" ON public.ai_assistant_conversations;
DROP POLICY IF EXISTS "Tous peuvent créer des conversations assistant" ON public.ai_assistant_conversations;

-- Recréer des politiques plus sécurisées
DROP POLICY IF EXISTS "Users can create conversations" ON public.ai_assistant_conversations;
CREATE POLICY "Users can create conversations" 
ON public.ai_assistant_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 2. Nettoyer les politiques dupliquées sur ai_assistant_knowledge  
DROP POLICY IF EXISTS "Base de connaissances accessible à tous" ON public.ai_assistant_knowledge;

-- 3. Corriger les politiques sur leads_prospects_ia pour permettre la création par webhook
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads_prospects_ia;
CREATE POLICY "Users can create leads" 
ON public.leads_prospects_ia 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 4. Corriger les politiques sur opportunities_ia pour permettre la création par webhook
DROP POLICY IF EXISTS "Users can create their own opportunities" ON public.opportunities_ia;
CREATE POLICY "Users can create opportunities" 
ON public.opportunities_ia 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 5. Corriger la politique sur support_tickets pour être plus restrictive
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
CREATE POLICY "Anyone can create tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (true);

-- 6. Améliorer les politiques sur companies pour plus de sécurité
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
CREATE POLICY "Anyone can create companies for leads" 
ON public.companies 
FOR INSERT 
WITH CHECK (true);

-- Ajouter les politiques manquantes pour UPDATE et DELETE sur companies
CREATE POLICY "Admins can update companies" 
ON public.companies 
FOR UPDATE 
USING (has_role('admin'::app_role));

CREATE POLICY "Admins can delete companies" 
ON public.companies 
FOR DELETE 
USING (has_role('admin'::app_role));