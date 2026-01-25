# Frappe React SDK Authentication Testing Guide

## Quick Testing Commands

### 1. Build and Test Locally

```bash
# Navigate to landing directory
cd landing

# Install dependencies (if needed)
yarn install

# Run development server
yarn dev

# In another terminal, build for production
yarn build
```

### 2. Test on Frappe Server

```bash
# From project root
cd landing

# Build and deploy
yarn build:prod

# This will:
# 1. Build the React app
# 2. Copy files to Frappe public directory
# 3. Clear Frappe cache
# 4. Restart bench
```

## Manual Testing Checklist

### Driver Login (`/auth/driver-login`)

#### Valid Credentials Test
1. Navigate to `/auth/driver-login`
2. Enter valid driver email
3. Enter correct password
4. Click "Login"
5. ✅ Should show success toast
6. ✅ Should redirect to `/dashboard`
7. ✅ Profile should load correctly

#### Invalid Credentials Test
1. Enter valid email
2. Enter wrong password
3. Click "Login"
4. ✅ Should show error: "Invalid email or password"
5. ✅ Should not redirect

#### Non-existent Account Test
1. Enter non-existent email
2. Enter any password
3. Click "Login"
4. ✅ Should show error: "No account found with this email"

#### Empty Fields Test
1. Leave email empty
2. Click "Login"
3. ✅ Should show error: "Please enter both email and password"

#### Network Error Test
1. Disconnect internet
2. Try to login
3. ✅ Should show network error message

### Employer Login (`/auth/employer-login`)

#### Verified Employer Test
1. Navigate to `/auth/employer-login`
2. Login with verified employer account
3. ✅ Should redirect to `/employer/dashboard`

#### Unverified Employer Test
1. Login with unverified employer account
2. ✅ Should redirect to `/employer/pending-verification`

#### Invalid Credentials Test
1. Enter wrong credentials
2. ✅ Should show appropriate error message

### Admin Login (`/auth/admin-login`)

#### Valid Admin Test
1. Navigate to `/auth/admin-login`
2. Login with admin account
3. ✅ Should redirect to `/admin`

#### Valid Staff Test
1. Login with staff account
2. ✅ Should redirect to `/admin`

#### Non-Admin User Test
1. Login with driver/employer account
2. ✅ Should show "Access Denied" message
3. ✅ Should logout automatically
4. ✅ Should not redirect to admin

#### System Manager Test
1. Login with System Manager role
2. ✅ Should redirect to `/admin`

### General Authentication Tests

#### Logout Test
1. Login to any account
2. Click logout
3. ✅ Should clear session
4. ✅ Should redirect to home/login
5. ✅ Trying to access protected routes should redirect to login

#### Session Persistence Test
1. Login to any account
2. Refresh the page
3. ✅ Should remain logged in
4. ✅ Profile should load correctly

#### Protected Routes Test
1. Without logging in, try to access:
   - `/dashboard`
   - `/profile`
   - `/employer/dashboard`
   - `/admin`
2. ✅ Should redirect to login page

#### Multiple Tab Test
1. Login in one tab
2. Open another tab
3. ✅ Should be logged in both tabs
4. Logout in one tab
5. ✅ Should logout in both tabs

## Console Logging

Check browser console for debug logs:

### Driver Login
```
[DriverLogin] Attempting login for: user@example.com
[DriverLogin] Login successful: { user: {...}, profile: {...} }
```

### Employer Login
```
[EmployerLogin] Attempting login for: employer@company.com
[EmployerLogin] Login successful, profile: {...}
```

### Admin Login
```
[AdminLogin] Attempting login for: admin@example.com
[AdminLogin] Login successful, user: {...}
[AdminLogin] User does not have admin privileges (if unauthorized)
```

## Error Scenarios to Test

### 1. Invalid Credentials
- **Input**: Wrong password
- **Expected**: "Invalid email or password. Please try again."

### 2. User Not Found
- **Input**: Non-existent email
- **Expected**: "No account found with this email. Please register first."

### 3. Disabled Account
- **Input**: Disabled user credentials
- **Expected**: "Your account has been disabled. Please contact support."

### 4. Network Error
- **Input**: No internet connection
- **Expected**: "Network error. Please check your internet connection."

### 5. Empty Fields
- **Input**: Missing email or password
- **Expected**: "Please enter both email and password"

### 6. Unauthorized Admin Access
- **Input**: Non-admin user on admin login
- **Expected**: "You do not have admin privileges. Please use the appropriate login page."

## API Endpoints Being Called

### During Login
1. `frappe.auth.login` - Frappe's login endpoint
2. `derevahuduma_platform.api.auth.get_user_profile` - Get user profile with roles

### During Logout
1. `frappe.auth.logout` - Frappe's logout endpoint

## Browser DevTools Checks

### Network Tab
1. Check for successful API calls
2. Verify no 403/401 errors (unless testing invalid credentials)
3. Check response times

### Application Tab
1. Check cookies are set after login
2. Verify cookies are cleared after logout

### Console Tab
1. No JavaScript errors
2. Debug logs showing login flow
3. No warning messages

## Performance Checks

### Login Speed
- ✅ Login should complete in < 2 seconds
- ✅ No artificial delays
- ✅ Smooth transition to dashboard

### Loading States
- ✅ Button shows "Logging in..." during login
- ✅ Button is disabled during login
- ✅ Loading state clears after completion

## Accessibility Checks

### Keyboard Navigation
1. Tab through form fields
2. ✅ All fields should be accessible
3. ✅ Enter key should submit form

### Screen Reader
1. Test with screen reader
2. ✅ Labels should be read correctly
3. ✅ Error messages should be announced

## Mobile Testing

### Responsive Design
1. Test on mobile viewport
2. ✅ Form should be readable
3. ✅ Buttons should be tappable
4. ✅ No horizontal scrolling

### Touch Interactions
1. Test on actual mobile device
2. ✅ Touch targets should be adequate
3. ✅ Keyboard should appear for inputs

## Common Issues and Solutions

### Issue: Login succeeds but doesn't redirect
**Solution**: Check console for navigation errors, verify route configuration

### Issue: Profile doesn't load after login
**Solution**: Check API endpoint, verify user has profile created

### Issue: "Failed to load user data after login"
**Solution**: Check backend API, verify profile endpoint returns correct data

### Issue: Session not persisting
**Solution**: Check cookies, verify Frappe session management

### Issue: TypeScript errors
**Solution**: Run `yarn type-check` to identify type issues

## Automated Testing (Future)

### Unit Tests
```typescript
describe('AuthContext', () => {
  it('should login successfully with valid credentials', async () => {
    // Test implementation
  });
  
  it('should handle login errors correctly', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Driver Login Flow', () => {
  it('should complete full login flow', async () => {
    // Test implementation
  });
});
```

## Test Accounts

### Driver Account
- Email: `driver@test.com`
- Password: `test123`
- Expected: Redirect to `/dashboard`

### Employer Account (Verified)
- Email: `employer@test.com`
- Password: `test123`
- Expected: Redirect to `/employer/dashboard`

### Employer Account (Unverified)
- Email: `unverified@test.com`
- Password: `test123`
- Expected: Redirect to `/employer/pending-verification`

### Admin Account
- Email: `admin@test.com`
- Password: `admin123`
- Expected: Redirect to `/admin`

### Staff Account
- Email: `staff@test.com`
- Password: `staff123`
- Expected: Redirect to `/admin`

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Console errors (if any)
6. Network tab screenshots
7. User role being tested

## Success Criteria

✅ All login pages work correctly
✅ Error messages are clear and helpful
✅ Loading states work properly
✅ Navigation works as expected
✅ Session management works correctly
✅ No console errors
✅ Good performance (< 2s login time)
✅ Accessible to all users
✅ Works on mobile devices

## Next Steps After Testing

1. Document any issues found
2. Fix critical bugs
3. Optimize performance if needed
4. Add analytics tracking
5. Consider adding automated tests
6. Update user documentation
