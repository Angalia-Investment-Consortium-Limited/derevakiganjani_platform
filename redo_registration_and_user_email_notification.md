# Registration & User Notification Overhaul: Firebase Authentication

## 1. Objective

This document outlines the migration of all user authentication and notification features to **Firebase Authentication**. The goal is to create a secure, streamlined, and reliable user management system by deprecating custom logic and third-party services like Beem.

## 2. Affected Routes

The following routes will be updated to use Firebase Authentication:

```jsx
<Route path="/ingia" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/auth/login" element={<Login />} />
<Route path="/auth/admin-login" element={<AdminLogin />} />
<Route path="/auth/driver-login" element={<DriverLogin />} />
<Route path="/auth/employer-login" element={<EmployerLogin />} />
<Route path="/auth/forgot" element={<ForgotPassword />} />
<Route path="/auth/reset" element={<ResetPassword />} />
<Route path="/auth/redirect" element={<AuthRedirect />} />
```

## 3. Deprecation of Custom Logic

- **Beem SMS for OTP:** The existing integration with Beem for OTP-based sign-in will be completely removed.
- **Custom Password Reset:** The current, non-functional password reset flow will be replaced.
- **Manual Email Notifications:** All user email notifications for authentication events will be handled by Firebase.

## 4. Action Plan: Firebase Implementation

This plan details the steps to migrate each feature to Firebase Authentication. The existing UI components will be reused and connected to the new Firebase-powered backend.

### Step 1: User Registration & Email Verification

- [ ] **Implement `createUserWithEmailAndPassword`:**
    - In the `Register` component, replace the current registration logic with a call to Firebase's `createUserWithEmailAndPassword` function.
- [ ] **Trigger Email Verification:**
    - Upon successful user creation, call `sendEmailVerification` to send a verification link to the user's email.
- [ ] **Update Firestore User Profile:**
    - After registration, create a user document in the `users` collection in Firestore with their role and other relevant information.
- [ ] **UI Feedback:**
    - Display a message to the user prompting them to check their email to verify their account.

### Step 2: User Login

- [ ] **Implement `signInWithEmailAndPassword`:**
    - In the `Login` component, use `signInWithEmailAndPassword` to authenticate users.
- [ ] **Handle Unverified Emails:**
    - If a user tries to log in without a verified email, display a message and provide an option to resend the verification email.

### Step 3: Password Reset

- [ ] **Implement `sendPasswordResetEmail`:**
    - In the `ForgotPassword` component, use `sendPasswordResetEmail` to send a password reset link to the user's email.
- [ ] **UI Confirmation:**
    - Provide clear feedback to the user that a password reset email has been sent.

### Step 4: OTP Sign-In (Firebase Phone Authentication)

- [ ] **Set Up Firebase Phone Authentication:**
    - Enable Phone Number sign-in in the Firebase console.
- [ ] **Implement `RecaptchaVerifier`:**
    - Set up `RecaptchaVerifier` to protect against abuse.
- [ ] **Implement `signInWithPhoneNumber`:**
    - In the OTP sign-in component, use `signInWithPhoneNumber` to send a verification code to the user's phone.
- [ ] **Confirm OTP:**
    - Once the user enters the code, use the `confirm` method on the confirmation result object to complete the sign-in process.

### Step 5: Clean Up & Finalize

- [ ] **Remove Beem SDK:**
    - Uninstall the Beem SDK and remove all related code.
- [ ] **Remove Old Logic:**
    - Delete any unused custom authentication functions and components.
- [ ] **Testing:**
    - Thoroughly test all authentication flows:
        - Registration and email verification.
        - Login (with verified and unverified email).
        - Password reset.
        - OTP/Phone sign-in.
