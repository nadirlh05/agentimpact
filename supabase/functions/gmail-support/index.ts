import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Gmail support function called with method:', req.method);
  console.log('Request URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Configuration OAuth Google
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = 'https://cxcdfurwsefllhxucjnz.supabase.co/functions/v1/gmail-support/callback';

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Google OAuth credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route 1: Démarrer l'authentification OAuth
    if (req.method === 'GET' && url.pathname.includes('/gmail-support')) {
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route 2: Gérer le callback OAuth et synchroniser Gmail
    if (url.pathname.includes('/callback')) {
      const code = url.searchParams.get('code');
      
      if (!code) {
        // Rediriger vers l'app avec une erreur
        const appUrl = new URL('https://preview--digital-future-agents.lovable.app/support');
        appUrl.searchParams.set('gmail_error', 'authorization_failed');
        return Response.redirect(appUrl.toString(), 302);
      }

      try {
        // Échanger le code contre un access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error(`Token exchange failed: ${await tokenResponse.text()}`);
        }

        const tokens = await tokenResponse.json();

        // Récupérer les informations utilisateur
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
          },
        });

        const userInfo = await userResponse.json();

        // Synchroniser immédiatement avec Gmail
        const processed = await syncWithGmail(tokens.access_token, supabaseClient);

        // Rediriger vers l'application avec les résultats
        const appUrl = new URL('https://preview--digital-future-agents.lovable.app/support');
        appUrl.searchParams.set('gmail_sync', 'success');
        appUrl.searchParams.set('processed_count', processed.toString());
        appUrl.searchParams.set('user_email', userInfo.email);

        return Response.redirect(appUrl.toString(), 302);

      } catch (error) {
        console.error('OAuth callback error:', error);
        const appUrl = new URL('https://preview--digital-future-agents.lovable.app/support');
        appUrl.searchParams.set('gmail_error', 'sync_failed');
        return Response.redirect(appUrl.toString(), 302);
      }
    }

    // Route 3: Synchronisation manuelle (avec token existant)
    if (req.method === 'POST') {
      const { accessToken } = await req.json();
      
      if (!accessToken) {
        return new Response(
          JSON.stringify({ error: 'Access token required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const processed = await syncWithGmail(accessToken, supabaseClient);

      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: processed,
          message: `${processed} nouveaux tickets créés depuis Gmail`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in gmail-support function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// Fonction utilitaire pour synchroniser avec Gmail
async function syncWithGmail(accessToken: string, supabaseClient: any): Promise<number> {
  console.log('Starting Gmail sync...');

  // Rechercher les emails de support
  const searchQuery = 'in:inbox is:unread subject:(support OR aide OR problème OR bug OR erreur)';
  const listUrl = `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=10`;
  
  const listResponse = await fetch(listUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!listResponse.ok) {
    console.error('Gmail API list error:', listResponse.status);
    return 0;
  }

  const listData = await listResponse.json();
  
  if (!listData.messages || listData.messages.length === 0) {
    console.log('No new support emails found');
    return 0;
  }

  let processedCount = 0;

  for (const messageRef of listData.messages) {
    try {
      // Vérifier si ce message n'a pas déjà été traité
      const { data: existingTicket } = await supabaseClient
        .from('support_tickets')
        .select('id')
        .eq('gmail_message_id', messageRef.id)
        .maybeSingle();

      if (existingTicket) {
        continue;
      }

      // Récupérer le message complet
      const messageUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageRef.id}`;
      const messageResponse = await fetch(messageUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!messageResponse.ok) {
        continue;
      }

      const message = await messageResponse.json();
      
      // Extraire les informations
      const headers = message.payload.headers;
      const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'Sans sujet';
      const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Expéditeur inconnu';
      
      // Extraire l'email
      const emailMatch = from.match(/<([^>]+)>/);
      const emailFrom = emailMatch ? emailMatch[1] : from.split(' ')[0];

      // Créer le ticket
      const { error: insertError } = await supabaseClient
        .from('support_tickets')
        .insert({
          email_from: emailFrom,
          sujet: subject,
          message: message.snippet || 'Contenu du message',
          gmail_message_id: messageRef.id,
          statut: 'En attente',
          priorite: 'normale',
          categorie: 'email'
        });

      if (!insertError) {
        processedCount++;
        console.log(`Created ticket from email: ${subject}`);
      }

    } catch (messageError) {
      console.error(`Error processing message ${messageRef.id}:`, messageError);
    }
  }

  return processedCount;
}

serve(handler);