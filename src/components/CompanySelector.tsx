import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, Building2, Plus, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { supabaseService } from '@/lib/supabaseService';
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
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserCompanies();
    }
  }, [user?.id]);

  // Refresh data when dropdown opens
  useEffect(() => {
    if (isOpen && user?.id) {
      loadUserCompanies();
    }
  }, [isOpen, user?.id]);

  const loadUserCompanies = async () => {
    if (!user?.id) return;
    
    try {
      // Try to load real companies from database
      const userCompanies = await supabaseService.getUserCompanies(user.id);
      
      if (userCompanies && userCompanies.length > 0) {
        // Remove duplicates by company name
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
        
        // Update current company data if it exists
        if (currentCompany) {
          const updatedCurrentCompany = mappedCompanies.find(c => c.id === currentCompany.id);
          if (updatedCurrentCompany && 
              (updatedCurrentCompany.tin !== currentCompany.tin || 
               updatedCurrentCompany.name !== currentCompany.name)) {
            onCompanyChange(updatedCurrentCompany);
          }
        } else {
          // Set primary company as current if none selected
          const primaryCompany = mappedCompanies.find(c => c.isPrimary) || mappedCompanies[0];
          if (primaryCompany) {
            onCompanyChange(primaryCompany);
          }
        }
      } else {
        // No companies exist - create default one from user profile
        await createDefaultCompany();
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      // If database fails, create a simple fallback
      const fallbackCompany = {
        id: 'fallback-1',
        name: 'My Business',
        tin: '',
        isPrimary: true
      };
      setCompanies([fallbackCompany]);
      onCompanyChange(fallbackCompany);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCompany = async () => {
    if (!user?.id) return;
    
    try {
      const profile = await supabaseService.getProfile(user.id);
      const companyName = profile?.business_name || `${profile?.first_name || 'My'} Business`;
      
      const newCompany = await supabaseService.createCompany({
        user_id: user.id,
        company_name: companyName,
        business_type: profile?.business_type || 'General Business',
        tin: profile?.tin || '',
        cac_number: profile?.cac_number || '',
        address: profile?.address || '',
        phone: profile?.phone || '',
        is_primary: true
      });
      
      if (newCompany) {
        const company = {
          id: newCompany.id,
          name: newCompany.company_name,
          tin: newCompany.tin,
          isPrimary: true
        };
        setCompanies([company]);
        onCompanyChange(company);
      }
    } catch (error) {
      console.error('Error creating default company:', error);
      // Fallback to basic company if database fails
      const fallbackCompany = {
        id: 'temp-1',
        name: 'My Business',
        tin: '',
        isPrimary: true
      };
      setCompanies([fallbackCompany]);
      onCompanyChange(fallbackCompany);
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
              onClick={() => {
                setIsOpen(false);
                setShowAddModal(true);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left border-t border-border mt-2 pt-3"
            >
              <Plus className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-blue-600">Add New Company</div>
                <div className="text-sm text-muted-foreground">Manage another business</div>
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
    </div>
  );
}