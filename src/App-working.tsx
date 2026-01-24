import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelpProvider } from "@/components/onboarding/HelpProvider";
import { AuthProvider } from "@/contexts/AuthContextClean";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardSimple from "./pages/DashboardSimple";
import DigitalCashbook from "./pages/DigitalCashbook";
import EInvoicing from "./pages/EInvoicing";
import SmartTaxCalculator from "./pages/SmartTaxCalculator";
import ObligationsClean from "./pages/ObligationsClean";
import AddObligation from "./pages/AddObligation";
import RemindersClean from "./pages/RemindersClean";
import GuidesClean from "./pages/GuidesClean";
import SubscriptionClean from "./pages/SubscriptionClean";
import SettingsClean from "./pages/SettingsClean";
import TestNotifications from "./pages/TestNotifications";
import TestVATNotifications from "./pages/TestVATNotifications";
import TestRoute from "./pages/TestRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SCUMLCompliance from "./pages/SCUMLCompliance";
import StateRevenueServices from "./pages/StateRevenueServices";
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
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardSimple /></ProtectedRoute>} />
            <Route path="/obligations" element={<ProtectedRoute><ObligationsClean /></ProtectedRoute>} />
            <Route path="/add-obligation" element={<ProtectedRoute><AddObligation /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><RemindersClean /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><SmartTaxCalculator /></ProtectedRoute>} />
            <Route path="/cashbook" element={<ProtectedRoute><DigitalCashbook /></ProtectedRoute>} />
            <Route path="/invoicing" element={<ProtectedRoute><EInvoicing /></ProtectedRoute>} />
            <Route path="/guides" element={<ProtectedRoute><GuidesClean /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><SubscriptionClean /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsClean /></ProtectedRoute>} />
            <Route path="/test-notifications" element={<TestNotifications />} />
            <Route path="/test-vat-notifications" element={<TestVATNotifications />} />
            <Route path="/test-route" element={<TestRoute />} />
            <Route path="/scuml" element={<SCUMLCompliance />} />
            <Route path="/state-revenue" element={<StateRevenueServices />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </HelpProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
