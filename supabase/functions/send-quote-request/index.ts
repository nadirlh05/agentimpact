
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequestData {
  solutionName: string;
  solutionPrice: string;
  userEmail?: string;
  userId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { solutionName, solutionPrice, userEmail, userId }: QuoteRequestData = await req.json();

    console.log("Demande de devis reçue pour:", solutionName);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create opportunity in CRM
    if (userId) {
      const { data: opportunity, error: opportunityError } = await supabase
        .from('opportunities_ia')
        .insert({
          user_id: userId,
          title: `Demande de devis - ${solutionName}`,
          description: `Demande de devis automatique pour la solution ${solutionName} au prix ${solutionPrice}`,
          stage: 'qualification',
          estimated_value: parseInt(solutionPrice.replace(/[^\d]/g, '')) || 0,
          probability: 50,
          notes: `Demande générée depuis la page des solutions le ${new Date().toLocaleString('fr-FR')}`
        })
        .select()
        .single();

      if (opportunityError) {
        console.error("Erreur création opportunité:", opportunityError);
      } else {
        console.log("Opportunité créée:", opportunity);
      }
    }

    // Send email notification to admin
    const emailResponse = await resend.emails.send({
      from: "AgentImpact <onboarding@resend.dev>",
      to: ["nadir.lahyani@outlook.fr"], // Email admin
      subject: `Nouvelle demande de devis - ${solutionName}`,
      html: `
        <h2>Nouvelle demande de devis</h2>
        <p><strong>Solution demandée:</strong> ${solutionName}</p>
        <p><strong>Prix:</strong> ${solutionPrice}</p>
        <p><strong>Email client:</strong> ${userEmail || 'Non connecté'}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        
        <h3>Action requise</h3>
        <p>Veuillez contacter ce prospect dans les 24h pour discuter de ses besoins.</p>
        
        <p><a href="https://digital-future-agents.lovable.app/admin/crm" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir dans le CRM</a></p>
      `,
    });

    console.log("Email envoyé:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Demande de devis envoyée avec succès",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erreur dans send-quote-request:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
