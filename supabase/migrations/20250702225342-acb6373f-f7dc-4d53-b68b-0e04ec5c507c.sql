-- Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admin can update all tickets" ON public.support_tickets;

-- Créer de nouvelles politiques RLS qui ne référencent PAS auth.users
CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Politique pour les admins (à ajuster selon vos besoins)
-- Pour l'instant, on permet seulement aux utilisateurs de gérer leurs propres tickets