import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanySelector from "@/components/CompanySelector";
import { useAuth } from "@/contexts/AuthContextClean";
import { useCompany } from "@/contexts/CompanyContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  
  // Try to use company context, fallback if not available
  let currentCompany = null;
  let setCurrentCompany = () => {};
  
  try {
    const companyContext = useCompany();
    currentCompany = companyContext.currentCompany;
    setCurrentCompany = companyContext.setCurrentCompany;
  } catch (error) {
    console.warn('CompanyProvider not available, using fallback');
    // Fallback to localStorage
    const savedCompany = user?.id ? localStorage.getItem(`selectedCompany_${user.id}`) : null;
    if (savedCompany) {
      try {
        currentCompany = JSON.parse(savedCompany);
      } catch (e) {
        console.error('Error parsing saved company:', e);
      }
    }
  }
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-60 overflow-auto flex flex-col">
        {/* Desktop header with company selector */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">TaxandCompliance T&C</span>
            <div className="text-sm text-muted-foreground">|</div>
            <CompanySelector 
              currentCompany={currentCompany}
              onCompanyChange={setCurrentCompany}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {currentCompany ? `Managing: ${currentCompany.name}` : 'Select Company'}
          </div>
        </div>
        
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold">T&C</span>
          </div>
          <CompanySelector 
            currentCompany={currentCompany}
            onCompanyChange={setCurrentCompany}
          />
        </div>
        
        <div className="flex-1 p-4 lg:p-6">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
