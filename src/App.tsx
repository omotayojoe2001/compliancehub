import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContextClean";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import AdminLogin from "./pages/AdminLogin";
import PublicLanding from "./pages/PublicLanding";
import TaxCalculator from "./pages/TaxCalculator";
import Dashboard from "./pages/Dashboard";
import Obligations from "./pages/Obligations";
import Reminders from "./pages/Reminders";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import AdminUsers from "./pages/AdminUsers";
import AdminTaxData from "./pages/AdminTaxData";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSystem from "./pages/AdminSystem";
import AdminContent from "./pages/AdminContent";
import AdminSettings from "./pages/AdminSettings";
import AdminTaxRates from "./pages/AdminTaxRates";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import DigitalCashbook from "./pages/DigitalCashbook";
import EInvoicing from "./pages/EInvoicing";
import SmartTaxCalculator from "./pages/SmartTaxCalculator";
import Guides from "./pages/Guides";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (false) { // Disable auth loading check
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm-email" element={<EmailConfirmation />} />
      <Route path="/terms" element={<Terms />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/obligations" element={<ProtectedRoute><Obligations /></ProtectedRoute>} />
      <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
      <Route path="/calculator" element={<ProtectedRoute><SmartTaxCalculator /></ProtectedRoute>} />
      <Route path="/cashbook" element={<ProtectedRoute><DigitalCashbook /></ProtectedRoute>} />
      <Route path="/invoicing" element={<ProtectedRoute><EInvoicing /></ProtectedRoute>} />
      <Route path="/guides" element={<ProtectedRoute><Guides /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/tax-rates" element={<AdminRoute><AdminTaxRates /></AdminRoute>} />
      <Route path="/admin/tax-data" element={<AdminRoute><AdminTaxData /></AdminRoute>} />
      <Route path="/admin/content" element={<AdminRoute><AdminContent /></AdminRoute>} />
      <Route path="/admin/system" element={<AdminRoute><AdminSystem /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CompanyProvider>
            <AppContent />
          </CompanyProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
