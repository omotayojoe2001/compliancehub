import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, body } = await req.json()
    
    console.log('📧 Attempting to send email:', { to, subject })
    console.log('🔑 API Key exists:', !!Deno.env.get('RESEND_API_KEY'))

    const { data, error } = await resend.emails.send({
      from: 'ComplianceHub <kolajo@forecourtlimited.com>',
      to: [to],
      subject,
      html: body.replace(/\n/g, '<br>'),
      text: body
    })
    
    console.log('📬 Resend response:', { data, error })

    if (error) {
      console.error('❌ Resend error:', error)
      return new Response(JSON.stringify({ success: false, error }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    console.log('✅ Email sent successfully:', data)
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('💥 Exception:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
