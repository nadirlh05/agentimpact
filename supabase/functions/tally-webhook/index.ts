import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    fields: Array<{
      key: string;
      label: string;
      type: string;
      value: any;
    }>;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Webhook Tally reçu");
    
    const webhookData: TallyWebhookData = await req.json();
    console.log("Données reçues:", JSON.stringify(webhookData, null, 2));

    // Extraire les informations du formulaire
    const fields = webhookData.data.fields;
    const extractFieldValue = (key: string) => {
      const field = fields.find(f => f.key.toLowerCase().includes(key.toLowerCase()) || 
                                   f.label.toLowerCase().includes(key.toLowerCase()));
      return field?.value || null;
    };

    // Extraire les données importantes
    const prenom = extractFieldValue('prenom') || extractFieldValue('first') || extractFieldValue('nom') || '';
    const nom = extractFieldValue('nom') || extractFieldValue('last') || extractFieldValue('surname') || '';
    const email = extractFieldValue('email') || extractFieldValue('mail') || '';
    const telephone = extractFieldValue('telephone') || extractFieldValue('phone') || extractFieldValue('tel') || '';
    const entreprise = extractFieldValue('entreprise') || extractFieldValue('company') || extractFieldValue('société') || '';
    const secteur = extractFieldValue('secteur') || extractFieldValue('industrie') || extractFieldValue('industry') || '';
    const typeConsultation = extractFieldValue('consultation') || extractFieldValue('type') || 'Consultation IA';
    const budget = extractFieldValue('budget') || '';
    const message = extractFieldValue('message') || extractFieldValue('description') || extractFieldValue('besoins') || '';

    console.log("Données extraites:", {
      prenom, nom, email, telephone, entreprise, secteur, typeConsultation, budget
    });

    if (!email || (!prenom && !nom)) {
      throw new Error("Email et nom requis");
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
          console.error('Erreur création entreprise:', companyError);
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
      console.error('Erreur création lead:', leadError);
      throw leadError;
    }

    console.log("Lead créé:", lead?.id);

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
      console.error('Erreur création opportunité:', opportunityError);
    } else {
      console.log("Opportunité créée:", opportunity?.id);
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

  } catch (error: any) {
    console.error("Erreur dans tally-webhook function:", error);
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