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

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 8000): Promise<T> => {
    let timeoutId: number | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }
  };

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
      console.log('👤 About to call supabase.from(user_profiles)...');
      
      // Get user profile
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();
      
      // Get subscription data
      const subscriptionPromise = supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      const [
        { data: profileData, error: profileError },
        { data: subscriptionData, error: subscriptionError }
      ] = await Promise.all([
        withTimeout(profilePromise),
        withTimeout(subscriptionPromise)
      ]);
      
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

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('👤 Profile fetch ERROR:', profileError);
      }
      
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('👤 Subscription fetch ERROR:', subscriptionError);
      }
      
      // Combine profile and subscription data
      const combinedProfile = {
        id: user?.id || '',
        business_name: profileData?.business_name || 'Your Business',
        phone: profileData?.phone || '',
        email: user?.email || '',
        cac_date: profileData?.cac_date || null,
        vat_status: profileData?.vat_status || false,
        paye_status: profileData?.paye_status || false,
        plan: subscriptionData?.plan_type || 'free',
        subscription_status: subscriptionData?.status || 'inactive'
      };
      
      console.log('👤 Setting combined profile:', combinedProfile);
      setProfile(combinedProfile);
    } catch (error) {
      console.error('👤 fetchProfile EXCEPTION:', error);
      const fallbackProfile = {
        id: user?.id || '',
        business_name: 'Your Business',
        phone: '',
        email: user?.email || '',
        cac_date: null,
        vat_status: false,
        paye_status: false,
        plan: 'free',
        subscription_status: 'inactive'
      };
      setProfile(fallbackProfile);
    } finally {
      console.log('👤 fetchProfile FINALLY block - setting loading to false');
      setLoading(false);
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
