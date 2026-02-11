import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const WAWP_INSTANCE = '40993795';
const WAWP_ACCESS_TOKEN = 'mBV1vrB8zxaMNX';

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  try {
    const { phone, message } = await req.json();

    // Wawp API uses query params
    const url = `https://wawp.net/wp-json/awp/v1/sendMessage?instance_id=${WAWP_INSTANCE}&access_token=${WAWP_ACCESS_TOKEN}&phone=${phone.replace(/[^0-9]/g, '')}&message=${encodeURIComponent(message)}`;

    const response = await fetch(url, { method: 'GET' });
    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
