import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    id: string;
    to: string[];
    from: string;
    subject: string;
    created_at: string;
    delivered_at?: string;
    opened_at?: string;
    bounced_at?: string;
    complained_at?: string;
    error?: {
      message: string;
      name: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ResendWebhookPayload = await req.json();
    console.log("Received Resend webhook:", JSON.stringify(payload, null, 2));

    const { type, data } = payload;
    const emailId = data.id;
    const recipientEmail = data.to[0]; // Premier destinataire

    // Détermine le nouveau statut basé sur le type d'événement
    let status = 'sent';
    let deliveredAt = null;
    let openedAt = null;
    let bouncedAt = null;
    let errorMessage = null;

    switch (type) {
      case 'email.delivered':
        status = 'delivered';
        deliveredAt = data.delivered_at || new Date().toISOString();
        break;
      case 'email.opened':
        status = 'opened';
        openedAt = data.opened_at || new Date().toISOString();
        break;
      case 'email.bounced':
        status = 'bounced';
        bouncedAt = data.bounced_at || new Date().toISOString();
        errorMessage = data.error?.message || 'Email bounced';
        break;
      case 'email.complained':
        status = 'complained';
        errorMessage = 'Recipient marked email as spam';
        break;
      case 'email.delivery_delayed':
        status = 'delayed';
        errorMessage = 'Email delivery delayed';
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    // Met à jour le log d'email correspondant
    const updateData: any = {
      status,
      webhook_data: payload,
      updated_at: new Date().toISOString()
    };

    if (deliveredAt) updateData.delivered_at = deliveredAt;
    if (openedAt) updateData.opened_at = openedAt;
    if (bouncedAt) updateData.bounced_at = bouncedAt;
    if (errorMessage) updateData.error_message = errorMessage;

    const { data: updatedLog, error: updateError } = await supabase
      .from('email_logs')
      .update(updateData)
      .eq('email_id', emailId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating email log:", updateError);
      // Si le log n'existe pas encore, on le crée
      if (updateError.code === 'PGRST116') {
        const { data: newLog, error: insertError } = await supabase
          .from('email_logs')
          .insert({
            email_id: emailId,
            email_type: 'unknown',
            recipient_email: recipientEmail,
            subject: data.subject,
            status,
            delivered_at: deliveredAt,
            opened_at: openedAt,
            bounced_at: bouncedAt,
            error_message: errorMessage,
            webhook_data: payload
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating email log:", insertError);
          return new Response(JSON.stringify({ error: insertError.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        console.log("Created new email log:", newLog);
      } else {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    } else {
      console.log("Updated email log:", updatedLog);
    }

    // Si c'est un bounce ou une plainte, on pourrait ajouter une logique spéciale
    if (status === 'bounced' || status === 'complained') {
      console.log(`⚠️  Email ${status} for ${recipientEmail}: ${errorMessage}`);
      
      // Ici on pourrait ajouter une logique pour notifier l'admin
      // ou marquer l'email comme problématique dans le ticket
    }

    return new Response(JSON.stringify({ 
      received: true, 
      status: 'processed',
      email_id: emailId,
      new_status: status
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in resend-webhook function:", error);
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