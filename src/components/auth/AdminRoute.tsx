import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAuth = () => {
      const adminSession = localStorage.getItem('admin_session');
      
      if (!adminSession) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const session = JSON.parse(adminSession);
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        // Session expires after 8 hours
        if (hoursSinceLogin > 8) {
          localStorage.removeItem('admin_session');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem('admin_session');
        setIsAuthenticated(false);
      }
    };

    checkAdminAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}