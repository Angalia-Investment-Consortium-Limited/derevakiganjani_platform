# Frappe React SDK Authentication Refactoring Plan

## Overview
Refactor authentication to use `useFrappeAuth` from frappe-react-sdk more directly across all login pages (Driver, Employer, Admin) following best practices from the official documentation.

## Current State Analysis

### ✅ What's Working
- Frappe React SDK v1.13.0 is installed
- FrappeProvider is properly configured in App.tsx
- Custom AuthContext wraps useFrappeAuth
- All three login pages use the custom useAuth hook
- Type system is well-defined

### ❌ Issues to Address
1. **Redundant API Calls**: Making extra call to `frappe.auth.get_logged_user` when `useFrappeAuth` already provides `currentUser`
2. **Complex State Management**: Custom state management duplicates what useFrappeAuth provides
3. **Error Handling**: Not using `getUserCookie` for auth error recovery
4. **Loading States**: Not fully leveraging `isValidating` from useFrappeAuth
5. **Unnecessary Delays**: Using `setTimeout` to wait for data instead of proper async handling

## Implementation Plan

### Phase 1: Refactor AuthContext.tsx ✓
**Goal**: Simplify to use useFrappeAuth features directly

**Changes**:
1. Remove redundant `useFrappeGetCall` for `frappe.auth.get_logged_user`
2. Use `currentUser` from `useFrappeAuth` as primary source of truth
3. Leverage `updateCurrentUser` for refreshing auth state
4. Add `getUserCookie` for handling auth errors
5. Simplify login flow to remove artificial delays
6. Better error handling following SDK patterns

**Key Features to Use**:
- `currentUser` - Current logged-in user
- `isValidating` - Loading state
- `login(username, password)` - Login function
- `logout()` - Logout function
- `updateCurrentUser()` - Refresh current user
- `getUserCookie()` - Reset auth state on errors

### Phase 2: Update DriverLogin.tsx ✓
**Goal**: Simplify login flow using refactored AuthContext

**Changes**:
1. Keep using `useAuth` hook (now simplified)
2. Improve error handling with specific error messages
3. Maintain OTP functionality structure for future implementation
4. Add loading states during authentication
5. Better user feedback on errors

### Phase 3: Update EmployerLogin.tsx ✓
**Goal**: Apply same refactoring pattern as DriverLogin

**Changes**:
1. Use simplified `useAuth` hook
2. Maintain employer verification logic
3. Improve error handling
4. Better loading states
5. Consistent error messages

### Phase 4: Update AdminLogin.tsx ✓
**Goal**: Apply same refactoring pattern with role verification

**Changes**:
1. Use simplified `useAuth` hook
2. Keep role verification logic
3. Improve error handling
4. Better loading states
5. Consistent error messages

## Technical Details

### AuthContext Refactoring

**Before**:
```typescript
// Making redundant API call
const { data: userData } = useFrappeGetCall('frappe.auth.get_logged_user');

// Complex state initialization
useEffect(() => {
  if (currentUser && userData?.message) {
    // Complex logic
  }
}, [currentUser, userData, isValidating]);
```

**After**:
```typescript
// Use currentUser directly from useFrappeAuth
const { currentUser, isValidating, updateCurrentUser, getUserCookie } = useFrappeAuth();

// Simplified state initialization
useEffect(() => {
  if (currentUser) {
    // Simpler logic using currentUser directly
  } else if (!isValidating) {
    // Handle logged out state
  }
}, [currentUser, isValidating]);
```

### Login Flow Improvements

**Before**:
```typescript
await frappeLogin({ username, password });
await mutateUser();
await new Promise(resolve => setTimeout(resolve, 500)); // Artificial delay
const profileResponse = await mutateProfile();
```

**After**:
```typescript
await frappeLogin({ username, password });
await updateCurrentUser(); // Refresh current user
const profileResponse = await mutateProfile(); // Fetch profile
// No artificial delays needed
```

### Error Handling Pattern

```typescript
try {
  await login(credentials);
  // Success handling
} catch (error: any) {
  // Use getUserCookie to reset auth state on 403 errors
  if (error.httpStatus === 403) {
    getUserCookie();
  }
  
  // Specific error messages
  let errorMessage = 'Login failed';
  if (error.message?.includes('invalid')) {
    errorMessage = 'Invalid credentials';
  }
  // Show error to user
}
```

## Benefits

1. **Simpler Code**: Less custom state management
2. **Better Performance**: No redundant API calls or artificial delays
3. **More Reliable**: Using SDK's built-in features
4. **Easier Maintenance**: Following official patterns
5. **Better Error Handling**: Using getUserCookie for auth errors
6. **Consistent**: All login pages follow same pattern

## Testing Checklist

- [ ] Driver login with valid credentials
- [ ] Driver login with invalid credentials
- [ ] Employer login with valid credentials
- [ ] Employer login with invalid credentials
- [ ] Employer verification redirect logic
- [ ] Admin login with valid credentials
- [ ] Admin login with invalid credentials
- [ ] Admin role verification
- [ ] Logout functionality
- [ ] Protected routes still work
- [ ] Profile loading after login
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] Session persistence across page refreshes

## Files to Modify

1. ✓ `landing/src/contexts/AuthContext.tsx` - Core auth logic
2. ✓ `landing/src/pages/auth/DriverLogin.tsx` - Driver login page
3. ✓ `landing/src/pages/auth/EmployerLogin.tsx` - Employer login page
4. ✓ `landing/src/pages/auth/AdminLogin.tsx` - Admin login page

## Dependencies

- No new dependencies needed
- Using existing frappe-react-sdk v1.13.0

## Rollback Plan

If issues arise:
1. Git revert to previous commit
2. All changes are in isolated files
3. No database changes required
4. No breaking changes to API

## Documentation References

- [Frappe React SDK Authentication Docs](https://github.com/nikkothari22/frappe-react-sdk#authentication)
- useFrappeAuth hook documentation
- Error handling patterns from SDK

## Next Steps After Implementation

1. Test all login flows thoroughly
2. Monitor for any authentication issues
3. Update any related documentation
4. Consider adding unit tests for auth flows
5. Document the new patterns for team
