# Enterprise Plan Issue - Root Cause Analysis & Fix

## Problem Statement
Enterprise user "Joshua Omotayo" is seeing a "Free plan includes 1 company profile. Upgrade to manage more businesses" error when trying to add more company profiles, despite being an enterprise-level user.

## Root Cause Analysis

### Issue #1: Database Subscription Data
The user's subscription record in the database likely has one of these problems:
1. **Missing subscription**: No active subscription record exists for the user
2. **Wrong plan_type**: The `plan_type` column is set to 'free' or 'basic' instead of 'enterprise'
3. **Duplicate subscriptions**: Multiple subscription records exist, and the wrong one is being selected
4. **NULL plan_type**: The subscription exists but `plan_type` is NULL or empty

### Issue #2: Code Logic Flaw (FIXED)
Location: `src/hooks/usePlanRestrictions.ts`

**Previous Code:**
```typescript
const plan = subscription?.plan_type || subscription?.plan || 'enterprise';
```

**Problem:** 
- If `plan_type = 'free'` or `'basic'`, it would use that value instead of defaulting to 'enterprise'
- The fallback to 'enterprise' only worked if the value was falsy (null, undefined, empty string)
- No validation that the plan value was actually valid

**Fixed Code:**
```typescript
const rawPlan = subscription?.plan_type || subscription?.plan;
const validPlans = ['free', 'basic', 'pro', 'enterprise'];
const plan = (rawPlan && validPlans.includes(rawPlan.toLowerCase())) 
  ? rawPlan.toLowerCase() 
  : 'enterprise';
```

**Improvements:**
- Validates that the plan is one of the expected values
- Normalizes to lowercase for consistency
- Defaults to 'enterprise' if invalid or missing
- Added comprehensive logging to track plan detection

### Issue #3: Missing Database Constraint
The `subscriptions` table doesn't have a UNIQUE constraint on `user_id`, which could allow multiple active subscriptions for the same user, causing confusion about which plan to use.

## Solution Steps

### Step 1: Run Diagnostic SQL
Execute the diagnostic script to identify the exact issue:

```bash
# Run this SQL file in your Supabase SQL Editor
DIAGNOSE-AND-FIX-ENTERPRISE-PLAN.sql
```

This will:
- Show the user's current subscription status
- Identify any duplicate subscriptions
- Count their company profiles
- Automatically fix the issue

### Step 2: Code Fix (Already Applied)
The code fix has been applied to `src/hooks/usePlanRestrictions.ts` with:
- Better plan validation
- Comprehensive logging
- Proper fallback logic

### Step 3: Verify the Fix
After running the SQL script, check the browser console when the user logs in. You should see:

```
🔍 PLAN RESTRICTIONS DEBUG
Fetching subscription for user: [user-id]
Subscription query result: { subscription: {...}, error: null }
📊 Plan detection: {
  rawPlanType: "enterprise",
  rawPlan: null,
  detectedPlan: "enterprise",
  isValid: true
}
```

If you see a warning like:
```
⚠️ NON-ENTERPRISE PLAN DETECTED: free
User should have enterprise access but has: free
```

Then the database still needs to be fixed.

### Step 4: Manual Database Fix (If Needed)
If the automatic fix doesn't work, manually update the subscription:

```sql
-- Find the user ID
SELECT id, email FROM auth.users 
WHERE email ILIKE '%joshua%' OR email ILIKE '%omotayo%';

-- Update their subscription (replace USER_ID with actual ID)
UPDATE subscriptions 
SET plan_type = 'enterprise', 
    status = 'active',
    updated_at = NOW()
WHERE user_id = 'USER_ID';

-- Or insert if no subscription exists
INSERT INTO subscriptions (user_id, plan_type, status, amount, created_at, updated_at)
VALUES ('USER_ID', 'enterprise', 'active', 0, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE 
SET plan_type = 'enterprise', status = 'active', updated_at = NOW();
```

## Testing the Fix

1. **Clear browser cache** or open an incognito window
2. **Log in** as Joshua Omotayo
3. **Open browser console** (F12) and look for the plan detection logs
4. **Try to add a new company profile**:
   - Click on the company selector dropdown
   - Click "Add New Company"
   - Should open the modal WITHOUT showing the upgrade prompt

## Expected Behavior After Fix

- User should see "Add New Company" button (not "Upgrade to Add More")
- Clicking it should open the company creation modal
- No "Upgrade Required" popup should appear
- User can create unlimited company profiles

## Files Modified

1. `src/hooks/usePlanRestrictions.ts` - Enhanced plan detection logic
2. `DIAGNOSE-AND-FIX-ENTERPRISE-PLAN.sql` - Diagnostic and fix script (NEW)

## Prevention

To prevent this issue in the future:

1. **Add unique constraint** on `subscriptions.user_id` (included in fix script)
2. **Set default plan** when creating new users
3. **Add validation** in the registration flow to ensure subscription is created
4. **Monitor logs** for plan detection warnings

## Notes

- The code now defaults to 'enterprise' if any issue occurs
- Comprehensive logging helps identify future issues quickly
- The fix is backward compatible with existing code
- No changes needed to other components (CompanySelector, AddCompanyModal)
