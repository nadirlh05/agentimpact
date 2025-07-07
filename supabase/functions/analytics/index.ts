import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  session_id: string;
  user_id?: string;
  page_url: string;
  user_agent: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Configuration Supabase manquante");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === "POST") {
      const { events } = await req.json() as { events: AnalyticsEvent[] };
      
      if (!Array.isArray(events) || events.length === 0) {
        return new Response(JSON.stringify({ error: "Événements invalides" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Filtrer et valider les événements
      const validEvents = events.filter(event => 
        event.event && 
        event.timestamp && 
        event.session_id &&
        event.page_url
      ).map(event => ({
        ...event,
        created_at: new Date(event.timestamp).toISOString(),
      }));

      if (validEvents.length === 0) {
        return new Response(JSON.stringify({ error: "Aucun événement valide" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Insérer les événements dans la base de données
      const { error } = await supabase
        .from('analytics_events')
        .insert(validEvents);

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ 
        success: true, 
        processed: validEvents.length 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (req.method === "GET") {
      // Endpoint pour récupérer les statistiques
      const url = new URL(req.url);
      const days = parseInt(url.searchParams.get('days') || '7');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Statistiques de base
      const { data: stats, error: statsError } = await supabase
        .rpc('get_analytics_stats', { 
          start_date: startDate.toISOString() 
        });

      if (statsError) {
        throw statsError;
      }

      return new Response(JSON.stringify({ 
        success: true, 
        data: stats,
        period: `${days} derniers jours`
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Méthode non autorisée" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Erreur du serveur", 
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);