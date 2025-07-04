import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    console.log('Testing Twilio connection...');
    console.log('Account SID:', twilioAccountSid?.substring(0, 10) + '...');
    console.log('Phone Number:', twilioPhoneNumber);

    // Test 1: Vérifier le compte Twilio
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    
    const accountResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}.json`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    console.log('Account test status:', accountResponse.status);
    
    let accountData = null;
    let accountError = null;
    
    if (accountResponse.ok) {
      accountData = await accountResponse.json();
      console.log('Account status:', accountData.status);
    } else {
      accountError = await accountResponse.text();
      console.error('Account error:', accountError);
    }

    // Test 2: Lister les numéros WhatsApp disponibles
    let phoneNumbers = null;
    let phoneError = null;
    
    try {
      const phoneResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
          },
        }
      );
      
      if (phoneResponse.ok) {
        const phoneData = await phoneResponse.json();
        phoneNumbers = phoneData.incoming_phone_numbers?.map((p: any) => p.phone_number) || [];
        console.log('Available phone numbers:', phoneNumbers);
      } else {
        phoneError = await phoneResponse.text();
        console.error('Phone numbers error:', phoneError);
      }
    } catch (error) {
      phoneError = error.message;
    }

    const result = {
      timestamp: new Date().toISOString(),
      account: {
        status: accountResponse.status,
        success: accountResponse.ok,
        data: accountData ? { 
          status: accountData.status, 
          friendly_name: accountData.friendly_name 
        } : null,
        error: accountError
      },
      phoneNumbers: {
        configured: twilioPhoneNumber,
        available: phoneNumbers,
        error: phoneError
      },
      recommendation: accountResponse.ok ? 
        'Identifiants Twilio valides ✅' : 
        'Problème avec les identifiants Twilio ❌'
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Test Twilio error:', error);
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