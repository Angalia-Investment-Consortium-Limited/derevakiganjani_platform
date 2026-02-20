# **Jitesti Results: Implementation Plan (v4)**

## **1. Executive Summary**

This document outlines the implementation plan for the Jitesti Results feature. This feature will provide drivers with detailed feedback on their test performance and equip administrators with the tools to monitor and analyze test results. Upon passing a test, a certificate will be generated and stored.

## **2. Driver-Side Implementation**

### **2.1. Dedicated Results Page (`TestResultPage.tsx`)**

The new `TestResultPage.tsx` will be the central hub for results. If the user passes, this page will include a button to download their generated certificate.

### **2.2. Test History & Performance Analytics**

A new "Test History" section will allow drivers to view all past attempts and access the results page for each, including the link to their certificate if they passed.

## **3. Admin-Side Implementation**

### **3.1. Jitesti Test Results**

A new page at `src/pages/admin/JitestiResults.tsx` will be created to provide administrators with a comprehensive list of all "Jitesti" test attempts. This page will display key information for each attempt, such as the user, test category, score, and pass/fail status.

### **3.2. Aggregate Results Dashboard**

A "Results Center" in the Admin Dashboard for monitoring overall test performance.

### **3.3. Individual Attempt Analysis**

Admins can view any user's specific test attempt using the `TestResultPage.tsx` component.

### **3.4. Certificate Management**

A new `src/pages/admin/certificates/AdminCertificateManagement.tsx` page will be created. This dashboard will allow admins to:
*   View a list of all certificates issued for Jitesti.
*   Search and filter certificates by user, test, or date.
*   View the details of each certificate.

## **4. Data Model & Schema (Firestore)**

### **4.1. `test_attempts` Collection (Enhanced)**

We will enhance the `test_attempts` collection to include a `certificateId` field, which will be populated upon successful test completion and certificate generation.

*   **Document ID:** Auto-generated ID.
*   **Fields:** `userId`, `categoryTitle`, `completedAt`, `score`, `isPassed`, `answers`, `certificateId` (nullable string).

### **4.2. `certificates` Collection**

We will use the existing `certificates` collection. When a user passes a Jitesti test, a new document will be created here.

*   **Document ID:** Auto-generated ID.
*   **Fields:**
    *   `certificate_url`: `string` (URL to the certificate file in Firebase Storage).
    *   `testAttemptId`: `string` (Link back to the test attempt).
    *   `testName`: `string`
    *   `driverId`: `string`
    *   `issue_date`: `timestamp`

## **5. Implementation Phases**

### **Phase 1: Refactor and Build Driver Results Page**
1.  **Create Component:** Create `src/pages/jitesti/TestResultPage.tsx`.
2.  **Enhance Submission Logic:** Update `TestPage.tsx` to save the enhanced `test_attempts` data.
3.  **Implement Redirection:** Redirect from `TestPage.tsx` to `TestResultPage.tsx` on completion.
4.  **Build Results UI:** Implement the dynamic results page UI.

### **Phase 2: Certificate Generation**
1.  **Create Service:** Create a `src/services/CertificateGenerationService.ts`.
2.  **Generation Logic:** This service will contain a function that:
    a.  Accepts a `testAttempt` object.
    b.  (Placeholder) Generates a PDF/image of the certificate.
    c.  Uploads the file to Firebase Storage.
    d.  Creates a new document in the `certificates` collection.
    e.  Updates the corresponding `test_attempts` document with the new `certificateId`.
3.  **Integrate Service:** Call this new service from `TestPage.tsx` within the `submitTestMutation`'s `onSuccess` callback if `isPassed` is true.
4.  **Enable Download Button:** The "Download Certificate" button on `TestResultPage.tsx` will be enabled and linked to the `certificate_url`.

### **Phase 3: Driver Performance History**
1.  **API Hooks:** Create client-side hooks to fetch all `test_attempts` for a user.
2.  **UI - Driver:** Build the "Test History" list on the driver's dashboard.

### **Phase 4: Admin Management Dashboard**
1.  **Create Jitesti Results Page:** Create the `src/pages/admin/JitestiResults.tsx` file.
2.  **Create Certificate Management Page:** Create the `src/pages/admin/certificates/AdminCertificateManagement.tsx` file.
3.  **API Hooks:** Create client-side hooks to fetch all documents from the `certificates` and `test_attempts` collections.
4.  **UI - Admin:** Build the management tables using ShadCN components (`Table`, `DataTable`).

## **6. UI/UX Design Specification**

*(This section contains the previously added UI mockup description and reference code for the results page.)*
