import { useState, useEffect } from 'react'
import { httpDbService } from '@/lib/httpDbService'
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

export function useProfileHttp() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user?.id])

  const fetchProfile = async () => {
    try {
      const data = await httpDbService.getProfile(user?.id || '')
      
      if (data) {
        setProfile(data)
      } else {
        // Create fallback profile
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
        }
        setProfile(fallbackProfile)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      // Use fallback on error
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
      }
      setProfile(fallbackProfile)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (profileData: Partial<Profile>) => {
    if (!user?.id) return
    
    try {
      await httpDbService.saveProfile(user.id, profileData)
      await fetchProfile() // Refresh
    } catch (error) {
      console.error('Save profile error:', error)
      throw error
    }
  }

  return { profile, loading, refetch: fetchProfile, saveProfile }
}