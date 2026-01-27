import { useState, useEffect } from 'react'
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

export function useProfileFallback() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      // Create a fallback profile immediately without database calls
      const fallbackProfile: Profile = {
        id: user.id,
        business_name: 'Your Business',
        phone: '',
        email: user.email || '',
        cac_date: null,
        vat_status: false,
        paye_status: false,
        plan: 'free',
        subscription_status: 'active'
      }
      
      setProfile(fallbackProfile)
      setLoading(false)
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user?.id, user?.email])

  const refetch = async () => {
    // Do nothing - this is a fallback
  }

  return { profile, loading, refetch }
}