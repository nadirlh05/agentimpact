# Configuration Gmail API - Instructions

## 1. Créer un projet Google Cloud Console
1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet ou sélectionnez un projet existant

## 2. Activer l'API Gmail
1. Dans le menu, allez à "APIs & Services" > "Library"
2. Recherchez "Gmail API" et activez-la

## 3. Créer des identifiants OAuth2
1. Allez à "APIs & Services" > "Credentials"
2. Cliquez "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choisissez "Web application"
4. Ajoutez les URLs autorisées :
   - Origins: https://preview--digital-future-agents.lovable.app
   - Redirect URIs: https://cxcdfurwsefllhxucjnz.supabase.co/functions/v1/gmail-auth-callback

## 4. Configurer l'écran de consentement
1. Allez à "OAuth consent screen"
2. Ajoutez les scopes nécessaires :
   - https://www.googleapis.com/auth/gmail.readonly
   - https://www.googleapis.com/auth/userinfo.email

## 5. Récupérer les identifiants
- Client ID
- Client Secret
- Ces informations seront nécessaires pour la configuration Supabase