import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextClean";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/lib/supabase";
import { supabaseService } from "@/lib/supabaseService";
import { FileText, Users, Building, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Profile {
  cac_date: string | null;
}

interface Obligation {
  id: string;
  obligation_type: string;
  next_due_date: string;
  payment_status?: string;
}

export function TaxRegistrationStatus() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, currentCompany?.id]);

  const loadData = async () => {
    console.log('🔍 TaxRegistrationStatus loading data for user:', user?.id, 'company:', currentCompany?.id);
    try {
      const [profileData, obligationsData] = await Promise.all([
        supabase.from('profiles').select('cac_date').eq('id', user?.id).single(),
        supabaseService.getObligations(user?.id, currentCompany?.id)
      ]);
      
      console.log('📊 Profile data:', profileData.data);
      console.log('📊 Obligations data:', obligationsData);
      console.log('📊 Obligations count:', obligationsData?.length || 0);
      
      setProfile(profileData.data);
      setObligations(obligationsData || []);
    } catch (error) {
      console.error('❌ TaxRegistrationStatus error loading data:', error);
    }
    setLoading(false);
  };

  // Check if user is registered for a tax type (simple: if it's in "What We Watch", they're registered)
  const isRegisteredFor = (taxType: string) => {
    console.log(`🔍 Checking registration for ${taxType}:`);
    console.log('Available obligations:', obligations.map(o => o.obligation_type));
    
    const found = obligations.some(obligation => {
      const match = obligation.obligation_type.toLowerCase().includes(taxType.toLowerCase()) &&
        obligation.payment_status !== 'paid';
      console.log(`- ${obligation.obligation_type} matches ${taxType}:`, match);
      return match;
    });
    
    console.log(`✅ ${taxType} is registered:`, found);
    return found;
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded"></div>;
  }

  const taxTypes = [
    {
      name: "CAC Annual Returns",
      description: "Annual returns filing with Corporate Affairs Commission",
      icon: Building,
      isRegistered: !!profile?.cac_date || isRegisteredFor('cac'),
      status: (!!profile?.cac_date || isRegisteredFor('cac')) ? "Registered" : "Not Registered"
    },
    {
      name: "VAT Returns", 
      description: "Monthly VAT returns filing with FIRS",
      icon: FileText,
      isRegistered: isRegisteredFor('vat'),
      status: isRegisteredFor('vat') ? "Registered" : "Not Registered"
    },
    {
      name: "PAYE Returns",
      description: "Monthly PAYE returns for employees", 
      icon: Users,
      isRegistered: isRegisteredFor('paye'),
      status: isRegisteredFor('paye') ? "Registered" : "Not Registered"
    },
    {
      name: "Self Assessment Tax",
      description: "Annual personal income tax filing",
      icon: CreditCard, 
      isRegistered: true, // Everyone needs to file personal tax
      status: "Required"
    }
  ];

  return (
    <div className="space-y-4">
      {taxTypes.map((tax) => (
        <div key={tax.name} className="border border-border bg-card p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <tax.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">{tax.name}</h3>
                <p className="text-sm text-muted-foreground">{tax.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tax.isRegistered ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{tax.status}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{tax.status}</span>
                </div>
              )}
              <Button size="sm" variant="outline">
                {tax.isRegistered ? "Manage" : "File Now"}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}