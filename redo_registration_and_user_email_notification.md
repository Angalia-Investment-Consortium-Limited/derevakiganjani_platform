# Redo Registration and User Email Notification

## 1. Involved Routes
```jsx
<Route path="/ingia" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/auth/register" element={<Register />} />
<Route path="/auth/login" element={<Login />} />
<Route path="/auth/admin-login" element={<AdminLogin />} />
<Route path="/auth/driver-login" element={<DriverLogin />} />
<Route path="/auth/employer-login" element={<EmployerLogin />} />
<Route path="/auth/forgot" element={<ForgotPassword />} />
<Route path="/auth/reset" element={<ResetPassword />} />
<Route path="/auth/redirect" element={<AuthRedirect />} />
```

## Priority Activity: Investigate Duplicate Registration Routes

The following two routes point to the same `Register` component:

```jsx
<Route path="/register" element={<Register />} />  
<Route path="/auth/register" element={<Register />} />
```

- **Focus on `/register`:** This is the primary registration route to focus on.
- **Investigate `/auth/register`:** Find out where this route is being used in the application.

## Firebase Collection Implementation

For the Firebase collection implementation, refer to the `firestore_schema.md` file.

## Current Problems

*   **Email Notification:** Registered users do not receive an email notification.
*   **OTP Issues:** OTP with Beem doesn't work for signing in with OTP.
*   **Password Reset:** The reset password flow is not set up.
*   **Forgot Password:** The forgot password flow is not set up.

## Action Plan & Progress

Here is the step-by-step plan to address the issues:

### 1. Investigate Duplicate Registration Routes
- [ ] Find where `/auth/register` is used in the codebase.
- [ ] Determine if it's safe to remove one of the duplicate routes.
- [ ] If so, remove the unnecessary route and update any links pointing to it.
- **Status:** Not Started

### 2. Fix User Email Notification
- [ ] Examine the registration code to identify where the email notification should be triggered.
- [ ] Check the email sending service integration and its configuration.
- [ ] Implement the email sending logic to send a welcome email upon successful registration.
- [ ] Test the email notification functionality.
- **Status:** Not Started

### 3. Fix OTP with Beem
- [ ] Review the Beem API integration for sending OTPs.
- [ ] Debug the "sign in with OTP" functionality to identify the point of failure.
- [ ] Correct the code to ensure OTPs are sent and verified correctly.
- [ ] Test the "sign in with OTP" flow.
- **Status:** Not Started

### 4. Implement Forgot/Reset Password Flow
- [ ] Create the UI for the "Forgot Password" and "Reset Password" pages.
- [ ] Implement the logic to send a password reset link to the user's email.
- [ ] Create a secure backend endpoint to handle password reset requests.
- [ ] Implement the logic to update the user's password in the database.
- [ ] Test the entire forgot/reset password flow.
- **Status:** Not Started
