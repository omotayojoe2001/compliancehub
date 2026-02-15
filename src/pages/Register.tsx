import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextClean";

export default function Register() {
  const [step, setStep] = useState(1);
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
    
    if (step === 1) {
      if (!formData.clientName || !formData.businessName || !formData.email) {
        setError('Please fill in all required fields');
        return;
      }
      setError('');
      setStep(2);
      return;
    }
    
    if (step === 2) {
      if (!formData.phone || formData.phone.length < 13) {
        setError('Please enter a valid phone number');
        return;
      }
      setError('');
      setStep(3);
      return;
    }
    
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    const { data, error } = await signUp(formData.email, formData.password, {
      full_name: formData.clientName,
      business_name: formData.businessName,
      phone: formData.phone,
      cac_date: formData.cacDate,
      vat_status: formData.vatStatus,
      paye_status: formData.payeStatus
    });
    
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes('already registered')) {
        setError('This email already has an account. Please log in.');
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else if (data.user && !data.session) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      try {
        const scheduledTime = new Date(Date.now() + 2 * 60 * 1000);
        const welcomeMessage = `🎉 Welcome to TaxandCompliance T&C!\\n\\nHi ${formData.businessName}, we're excited to help you manage your tax compliance.\\n\\nPlease check your email to verify your account and get started!`;
        
        await fetch('https://fyhhcqjclcedpylhyjwy.supabase.co/rest/v1/scheduled_messages', {
          method: 'POST',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGhjcWpjbGNlZHB5bGh5and5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMTUsImV4cCI6MjA4MjA5MjAxNX0.qH7Qg65wEQxmI6p4dVA7Mg-C5ZxEdmULmUDAUOasdy8',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            target_type: 'individual',
            target_email: formData.email,
            target_phone: formData.phone,
            send_via_whatsapp: true,
            send_via_email: false,
            message_body: welcomeMessage,
            scheduled_time: scheduledTime.toISOString(),
            status: 'pending'
          })
        });
      } catch (err) {
        console.error('Schedule error:', err);
      }
      
      setError('Welcome! Please check your email to confirm your account and get started.');
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-primary lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary-foreground" />
            <span className="text-lg font-semibold text-primary-foreground">
              TaxandCompliance T&C
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-primary-foreground">
              Never miss a<br />deadline again.
            </h2>
            <p className="mt-4 text-sm text-primary-foreground/80">
              Join thousands of Nigerian businesses using TaxandCompliance T&C to stay on top of their tax obligations.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/60">
            © 2025 TaxandCompliance T&C. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                TaxandCompliance T&C
              </span>
            </div>
          </div>

          <h1 className="text-xl font-semibold text-foreground">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Contact & Tax Details' : 'Set Password'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className={`p-3 text-sm border rounded ${error.includes('Welcome') ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                {error}
              </div>
            )}

            {step === 1 && (
              <>
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
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Phone Number (WhatsApp)
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-2 border border-border bg-gray-50 text-sm text-muted-foreground rounded">
                      +234
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone.replace('234', '')}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.startsWith('0')) value = value.substring(1);
                        if (value.length <= 10) {
                          setFormData({...formData, phone: '234' + value});
                        }
                      }}
                      placeholder="8012345678"
                      required
                      maxLength={10}
                      className="flex-1 border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    📱 Enter 10 digits without the leading 0
                  </p>
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
                    placeholder="Optional"
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
                        checked={formData.vatStatus}
                        onChange={(e) => setFormData({...formData, vatStatus: e.target.checked})}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">VAT Registered</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.payeStatus}
                        onChange={(e) => setFormData({...formData, payeStatus: e.target.checked})}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">PAYE Registered</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating Account..." : step === 3 ? "Create Account" : "Continue"}
              </Button>
            </div>
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
