import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GmailMessage {
  id: string;
  threadId: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{
      mimeType: string;
      body: { data?: string };
    }>;
    body?: { data?: string };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const gmailApiKey = Deno.env.get('GMAIL_API_KEY');
    if (!gmailApiKey) {
      throw new Error('Gmail API key not configured');
    }

    // Récupérer les emails récents du support
    const gmailResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=to:support@productgenerator.com&maxResults=10`,
      {
        headers: {
          'Authorization': `Bearer ${gmailApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!gmailResponse.ok) {
      throw new Error(`Gmail API error: ${gmailResponse.status}`);
    }

    const gmailData = await gmailResponse.json();
    const messages = gmailData.messages || [];

    console.log(`Found ${messages.length} messages`);

    // Traiter chaque message
    for (const message of messages) {
      // Vérifier si le message existe déjà
      const { data: existingTicket } = await supabaseClient
        .from('support_tickets')
        .select('id')
        .eq('gmail_message_id', message.id)
        .single();

      if (existingTicket) {
        console.log(`Message ${message.id} already processed`);
        continue;
      }

      // Récupérer les détails du message
      const messageResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            'Authorization': `Bearer ${gmailApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!messageResponse.ok) {
        console.error(`Failed to fetch message ${message.id}`);
        continue;
      }

      const messageData: GmailMessage = await messageResponse.json();
      
      // Extraire les informations du message
      const headers = messageData.payload.headers;
      const fromHeader = headers.find(h => h.name === 'From')?.value || '';
      const subjectHeader = headers.find(h => h.name === 'Subject')?.value || 'Pas de sujet';
      
      // Extraire l'email de l'expéditeur
      const emailMatch = fromHeader.match(/<(.+)>/) || fromHeader.match(/([^\s]+@[^\s]+)/);
      const emailFrom = emailMatch ? (emailMatch[1] || emailMatch[0]) : fromHeader;

      // Extraire le contenu du message
      let messageContent = '';
      if (messageData.payload.parts) {
        // Message multipart
        const textPart = messageData.payload.parts.find(part => 
          part.mimeType === 'text/plain' || part.mimeType === 'text/html'
        );
        if (textPart?.body?.data) {
          messageContent = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      } else if (messageData.payload.body?.data) {
        // Message simple
        messageContent = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }

      // Nettoyer le contenu HTML si nécessaire
      messageContent = messageContent.replace(/<[^>]*>/g, '').trim();

      // Déterminer la catégorie basée sur le sujet
      let categorie = 'autre';
      const subject = subjectHeader.toLowerCase();
      if (subject.includes('technique') || subject.includes('bug') || subject.includes('erreur')) {
        categorie = 'technique';
      } else if (subject.includes('factur') || subject.includes('paiement')) {
        categorie = 'facturation';
      } else if (subject.includes('crédit') || subject.includes('credit')) {
        categorie = 'credits';
      } else if (subject.includes('compte') || subject.includes('profil')) {
        categorie = 'compte';
      }

      // Déterminer la priorité basée sur le contenu
      let priorite = 'normale';
      const contentLower = messageContent.toLowerCase();
      if (contentLower.includes('urgent') || contentLower.includes('critique')) {
        priorite = 'urgente';
      } else if (contentLower.includes('important')) {
        priorite = 'elevee';
      }

      // Chercher l'utilisateur par email
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('email', emailFrom)
        .single();

      // Créer le ticket de support
      const { error: insertError } = await supabaseClient
        .from('support_tickets')
        .insert({
          user_id: profile?.id || null,
          email_from: emailFrom,
          sujet: subjectHeader,
          message: messageContent,
          categorie,
          priorite,
          statut: 'En attente',
          gmail_message_id: message.id,
        });

      if (insertError) {
        console.error(`Error inserting ticket for message ${message.id}:`, insertError);
      } else {
        console.log(`Created support ticket for message ${message.id} from ${emailFrom}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: messages.length,
        message: `Processed ${messages.length} Gmail messages` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in gmail-support function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});