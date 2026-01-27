import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContextClean'

interface Profile {
  id: string
  business_name: string
  phone: string
  email: string
  cac_date: string | null
  vat_status: boolean
  paye_status: boolean
  plan: string | null
  subscription_status: string
}

export function useProfileSimple() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user?.id])

  const loadProfile = async () => {
    if (!user?.id) return;
    console.group('👤 PROFILE DEBUG - Load Profile')
    console.log('📊 Loading profile for user:', {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date().toISOString()
    })
    try {
      setLoading(true);
      // Fetch profile and subscription in parallel
      const [{ data: profileData, error: profileError }, { data: subscriptionData, error: subscriptionError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).single()
      ]);
      console.log('📊 Database response:', {
        hasProfile: !!profileData,
        hasSubscription: !!subscriptionData,
        profileError,
        subscriptionError
      });
      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
      }
      if (subscriptionError) {
        console.error('❌ Subscription fetch error:', subscriptionError);
      }
      // Compose profile with plan from subscription ONLY
      const profile: Profile = {
        id: profileData?.id || user.id,
        business_name: profileData?.business_name || 'My Business',
        phone: profileData?.phone || '',
        email: profileData?.email || user.email || '',
        cac_date: profileData?.cac_date || null,
        vat_status: profileData?.vat_status || false,
        paye_status: profileData?.paye_status || false,
        plan: subscriptionData?.plan_type || subscriptionData?.plan || 'enterprise', // Default to enterprise for full access
        subscription_status: subscriptionData?.status || 'active' // Default to active
      };
      setProfile(profile);
    } catch (error) {
      console.error('❌ Profile loading error:', error);
      // Create fallback profile with enterprise access
      const fallbackProfile: Profile = {
        id: user.id,
        business_name: 'My Business',
        phone: '',
        email: user.email || '',
        cac_date: null,
        vat_status: false,
        paye_status: false,
        plan: 'enterprise', // Default to enterprise for full access
        subscription_status: 'active'
      };
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }

  return { profile, loading, refetch: loadProfile }
}