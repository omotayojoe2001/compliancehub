import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelpProvider } from "@/components/onboarding/HelpProvider";
import { AuthProvider } from "@/contexts/AuthContextClean";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { automationService } from "@/lib/automationService";
import { testDatabaseConnection } from "@/lib/testDatabase";
import PublicLanding from "./pages/PublicLanding";
import TaxCalculator from "./pages/TaxCalculator";
import Dashboard from "./pages/Dashboard";
import Obligations from "./pages/Obligations";
import Reminders from "./pages/Reminders";
import CalculatorNew from "./pages/CalculatorNew";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import Guides from "./pages/Guides";
import Monitoring from "./pages/Monitoring";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPasswordClean from "./pages/ForgotPasswordClean";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import TestSystem from "./pages/TestSystem";
import DatabaseTest from "./pages/DatabaseTest";
import WhatsAppTest from "./pages/WhatsAppTest";
import AutomationTest from "./pages/AutomationTest";
import DashboardClean from "./pages/DashboardClean";
import SettingsClean from "./pages/SettingsClean";
import ObligationsClean from "./pages/ObligationsClean";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <HelpProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<PublicLanding />} />
            <Route path="/tax-calculator" element={<TaxCalculator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordClean />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-email" element={<EmailConfirmation />} />
            
            {/* Protected Dashboard Pages */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/obligations" element={<ProtectedRoute><Obligations /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><CalculatorNew /></ProtectedRoute>} />
            <Route path="/guides" element={<ProtectedRoute><Guides /></ProtectedRoute>} />
            <Route path="/monitoring" element={<ProtectedRoute><div>Monitoring disabled</div></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/test" element={<ProtectedRoute><TestSystem /></ProtectedRoute>} />
            <Route path="/db-test" element={<DatabaseTest />} />
            <Route path="/whatsapp-test" element={<WhatsAppTest />} />
            <Route path="/automation-test" element={<AutomationTest />} />
            
            {/* Clean Pages - No Database */}
            <Route path="/dashboard-clean" element={<ProtectedRoute><DashboardClean /></ProtectedRoute>} />
            <Route path="/settings-clean" element={<ProtectedRoute><SettingsClean /></ProtectedRoute>} />
            <Route path="/obligations-clean" element={<ProtectedRoute><ObligationsClean /></ProtectedRoute>} />
            
            {/* Admin Only Pages */}
            <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminPanel /></AdminRoute></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </HelpProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
