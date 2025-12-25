import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AddTaxPeriodModal } from './AddTaxPeriodModal';
import { Plus } from 'lucide-react';

export function AddTaxObligation() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    // Refresh page to show new obligation
    window.location.reload();
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Add Your First Tax Period</h3>
            <p className="text-sm text-blue-700 mb-3">Tell us about months when you had business activity</p>
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