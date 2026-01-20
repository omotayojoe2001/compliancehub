import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextClean";
import { HelpProvider } from "@/components/onboarding/HelpProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DigitalCashbook from "./pages/DigitalCashbook";
import ExpenseManagement from "./pages/ExpenseManagement";
import EInvoicing from "./pages/EInvoicing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SmartTaxCalculator from "./pages/SmartTaxCalculator";
import Obligations from "./pages/Obligations";
import Reminders from "./pages/Reminders";
import Guides from "./pages/Guides";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";

function HomePage() {
  return <div style={{padding: '40px'}}><h1>HOME PAGE WORKS</h1></div>;
}

function TestPage() {
  return <div style={{padding: '40px'}}><h1>TEST PAGE WORKS</h1></div>;
}

function App() {
  return (
    <AuthProvider>
      <HelpProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/obligations" element={<Obligations />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/calculator" element={<SmartTaxCalculator />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/cashbook" element={<DigitalCashbook />} />
            <Route path="/expenses" element={<ExpenseManagement />} />
            <Route path="/invoicing" element={<EInvoicing />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </BrowserRouter>
      </HelpProvider>
    </AuthProvider>
  );
}

export default App;