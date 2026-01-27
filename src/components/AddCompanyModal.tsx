import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Building2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabaseService } from '@/lib/supabaseService';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyAdded: (company: any) => void;
}

export default function AddCompanyModal({ isOpen, onClose, onCompanyAdded }: AddCompanyModalProps) {
  const { user } = useAuth();
  const { canCreateCompanyProfile } = usePlanRestrictions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    business_type: '',
    tin: '',
    cac_number: '',
    address: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.company_name.trim()) return;

    // Get current company count for plan check
    const userCompanies = await supabaseService.getUserCompanies(user.id);
    const currentCount = userCompanies?.length || 0;
    
    // Check plan restrictions
    if (!canCreateCompanyProfile(currentCount)) {
      alert('You have reached your plan limit for company profiles. Please upgrade to add more.');
      return;
    }

    setLoading(true);
    try {
      const newCompany = await supabaseService.createCompany({
        user_id: user.id,
        company_name: formData.company_name.trim(),
        business_type: formData.business_type,
        tin: formData.tin,
        cac_number: formData.cac_number,
        address: formData.address,
        phone: formData.phone,
        is_primary: false // New companies are not primary by default
      });

      if (newCompany) {
        onCompanyAdded({
          id: newCompany.id,
          name: newCompany.company_name,
          tin: newCompany.tin,
          isPrimary: false
        });
        
        // Reset form
        setFormData({
          company_name: '',
          business_type: '',
          tin: '',
          cac_number: '',
          address: '',
          phone: ''
        });
        
        onClose();
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Error creating company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Add New Company</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name *</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
              className="w-full border border-border rounded-md px-3 py-2"
              placeholder="e.g., ABC Trading Ltd"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Business Type</label>
            <select
              value={formData.business_type}
              onChange={(e) => setFormData({...formData, business_type: e.target.value})}
              className="w-full border border-border rounded-md px-3 py-2"
            >
              <option value="">Select business type</option>
              <option value="Limited Liability Company">Limited Liability Company</option>
              <option value="Partnership">Partnership</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Public Limited Company">Public Limited Company</option>
              <option value="Non-Profit Organization">Non-Profit Organization</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">TIN *</label>
              <input
                type="text"
                value={formData.tin}
                onChange={(e) => setFormData({...formData, tin: e.target.value})}
                className="w-full border border-border rounded-md px-3 py-2"
                placeholder="Tax ID Number"
                required
              />
            </div>
          <div>
            <label className="block text-sm font-medium mb-2">CAC Number</label>
            <input
              type="text"
              value={formData.cac_number}
              onChange={(e) => setFormData({...formData, cac_number: e.target.value})}
              className="w-full border border-border rounded-md px-3 py-2"
              placeholder="RC Number"
            />
          </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full border border-border rounded-md px-3 py-2"
              rows={2}
              placeholder="Business address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full border border-border rounded-md px-3 py-2"
              placeholder="Business phone number"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading || !formData.company_name.trim() || !formData.tin.trim()}>
              {loading ? (
                <>Loading...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Company
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}