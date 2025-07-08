-- Ajouter un champ company_name pour permettre la saisie libre du nom d'entreprise
ALTER TABLE leads_prospects_ia 
ADD COLUMN company_name TEXT;