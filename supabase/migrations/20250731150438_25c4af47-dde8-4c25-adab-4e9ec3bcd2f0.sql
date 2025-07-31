-- Security fixes implementation

-- 1. Fix database function security by setting proper search paths
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = _role
  );
$function$;

-- Update the handle_new_user function with proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    CASE 
      WHEN NEW.email = 'nadir.lahyani@outlook.fr' THEN 'admin'::public.app_role
      ELSE 'client'::public.app_role
    END
  );
  RETURN NEW;
END;
$function$;

-- 2. Strengthen RLS policies to require authentication for sensitive operations

-- Update profiles policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile or admins can view all" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING ((auth.uid() = id) OR has_role('admin'::app_role));

CREATE POLICY "Users can update their own profile or admins can update all" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING ((auth.uid() = id) OR has_role('admin'::app_role));

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Update analytics policies to be more restrictive
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "System can insert analytics" ON public.analytics_events;

CREATE POLICY "Admins can view analytics" 
ON public.analytics_events 
FOR SELECT 
TO authenticated
USING (has_role('admin'::app_role));

CREATE POLICY "System can insert analytics" 
ON public.analytics_events 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Update AI assistant conversation policies
DROP POLICY IF EXISTS "Users can view their own conversations or admins can view all" ON public.ai_assistant_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.ai_assistant_conversations;

CREATE POLICY "Users can view their own conversations or admins can view all" 
ON public.ai_assistant_conversations 
FOR SELECT 
TO authenticated
USING ((auth.uid() = user_id) OR has_role('admin'::app_role));

CREATE POLICY "Authenticated users can create conversations" 
ON public.ai_assistant_conversations 
FOR INSERT 
TO authenticated
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

-- 3. Add role validation constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_role_constraint 
CHECK (role IN ('admin', 'client'));

-- 4. Create audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (has_role('admin'::app_role));

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 5. Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
      auth.uid(),
      'UPDATE',
      'profiles',
      NEW.id,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role)
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS audit_role_changes ON public.profiles;
CREATE TRIGGER audit_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- 6. Add rate limiting table for edge functions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  endpoint text NOT NULL,
  requests_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits" 
ON public.rate_limits 
FOR ALL 
TO authenticated
USING (true);

-- Create index for efficient rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint 
ON public.rate_limits(identifier, endpoint, window_start);

-- 7. Add function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _identifier text,
  _endpoint text,
  _max_requests integer DEFAULT 100,
  _window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - interval '1 minute' * _window_minutes;
  
  -- Clean old entries
  DELETE FROM public.rate_limits 
  WHERE window_start < window_start;
  
  -- Get current count
  SELECT COALESCE(SUM(requests_count), 0) INTO current_count
  FROM public.rate_limits
  WHERE identifier = _identifier 
    AND endpoint = _endpoint 
    AND window_start >= window_start;
  
  -- Check if limit exceeded
  IF current_count >= _max_requests THEN
    RETURN false;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO public.rate_limits (identifier, endpoint, requests_count, window_start)
  VALUES (_identifier, _endpoint, 1, now())
  ON CONFLICT (identifier, endpoint) DO UPDATE SET
    requests_count = rate_limits.requests_count + 1,
    window_start = CASE 
      WHEN rate_limits.window_start < window_start THEN now()
      ELSE rate_limits.window_start
    END;
  
  RETURN true;
END;
$function$;