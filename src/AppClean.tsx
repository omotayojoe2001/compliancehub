import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelpProvider } from "@/components/onboarding/HelpProvider";
import { AuthProvider } from "@/contexts/AuthContextClean";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AutomationStatusPage from "./pages/AutomationStatusPage";
import ScheduledNotificationTest from "./pages/ScheduledNotificationTest";
import MasterAutomationTest from "./pages/MasterAutomationTest";
import TestAutomation from "./pages/TestAutomation";
import TestEmailDirect from "./pages/TestEmailDirect";
import TestNotifications from "./pages/TestNotifications";
import PublicLanding from "./pages/PublicLanding";
import TaxCalculator from "./pages/TaxCalculator";
import CalculatorNew from "./pages/CalculatorNew";
import Guides from "./pages/Guides";
import Subscription from "./pages/Subscription";
import Reminders from "./pages/Reminders";
import DashboardClean from "./pages/DashboardClean";
import SettingsClean from "./pages/SettingsClean";
import ObligationsWorking from "./pages/ObligationsWorking";
import WhatsAppTest from "./pages/WhatsAppTest";
import ForgotPasswordClean from "./pages/ForgotPasswordClean";
import DebugTest from "./pages/DebugTest";
import DatabaseSetup from "./pages/DatabaseSetup";
import AutomationTestClean from "./pages/AutomationTestClean";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
            
            {/* Clean Dashboard Pages - No Database */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardClean /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsClean /></ProtectedRoute>} />
            <Route path="/obligations" element={<ProtectedRoute><ObligationsWorking /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><CalculatorNew /></ProtectedRoute>} />
            <Route path="/guides" element={<ProtectedRoute><Guides /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
            
            {/* Test Pages */}
            <Route path="/automation-status" element={<AutomationStatusPage />} />
            <Route path="/scheduled-notification-test" element={<ScheduledNotificationTest />} />
            <Route path="/master-automation-test" element={<MasterAutomationTest />} />
            <Route path="/test-automation" element={<TestAutomation />} />
            <Route path="/test-email-direct" element={<TestEmailDirect />} />
            <Route path="/test-notifications" element={<TestNotifications />} />
            <Route path="/whatsapp-test" element={<WhatsAppTest />} />
            <Route path="/automation-test" element={<AutomationTestClean />} />
            <Route path="/database-setup" element={<DatabaseSetup />} />
            <Route path="/debug-test" element={<DebugTest />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </HelpProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;