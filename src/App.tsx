import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelpProvider } from "@/components/onboarding/HelpProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContextClean";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import WelcomeIntro from "@/components/WelcomeIntro";
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
import DigitalCashbook from "./pages/DigitalCashbook";
import EInvoicing from "./pages/EInvoicing";
import SmartTaxCalculator from "./pages/SmartTaxCalculator";
import { DashboardRouter } from "@/components/DashboardRouter";
import NotFound from "./pages/NotFound";
import { useState } from "react";

import TestPage from "./pages/TestPage";

import Landing from "./pages/Landing";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPasswordClean />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm-email" element={<EmailConfirmation />} />
      <Route path="/terms" element={<Terms />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/obligations" element={<ProtectedRoute><Obligations /></ProtectedRoute>} />
      <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
      <Route path="/calculator" element={<ProtectedRoute><SmartTaxCalculator /></ProtectedRoute>} />
      <Route path="/test-route" element={<TestPage />} />
      <Route path="/cashbook" element={<ProtectedRoute><DigitalCashbook /></ProtectedRoute>} />
      <Route path="/invoicing" element={<ProtectedRoute><EInvoicing /></ProtectedRoute>} />
      <Route path="/guides" element={<ProtectedRoute><Guides /></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminPanel /></AdminRoute></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <HelpProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CompanyProvider>
              <AppContent />
            </CompanyProvider>
          </BrowserRouter>
        </HelpProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
