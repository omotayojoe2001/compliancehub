# SIGNUP DATA FLOW DOCUMENTATION

## Registration Form Fields & Database Storage

### Fields on Signup Page (src/pages/Register.tsx):
1. **Full Name** (`clientName`) → Saved to `profiles.client_name` or `profiles.full_name`
2. **Business Name** (`businessName`) → Saved to `profiles.business_name`
3. **TIN** (`tin`) → Saved to `profiles.tin`
4. **Phone Number** (`phone`) → Saved to `profiles.phone`
5. **Email** (`email`) → Saved to `auth.users.email` (Supabase Auth)
6. **CAC Registration Date** (`cacDate`) → Saved to `profiles.cac_date` or `profiles.cac_registration_date`
7. **VAT Status** (`vatStatus`) → Saved to `profiles.vat_status` or `profiles.vat_registered`
8. **PAYE Status** (`payeStatus`) → Saved to `profiles.paye_status` or `profiles.paye_registered`
9. **Password** → Saved to `auth.users` (encrypted by Supabase)

### Database Tables:
- **auth.users**: Email, password (managed by Supabase Auth)
- **profiles**: All business and user profile data

### Data Flow:
1. User fills form → Register.tsx
2. Calls `signUp()` from AuthContextClean.tsx
3. Supabase creates user in `auth.users`
4. Metadata passed to Supabase (but NOT automatically saved to profiles)
5. Register.tsx manually calls `freshDbService.saveProfile()` to save to `profiles` table

### SQL to Verify Data:
```sql
-- Check auth users
SELECT email, created_at, email_confirmed_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Check profiles
SELECT id, email, full_name, business_name, tin, phone, cac_registration_date, vat_registered, paye_registered 
FROM profiles ORDER BY created_at DESC LIMIT 10;
```

## Email Verification Flow

### Current Issue:
- Email confirmation link redirects to `localhost:5173` instead of production URL

### Fix Required:
Update Supabase project settings:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to: `https://your-production-domain.com`
3. Set **Redirect URLs** to include: `https://your-production-domain.com/email-confirmation`

### Email Confirmation Page:
- Located at: `src/pages/EmailConfirmation.tsx`
- Handles the redirect after user clicks email verification link
- Should redirect to `/dashboard` after successful verification

## Password Reset Flow

### Forgot Password Page:
- Located at: `src/pages/ForgotPassword.tsx`
- User enters email
- Supabase sends reset link
- Link redirects to `src/pages/ResetPassword.tsx`

### Reset Password Page:
- Located at: `src/pages/ResetPassword.tsx`
- User enters new password
- Should redirect to `/login` after successful reset

### Fix Required:
Same as email verification - update Supabase URL configuration to use production domain instead of localhost.
