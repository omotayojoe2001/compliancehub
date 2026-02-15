import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { comprehensiveAutomationService } from "@/lib/comprehensiveAutomationService";
import { freshDbService } from "@/lib/freshDbService";
import { whatsappService } from "@/lib/whatsappService";

export default function EmailConfirmation() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check URL hash first (Supabase uses hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchAccessToken = searchParams.get('access_token');
      const searchRefreshToken = searchParams.get('refresh_token');
      const hashAccessToken = hashParams.get('access_token');
      const hashRefreshToken = hashParams.get('refresh_token');
      
      const accessToken = searchAccessToken || hashAccessToken;
      const refreshToken = searchRefreshToken || hashRefreshToken;
      const type = searchParams.get('type') || hashParams.get('type');

      console.log('📧 Confirmation page loaded');
      console.log('📧 Search params:', Object.fromEntries(searchParams));
      console.log('📧 Hash params:', Object.fromEntries(hashParams));
      console.log('📧 Access token:', accessToken ? 'Present' : 'Missing');
      console.log('📧 Refresh token:', refreshToken ? 'Present' : 'Missing');
      console.log('📧 Type:', type);

      if (type === 'signup' && accessToken && refreshToken) {
        try {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            setStatus('error');
            setMessage('Failed to confirm email. Please try again.');
          } else {
            setStatus('success');
            setMessage('Email confirmed successfully! You can now access your account.');
            
            // Get user session to trigger welcome email
            const { data: { session } } = await supabase.auth.getSession();
            console.log('📧 Email confirmed for user:', session?.user?.id);
            
            if (session?.user) {
              try {
                // Get user profile
                console.log('🔍 Fetching profile...');
                const profile = await freshDbService.getProfile(session.user.id);
                console.log('👤 Profile loaded:', profile);
                
                if (profile) {
                  // Send WhatsApp welcome message immediately
                  if (profile.phone) {
                    console.log('📱 Sending WhatsApp to:', profile.phone);
                    const welcomeMessage = `🎉 Welcome to TaxandCompliance T&C!\n\nHi ${profile.business_name || 'there'}, we're excited to help you manage your tax compliance.\n\nGet started now by logging into your dashboard!`;
                    const sent = await whatsappService.sendMessage(profile.phone, welcomeMessage);
                    console.log('✅ WhatsApp send result:', sent);
                  } else {
                    console.warn('⚠️ No phone number in profile');
                  }
                  
                  // Now trigger welcome email since email is verified
                  await comprehensiveAutomationService.scheduleUserOnboarding(
                    session.user.id,
                    session.user.email || '',
                    profile.business_name || 'Your Business',
                    profile.phone || undefined,
                    true // Email is now verified
                  );
                } else {
                  console.error('❌ Profile not found for user:', session.user.id);
                }
              } catch (profileError) {
                console.error('❌ Profile error:', profileError);
              }
            }
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 3000);
          }
        } catch (error) {
          setStatus('error');
          setMessage('An error occurred while confirming your email.');
        }
      } else {
        setStatus('error');
        setMessage('Invalid confirmation link. Please check your email and try again.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">ComplianceHub</span>
          </div>
        </div>

        <div className="mb-6">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          )}
          
          {status === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          )}
          
          {status === 'error' && (
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          )}
        </div>

        <h1 className="text-2xl font-semibold mb-4">
          {status === 'loading' && 'Confirming your email...'}
          {status === 'success' && 'Email Confirmed!'}
          {status === 'error' && 'Confirmation Failed'}
        </h1>

        <p className="text-muted-foreground mb-8">
          {status === 'loading' && 'Please wait while we verify your email address.'}
          {message}
        </p>

        {status === 'success' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Redirecting to your dashboard in a few seconds...
            </p>
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <Button asChild>
              <Link to="/login">Back to Login</Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Need help? <Link to="/forgot-password" className="text-primary hover:underline">Reset your password</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}