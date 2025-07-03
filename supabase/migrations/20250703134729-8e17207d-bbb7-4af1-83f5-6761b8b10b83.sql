-- Set nadir.lahyani@outlook.fr as admin automatically
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'nadir.lahyani@outlook.fr';

-- Ensure all other users are clients
UPDATE public.profiles 
SET role = 'client' 
WHERE email != 'nadir.lahyani@outlook.fr' AND role IS NULL;

-- Update the handle_new_user function to automatically set admin for your email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
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
$$;