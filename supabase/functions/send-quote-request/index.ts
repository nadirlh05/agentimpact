
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

    // Définir l'URL du CRM
    const crmUrl = "https://agentimpact.lovable.app/admin/crm";
    console.log("URL du CRM utilisée:", crmUrl);

    // Send email notification to admin
    const emailResponse = await resend.emails.send({
      from: "AgentImpact <onboarding@resend.dev>",
      to: ["nadir.lahyani@outlook.fr"], // Email admin
      subject: `Nouvelle demande de devis - ${solutionName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nouvelle demande de devis</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007bff;">Nouvelle demande de devis</h2>
            <p><strong>Solution demandée:</strong> ${solutionName}</p>
            <p><strong>Prix:</strong> ${solutionPrice}</p>
            <p><strong>Email client:</strong> ${userEmail || 'Non connecté'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
            
            <h3 style="color: #007bff;">Action requise</h3>
            <p>Veuillez contacter ce prospect dans les 24h pour discuter de ses besoins.</p>
            
            <div style="margin: 20px 0;">
              <a href="${crmUrl}" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;"
                 target="_blank">
                Voir dans le CRM
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur:<br>
              <a href="${crmUrl}" target="_blank">${crmUrl}</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email envoyé avec succès:", emailResponse);
    console.log("ID de l'email:", emailResponse.data?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Demande de devis envoyée avec succès",
      emailId: emailResponse.data?.id,
      crmUrl: crmUrl
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
