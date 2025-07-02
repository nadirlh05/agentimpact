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
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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
      throw new Error('GMAIL_API_KEY not configured');
    }

    // Pour cette démonstration, nous allons simuler la récupération d'emails
    // En production, vous devriez utiliser l'API Gmail avec OAuth
    console.log('Simulating Gmail API call...');

    // Simuler quelques tickets reçus par email
    const simulatedEmails = [
      {
        subject: "Problème de connexion",
        from: "user@example.com",
        body: "Je n'arrive pas à me connecter à mon compte",
        messageId: "gmail_msg_001",
        receivedAt: new Date().toISOString()
      },
      {
        subject: "Demande d'aide facturation",
        from: "client@company.com", 
        body: "J'ai une question sur ma dernière facture",
        messageId: "gmail_msg_002",
        receivedAt: new Date().toISOString()
      }
    ];

    let processedCount = 0;

    for (const email of simulatedEmails) {
      // Vérifier si ce message Gmail n'a pas déjà été traité
      const { data: existingTicket } = await supabaseClient
        .from('support_tickets')
        .select('id')
        .eq('gmail_message_id', email.messageId)
        .maybeSingle();

      if (!existingTicket) {
        // Créer un nouveau ticket depuis l'email
        const { error: insertError } = await supabaseClient
          .from('support_tickets')
          .insert({
            email_from: email.from,
            sujet: email.subject,
            message: email.body,
            gmail_message_id: email.messageId,
            statut: 'En attente',
            priorite: 'normale',
            categorie: 'email'
          });

        if (insertError) {
          console.error('Error inserting ticket:', insertError);
        } else {
          processedCount++;
          console.log(`Created ticket from email: ${email.subject}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        message: `${processedCount} nouveaux tickets créés depuis Gmail`
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