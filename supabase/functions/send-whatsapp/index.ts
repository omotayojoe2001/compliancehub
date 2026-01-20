import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Note: WhatsApp sandbox only works with verified numbers
// For production, you need Twilio WhatsApp Business API approval

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, message } = await req.json()

    // Try WhatsApp first
    const whatsappRes = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + Deno.env.get('TWILIO_ACCOUNT_SID') + '/Messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(Deno.env.get('TWILIO_ACCOUNT_SID') + ':' + Deno.env.get('TWILIO_AUTH_TOKEN')),
      },
      body: new URLSearchParams({
        From: 'whatsapp:+14155238886',
        To: `whatsapp:${to}`,
        Body: message,
      }),
    })

    if (whatsappRes.ok) {
      const data = await whatsappRes.json()
      return new Response(JSON.stringify({ success: true, method: 'whatsapp', data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fallback to SMS if WhatsApp fails
    const smsRes = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + Deno.env.get('TWILIO_ACCOUNT_SID') + '/Messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(Deno.env.get('TWILIO_ACCOUNT_SID') + ':' + Deno.env.get('TWILIO_AUTH_TOKEN')),
      },
      body: new URLSearchParams({
        From: '+12345678901', // Replace with your Twilio SMS number
        To: to,
        Body: message,
      }),
    })

    if (smsRes.ok) {
      const data = await smsRes.json()
      return new Response(JSON.stringify({ success: true, method: 'sms', data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Both WhatsApp and SMS failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})