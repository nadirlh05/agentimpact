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

// Validation constants
const MAX_MESSAGE_LENGTH = 4096;
const MAX_NAME_LENGTH = 100;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// Mask PII for logging
const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 4) return '****';
  return `***${phone.slice(-4)}`;
};

// Sanitize text input
const sanitizeText = (text: string, maxLength: number): string => {
  return text
    .trim()
    .substring(0, maxLength)
    .replace(/[<>"']/g, ''); // Remove potential XSS characters
};

// Validate phone number
const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace('whatsapp:', '').replace(/\s/g, '');
  return PHONE_REGEX.test(cleaned);
};

const sendWhatsAppMessage = async (to: string, message: string) => {
  console.log(`Envoi WhatsApp vers ${maskPhone(to)}`);
  
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
        Body: message.substring(0, 1600), // Twilio WhatsApp limit
      }),
    }
  );

  const responseText = await response.text();
  console.log(`Twilio response status: ${response.status}`);

  if (!response.ok) {
    throw new Error(`Erreur Twilio ${response.status}`);
  }

  return JSON.parse(responseText);
};

const handleIncomingMessage = async (messageData: WhatsAppMessage) => {
  // Validate phone number
  if (!validatePhoneNumber(messageData.From)) {
    console.error('Invalid phone number format');
    throw new Error('Invalid phone number format');
  }

  // Validate message body
  if (!messageData.Body || messageData.Body.trim().length === 0) {
    console.error('Empty message body');
    throw new Error('Message body is required');
  }

  if (messageData.Body.length > MAX_MESSAGE_LENGTH) {
    console.error('Message too long');
    throw new Error('Message too long');
  }

  const phoneNumber = messageData.From.replace('whatsapp:', '');
  const sanitizedName = sanitizeText(messageData.ProfileName || phoneNumber, MAX_NAME_LENGTH);
  const sanitizedBody = sanitizeText(messageData.Body, MAX_MESSAGE_LENGTH);
  
  console.log(`Message WhatsApp reçu de ${maskPhone(phoneNumber)}`);

  // Créer un ticket de support automatiquement
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .insert({
      email_from: `${sanitizedName} <whatsapp:${phoneNumber}>`,
      sujet: `Message WhatsApp de ${sanitizedName}`,
      message: sanitizedBody,
      categorie: 'WhatsApp',
      priorite: 'normale',
      statut: 'En attente'
    })
    .select()
    .single();

  if (ticketError) {
    console.error('Erreur création ticket');
    throw ticketError;
  }

  console.log('Ticket créé:', ticket.id.slice(-8));

  // Envoyer une confirmation automatique
  const confirmationMessage = `Bonjour ${sanitizedName} ! 👋\n\nNous avons bien reçu votre message concernant nos solutions IA pour agents immobiliers.\n\nVotre demande a été enregistrée (Ticket #${ticket.id.slice(-8)}) et notre équipe vous répondra dans les plus brefs délais.\n\nPour plus d'informations sur nos services d'automatisation IA (prospection, gestion biens, CRM immobilier), visitez notre site.\n\nMerci de votre confiance ! 🤖✨`;

  try {
    const result = await sendWhatsAppMessage(phoneNumber, confirmationMessage);
    console.log(`Confirmation envoyée, SID: ${result.sid.slice(-8)}`);
  } catch (error) {
    console.error('Erreur envoi confirmation');
    // Ne pas faire échouer toute la fonction si la confirmation échoue
  }

  return ticket;
};

serve(async (req) => {
  console.log(`${req.method} request received`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('application/x-www-form-urlencoded')) {
        // Message entrant depuis Twilio webhook
        const formData = await req.formData();
        const messageData: WhatsAppMessage = {
          From: formData.get('From') as string,
          To: formData.get('To') as string,
          Body: formData.get('Body') as string,
          MessageSid: formData.get('MessageSid') as string,
          ProfileName: formData.get('ProfileName') as string,
        };

        // Basic validation before processing
        if (!messageData.From || !messageData.Body) {
          return new Response(
            '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
            { headers: { 'Content-Type': 'application/xml', ...corsHeaders } }
          );
        }

        await handleIncomingMessage(messageData);
        
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
        const requestBody = await req.json();
        
        const { to, message } = requestBody;
        
        if (!to || !message) {
          return new Response(
            JSON.stringify({ error: 'Paramètres "to" et "message" requis' }),
            { 
              status: 400, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        }

        // Validate phone number
        const cleanedTo = to.startsWith('+') ? to.substring(1) : to;
        if (!PHONE_REGEX.test(cleanedTo)) {
          return new Response(
            JSON.stringify({ error: 'Format de numéro de téléphone invalide' }),
            { 
              status: 400, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        }

        // Validate message length
        if (message.length > MAX_MESSAGE_LENGTH) {
          return new Response(
            JSON.stringify({ error: 'Message trop long (max 4096 caractères)' }),
            { 
              status: 400, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            }
          );
        }
        
        const result = await sendWhatsAppMessage(cleanedTo, message);
        
        return new Response(JSON.stringify({ 
          success: true, 
          messageSid: result.sid,
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    return new Response('Méthode non autorisée', { 
      status: 405,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Erreur dans whatsapp-handler:', error.message);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
