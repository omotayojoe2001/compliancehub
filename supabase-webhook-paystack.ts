import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.json()
    console.log('🔔 Webhook received:', payload.event)

    // Handle successful payment
    if (payload.event === 'charge.success') {
      const { data } = payload
      const { reference, amount, customer, metadata } = data

      console.log('💳 Processing successful payment:', {
        reference,
        amount,
        email: customer.email,
        plan: metadata?.plan_type
      })

      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, business_name')
        .eq('email', customer.email)
        .single()

      if (profileError || !profile) {
        console.error('❌ User not found:', customer.email)
        return new Response('User not found', { status: 404 })
      }

      const planType = metadata?.plan_type || 'basic'
      
      // Update or create subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .single()

      if (existingSubscription) {
        // Update existing subscription
        await supabase
          .from('subscriptions')
          .update({
            plan_type: planType,
            status: 'active',
            paystack_subscription_code: reference,
            amount: amount,
            next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })
          .eq('user_id', profile.id)
      } else {
        // Create new subscription
        await supabase
          .from('subscriptions')
          .insert({
            user_id: profile.id,
            plan_type: planType,
            status: 'active',
            paystack_subscription_code: reference,
            amount: amount,
            next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({
          plan: planType,
          subscription_status: 'active'
        })
        .eq('id', profile.id)

      console.log('✅ Subscription updated successfully for:', customer.email)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return new Response('Error', { status: 500 })
  }
})