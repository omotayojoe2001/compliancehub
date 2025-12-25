import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { intelligentEmailScheduler } from '@/lib/intelligentEmailScheduler'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'

export function ProfileSetup() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    cacDate: '',
    vatStatus: false,
    payeStatus: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🏢 Profile setup attempt:', {
      userId: user?.id,
      businessName: formData.businessName,
      phone: formData.phone
    })

    try {
      console.log('🏢 Starting profile setup process...');
      
      // Simple direct insert/upsert approach
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          business_name: formData.businessName,
          phone: formData.phone,
          email: user?.email || '',
          cac_date: formData.cacDate || null,
          vat_status: formData.vatStatus,
          paye_status: formData.payeStatus,
          plan: 'basic',
          subscription_status: 'inactive'
        }, {
          onConflict: 'id'
        })

      console.log('🏢 Upsert result:', { error });

      if (error) {
        console.error('🏢 Profile upsert failed:', error)
        setError(`Profile save failed: ${error.message}`)
        return;
      }

      console.log('🏢 Profile saved successfully!');
      console.log('🏢 Redirecting to dashboard...');
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('🏢 Profile setup error:', err)
      setError('Failed to save profile. Please try again.')
    }
    
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Building2 className="h-8 w-8 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-semibold">Complete Your Profile</h1>
          <p className="text-muted-foreground">Tell us about your business</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Acme Corp Ltd"
              required
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="08012345678"
              required
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              CAC Registration Date (Optional)
            </label>
            <input
              type="date"
              name="cacDate"
              value={formData.cacDate}
              onChange={handleChange}
              className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-3">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tax Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="vatStatus"
                  checked={formData.vatStatus}
                  onChange={(e) => setFormData({...formData, vatStatus: e.target.checked})}
                  className="h-4 w-4 border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">VAT Registered</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="payeStatus"
                  checked={formData.payeStatus}
                  onChange={(e) => setFormData({...formData, payeStatus: e.target.checked})}
                  className="h-4 w-4 border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">PAYE Registered</span>
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  )
}