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

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      // Create immediate profile from user data
      const userProfile: Profile = {
        id: user.id,
        business_name: 'Your Business',
        phone: '',
        email: user.email || '',
        cac_date: null,
        vat_status: false,
        paye_status: false,
        plan: 'basic',
        subscription_status: 'active'
      }
      setProfile(userProfile)
      setLoading(false)
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user?.id])

  return { profile, loading, refetch: () => {} }
}