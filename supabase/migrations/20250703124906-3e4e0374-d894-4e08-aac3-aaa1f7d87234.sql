-- Insert AI solutions catalog data
INSERT INTO public.client_ai_solutions (name, category, subcategory, description, features, benefits, implementation_time, complexity_level, price_min, price_max, pricing_model, target_company_size, target_industries, roi_estimate) VALUES

-- Chatbots
('ChatBot Customer Service Pro', 'chatbot', 'service_client', 'Assistant conversationnel IA pour support client 24/7 avec compréhension du langage naturel et intégration CRM.', 
ARRAY['Réponses automatiques 24/7', 'Intégration CRM', 'Analyse sentiment', 'Escalade intelligente', 'Multilingue'], 
ARRAY['Réduction 70% temps réponse', 'Satisfaction client +40%', 'Économies personnel support', 'Disponibilité 24/7'], 
'2-4 semaines', 'moyen', 199, 499, 'mensuel', 
ARRAY['pme', 'entreprise', 'grand_groupe'], 
ARRAY['e-commerce', 'services', 'finance', 'sante'], 
'ROI 300% en 6 mois'),

('ChatBot Sales Assistant', 'chatbot', 'vente', 'Assistant commercial IA pour qualification leads et accompagnement prospects dans le parcours d''achat.', 
ARRAY['Qualification prospects', 'Recommandations produits', 'Prise RDV automatique', 'Scoring leads', 'Analytics ventes'], 
ARRAY['Conversion +25%', 'Leads qualifiés +60%', 'Temps commercial optimisé', 'Pipeline predictible'], 
'3-5 semaines', 'avance', 299, 799, 'mensuel', 
ARRAY['pme', 'entreprise', 'grand_groupe'], 
ARRAY['e-commerce', 'services', 'immobilier', 'finance'], 
'ROI 400% en 4 mois'),

-- RPA
('RPA Process Automation Suite', 'rpa', 'processus_metier', 'Suite complète d''automatisation robotique pour optimiser les processus métier répétitifs et réduire les erreurs.', 
ARRAY['Automatisation workflows', 'Intégration multi-systèmes', 'Monitoring temps réel', 'Gestion exceptions', 'Reporting avancé'], 
ARRAY['Productivité +50%', 'Erreurs -90%', 'Coûts opérationnels -40%', 'Conformité renforcée'], 
'4-8 semaines', 'avance', 2500, 8000, 'sur_mesure', 
ARRAY['entreprise', 'grand_groupe'], 
ARRAY['finance', 'assurance', 'manufacturing', 'services'], 
'ROI 250% en 12 mois'),

('RPA Document Processing', 'rpa', 'gestion_documents', 'Automatisation intelligente de traitement et extraction de données depuis documents (factures, contrats, formulaires).', 
ARRAY['OCR avancé', 'Extraction données structurées', 'Validation automatique', 'Intégration ERP', 'Audit trail'], 
ARRAY['Traitement 10x plus rapide', 'Précision 99%+', 'Réduction saisie manuelle', 'Conformité documentaire'], 
'2-4 semaines', 'moyen', 800, 2500, 'mensuel', 
ARRAY['pme', 'entreprise', 'grand_groupe'], 
ARRAY['finance', 'juridique', 'assurance', 'rh'], 
'ROI 350% en 8 mois'),

-- Analyse Prédictive
('Predictive Analytics Platform', 'analyse_predictive', 'business_intelligence', 'Plateforme d''analyse prédictive pour forecasting ventes, optimisation stocks et détection tendances marché.', 
ARRAY['Machine Learning avancé', 'Prédictions temps réel', 'Dashboards interactifs', 'Alertes automatiques', 'API intégration'], 
ARRAY['Précision prévisions +40%', 'Optimisation stock 30%', 'Décisions data-driven', 'Avantage concurrentiel'], 
'3-6 semaines', 'avance', 1500, 5000, 'mensuel', 
ARRAY['entreprise', 'grand_groupe'], 
ARRAY['e-commerce', 'retail', 'manufacturing', 'finance'], 
'ROI 280% en 10 mois'),

('Customer Behavior Analytics', 'analyse_predictive', 'comportement_client', 'Solution d''analyse comportementale pour prédire actions clients et optimiser expérience utilisateur.', 
ARRAY['Segmentation automatique', 'Prédiction churn', 'Recommandations personnalisées', 'A/B testing IA', 'Attribution marketing'], 
ARRAY['Retention client +35%', 'Revenus par client +25%', 'Campagnes ciblées efficaces', 'LTV optimisé'], 
'4-7 semaines', 'avance', 1200, 4000, 'mensuel', 
ARRAY['pme', 'entreprise', 'grand_groupe'], 
ARRAY['e-commerce', 'saas', 'media', 'finance'], 
'ROI 320% en 8 mois'),

-- Génération de Contenu
('AI Content Generator Pro', 'generation_contenu', 'marketing', 'Générateur de contenu IA pour création automatique articles, descriptions produits, posts réseaux sociaux.', 
ARRAY['Génération multi-formats', 'Optimisation SEO', 'Ton de voix personnalisé', 'Planning éditorial', 'Intégration CMS'], 
ARRAY['Production contenu 5x plus rapide', 'Cohérence marque', 'SEO optimisé', 'Économies rédaction'], 
'1-3 semaines', 'simple', 99, 399, 'mensuel', 
ARRAY['startup', 'pme', 'entreprise'], 
ARRAY['marketing', 'e-commerce', 'media', 'services'], 
'ROI 200% en 3 mois'),

('Technical Documentation AI', 'generation_contenu', 'documentation', 'IA spécialisée dans génération documentation technique, manuels utilisateur et guides procédures.', 
ARRAY['Documentation auto-générée', 'Mise à jour intelligente', 'Multi-formats export', 'Versioning avancé', 'Traduction automatique'], 
ARRAY['Temps documentation -70%', 'Qualité constante', 'Maintenance facilitée', 'Onboarding accéléré'], 
'2-4 semaines', 'moyen', 299, 899, 'mensuel', 
ARRAY['pme', 'entreprise', 'grand_groupe'], 
ARRAY['tech', 'manufacturing', 'services', 'formation'], 
'ROI 180% en 6 mois'),

-- Assistant Virtuel
('Virtual Assistant Enterprise', 'assistant_virtuel', 'productivite', 'Assistant virtuel IA pour gestion planning, emails, tâches et coordination équipes avec intégrations Office 365/Google Workspace.', 
ARRAY['Gestion planning intelligente', 'Priorisation tâches', 'Résumés réunions', 'Suivi projets', 'Intégrations bureau'], 
ARRAY['Productivité +40%', 'Temps admin -50%', 'Organisation optimisée', 'Collaboration renforcée'], 
'2-5 semaines', 'moyen', 149, 449, 'mensuel', 
ARRAY['pme', 'entreprise', 'grand_groupe'], 
ARRAY['services', 'conseil', 'finance', 'tech'], 
'ROI 250% en 5 mois'),

-- Recommandation
('AI Recommendation Engine', 'recommandation', 'e-commerce', 'Moteur de recommandations IA pour personnalisation expérience client et optimisation cross-selling/up-selling.', 
ARRAY['Recommandations temps réel', 'Personnalisation avancée', 'A/B testing automatique', 'Analytics performance', 'API flexible'], 
ARRAY['Ventes additionnelles +45%', 'Engagement client +60%', 'Panier moyen +30%', 'Fidélisation renforcée'], 
'3-6 semaines', 'avance', 599, 1999, 'mensuel', 
ARRAY['pme', 'entreprise', 'grand_groupe'], 
ARRAY['e-commerce', 'retail', 'media', 'entertainment'], 
'ROI 380% en 6 mois');