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
  const [isLoading, setIsLoading] = useState(false); // Never loading

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
    setIsLoading(false); // Keep false
  }, [user?.id]);

  // Save company selection to localStorage
  const setCurrentCompany = (company: Company) => {
    console.group('🏢 COMPANY DEBUG - Switch Company');
    console.log('📊 Company Switch Details:', {
      timestamp: new Date().toISOString(),
      userId: user?.id,
      previousCompany: {
        name: currentCompany?.name || 'none',
        id: currentCompany?.id || 'none',
        tin: currentCompany?.tin || 'none',
        isPrimary: currentCompany?.isPrimary || false
      },
      newCompany: {
        name: company.name,
        id: company.id,
        tin: company.tin || 'none',
        isPrimary: company.isPrimary
      }
    });
    
    setCurrentCompanyState(company);
    if (user?.id) {
      const storageKey = `selectedCompany_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(company));
      console.log('💾 Saved to localStorage:', {
        key: storageKey,
        data: company
      });
    }
    console.log('✅ Company switch completed successfully');
    console.groupEnd();
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