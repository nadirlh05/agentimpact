import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface WhatsAppMessage {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
  ProfileName?: string;
}

const sendWhatsAppMessage = async (to: string, message: string) => {
  const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${twilioPhoneNumber}`,
        To: `whatsapp:${to}`,
        Body: message,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Erreur envoi WhatsApp:', error);
    throw new Error(`Erreur Twilio: ${response.status}`);
  }

  return await response.json();
};

const handleIncomingMessage = async (messageData: WhatsAppMessage) => {
  console.log('Message WhatsApp reçu:', messageData);

  const phoneNumber = messageData.From.replace('whatsapp:', '');
  const senderName = messageData.ProfileName || phoneNumber;
  
  // Créer un ticket de support automatiquement
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .insert({
      email_from: `${senderName} <whatsapp:${phoneNumber}>`,
      sujet: `Message WhatsApp de ${senderName}`,
      message: messageData.Body,
      categorie: 'WhatsApp',
      priorite: 'normale',
      statut: 'En attente'
    })
    .select()
    .single();

  if (ticketError) {
    console.error('Erreur création ticket:', ticketError);
    throw ticketError;
  }

  // Envoyer une confirmation automatique
  const confirmationMessage = `Bonjour ${senderName} ! 👋\n\nNous avons bien reçu votre message concernant nos solutions IA d'automatisation.\n\nVotre demande a été enregistrée (Ticket #${ticket.id.slice(-8)}) et notre équipe vous répondra dans les plus brefs délais.\n\nPour plus d'informations sur nos services d'automatisation IA (facturation, gestion fournisseurs, CRM clients), visitez notre site.\n\nMerci de votre confiance ! 🤖✨`;

  try {
    await sendWhatsAppMessage(phoneNumber, confirmationMessage);
    console.log(`Confirmation envoyée à ${phoneNumber}`);
  } catch (error) {
    console.error('Erreur envoi confirmation:', error);
  }

  return ticket;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type');
      
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        // Message entrant depuis Twilio webhook
        const formData = await req.formData();
        const messageData: WhatsAppMessage = {
          From: formData.get('From') as string,
          To: formData.get('To') as string,
          Body: formData.get('Body') as string,
          MessageSid: formData.get('MessageSid') as string,
          ProfileName: formData.get('ProfileName') as string,
        };

        const ticket = await handleIncomingMessage(messageData);
        
        return new Response(
          '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
          {
            headers: { 
              'Content-Type': 'application/xml',
              ...corsHeaders 
            }
          }
        );
      } else {
        // API pour envoyer des messages depuis l'app
        const { to, message } = await req.json();
        
        if (!to || !message) {
          return new Response(
            JSON.stringify({ error: 'Paramètres "to" et "message" requis' }),
            { 
              status: 400, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        }

        const result = await sendWhatsAppMessage(to, message);
        
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    return new Response('Méthode non autorisée', { 
      status: 405,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Erreur dans whatsapp-handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});