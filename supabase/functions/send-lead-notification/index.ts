import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LeadNotificationRequest {
  leadData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    position?: string;
    company_id?: string;
    lead_source: string;
    status: string;
    priority: string;
    notes?: string;
  };
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadData, userEmail }: LeadNotificationRequest = await req.json();

    console.log("Sending lead notification for:", leadData.first_name, leadData.last_name);

    const emailResponse = await resend.emails.send({
      from: "CRM Notification <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Nouveau prospect: ${leadData.first_name} ${leadData.last_name}`,
      html: `
        <h1>Nouveau prospect créé</h1>
        <h2>Informations du prospect:</h2>
        <ul>
          <li><strong>Nom:</strong> ${leadData.first_name} ${leadData.last_name}</li>
          <li><strong>Email:</strong> ${leadData.email}</li>
          ${leadData.phone ? `<li><strong>Téléphone:</strong> ${leadData.phone}</li>` : ''}
          ${leadData.position ? `<li><strong>Poste:</strong> ${leadData.position}</li>` : ''}
          ${leadData.company_id ? `<li><strong>Entreprise:</strong> ${leadData.company_id}</li>` : ''}
          <li><strong>Source:</strong> ${leadData.lead_source}</li>
          <li><strong>Statut:</strong> ${leadData.status}</li>
          <li><strong>Priorité:</strong> ${leadData.priority}</li>
          ${leadData.notes ? `<li><strong>Notes:</strong> ${leadData.notes}</li>` : ''}
        </ul>
        <p>Ce prospect a été ajouté à votre CRM et nécessite votre attention.</p>
        <p>Cordialement,<br>Votre CRM</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-lead-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);