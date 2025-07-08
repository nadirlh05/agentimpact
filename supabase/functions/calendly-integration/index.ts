import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const calendlyApiKey = Deno.env.get('CALENDLY_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    console.log('Calendly integration called with action:', action);

    switch (action) {
      case 'webhook':
        return await handleCalendlyWebhook(payload);
      case 'sync_events':
        return await syncCalendlyEvents(payload);
      case 'get_user_events':
        return await getUserEvents(payload);
      case 'create_opportunity':
        return await createOpportunityFromEvent(payload);
      default:
        return new Response(
          JSON.stringify({ error: 'Action not supported' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('Error in calendly-integration function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleCalendlyWebhook(payload: any) {
  console.log('Processing Calendly webhook:', payload);
  
  try {
    const { event, created_by, payload: eventData } = payload;
    
    // Traiter différents types d'événements Calendly
    switch (event) {
      case 'invitee.created':
        await handleInviteeCreated(eventData);
        break;
      case 'invitee.canceled':
        await handleInviteeCanceled(eventData);
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}

async function handleInviteeCreated(eventData: any) {
  console.log('New Calendly appointment created:', eventData);
  
  const invitee = eventData;
  const email = invitee.email;
  const name = invitee.name;
  const eventTime = new Date(invitee.start_time);
  const eventTitle = invitee.event.name;
  
  // 1. Vérifier si l'utilisateur existe déjà
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  // 2. Créer un lead/prospect
  const { data: lead, error: leadError } = await supabase
    .from('leads_prospects_ia')
    .upsert({
      email: email,
      first_name: name.split(' ')[0] || name,
      last_name: name.split(' ').slice(1).join(' ') || '',
      lead_source: 'calendly',
      status: 'nouveau',
      priority: 'moyenne',
      notes: `Consultation planifiée via Calendly: ${eventTitle} le ${eventTime.toLocaleDateString('fr-FR')}`
    }, {
      onConflict: 'email'
    })
    .select()
    .single();

  if (leadError) {
    console.error('Error creating lead:', leadError);
  } else {
    console.log('Lead created/updated:', lead);
  }

  // 3. Créer une opportunité
  if (lead) {
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities_ia')
      .insert({
        title: `Consultation ${eventTitle}`,
        description: `Consultation planifiée le ${eventTime.toLocaleDateString('fr-FR')} à ${eventTime.toLocaleTimeString('fr-FR')}`,
        lead_id: lead.id,
        stage: 'qualification',
        probability: 25,
        estimated_value: 5000, // Valeur moyenne d'une consultation
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
        notes: `Calendly Event URI: ${invitee.uri}`
      })
      .select()
      .single();

    if (oppError) {
      console.error('Error creating opportunity:', oppError);
    } else {
      console.log('Opportunity created:', opportunity);
    }
  }

  // 4. Envoyer une notification interne
  await sendInternalNotification(email, name, eventTitle, eventTime);
}

async function handleInviteeCanceled(eventData: any) {
  console.log('Calendly appointment canceled:', eventData);
  
  const invitee = eventData;
  const email = invitee.email;
  
  // Mettre à jour le statut du lead
  const { error } = await supabase
    .from('leads_prospects_ia')
    .update({
      status: 'annulé',
      notes: 'Consultation Calendly annulée'
    })
    .eq('email', email);

  if (error) {
    console.error('Error updating canceled lead:', error);
  }
}

async function sendInternalNotification(email: string, name: string, eventTitle: string, eventTime: Date) {
  try {
    // Envoyer un email à l'équipe
    const { error } = await supabase.functions.invoke('send-ticket-notification', {
      body: {
        to: 'nadir.lahyani@outlook.fr',
        subject: '🎯 Nouvelle consultation Calendly réservée',
        html: `
          <h2>Nouvelle consultation planifiée</h2>
          <p><strong>Client:</strong> ${name} (${email})</p>
          <p><strong>Type:</strong> ${eventTitle}</p>
          <p><strong>Date:</strong> ${eventTime.toLocaleDateString('fr-FR')} à ${eventTime.toLocaleTimeString('fr-FR')}</p>
          <p><strong>Source:</strong> Calendly</p>
          
          <p>Le lead a été automatiquement ajouté au CRM avec une opportunité associée.</p>
        `
      }
    });

    if (error) {
      console.error('Error sending notification:', error);
    }
  } catch (error) {
    console.error('Error in notification:', error);
  }
}

async function syncCalendlyEvents(payload: any) {
  console.log('Syncing Calendly events...');
  
  try {
    // Récupérer les événements Calendly via l'API
    const response = await fetch('https://api.calendly.com/scheduled_events', {
      headers: {
        'Authorization': `Bearer ${calendlyApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Calendly events retrieved:', data.collection?.length || 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        events_count: data.collection?.length || 0,
        events: data.collection 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing events:', error);
    throw error;
  }
}

async function getUserEvents(payload: any) {
  const { userEmail } = payload;
  
  try {
    // Récupérer les événements de l'utilisateur depuis la base
    const { data: leads } = await supabase
      .from('leads_prospects_ia')
      .select(`
        *,
        opportunities_ia (*)
      `)
      .eq('email', userEmail)
      .eq('lead_source', 'calendly');

    return new Response(
      JSON.stringify({ 
        success: true, 
        events: leads 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting user events:', error);
    throw error;
  }
}

async function createOpportunityFromEvent(payload: any) {
  const { eventData, userEmail } = payload;
  
  try {
    // Logique pour créer une opportunité à partir d'un événement
    const { data: lead } = await supabase
      .from('leads_prospects_ia')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (!lead) {
      throw new Error('Lead not found');
    }

    const { data: opportunity } = await supabase
      .from('opportunities_ia')
      .insert({
        title: eventData.title || 'Consultation Calendly',
        description: eventData.description || 'Consultation planifiée via Calendly',
        lead_id: lead.id,
        stage: 'qualification',
        probability: 25,
        estimated_value: eventData.value || 5000
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        opportunity 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating opportunity:', error);
    throw error;
  }
}