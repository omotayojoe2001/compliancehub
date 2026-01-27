import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextClean";
import { supabase } from "@/lib/supabase";
import { freshDbService } from "@/lib/freshDbService";
import { comprehensiveAutomationService } from "@/lib/comprehensiveAutomationService";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: "",
    businessName: "",
    tin: "",
    phone: "",
    email: "",
    cacDate: "",
    vatStatus: false,
    payeStatus: false,
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Registration form submitted:', {
      email: formData.email,
      businessName: formData.businessName,
      phone: formData.phone,
      hasPassword: !!formData.password,
      passwordsMatch: formData.password === formData.confirmPassword,
      timestamp: new Date().toISOString()
    })
    
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      console.error('📝 Password mismatch')
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    console.log('📝 Calling signUp function...')
    const { data, error } = await signUp(formData.email, formData.password, {
      full_name: formData.clientName,
      business_name: formData.businessName,
      tin: formData.tin,
      phone: formData.phone,
      cac_date: formData.cacDate,
      vat_status: formData.vatStatus,
      paye_status: formData.payeStatus
    });
    
    console.log('📝 Registration result:', {
      success: !error,
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      needsConfirmation: data?.user && !data?.session,
      errorMessage: error?.message
    })
    
    if (error) {
      console.error('📝 Registration failed:', {
        message: error.message,
        status: error.status,
        name: error.name
      })
      const message = error.message.toLowerCase();
      if (message.includes('already registered') || message.includes('user already registered')) {
        setError('This email already has an account. Please log in.');
      } else {
        setError(error.message);
      }
    } else if (data.user && !data.session) {
      console.log('📝 Email confirmation required')
      
      // Send welcome notifications
      try {
        // Save profile data
        await freshDbService.saveProfile(data.user.id, {
          client_name: formData.clientName,
          business_name: formData.businessName,
          tin: formData.tin,
          phone: formData.phone,
          email: formData.email,
          cac_date: formData.cacDate,
          vat_status: formData.vatStatus,
          paye_status: formData.payeStatus,
          plan: 'free',
          subscription_status: 'inactive'
        });
        
        // Schedule complete onboarding notification sequence (but skip welcome email until verified)
        await comprehensiveAutomationService.scheduleUserOnboarding(
          data.user.id,
          formData.email,
          formData.clientName || formData.businessName,
          formData.phone,
          false // Email not verified yet
        );
      } catch (notificationError) {
        console.error('Welcome notifications failed:', notificationError);
      }
      
      setError('Welcome! Please check your email to confirm your account and get started.');
    } else {
      console.log('📝 Registration successful - user logged in')
    }
    
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden w-1/2 bg-primary lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary-foreground" />
            <span className="text-lg font-semibold text-primary-foreground">
              ComplianceHub
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-primary-foreground">
              Never miss a<br />deadline again.
            </h2>
            <p className="mt-4 text-sm text-primary-foreground/80">
              Join thousands of Nigerian businesses using ComplianceHub to stay on top of their tax obligations.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/60">
            © 2025 ComplianceHub. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                ComplianceHub
              </span>
            </div>
          </div>

          <h1 className="text-xl font-semibold text-foreground">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start your compliance journey today
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your Full Name
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Acme Corp Ltd"
                required
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tax Identification Number (TIN)
              </label>
              <input
                type="text"
                name="tin"
                value={formData.tin}
                onChange={handleChange}
                placeholder="Enter your company TIN"
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                📄 Your company's Tax Identification Number from NRS
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Phone Number (WhatsApp)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                required
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                📱 This number should be registered on WhatsApp to receive notifications
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                CAC Registration Date
              </label>
              <input
                type="date"
                name="cacDate"
                value={formData.cacDate}
                onChange={handleChange}
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-3">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tax Status
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="vatStatus"
                    checked={formData.vatStatus}
                    onChange={(e) => setFormData({...formData, vatStatus: e.target.checked})}
                    className="h-4 w-4 border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">VAT Registered</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="payeStatus"
                    checked={formData.payeStatus}
                    onChange={(e) => setFormData({...formData, payeStatus: e.target.checked})}
                    className="h-4 w-4 border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">PAYE Registered</span>
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  className="w-full border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className="w-full border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

