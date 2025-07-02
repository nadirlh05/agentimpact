-- Create support_tickets table to store tickets received via email
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email_from TEXT NOT NULL,
  sujet TEXT NOT NULL,
  message TEXT NOT NULL,
  categorie TEXT,
  priorite TEXT DEFAULT 'normale',
  statut TEXT DEFAULT 'En attente',
  gmail_message_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for support tickets
CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (auth.uid() = user_id OR email_from = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can create tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update all tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_email_from ON public.support_tickets(email_from);
CREATE INDEX idx_support_tickets_gmail_message_id ON public.support_tickets(gmail_message_id);