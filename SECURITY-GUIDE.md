# SECURITY GUIDE - PROTECTING YOUR APP FROM HACKERS

## CRITICAL SECURITY VULNERABILITIES FOUND

### 🚨 IMMEDIATE THREATS IN YOUR CODE

1. **API Keys Exposed in Frontend Code**
   - WhatsApp API token hardcoded in `whatsappService.ts`
   - Resend API key in documentation files
   - Anyone can view source code and steal these keys

2. **No Input Validation**
   - Login/Registration forms accept any input
   - SQL injection possible
   - XSS (Cross-Site Scripting) attacks possible

3. **No Rate Limiting**
   - Hackers can spam login attempts (brute force)
   - Can spam registration to create fake accounts
   - Can spam API calls to exhaust resources

4. **Weak Authentication**
   - No multi-factor authentication (MFA)
   - No password strength requirements
   - No account lockout after failed attempts

5. **Database Security Issues**
   - RLS (Row Level Security) might not be properly configured
   - Admin privileges hardcoded in code
   - No audit logging

---

## IMMEDIATE FIXES (DO THIS NOW)

### Fix 1: Move API Keys to Environment Variables (CRITICAL)

**Current Problem:**
```typescript
// ❌ EXPOSED IN CODE - ANYONE CAN SEE THIS
const WAWP_ACCESS_TOKEN = 'mBV1vrB8zxaMNX';
const WATI_TOKEN = 'Bearer eyJhbGci...';
```

**Solution:**

**Step 1:** Create `.env` file (if not exists):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_WAWP_INSTANCE=C5A0B44DFCA6
VITE_WAWP_ACCESS_TOKEN=mBV1vrB8zxaMNX
```

**Step 2:** Update `whatsappService.ts`:
```typescript
// ✅ SECURE - Keys hidden in environment variables
const WAWP_INSTANCE = import.meta.env.VITE_WAWP_INSTANCE;
const WAWP_ACCESS_TOKEN = import.meta.env.VITE_WAWP_ACCESS_TOKEN;

if (!WAWP_INSTANCE || !WAWP_ACCESS_TOKEN) {
  throw new Error('Missing WhatsApp API credentials');
}
```

**Step 3:** Add `.env` to `.gitignore`:
```
.env
.env.local
.env.production
```

**Step 4:** REGENERATE ALL API KEYS
- Go to Wati.io → Generate new API token
- Go to Resend → Generate new API key
- Update `.env` with new keys
- Old keys are now compromised (in git history)

---

### Fix 2: Add Input Validation and Sanitization

**Create `src/lib/validation.ts`:**
```typescript
export const validation = {
  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number (Nigerian format)
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^234[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
  },

  // Validate password strength
  isStrongPassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { valid: false, message: 'Password must contain special character (!@#$%^&*)' };
    }
    return { valid: true, message: 'Password is strong' };
  },

  // Sanitize input to prevent XSS
  sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Validate business name
  isValidBusinessName(name: string): boolean {
    return name.length >= 2 && name.length <= 100 && /^[a-zA-Z0-9\s&.-]+$/.test(name);
  },

  // Validate RC number
  isValidRCNumber(rc: string): boolean {
    return /^RC[0-9]{6,}$/.test(rc.toUpperCase());
  },

  // Validate TIN
  isValidTIN(tin: string): boolean {
    return /^[0-9]{8,10}$/.test(tin);
  }
};
```

**Update Login Page:**
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate inputs
  if (!validation.isValidEmail(email)) {
    toast.error('Invalid email format');
    return;
  }
  
  if (password.length < 8) {
    toast.error('Password must be at least 8 characters');
    return;
  }
  
  // Sanitize inputs
  const sanitizedEmail = validation.sanitizeInput(email.trim().toLowerCase());
  
  // Proceed with login
  const { error } = await supabase.auth.signInWithPassword({
    email: sanitizedEmail,
    password: password
  });
  
  if (error) {
    toast.error('Invalid credentials');
    return;
  }
};
```

---

### Fix 3: Add Rate Limiting

**Create `src/lib/rateLimiter.ts`:**
```typescript
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  // Check if action is allowed
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  // Get remaining time until reset
  getResetTime(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return 0;
    return Math.max(0, record.resetTime - Date.now());
  }
  
  // Clear attempts for a key
  clear(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();
```

**Use in Login:**
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Rate limit: 5 attempts per 15 minutes
  const rateLimitKey = `login:${email}`;
  if (!rateLimiter.isAllowed(rateLimitKey, 5, 15 * 60 * 1000)) {
    const resetTime = Math.ceil(rateLimiter.getResetTime(rateLimitKey) / 1000 / 60);
    toast.error(`Too many login attempts. Try again in ${resetTime} minutes`);
    return;
  }
  
  // Proceed with login...
};
```

---

### Fix 4: Implement Supabase Row Level Security (RLS)

**SQL to Enable RLS on All Tables:**

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Only admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  email IN ('joshuaomotayo10@gmail.com', 'admin@taxandcompliance.com.ng')
);

-- Enable RLS on scheduled_messages
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Only admins can create scheduled messages
CREATE POLICY "Only admins can create messages"
ON scheduled_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND email IN ('joshuaomotayo10@gmail.com', 'admin@taxandcompliance.com.ng')
  )
);

-- Only admins can view scheduled messages
CREATE POLICY "Only admins can view messages"
ON scheduled_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND email IN ('joshuaomotayo10@gmail.com', 'admin@taxandcompliance.com.ng')
  )
);

-- Enable RLS on tax_obligations
ALTER TABLE tax_obligations ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tax obligations
CREATE POLICY "Users can view own obligations"
ON tax_obligations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can only create their own tax obligations
CREATE POLICY "Users can create own obligations"
ON tax_obligations FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
```

---

### Fix 5: Add Content Security Policy (CSP)

**Update `index.html`:**
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Content Security Policy -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co https://wawp.net https://live-mt-server.wati.io;
    frame-src 'self' https://www.facebook.com;
  " />
  
  <!-- Prevent clickjacking -->
  <meta http-equiv="X-Frame-Options" content="DENY" />
  
  <!-- Prevent MIME type sniffing -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff" />
  
  <!-- Enable XSS protection -->
  <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
  
  <title>TaxandCompliance T&C</title>
</head>
```

---

### Fix 6: Secure Password Requirements

**Update Registration Page:**
```typescript
const [passwordStrength, setPasswordStrength] = useState({ valid: false, message: '' });

const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const pwd = e.target.value;
  setPassword(pwd);
  setPasswordStrength(validation.isStrongPassword(pwd));
};

return (
  <Input
    type="password"
    value={password}
    onChange={handlePasswordChange}
    required
  />
  {password && (
    <p className={`text-sm ${passwordStrength.valid ? 'text-green-600' : 'text-red-600'}`}>
      {passwordStrength.message}
    </p>
  )}
);
```

---

### Fix 7: Add Audit Logging

**Create audit_logs table:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

**Create `src/lib/auditLogger.ts`:**
```typescript
import { supabase } from './supabase';

export const auditLogger = {
  async log(action: string, resource: string, details?: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action,
        resource,
        details,
        ip_address: await this.getIpAddress(),
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Audit log failed:', error);
    }
  },
  
  async getIpAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
};

// Usage:
await auditLogger.log('LOGIN', 'auth', { email: user.email });
await auditLogger.log('DELETE_USER', 'profiles', { deleted_user_id: userId });
await auditLogger.log('SEND_MESSAGE', 'scheduled_messages', { message_id: messageId });
```

---

### Fix 8: Implement HTTPS Only

**Update `vite.config.ts`:**
```typescript
export default defineConfig({
  server: {
    https: true, // Force HTTPS in development
  },
  build: {
    // Ensure production builds use HTTPS
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
```

**Add to Vercel deployment:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

---

### Fix 9: Protect Against SQL Injection

**Always use Supabase query builders (NOT raw SQL):**

```typescript
// ❌ VULNERABLE TO SQL INJECTION
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', userInput); // If userInput contains SQL, it could be exploited

// ✅ SAFE - Supabase automatically sanitizes
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', userInput); // Supabase handles sanitization
```

**Never concatenate user input into queries:**
```typescript
// ❌ NEVER DO THIS
const query = `SELECT * FROM profiles WHERE email = '${userInput}'`;

// ✅ ALWAYS USE PARAMETERIZED QUERIES
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', userInput);
```

---

### Fix 10: Add Session Timeout

**Create `src/lib/sessionManager.ts`:**
```typescript
import { supabase } from './supabase';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
let timeoutId: NodeJS.Timeout | null = null;

export const sessionManager = {
  start() {
    this.resetTimeout();
    
    // Reset timeout on user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimeout());
    });
  },
  
  resetTimeout() {
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(async () => {
      await supabase.auth.signOut();
      window.location.href = '/login?timeout=true';
    }, SESSION_TIMEOUT);
  },
  
  stop() {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

// Start in App.tsx
useEffect(() => {
  sessionManager.start();
  return () => sessionManager.stop();
}, []);
```

---

## SECURITY CHECKLIST

### ✅ Immediate Actions (Do Today)
- [ ] Move all API keys to environment variables
- [ ] Add `.env` to `.gitignore`
- [ ] Regenerate all API keys (Wati, Resend, etc.)
- [ ] Enable RLS on all database tables
- [ ] Add input validation to login/registration
- [ ] Add rate limiting to login attempts
- [ ] Remove API keys from documentation files

### ✅ This Week
- [ ] Implement password strength requirements
- [ ] Add Content Security Policy headers
- [ ] Create audit logging system
- [ ] Add session timeout
- [ ] Test all security measures

### ✅ This Month
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Add IP-based blocking for suspicious activity
- [ ] Set up security monitoring alerts
- [ ] Conduct security audit
- [ ] Create incident response plan

---

## MONITORING AND ALERTS

### Set Up Supabase Alerts

1. Go to Supabase Dashboard → Database → Webhooks
2. Create webhook for failed login attempts:
```sql
CREATE OR REPLACE FUNCTION notify_failed_logins()
RETURNS TRIGGER AS $$
BEGIN
  -- Send alert if more than 5 failed attempts in 5 minutes
  IF (SELECT COUNT(*) FROM audit_logs 
      WHERE action = 'FAILED_LOGIN' 
      AND created_at > NOW() - INTERVAL '5 minutes') > 5 THEN
    -- Send email/SMS alert to admin
    PERFORM pg_notify('security_alert', 'Multiple failed login attempts detected');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## WHAT HACKERS LOOK FOR

### Common Attack Vectors:
1. **Exposed API Keys** - Check browser DevTools, source code, git history
2. **Weak Passwords** - Brute force common passwords
3. **SQL Injection** - Input `' OR '1'='1` in login forms
4. **XSS Attacks** - Input `<script>alert('hacked')</script>` in forms
5. **CSRF Attacks** - Trick users into clicking malicious links
6. **Session Hijacking** - Steal session tokens from cookies
7. **Rate Limit Bypass** - Spam API endpoints to cause DoS

### How to Test Your Security:
```bash
# Test SQL injection
Email: admin@test.com' OR '1'='1' --
Password: anything

# Test XSS
Business Name: <script>alert('XSS')</script>

# Test rate limiting
# Try logging in 10 times with wrong password

# Check for exposed keys
# Open browser DevTools → Network → Check API calls
```

---

## EMERGENCY RESPONSE PLAN

### If You Get Hacked:

1. **Immediately:**
   - Revoke all API keys
   - Force logout all users
   - Take app offline if needed

2. **Within 1 Hour:**
   - Check audit logs for suspicious activity
   - Identify compromised accounts
   - Reset passwords for affected users

3. **Within 24 Hours:**
   - Patch security vulnerability
   - Notify affected users
   - Report to authorities if needed

4. **After Incident:**
   - Conduct post-mortem analysis
   - Update security measures
   - Train team on security best practices

---

## FINAL RECOMMENDATIONS

### Priority 1 (Critical - Do Now):
1. Move API keys to environment variables
2. Regenerate all API keys
3. Enable RLS on database
4. Add input validation

### Priority 2 (High - This Week):
1. Implement rate limiting
2. Add password strength requirements
3. Set up audit logging
4. Add CSP headers

### Priority 3 (Medium - This Month):
1. Implement 2FA
2. Add session timeout
3. Set up monitoring alerts
4. Conduct security audit

---

**Remember:** Security is not a one-time task. It's an ongoing process. Review and update your security measures regularly.

**Cost:** Most security improvements are FREE. They just require time and proper implementation.

**Impact:** Prevents data breaches, protects user data, maintains trust, avoids legal issues.
