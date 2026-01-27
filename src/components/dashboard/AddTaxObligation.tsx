import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AddTaxPeriodModal } from './AddTaxPeriodModal';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextClean';
import { useCompany } from '@/contexts/CompanyContext';
import { supabaseService } from '@/lib/supabaseService';

interface AddTaxObligationProps {
  onSuccess?: () => void;
}

export function AddTaxObligation({ onSuccess }: AddTaxObligationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasExistingObligations, setHasExistingObligations] = useState(false);
  const { user } = useAuth();
  const { currentCompany } = useCompany();

  useEffect(() => {
    checkExistingObligations();
  }, [user?.id, currentCompany?.id]);

  const checkExistingObligations = async () => {
    if (!user?.id) return;
    
    try {
      const obligations = await supabaseService.getObligations(user.id, currentCompany?.id);
      setHasExistingObligations((obligations?.length || 0) > 0);
    } catch (error) {
      console.error('Error checking obligations:', error);
    }
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.reload();
    }
  };

  const title = hasExistingObligations ? "Add New Tax Period" : "Add Your First Tax Period";
  const description = hasExistingObligations 
    ? "Add another month when you had business activity" 
    : "Tell us about months when you had business activity";

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">{title}</h3>
            <p className="text-sm text-blue-700 mb-3">{description}</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tax Period
          </Button>
        </div>
      </div>

      <AddTaxPeriodModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}