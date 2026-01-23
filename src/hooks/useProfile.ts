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
    
    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('👤 Database query timeout - using fallback');
      const fallbackProfile = {
        id: user?.id || '',
        business_name: 'Your Business',
        phone: '',
        email: user?.email || '',
        cac_date: null,
        vat_status: false,
        paye_status: false,
        plan: 'basic',
        subscription_status: 'active'
      };
      setProfile(fallbackProfile);
      setLoading(false);
    }, 3000); // 3 second timeout
    
    try {
      console.log('👤 About to call supabase.from(profiles)...');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle()

      clearTimeout(timeoutId);
      
      console.log('👤 Supabase query COMPLETED:', {
        hasData: !!data,
        data: data,
        hasError: !!error,
        error: error,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });

      if (error) {
        console.error('👤 Profile fetch ERROR:', error);
        const fallbackProfile = {
          id: user?.id || '',
          business_name: 'Your Business',
          phone: '',
          email: user?.email || '',
          cac_date: null,
          vat_status: false,
          paye_status: false,
          plan: 'basic',
          subscription_status: 'active'
        };
        setProfile(fallbackProfile);
      } else if (data) {
        console.log('👤 Profile FOUND, setting profile:', data);
        setProfile(data);
      } else {
        console.log('👤 No profile data returned, using fallback');
        const fallbackProfile = {
          id: user?.id || '',
          business_name: 'Your Business',
          phone: '',
          email: user?.email || '',
          cac_date: null,
          vat_status: false,
          paye_status: false,
          plan: 'basic',
          subscription_status: 'active'
        };
        setProfile(fallbackProfile);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('👤 fetchProfile EXCEPTION:', error);
      const fallbackProfile = {
        id: user?.id || '',
        business_name: 'Your Business',
        phone: '',
        email: user?.email || '',
        cac_date: null,
        vat_status: false,
        paye_status: false,
        plan: 'basic',
        subscription_status: 'active'
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