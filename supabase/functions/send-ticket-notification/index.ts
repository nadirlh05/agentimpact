import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketNotificationRequest {
  ticketId: string;
  clientName: string;
  clientEmail: string;
  subject: string;
  description: string;
  priority: string;
  attachmentUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      ticketId, 
      clientName, 
      clientEmail, 
      subject, 
      description, 
      priority, 
      attachmentUrl 
    }: TicketNotificationRequest = await req.json();

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Support Digital Future <support@digital-future-agents.fr>",
      to: ["contact@digital-future-agents.fr"], // Remplacez par votre email
      subject: `[TICKET #${ticketId.slice(-8)}] ${subject} - Priorité: ${priority}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Nouveau Ticket de Support</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Informations du Client</h3>
            <p><strong>Nom:</strong> ${clientName}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Priorité:</strong> <span style="background: ${getPriorityColor(priority)}; color: white; padding: 4px 8px; border-radius: 4px;">${priority}</span></p>
          </div>
          
          <div style="background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Détails du Ticket</h3>
            <p><strong>Sujet:</strong> ${subject}</p>
            <p><strong>Description:</strong></p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${description}</div>
            ${attachmentUrl ? `<p><strong>Pièce jointe:</strong> <a href="${attachmentUrl}" target="_blank">Voir le fichier</a></p>` : ''}
          </div>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>ID du Ticket:</strong> ${ticketId}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #059669;">Connectez-vous à votre tableau de bord pour gérer ce ticket.</p>
          </div>
        </div>
      `,
    });

    // Send confirmation email to client
    const clientEmailResponse = await resend.emails.send({
      from: "Support Digital Future <support@digital-future-agents.fr>",
      to: [clientEmail],
      subject: `Confirmation - Votre ticket de support #${ticketId.slice(-8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Ticket de Support Créé avec Succès</h2>
          
          <p>Bonjour ${clientName},</p>
          
          <p>Nous avons bien reçu votre demande de support. Votre ticket a été créé avec les informations suivantes :</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Numéro de ticket:</strong> #${ticketId.slice(-8)}</p>
            <p><strong>Sujet:</strong> ${subject}</p>
            <p><strong>Priorité:</strong> ${priority}</p>
            <p><strong>Status:</strong> Ouvert</p>
          </div>
          
          <p>Notre équipe va examiner votre demande et vous contacter sous peu. Le délai de réponse varie selon la priorité :</p>
          
          <ul>
            <li><strong>Urgente:</strong> Sous 2 heures</li>
            <li><strong>Haute:</strong> Sous 4 heures</li>
            <li><strong>Moyenne:</strong> Sous 24 heures</li>
            <li><strong>Basse:</strong> Sous 48 heures</li>
          </ul>
          
          <p>Gardez ce numéro de ticket pour toute référence future : <strong>#${ticketId.slice(-8)}</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          
          <p style="font-size: 14px; color: #64748b;">
            Cordialement,<br>
            L'équipe Digital Future Agents<br>
            Experts en Automatisation IA pour la Gestion de Fournisseurs
          </p>
        </div>
      `,
    });

    console.log("Notification emails sent:", { adminEmailResponse, clientEmailResponse });

    return new Response(JSON.stringify({ 
      success: true,
      adminEmailId: adminEmailResponse.data?.id,
      clientEmailId: clientEmailResponse.data?.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-ticket-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'urgente': return '#dc2626';
    case 'haute': return '#ea580c';
    case 'moyenne': return '#ca8a04';
    case 'basse': return '#16a34a';
    default: return '#6b7280';
  }
}

serve(handler);