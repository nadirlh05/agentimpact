import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GmailMessage {
  id: string;
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
      };
    }>;
    body?: {
      data?: string;
    };
  };
}

interface GmailListResponse {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer les tokens OAuth depuis la requête ou la base de données
    const { accessToken, userEmail } = await req.json();
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Access token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting Gmail sync for:', userEmail);

    // 1. Rechercher les emails dans la boîte de réception
    const searchQuery = 'in:inbox is:unread subject:(support OR aide OR problème OR bug OR erreur)';
    const listUrl = `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=10`;
    
    const listResponse = await fetch(listUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!listResponse.ok) {
      throw new Error(`Gmail API error: ${listResponse.status} - ${await listResponse.text()}`);
    }

    const listData: GmailListResponse = await listResponse.json();
    
    if (!listData.messages || listData.messages.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0,
          message: 'Aucun nouvel email de support trouvé'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedCount = 0;

    // 2. Traiter chaque message
    for (const messageRef of listData.messages) {
      try {
        // Vérifier si ce message n'a pas déjà été traité
        const { data: existingTicket } = await supabaseClient
          .from('support_tickets')
          .select('id')
          .eq('gmail_message_id', messageRef.id)
          .maybeSingle();

        if (existingTicket) {
          console.log(`Message ${messageRef.id} already processed, skipping`);
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
          console.error(`Failed to fetch message ${messageRef.id}:`, messageResponse.status);
          continue;
        }

        const message: GmailMessage = await messageResponse.json();
        
        // 3. Extraire les informations du message
        const headers = message.payload.headers;
        const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'Sans sujet';
        const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Expéditeur inconnu';
        const date = headers.find(h => h.name.toLowerCase() === 'date')?.value;

        // Extraire l'email de l'expéditeur
        const emailMatch = from.match(/<([^>]+)>/);
        const emailFrom = emailMatch ? emailMatch[1] : from.split(' ')[0];

        // 4. Extraire le contenu du message
        let messageBody = '';
        
        if (message.payload.body?.data) {
          // Message simple
          messageBody = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (message.payload.parts) {
          // Message multipart
          for (const part of message.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              messageBody = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              break;
            }
          }
        }

        // Utiliser le snippet si pas de contenu trouvé
        if (!messageBody) {
          messageBody = message.snippet;
        }

        // 5. Déterminer la catégorie automatiquement
        let categorie = 'autre';
        const subjectLower = subject.toLowerCase();
        if (subjectLower.includes('facturation') || subjectLower.includes('paiement')) {
          categorie = 'facturation';
        } else if (subjectLower.includes('technique') || subjectLower.includes('bug') || subjectLower.includes('erreur')) {
          categorie = 'technique';
        } else if (subjectLower.includes('compte') || subjectLower.includes('connexion')) {
          categorie = 'compte';
        }

        // 6. Déterminer la priorité
        let priorite = 'normale';
        if (subjectLower.includes('urgent') || subjectLower.includes('critique')) {
          priorite = 'elevee';
        }

        // 7. Créer le ticket dans la base de données
        const { error: insertError } = await supabaseClient
          .from('support_tickets')
          .insert({
            email_from: emailFrom,
            sujet: subject,
            message: messageBody.substring(0, 5000), // Limiter la taille
            gmail_message_id: messageRef.id,
            statut: 'En attente',
            priorite: priorite,
            categorie: categorie,
            created_at: date ? new Date(date).toISOString() : new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting ticket:', insertError);
        } else {
          processedCount++;
          console.log(`Created ticket from email: ${subject} (${emailFrom})`);
          
          // Marquer l'email comme lu (optionnel)
          await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageRef.id}/modify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              removeLabelIds: ['UNREAD']
            })
          });
        }
      } catch (messageError) {
        console.error(`Error processing message ${messageRef.id}:`, messageError);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        message: `${processedCount} nouveaux tickets créés depuis Gmail`,
        totalEmails: listData.messages.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in gmail-support function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);