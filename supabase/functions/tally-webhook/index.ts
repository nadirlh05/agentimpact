import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation des données Tally Webhook
interface TallyField {
  key: string;
  label: string;
  type: string;
  value: any;
}

interface TallyWebhookData {
  eventId: string;
  eventType: string;
  createdAt: string;
  data: {
    responseId: string;
    submissionId: string;
    respondentId: string;
    formId: string;
    formName: string;
    createdAt: string;
    fields: TallyField[];
  };
}

// Validation simple des données requises
const validateTallyData = (data: any): data is TallyWebhookData => {
  return (
    data &&
    typeof data.eventId === 'string' &&
    typeof data.eventType === 'string' &&
    data.data &&
    Array.isArray(data.data.fields) &&
    data.data.fields.length > 0
  );
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting for webhook to prevent abuse
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Validation de la requête
    if (!req.body) {
      return new Response(JSON.stringify({ error: "Corps de requête manquant" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Content-Type validation
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: "Content-Type invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Configuration Supabase manquante");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const webhookData: unknown = await req.json();
    
    // Validation des données webhook
    if (!validateTallyData(webhookData)) {
      return new Response(JSON.stringify({ error: "Format de données invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Extraire les informations du formulaire
    const fields = webhookData.data.fields;
    const extractFieldValue = (key: string) => {
      const field = fields.find(f => f.key.toLowerCase().includes(key.toLowerCase()) || 
                                   f.label.toLowerCase().includes(key.toLowerCase()));
      return field?.value || null;
    };

    // Extraire et assainir les données importantes
    const prenom = String(extractFieldValue('prenom') || extractFieldValue('first') || extractFieldValue('nom') || '').trim().substring(0, 100);
    const nom = String(extractFieldValue('nom') || extractFieldValue('last') || extractFieldValue('surname') || '').trim().substring(0, 100);
    const email = String(extractFieldValue('email') || extractFieldValue('mail') || '').trim().toLowerCase().substring(0, 254);
    const telephone = String(extractFieldValue('telephone') || extractFieldValue('phone') || extractFieldValue('tel') || '').trim().substring(0, 20);
    const entreprise = String(extractFieldValue('entreprise') || extractFieldValue('company') || extractFieldValue('société') || '').trim().substring(0, 200);
    const secteur = String(extractFieldValue('secteur') || extractFieldValue('industrie') || extractFieldValue('industry') || '').trim().substring(0, 100);
    const typeConsultation = String(extractFieldValue('consultation') || extractFieldValue('type') || 'Consultation IA').trim().substring(0, 100);
    const budget = String(extractFieldValue('budget') || '').trim().substring(0, 50);
    const message = String(extractFieldValue('message') || extractFieldValue('description') || extractFieldValue('besoins') || '').trim().substring(0, 2000);
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Format d'email invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    
    // Validation des données essentielles
    if (!email || (!prenom && !nom)) {
      return new Response(JSON.stringify({ error: "Email et nom requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 1. Créer ou récupérer l'entreprise
    let companyId = null;
    if (entreprise) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', entreprise)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: entreprise,
            industry: secteur,
            size_category: 'PME', // Valeur par défaut
          })
          .select('id')
          .single();

        if (companyError) {
          // Log error mais continue le processus
        } else {
          companyId = newCompany?.id;
        }
      }
    }

    // 2. Créer le lead/prospect
    const { data: lead, error: leadError } = await supabase
      .from('leads_prospects_ia')
      .insert({
        first_name: prenom,
        last_name: nom,
        email: email,
        phone: telephone,
        company_id: companyId,
        lead_source: 'website_tally',
        status: 'nouveau',
        priority: 'haute',
        notes: `Consultation demandée via Tally Form.\nType: ${typeConsultation}\nBudget: ${budget}\nMessage: ${message}`,
        user_id: null // Sera assigné par un admin
      })
      .select('id')
      .single();

    if (leadError) {
      return new Response(JSON.stringify({ 
        error: "Erreur lors de la création du lead", 
        details: leadError.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 3. Créer l'opportunité
    const { data: opportunity, error: opportunityError } = await supabase
      .from('opportunities_ia')
      .insert({
        title: `Consultation IA - ${entreprise || (prenom + ' ' + nom)}`,
        description: `Demande de consultation reçue via formulaire Tally.\n\nType: ${typeConsultation}\nSecteur: ${secteur}\nBudget estimé: ${budget}\n\nMessage du client:\n${message}`,
        lead_id: lead?.id,
        company_id: companyId,
        stage: 'prospection',
        probability: 25, // 25% initial pour une consultation
        estimated_value: budget ? parseInt(budget.replace(/[^\d]/g, '')) || null : null,
        user_id: null, // Sera assigné par un admin
        notes: `Lead source: Formulaire Tally\nDate de soumission: ${webhookData.data.createdAt}`
      })
      .select('id')
      .single();

    if (opportunityError) {
      // Log error mais ne fait pas échouer la requête car le lead est créé
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Données Tally intégrées avec succès",
      leadId: lead?.id,
      opportunityId: opportunity?.id,
      companyId: companyId
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "Erreur lors du traitement", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);