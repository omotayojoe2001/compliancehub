# Quick Fix Guide: Enterprise Plan Issue

## Problem
Enterprise user sees "Free plan includes 1 company profile" error when trying to add more companies.

## Quick Fix Steps

### Option 1: Automated Fix (RECOMMENDED)
1. Open your Supabase SQL Editor
2. Run the file: `DIAGNOSE-AND-FIX-ENTERPRISE-PLAN.sql`
3. Check the output to confirm the fix
4. Have the user refresh their browser and try again

### Option 2: Manual Fix
If you know the user's email, run this SQL:

```sql
-- Replace 'user@email.com' with actual email
UPDATE subscriptions 
SET plan_type = 'enterprise', 
    status = 'active',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'user@email.com'
);
```

### Option 3: Test First, Then Fix
1. Open `test-enterprise-plan.html` in a browser
2. Enter your Supabase credentials
3. Log in as the affected user
4. Click "Run Verification Test"
5. The test will tell you exactly what's wrong
6. Then run the appropriate SQL fix

## What Was Fixed in the Code

File: `src/hooks/usePlanRestrictions.ts`

**Before:**
```typescript
const plan = subscription?.plan_type || subscription?.plan || 'enterprise';
```

**After:**
```typescript
const rawPlan = subscription?.plan_type || subscription?.plan;
const validPlans = ['free', 'basic', 'pro', 'enterprise'];
const plan = (rawPlan && validPlans.includes(rawPlan.toLowerCase())) 
  ? rawPlan.toLowerCase() 
  : 'enterprise';
```

**Why:** The old code would accept any value from the database, even 'free'. The new code validates the plan and defaults to 'enterprise' if invalid.

## Verification

After applying the fix:
1. User logs in
2. Opens browser console (F12)
3. Should see: `📊 Plan detection: { detectedPlan: "enterprise" }`
4. Can add unlimited company profiles

## Files Created

1. ✅ `DIAGNOSE-AND-FIX-ENTERPRISE-PLAN.sql` - Automated diagnostic and fix
2. ✅ `test-enterprise-plan.html` - Browser-based verification tool
3. ✅ `ENTERPRISE-PLAN-ISSUE-FIX.md` - Detailed documentation
4. ✅ `src/hooks/usePlanRestrictions.ts` - Code fix applied

## Important Notes

⚠️ **DO NOT push to git until you confirm the error is resolved** (as requested)

The code changes are safe and improve error handling, but you should:
1. Test the SQL fix first
2. Verify the user can add companies
3. Check the browser console logs
4. Then commit and push

## Need Help?

If the automated fix doesn't work:
1. Check the output of the diagnostic SQL
2. Look for any error messages
3. Verify the user's email is correct
4. Check if the subscriptions table exists
5. Ensure RLS policies allow the query

## Contact

If you need further assistance, provide:
- Output from `DIAGNOSE-AND-FIX-ENTERPRISE-PLAN.sql`
- Browser console logs (with plan detection messages)
- User's email address
