import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Calculator,
  CreditCard,
  Settings,
  LogOut,
  Building2,
  BookOpen,
  X,
  Receipt,
  BookOpenCheck,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContextClean";
import { useProfile } from "@/hooks/useProfileClean";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  // TEMPORARILY DISABLED AUTH
  // const { signOut } = useAuth();
  // const { profile } = useProfile();

  // TEMPORARILY SHOW ALL FEATURES FOR TESTING
  const hasExpenseAccess = true; // profile?.plan === 'pro' || profile?.plan === 'enterprise';
  const hasInvoicingAccess = true; // ['basic', 'pro', 'enterprise'].includes(profile?.plan || '');

  const navigation = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "What We Watch", href: "/obligations", icon: FileText },
    { name: "Proof We Work", href: "/reminders", icon: Bell },
    { name: "Smart Calculator", href: "/calculator", icon: Calculator },
    ...(hasExpenseAccess ? [{ name: "Digital Cashbook", href: "/cashbook", icon: BookOpenCheck }] : []),
    ...(hasInvoicingAccess ? [{ name: "E-Invoicing", href: "/invoicing", icon: FileSpreadsheet }] : []),
    ...(hasExpenseAccess ? [{ name: "Expenses", href: "/expenses", icon: Receipt }] : []),
    { name: "How-To Guides", href: "/guides", icon: BookOpen },
    { name: "Payment", href: "/subscription", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-50 h-screen w-60 border-r border-border bg-card transition-transform duration-300",
      "lg:translate-x-0", // Always visible on desktop
      isOpen ? "translate-x-0" : "-translate-x-full" // Mobile toggle
    )}>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-primary" />
          <span className="ml-2 text-sm font-semibold text-foreground">
            ComplianceHub
          </span>
        </div>
        {/* Close button for mobile */}
        <button 
          onClick={onClose}
          className="lg:hidden p-1 hover:bg-secondary rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto h-[calc(100vh-168px)]">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose} // Close sidebar on mobile when link is clicked
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors rounded-md",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          );
        })}
        
        {/* Logout button in navigation for mobile - TEMPORARILY DISABLED
        <button 
          onClick={() => {
            signOut();
            onClose?.();
          }}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground rounded-md lg:hidden"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        */}
      </nav>

      {/* Footer - Desktop only - TEMPORARILY DISABLED
      <div className="hidden lg:block absolute bottom-0 left-0 right-0 border-t border-border p-3 bg-card">
        <button 
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground rounded-md"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
      */}
    </aside>
  );
}
