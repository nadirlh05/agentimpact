-- Create storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-attachments', 'ticket-attachments', false);

-- Create policies for ticket attachments storage
CREATE POLICY "Users can upload their own ticket attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ticket-attachments');

CREATE POLICY "Users can view their own ticket attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ticket-attachments');

-- Update support_tickets table structure for better functionality
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Ouvert';

-- Update existing tickets to have proper status if NULL
UPDATE public.support_tickets 
SET status = 'Ouvert' 
WHERE status IS NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();