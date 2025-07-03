-- Create companies table for client companies
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  size_category TEXT CHECK (size_category IN ('startup', 'pme', 'entreprise', 'grand_groupe')),
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads_prospects_ia table
CREATE TABLE public.leads_prospects_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  lead_source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'qualifie', 'en_cours', 'converti', 'perdu')),
  priority TEXT DEFAULT 'normale' CHECK (priority IN ('faible', 'normale', 'haute', 'urgente')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_ai_solutions table for AI solution catalog
CREATE TABLE public.client_ai_solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('chatbot', 'rpa', 'analyse_predictive', 'generation_contenu', 'assistant_virtuel', 'recommandation')),
  subcategory TEXT,
  description TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  implementation_time TEXT,
  complexity_level TEXT CHECK (complexity_level IN ('simple', 'moyen', 'avance', 'expert')),
  price_min INTEGER, -- in euros
  price_max INTEGER, -- in euros
  pricing_model TEXT CHECK (pricing_model IN ('mensuel', 'annuel', 'usage', 'fixe', 'sur_mesure')),
  target_company_size TEXT[] DEFAULT '{}',
  target_industries TEXT[] DEFAULT '{}',
  roi_estimate TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunities_ia table for sales opportunities
CREATE TABLE public.opportunities_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads_prospects_ia(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_value INTEGER, -- in euros
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  stage TEXT DEFAULT 'prospection' CHECK (stage IN ('prospection', 'qualification', 'proposition', 'negociation', 'cloture_gagnee', 'cloture_perdue')),
  expected_close_date DATE,
  configured_solutions JSONB DEFAULT '[]', -- Array of configured solution objects
  total_estimated_price INTEGER,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_session_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coaching_projects_ia table
CREATE TABLE public.coaching_projects_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities_ia(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_type TEXT CHECK (project_type IN ('implementation', 'formation', 'accompagnement', 'maintenance')),
  status TEXT DEFAULT 'planifie' CHECK (status IN ('planifie', 'en_cours', 'en_attente', 'termine', 'annule')),
  start_date DATE,
  end_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  milestones JSONB DEFAULT '[]',
  team_members TEXT[] DEFAULT '{}',
  budget INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_prospects_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_ai_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_projects_ia ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies (users can see all companies but only create/edit their own)
CREATE POLICY "Everyone can view companies" 
  ON public.companies 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create companies" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for leads_prospects_ia (users can only see their own leads)
CREATE POLICY "Users can view their own leads" 
  ON public.leads_prospects_ia 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create leads" 
  ON public.leads_prospects_ia 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own leads" 
  ON public.leads_prospects_ia 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for client_ai_solutions (public catalog, readable by all)
CREATE POLICY "Everyone can view active solutions" 
  ON public.client_ai_solutions 
  FOR SELECT 
  USING (is_active = true);

-- RLS Policies for opportunities_ia (users can only see their own opportunities)
CREATE POLICY "Users can view their own opportunities" 
  ON public.opportunities_ia 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create opportunities" 
  ON public.opportunities_ia 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own opportunities" 
  ON public.opportunities_ia 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for coaching_projects_ia (users can only see their own projects)
CREATE POLICY "Users can view their own coaching projects" 
  ON public.coaching_projects_ia 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create coaching projects" 
  ON public.coaching_projects_ia 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own coaching projects" 
  ON public.coaching_projects_ia 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_companies_name ON public.companies(name);
CREATE INDEX idx_companies_industry ON public.companies(industry);
CREATE INDEX idx_leads_email ON public.leads_prospects_ia(email);
CREATE INDEX idx_leads_status ON public.leads_prospects_ia(status);
CREATE INDEX idx_leads_company ON public.leads_prospects_ia(company_id);
CREATE INDEX idx_solutions_category ON public.client_ai_solutions(category);
CREATE INDEX idx_solutions_active ON public.client_ai_solutions(is_active);
CREATE INDEX idx_opportunities_stage ON public.opportunities_ia(stage);
CREATE INDEX idx_opportunities_user ON public.opportunities_ia(user_id);
CREATE INDEX idx_coaching_status ON public.coaching_projects_ia(status);

-- Add triggers for updating updated_at timestamps
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON public.companies 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON public.leads_prospects_ia 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solutions_updated_at 
    BEFORE UPDATE ON public.client_ai_solutions 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON public.opportunities_ia 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaching_updated_at 
    BEFORE UPDATE ON public.coaching_projects_ia 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();