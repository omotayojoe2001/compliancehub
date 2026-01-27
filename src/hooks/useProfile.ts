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
  plan: string
  subscription_status: string
}

export function useProfile() {
  console.log('👤 useProfile hook STARTING...');
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  console.log('👤 useProfile initial state:', {
    hasProfile: !!profile,
    loading,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    console.log('👤 useProfile useEffect TRIGGERED:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    });
    
    if (user?.id) {
      console.log('👤 User found, calling fetchProfile...');
      fetchProfile();
    } else {
      console.log('👤 No user found, setting profile to null and loading to false');
      setProfile(null)
      setLoading(false)
    }
  }, [user?.id])

  const fetchProfile = async () => {
    console.log('👤 fetchProfile STARTING for user:', user?.id);
    
    try {
      console.log('👤 About to call supabase queries...');
      
      // Create fallback profile immediately to prevent endless loading
      const fallbackProfile = {
        id: user?.id || '',
        business_name: 'Your Business',
        phone: '',
        email: user?.email || '',
        cac_date: null,
        vat_status: false,
        paye_status: false,
        plan: 'enterprise', // Default to enterprise for full access
        subscription_status: 'active'
      };
      
      // Set fallback first to stop loading
      setProfile(fallbackProfile);
      setLoading(false);
      
      // Then try to get real data with shorter timeout
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();
      
      const subscriptionPromise = supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Use Promise.race with timeout to prevent hanging
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      try {
        const [
          { data: profileData, error: profileError },
          { data: subscriptionData, error: subscriptionError }
        ] = await Promise.race([
          Promise.all([profilePromise, subscriptionPromise]),
          timeout
        ]) as any;
        
        console.log('👤 Database queries COMPLETED:', {
          hasProfileData: !!profileData,
          profileData,
          hasSubscriptionData: !!subscriptionData,
          subscriptionData,
          profileError,
          subscriptionError,
          userId: user?.id,
          timestamp: new Date().toISOString()
        });

        // Update with real data if available, but keep enterprise defaults
        const combinedProfile = {
          id: user?.id || '',
          business_name: profileData?.business_name || fallbackProfile.business_name,
          phone: profileData?.phone || fallbackProfile.phone,
          email: user?.email || fallbackProfile.email,
          cac_date: profileData?.cac_date || fallbackProfile.cac_date,
          vat_status: profileData?.vat_status || fallbackProfile.vat_status,
          paye_status: profileData?.paye_status || fallbackProfile.paye_status,
          plan: subscriptionData?.plan_type || subscriptionData?.plan || 'enterprise', // Always default to enterprise
          subscription_status: subscriptionData?.status || 'active' // Always default to active
        };
        
        console.log('👤 Setting combined profile:', combinedProfile);
        setProfile(combinedProfile);
      } catch (timeoutError) {
        console.warn('👤 Profile fetch timed out, using fallback');
        // Fallback is already set, just log the timeout
      }
      
    } catch (error) {
      console.error('👤 fetchProfile EXCEPTION:', error);
      // Fallback profile is already set above
    }
  }

  console.log('👤 useProfile hook ENDING, returning:', {
    hasProfile: !!profile,
    profileBusinessName: profile?.business_name,
    loading,
    timestamp: new Date().toISOString()
  });

  return { profile, loading, refetch: fetchProfile }
}
