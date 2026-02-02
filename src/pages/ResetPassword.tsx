import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for tokens in URL hash (Supabase format) or query params
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    
    let accessToken = searchParams.get('access_token') || hashParams.get('access_token');
    let refreshToken = searchParams.get('refresh_token') || hashParams.get('refresh_token');
    let type = searchParams.get('type') || hashParams.get('type');
    
    if (!accessToken || !refreshToken) {
      setMessage("Invalid reset link. Please request a new password reset.");
      return;
    }

    // Set the session with the tokens
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: password
    });
    
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">TaxandCompliance T&C</span>
          </div>
        </div>

        <h1 className="text-xl font-semibold">Set New Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your new password below
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {message && (
            <div className={`p-3 text-sm rounded ${
              message.includes('successfully') 
                ? 'text-green-600 bg-green-50 border border-green-200'
                : 'text-red-600 bg-red-50 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
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
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}