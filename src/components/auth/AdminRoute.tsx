import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface AdminRouteProps {
  children: React.ReactNode;
}

const ADMIN_EMAILS = [
  'admin@compliancehub.ng',
  'joshua@compliancehub.ng',
  'support@compliancehub.ng',
  'user@example.com' // Add your current email here
];

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user?.email) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Temporarily allow all logged-in users for testing
    setIsAdmin(true);
    setLoading(false);
    
    // Original admin check (commented out for testing)
    // const isAdminUser = ADMIN_EMAILS.includes(user.email.toLowerCase());
    // setIsAdmin(isAdminUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="text-primary hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}