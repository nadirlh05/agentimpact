-- Restrict companies table to authenticated users only
DROP POLICY IF EXISTS "Everyone can view companies" ON companies;

CREATE POLICY "Authenticated users can view companies" 
ON companies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);