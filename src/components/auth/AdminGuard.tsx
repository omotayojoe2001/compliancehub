import { Navigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const isAdminAuthenticated = localStorage.getItem('admin_token') === 'admin_authenticated';

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}