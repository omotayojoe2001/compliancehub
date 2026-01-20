import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function LoginSimple() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Bypass authentication for testing
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">ComplianceHub</span>
          </div>
          <h2 className="text-xl font-semibold">Quick Access</h2>
          <p className="text-gray-600 mt-2">Testing mode - authentication bypassed</p>
        </div>
        
        <div className="space-y-4">
          <Button onClick={handleLogin} className="w-full">
            Enter Dashboard
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            <p>Real-time Supabase integration active</p>
            <p>Paystack payments configured</p>
            <p>WhatsApp & Email notifications ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}