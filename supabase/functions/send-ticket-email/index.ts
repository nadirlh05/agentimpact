import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailRequest {
  type: 'new_ticket' | 'status_update' | 'admin_response';
  ticketId: string;
  clientName: string;
  clientEmail: string;
  subject: string;
  message: string;
  priority: string;
  status?: string;
  adminResponse?: string;
  adminName?: string;
}

const getEmailTemplate = (type: string, data: TicketEmailRequest) => {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
      .ticket-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
      .priority-urgent { color: #dc3545; font-weight: bold; }
      .priority-haute { color: #fd7e14; font-weight: bold; }
      .priority-moyenne { color: #ffc107; font-weight: bold; }
      .priority-basse { color: #28a745; font-weight: bold; }
      .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
  `;

  switch (type) {
    case 'new_ticket':
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🎫 Nouveau Ticket de Support</h1>
            <p>Ticket #${data.ticketId.slice(-8)}</p>
          </div>
          <div class="content">
            <p>Bonjour ${data.clientName},</p>
            <p>Votre ticket de support a été créé avec succès. Notre équipe d'experts en IA va traiter votre demande rapidement.</p>
            
            <div class="ticket-info">
              <h3>📋 Détails du ticket :</h3>
              <p><strong>Sujet :</strong> ${data.subject}</p>
              <p><strong>Priorité :</strong> <span class="priority-${data.priority}">${data.priority.toUpperCase()}</span></p>
              <p><strong>Message :</strong></p>
              <p style="background: #e9ecef; padding: 10px; border-radius: 4px;">${data.message}</p>
            </div>

            <p><strong>⏱️ Temps de réponse estimé :</strong></p>
            <ul>
              <li>🔴 Urgente : 2h</li>
              <li>🟠 Haute : 4h</li>
              <li>🟡 Moyenne : 24h</li>
              <li>🟢 Basse : 48h</li>
            </ul>

            <p>Nous vous contacterons dès que nous aurons des nouvelles concernant votre demande.</p>
             <p>Cordialement,<br><strong>L'équipe AgentImpact.fr</strong></p>
          </div>
          <div class="footer">
             <p>AgentImpact.fr - Solutions IA</p>
          </div>
        </div>
      `;

    case 'status_update':
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>📈 Mise à jour de votre ticket</h1>
            <p>Ticket #${data.ticketId.slice(-8)}</p>
          </div>
          <div class="content">
            <p>Bonjour ${data.clientName},</p>
            <p>Le statut de votre ticket a été mis à jour.</p>
            
            <div class="ticket-info">
              <h3>📋 Détails :</h3>
              <p><strong>Sujet :</strong> ${data.subject}</p>
              <p><strong>Nouveau statut :</strong> <span style="color: #28a745; font-weight: bold;">${data.status}</span></p>
            </div>

            ${data.status === 'Résolu' ? `
              <p style="background: #d4edda; padding: 15px; border-radius: 8px; color: #155724;">
                ✅ <strong>Votre ticket a été résolu !</strong><br>
                Si vous avez d'autres questions ou si le problème persiste, n'hésitez pas à créer un nouveau ticket.
              </p>
            ` : `
              <p>Notre équipe travaille activement sur votre demande. Nous vous tiendrons informé de l'avancement.</p>
            `}

             <p>Cordialement,<br><strong>L'équipe AgentImpact.fr</strong></p>
          </div>
          <div class="footer">
             <p>AgentImpact.fr - Solutions IA</p>
          </div>
        </div>
      `;

    case 'admin_response':
      return `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>💬 Réponse à votre ticket</h1>
            <p>Ticket #${data.ticketId.slice(-8)}</p>
          </div>
          <div class="content">
            <p>Bonjour ${data.clientName},</p>
            <p>Vous avez reçu une réponse de notre équipe concernant votre ticket :</p>
            
            <div class="ticket-info">
              <h3>📋 Votre demande :</h3>
              <p><strong>Sujet :</strong> ${data.subject}</p>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
              <h4>💬 Réponse de ${data.adminName || 'notre équipe'} :</h4>
              <p>${data.adminResponse}</p>
            </div>

            <p>Si vous avez besoin de plus d'informations, n'hésitez pas à répondre à ce message ou à créer un nouveau ticket.</p>
            <p>Cordialement,<br><strong>L'équipe AgentImpact.fr</strong></p>
          </div>
          <div class="footer">
            <p>AgentImpact.fr - Solutions IA</p>
          </div>
        </div>
      `;

    default:
      return '';
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: TicketEmailRequest = await req.json();
    console.log("Processing email request:", emailData);

    const emailHtml = getEmailTemplate(emailData.type, emailData);

    // Send email to client
    const clientEmailResponse = await resend.emails.send({
      from: "AgentImpact.fr <onboarding@resend.dev>",
      to: [emailData.clientEmail],
      subject: emailData.type === 'new_ticket' 
        ? `✅ Ticket créé #${emailData.ticketId.slice(-8)} - ${emailData.subject}`
        : emailData.type === 'status_update'
        ? `📈 Mise à jour ticket #${emailData.ticketId.slice(-8)} - ${emailData.status}`
        : `💬 Réponse à votre ticket #${emailData.ticketId.slice(-8)}`,
      html: emailHtml,
    });

    // Send notification to admin if it's a new ticket
    if (emailData.type === 'new_ticket') {
      const adminEmailResponse = await resend.emails.send({
        from: "AgentImpact.fr <onboarding@resend.dev>",
        to: ["nadir.lahyani@outlook.fr"],
        subject: `🚨 Nouveau ticket de support - Priorité ${emailData.priority.toUpperCase()}`,
        html: `
          <h2>🎫 Nouveau ticket de support reçu</h2>
          <p><strong>De :</strong> ${emailData.clientName} (${emailData.clientEmail})</p>
          <p><strong>Priorité :</strong> ${emailData.priority.toUpperCase()}</p>
          <p><strong>Sujet :</strong> ${emailData.subject}</p>
          <p><strong>Message :</strong></p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
            ${emailData.message}
          </div>
          <p><strong>ID du ticket :</strong> ${emailData.ticketId}</p>
          <hr>
          <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://digital-future-agents.lovable.app'}/admin/tickets" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Gérer les tickets</a></p>
        `,
      });
      console.log("Admin notification sent:", adminEmailResponse);
    }

    console.log("Email sent successfully:", clientEmailResponse);

    // Log the email in database if it was sent successfully
    if (clientEmailResponse.data?.id) {
      try {
        const emailLogData = {
          email_id: clientEmailResponse.data.id,
          ticket_id: emailData.ticketId,
          email_type: emailData.type,
          recipient_email: emailData.clientEmail,
          subject: emailData.type === 'new_ticket' 
            ? `✅ Ticket créé #${emailData.ticketId.slice(-8)} - ${emailData.subject}`
            : emailData.type === 'status_update'
            ? `📈 Mise à jour ticket #${emailData.ticketId.slice(-8)} - ${emailData.status}`
            : `💬 Réponse à votre ticket #${emailData.ticketId.slice(-8)}`,
          status: 'sent'
        };

        const { error: logError } = await supabase
          .from('email_logs')
          .insert(emailLogData);

        if (logError) {
          console.error("Error logging email:", logError);
        } else {
          console.log("Email logged successfully:", emailLogData.email_id);
        }
      } catch (logError) {
        console.error("Error logging email:", logError);
      }
    }

    return new Response(JSON.stringify({ success: true, emailId: clientEmailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error sending email:", error);
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