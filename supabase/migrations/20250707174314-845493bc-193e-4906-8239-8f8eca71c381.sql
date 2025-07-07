-- Create email_logs table to track email status
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT NOT NULL, -- Resend email ID
  ticket_id UUID REFERENCES public.support_tickets(id),
  email_type TEXT NOT NULL, -- 'ticket_created', 'status_update', 'admin_response'
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'bounced', 'complained'
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email logs
CREATE POLICY "Admins can view all email logs" 
ON public.email_logs 
FOR SELECT 
USING (has_role('admin'::app_role));

CREATE POLICY "System can insert email logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update email logs" 
ON public.email_logs 
FOR UPDATE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_email_logs_email_id ON public.email_logs(email_id);
CREATE INDEX idx_email_logs_ticket_id ON public.email_logs(ticket_id);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_logs_updated_at
BEFORE UPDATE ON public.email_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();