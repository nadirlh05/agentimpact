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
    console.log('Test function called');
    
    // Vérifier les variables d'environnement Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    const envStatus = {
      TWILIO_ACCOUNT_SID: twilioAccountSid ? `SET (${twilioAccountSid.substring(0, 6)}...)` : 'MISSING',
      TWILIO_AUTH_TOKEN: twilioAuthToken ? 'SET' : 'MISSING',
      TWILIO_PHONE_NUMBER: twilioPhoneNumber ? `SET (${twilioPhoneNumber})` : 'MISSING',
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'MISSING'
    };

    console.log('Environment variables:', envStatus);

    // Test basique d'appel Twilio
    if (twilioAccountSid && twilioAuthToken) {
      try {
        const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
        const testResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}.json`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${auth}`,
            },
          }
        );
        
        console.log('Twilio API test status:', testResponse.status);
        
        if (testResponse.ok) {
          envStatus.TWILIO_CONNECTION = 'SUCCESS';
        } else {
          const errorText = await testResponse.text();
          envStatus.TWILIO_CONNECTION = `ERROR: ${testResponse.status} - ${errorText}`;
        }
      } catch (error) {
        envStatus.TWILIO_CONNECTION = `FETCH_ERROR: ${error.message}`;
        console.error('Twilio connection error:', error);
      }
    } else {
      envStatus.TWILIO_CONNECTION = 'SKIPPED - Missing credentials';
    }

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envStatus,
      message: 'Diagnostic completed'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in whatsapp-test function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});