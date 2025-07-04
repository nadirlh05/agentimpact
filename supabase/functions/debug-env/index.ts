import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const envVars = {
      TWILIO_ACCOUNT_SID: Deno.env.get('TWILIO_ACCOUNT_SID') ? 'CONFIGURED' : 'MISSING',
      TWILIO_AUTH_TOKEN: Deno.env.get('TWILIO_AUTH_TOKEN') ? 'CONFIGURED' : 'MISSING',
      TWILIO_PHONE_NUMBER: Deno.env.get('TWILIO_PHONE_NUMBER') ? 'CONFIGURED' : 'MISSING',
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'CONFIGURED' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'CONFIGURED' : 'MISSING'
    };

    return new Response(JSON.stringify({
      status: 'success',
      environment: envVars,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});