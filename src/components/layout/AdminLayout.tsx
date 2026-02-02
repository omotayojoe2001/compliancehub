import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Shield, Users, Database, Settings, BarChart3, FileText, TrendingUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/admin/login');
  };

  const adminNavItems = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Tax Data', href: '/admin/tax-data', icon: FileText },
    { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { name: 'Content', href: '/admin/content', icon: FileText },
    { name: 'System', href: '/admin/system', icon: Database },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Admin Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-60 bg-red-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-red-800">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-bold">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-red-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={`w-full justify-start text-white hover:bg-red-800 ${
                  isActive ? 'bg-red-800' : ''
                }`}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-red-800"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>
      
      <main className="flex-1 lg:ml-60 overflow-auto flex flex-col">
        {/* Admin Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-red-50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span className="text-lg font-semibold text-red-900">Administrator Dashboard</span>
            </div>
          </div>
          <div className="text-sm text-red-700 font-medium">
            Admin Access Only
          </div>
        </div>
        
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}