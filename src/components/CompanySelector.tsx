import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, Building2, Plus, Check, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabaseService } from '@/lib/supabaseService';
import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import AddCompanyModal from './AddCompanyModal';

interface Company {
  id: string;
  name: string;
  tin?: string;
  isPrimary: boolean;
}

interface CompanySelectorProps {
  currentCompany?: Company;
  onCompanyChange: (company: Company) => void;
}

export default function CompanySelector({ currentCompany, onCompanyChange }: CompanySelectorProps) {
  const { user } = useAuth();
  const { canCreateCompanyProfile, getCompanyProfileLimitMessage, plan } = usePlanRestrictions();
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false); // Never show loading
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserCompanies();
    }
  }, [user?.id]);

  // Load companies when dropdown opens
  useEffect(() => {
    if (isOpen && user?.id) {
      loadUserCompanies();
    }
  }, [isOpen, user?.id]);

  const loadUserCompanies = async () => {
    if (!user?.id) return;
    
    try {
      const userCompanies = await supabaseService.getUserCompanies(user.id);
      
      if (userCompanies && userCompanies.length > 0) {
        const uniqueCompanies = userCompanies.filter((company, index, self) => 
          index === self.findIndex(c => c.company_name === company.company_name)
        );
        
        const mappedCompanies = uniqueCompanies.map(company => ({
          id: company.id,
          name: company.company_name,
          tin: company.tin || '',
          isPrimary: company.is_primary
        }));
        
        setCompanies(mappedCompanies);
        
        if (currentCompany) {
          const updatedCurrentCompany = mappedCompanies.find(c => c.id === currentCompany.id);
          if (updatedCurrentCompany && 
              (updatedCurrentCompany.tin !== currentCompany.tin || 
               updatedCurrentCompany.name !== currentCompany.name)) {
            onCompanyChange(updatedCurrentCompany);
          }
        } else {
          const primaryCompany = mappedCompanies.find(c => c.isPrimary) || mappedCompanies[0];
          if (primaryCompany) {
            onCompanyChange(primaryCompany);
          }
        }
      } else {
        await createDefaultCompany();
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      try {
        await createDefaultCompany();
      } catch (createError) {
        const fallbackCompany = {
          id: 'fallback-1',
          name: 'My Business',
          tin: '',
          isPrimary: true
        };
        setCompanies([fallbackCompany]);
        onCompanyChange(fallbackCompany);
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCompany = async () => {
    if (!user?.id) return;
    
    console.group('🏢 COMPANY DEBUG - Create Default Company');
    console.log('📊 Creating default company for user:', user.id);
    
    try {
      const profile = await supabaseService.getProfile(user.id);
      console.log('📊 Profile data retrieved:', {
        hasProfile: !!profile,
        businessName: profile?.business_name,
        firstName: profile?.first_name,
        businessType: profile?.business_type,
        tin: profile?.tin,
        cacNumber: profile?.cac_number
      });
      
      const companyName = profile?.business_name || `${profile?.first_name || 'My'} Business`;
      
      const newCompanyData = {
        user_id: user.id,
        company_name: companyName,
        business_type: profile?.business_type || 'General Business',
        tin: profile?.tin || '',
        cac_number: profile?.cac_number || '',
        address: profile?.address || '',
        phone: profile?.phone || '',
        is_primary: true
      };
      
      console.log('📊 Creating company with data:', newCompanyData);
      const newCompany = await supabaseService.createCompany(newCompanyData);
      
      if (newCompany) {
        const company = {
          id: newCompany.id,
          name: newCompany.company_name,
          tin: newCompany.tin,
          isPrimary: true
        };
        console.log('✅ Default company created successfully:', company);
        setCompanies([company]);
        onCompanyChange(company);
      }
    } catch (error) {
      console.error('❌ Error creating default company:', error);
      // Fallback to basic company if database fails
      const fallbackCompany = {
        id: 'temp-1',
        name: 'My Business',
        tin: '',
        isPrimary: true
      };
      console.log('🆘 Using temporary fallback company:', fallbackCompany);
      setCompanies([fallbackCompany]);
      onCompanyChange(fallbackCompany);
    } finally {
      console.groupEnd();
    }
  };

  const handleCompanySelect = (company: Company) => {
    onCompanyChange(company);
    setIsOpen(false);
  };

  const handleCompanyAdded = (newCompany: Company) => {
    setCompanies(prev => [...prev, newCompany]);
    onCompanyChange(newCompany); // Switch to the new company immediately
  };

  const handleAddCompanyClick = () => {
    setIsOpen(false);
    
    console.log('🏢 Add Company Click:', {
      currentPlan: plan,
      companiesCount: companies.length,
      canCreate: canCreateCompanyProfile(companies.length)
    });
    
    // Check if user can create more company profiles
    if (!canCreateCompanyProfile(companies.length)) {
      console.log('⚠️ Cannot create more companies, showing upgrade prompt');
      setShowUpgradePrompt(true);
      return;
    }
    
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 min-w-[200px] p-2 border rounded">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  const selectedCompany = currentCompany || companies[0];

  if (!selectedCompany) {
    return (
      <Button variant="outline" className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Company
      </Button>
    );
  }

  return (
    <div className="relative">
      {/* Company Selector Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <div className="text-left">
            <div className="font-medium text-sm">{selectedCompany.name}</div>
            {selectedCompany.tin && (
              <div className="text-xs text-muted-foreground">TIN: {selectedCompany.tin}</div>
            )}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 p-2">
          <div className="space-y-1">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleCompanySelect(company)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{company.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {company.tin ? `TIN: ${company.tin}` : 'No TIN'}
                      {company.isPrimary && ' • Primary'}
                    </div>
                  </div>
                </div>
                {selectedCompany.id === company.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
            
            {/* Add New Company Button */}
            <button 
              onClick={handleAddCompanyClick}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left border-t border-border mt-2 pt-3 ${
                canCreateCompanyProfile(companies.length) 
                  ? 'hover:bg-muted' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {canCreateCompanyProfile(companies.length) ? (
                <Plus className="h-4 w-4 text-blue-600" />
              ) : (
                <Crown className="h-4 w-4 text-amber-500" />
              )}
              <div>
                <div className={`font-medium ${
                  canCreateCompanyProfile(companies.length) 
                    ? 'text-blue-600' 
                    : 'text-muted-foreground'
                }`}>
                  {canCreateCompanyProfile(companies.length) 
                    ? 'Add New Company' 
                    : 'Upgrade to Add More'
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {canCreateCompanyProfile(companies.length) 
                    ? 'Manage another business' 
                    : getCompanyProfileLimitMessage()
                  }
                </div>
              </div>
            </button>
          </div>
        </Card>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Add Company Modal */}
      <AddCompanyModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCompanyAdded={handleCompanyAdded}
      />
      
      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUpgradePrompt(false)} />
          <Card className="relative w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold">Upgrade Required</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              {getCompanyProfileLimitMessage()}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setShowUpgradePrompt(false)} className="flex-1">
                Upgrade Now
              </Button>
              <Button variant="outline" onClick={() => setShowUpgradePrompt(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}