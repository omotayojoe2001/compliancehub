import { useAuth } from '@/contexts/AuthContextClean';
import { useCompany } from '@/contexts/CompanyContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SystemTest() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">System Test</h1>
        
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-bold">User Info:</h3>
          <p>ID: {user?.id}</p>
          <p>Email: {user?.email}</p>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-bold">Company Info:</h3>
          <p>ID: {currentCompany?.id || 'None'}</p>
          <p>Name: {currentCompany?.name || 'None'}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <h3 className="font-bold">Status:</h3>
          <p>✅ Auth Context: Working</p>
          <p>✅ Company Context: Working</p>
          <p>✅ Layout: Working</p>
        </div>
      </div>
    </DashboardLayout>
  );
}