-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role public.app_role NOT NULL DEFAULT 'client';

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = _role
  );
$$;

-- Update support_tickets RLS policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.support_tickets;

-- New RLS policies for support_tickets
CREATE POLICY "Users can view their own tickets or admins can view all"
ON public.support_tickets
FOR SELECT
USING (
  auth.uid() = user_id OR public.has_role('admin')
);

CREATE POLICY "Users can create their own tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets or admins can update all"
ON public.support_tickets
FOR UPDATE
USING (
  auth.uid() = user_id OR public.has_role('admin')
);

CREATE POLICY "Admins can delete tickets"
ON public.support_tickets
FOR DELETE
USING (public.has_role('admin'));

-- Update opportunities_ia RLS policies
DROP POLICY IF EXISTS "Users can view their own opportunities" ON public.opportunities_ia;
DROP POLICY IF EXISTS "Users can create opportunities" ON public.opportunities_ia;
DROP POLICY IF EXISTS "Users can update their own opportunities" ON public.opportunities_ia;

CREATE POLICY "Users can view their own opportunities or admins can view all"
ON public.opportunities_ia
FOR SELECT
USING (
  auth.uid() = user_id OR public.has_role('admin')
);

CREATE POLICY "Users can create their own opportunities"
ON public.opportunities_ia
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opportunities or admins can update all"
ON public.opportunities_ia
FOR UPDATE
USING (
  auth.uid() = user_id OR public.has_role('admin')
);

CREATE POLICY "Admins can delete opportunities"
ON public.opportunities_ia
FOR DELETE
USING (public.has_role('admin'));

-- Update coaching_projects_ia RLS policies
DROP POLICY IF EXISTS "Users can view their own coaching projects" ON public.coaching_projects_ia;
DROP POLICY IF EXISTS "Users can create coaching projects" ON public.coaching_projects_ia;
DROP POLICY IF EXISTS "Users can update their own coaching projects" ON public.coaching_projects_ia;

CREATE POLICY "Users can view their own projects or admins can view all"
ON public.coaching_projects_ia
FOR SELECT
USING (
  auth.uid() = user_id OR public.has_role('admin')
);

CREATE POLICY "Users can create their own projects"
ON public.coaching_projects_ia
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects or admins can update all"
ON public.coaching_projects_ia
FOR UPDATE
USING (
  auth.uid() = user_id OR public.has_role('admin')
);

CREATE POLICY "Admins can delete projects"
ON public.coaching_projects_ia
FOR DELETE
USING (public.has_role('admin'));

-- Update leads_prospects_ia RLS policies
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads_prospects_ia;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads_prospects_ia;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads_prospects_ia;

CREATE POLICY "Users can view their own leads or admins can view all"
ON public.leads_prospects_ia
FOR SELECT
USING (
  auth.uid() = user_id OR public.has_role('admin')
);

CREATE POLICY "Users can create their own leads"
ON public.leads_prospects_ia
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads or admins can update all"
ON public.leads_prospects_ia
FOR UPDATE
USING (
  auth.uid() = user_id OR public.has_role('admin')
);

CREATE POLICY "Admins can delete leads"
ON public.leads_prospects_ia
FOR DELETE
USING (public.has_role('admin'));

-- Update profiles RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile or admins can view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR public.has_role('admin')
);

CREATE POLICY "Users can update their own profile or admins can update all"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id OR public.has_role('admin')
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Update AI assistant conversations RLS policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_assistant_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.ai_assistant_conversations;

CREATE POLICY "Users can view their own conversations or admins can view all"
ON public.ai_assistant_conversations
FOR SELECT
USING (
  auth.uid() = user_id OR user_id IS NULL OR public.has_role('admin')
);

CREATE POLICY "Users can create conversations"
ON public.ai_assistant_conversations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);

-- Set default admin user (replace with your actual user ID if needed)
-- This will be done manually by the admin after first login