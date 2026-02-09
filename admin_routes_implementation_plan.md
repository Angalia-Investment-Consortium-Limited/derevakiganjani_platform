# Admin Panel Implementation Plan

This document outlines the phased approach to building out the full functionality for the Dereva Kiganjani admin panel routes. The goal is to implement complete CRUD (Create, Read, Update, Delete) operations and data visualization for all specified admin features, connecting them to the Firebase backend.

---

## 1. Reference Documents

The implementation will be guided by the following key project files:

*   **`firestore_schema.md`**: The primary source of truth for all Firestore collection structures and data models.
*   **`src/App.tsx`**: Contains the route definitions that map URLs to their corresponding React components.
*   **`src/pages/admin/`**: This directory contains all the UI components for the admin panel that will be made functional.
*   **`src/hooks/`**: This directory contains the business logic, state management, and Firebase interaction logic.
*   **`src/lib/firebase.ts`**: Contains the core Firebase configuration and initialization.
*   **`src/types/`**: Contains the TypeScript type definitions for our data models.

---

## 2. Implementation Phases

The work will be executed in logical phases to ensure a structured and manageable development process.

### Phase 1: Job & Application Management (Completed)

This phase focuses on providing admins with full control over job postings and their applicants.

*   **Objective:** Implement viewing and management of job posts and submitted applications.
*   **Status:** ✅ **Completed**
*   **Data Fetching Strategy:** Data is queried directly from Firestore collections (`jobs`, `job_applications`) within the hooks, avoiding the use of Cloud Functions for these read operations.
*   **Routes & Components:**
    *   `✅ /admin/job-management`: `JobManagement.tsx` - Lists, filters, and allows deletion of all jobs from the `jobs` collection.
    *   `✅ /admin/job-applicants/:jobId`: `JobApplicants.tsx` - Displays all applicants for a specific job from the `job_applications` collection.
*   **Hooks Used:**
    *   `useJobManagement` and `useJobApplicants` in `src/hooks/useJobs.ts`.

### Phase 2: User & Role Management (Not Started)

This phase focuses on managing user accounts and their permissions within the system.

*   **Objective:** Implement CRUD for users and manage roles/permissions.
*   **Routes & Components:**
    *   `/admin/users`: `UsersManagement.tsx`
    *   `/admin/users/new`: `UserForm.tsx`
    *   `/admin/users/:id/edit`: `UserForm.tsx`
    *   `/admin/settings/roles`: `RolesPermissions.tsx`
*   **Action Plan:**
    1.  Create a `useUsers.ts` hook for fetching and managing users based on the `users` and profile collections (`admins`, `employers`, `driver_profiles`).
    2.  Refactor `UsersManagement.tsx` to list, search, and filter all users.
    3.  Refactor `UserForm.tsx` to handle both the creation of new users and the modification of existing ones.
    4.  Refactor `RolesPermissions.tsx` to fetch and display role data, and provide functionality to modify permissions.

### Phase 3: Application & Verification Management (Partially Completed)

This phase focuses on the core administrative workflows of reviewing applications and verifying employers.

*   **Objective:** Allow admins to review and process license applications and employer verification requests.
*   **Status:** 🔄 **In Progress**
*   **Completed Work:**
    *   `✅ /admin/employer-verification`: `EmployerVerificationManagement.tsx` - Lists and filters employers based on their verification status.
    *   `✅ /admin/employer-review/:id`: `EmployerReview.tsx` - Allows an admin to review an employer's details and approve or reject their verification request.
    *   **Hooks Used:** `useEmployerVerificationManagement` and `useEmployerReview` in `src/hooks/useEmployerVerification.ts`.
*   **Remaining Work:**
    *   `/admin/license-applications`: `LicenseApplicationsManagement.tsx`
    *   `/admin/license-application/:id`: `LicenseApplicationReview.tsx`
*   **Action Plan:**
    1.  Create a `useLicenseApplications.ts` hook to fetch data from the `license_applications` collection.
    2.  Refactor `LicenseApplicationsManagement.tsx` to list and manage all incoming license applications.
    3.  Refactor `LicenseApplicationReview.tsx` to display the full details of a single application and allow an admin to approve or reject it.

### Phase 4: Reporting & Analytics (Not Started)

This phase focuses on providing data insights to administrators.

*   **Objective:** Display key metrics and reports from various parts of the application.
*   **Routes & Components:**
    *   `/admin/reports`: `ReportsCenter.tsx`
    *   `/admin/recruitment-reports`: `RecruitmentReports.tsx`
    *   `/admin/license-statistics`: `LicenseStatistics.tsx`
    *   `/admin/certificates`: `CertificatesManagement.tsx`
    *   `/admin/matching`: `MatchingMonitor.tsx`
*   **Action Plan:**
    1.  For each component, identify the necessary data points by referencing `firestore_schema.md`.
    2.  Create dedicated hooks to perform the necessary Firestore queries and aggregations.
    3.  Refactor each component to fetch and display the data in a clear, understandable format (e.g., charts, tables, stats cards).

### Phase 5: Payments (On Hold)

This phase will be addressed once the core functionalities are complete.

*   **Objective:** Provide a view of all transactions processed through the system.
*   **Route:** `/admin/payments`
*   **Component:** `PaymentsManagement.tsx`
*   **Action Plan:**
    1.  Create a `usePayments.ts` hook to fetch data from the `payments` collection.
    2.  Refactor `PaymentsManagement.tsx` to display a searchable and filterable list of all payments.
