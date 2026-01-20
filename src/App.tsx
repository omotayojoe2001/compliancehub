import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelpProvider } from "@/components/onboarding/HelpProvider";
import { AuthProvider } from "@/contexts/AuthContextClean";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import PublicLanding from "./pages/PublicLanding";
import TaxCalculator from "./pages/TaxCalculator";
import Dashboard from "./pages/Dashboard";
import Obligations from "./pages/Obligations";
import Reminders from "./pages/Reminders";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import Guides from "./pages/Guides";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPasswordClean from "./pages/ForgotPasswordClean";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import ExpenseManagement from "./pages/ExpenseManagement";
import DigitalCashbook from "./pages/DigitalCashbook";
import EInvoicing from "./pages/EInvoicing";
import SmartTaxCalculator from "./pages/SmartTaxCalculator";
import NotFound from "./pages/NotFound";

import TestPage from "./pages/TestPage";

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
            <Route path="/" element={<PublicLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordClean />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-email" element={<EmailConfirmation />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/obligations" element={<ProtectedRoute><Obligations /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><SmartTaxCalculator /></ProtectedRoute>} />
            <Route path="/test-route" element={<TestPage />} />
            <Route path="/expenses" element={<ProtectedRoute><ExpenseManagement /></ProtectedRoute>} />
            <Route path="/cashbook" element={<ProtectedRoute><DigitalCashbook /></ProtectedRoute>} />
            <Route path="/invoicing" element={<ProtectedRoute><EInvoicing /></ProtectedRoute>} />
            <Route path="/guides" element={<ProtectedRoute><Guides /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
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