import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContextClean';

interface Company {
  id: string;
  name: string;
  tin?: string;
  isPrimary: boolean;
}

interface CompanyContextType {
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentCompany, setCurrentCompanyState] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved company from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const savedCompany = localStorage.getItem(`selectedCompany_${user.id}`);
      if (savedCompany) {
        try {
          setCurrentCompanyState(JSON.parse(savedCompany));
        } catch (error) {
          console.error('Error parsing saved company:', error);
        }
      }
    }
    setIsLoading(false);
  }, [user?.id]);

  // Save company selection to localStorage
  const setCurrentCompany = (company: Company) => {
    console.log('🔄 COMPANY SWITCH DEBUG:', {
      from: currentCompany?.name || 'none',
      to: company.name,
      fromId: currentCompany?.id || 'none',
      toId: company.id,
      fromTin: currentCompany?.tin || 'none',
      toTin: company.tin || 'none'
    });
    
    setCurrentCompanyState(company);
    if (user?.id) {
      localStorage.setItem(`selectedCompany_${user.id}`, JSON.stringify(company));
      console.log('💾 Saved to localStorage:', JSON.stringify(company));
    }
    console.log('🏢 Switched to company:', company.name);
  };

  return (
    <CompanyContext.Provider value={{
      currentCompany,
      setCurrentCompany,
      isLoading
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}