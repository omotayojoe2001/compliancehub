import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextClean";
import { validation } from "@/lib/validation";
import { rateLimiter } from "@/lib/rateLimiter";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate email format
    if (!validation.isValidEmail(email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    // Rate limiting: 5 attempts per 15 minutes
    const rateLimitKey = `login:${email.toLowerCase()}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 5, 15 * 60 * 1000)) {
      const resetTime = Math.ceil(rateLimiter.getResetTime(rateLimitKey) / 1000 / 60);
      setError(`Too many login attempts. Try again in ${resetTime} minutes`);
      setLoading(false);
      return;
    }

    // Sanitize email input
    const sanitizedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await signIn(sanitizedEmail, password);
      
      if (error) {
        setError('Invalid email or password');
        return;
      }
      
      if (data.user) {
        rateLimiter.clear(rateLimitKey);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
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
              Stay compliant,<br />stay ahead.
            </h2>
            <p className="mt-4 text-sm text-primary-foreground/80">
              Automated tax reminders and compliance tracking for Nigerian businesses.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/60">
            © 2025 TaxandCompliance T&C. All rights reserved.
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
                TaxandCompliance T&C
              </span>
            </div>
          </div>

          <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
