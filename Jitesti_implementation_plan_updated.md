# JiTesti Online Testing Module: Implementation Plan (Updated)

**Author:** Gemini AI
**Date:** October 27, 2023
**Status:** Core Functionality Complete. Awaiting Payment Integration and Certificate Generation.

---

## 1. Executive Summary

This document outlines a phased, risk-mitigated plan to implement the "JiTesti" online testing module for the Ajiriwa platform. The goal is to create a robust, secure, and user-friendly system for drivers to take paid online tests, view results, and earn certificates, while providing administrators with the tools to manage the entire process.

This updated plan reflects the completion of the core test-taking functionality and a fix for the question-loading issue. The next phases focus on integrating a real payment system and automating certificate generation.

---

## 2. Data Models (Firestore)

(No changes to the data models. The existing schema is correct and can be found in `firestore_schema.md`.)

---

## 3. Security (Firestore Rules)

(No changes to the security rules. The existing rules are sufficient for the next phases.)

---

## 4. Implementation Phases

### Phase 1: Admin Foundation & Data Seeding
*Purpose: To build the necessary management tools and secure the backend before any driver-facing UI is created.*

- [x] **Data Models:** Define the structure for all new Firestore collections.
- [x] **Admin Pages (Placeholders):** Create new files: `src/pages/admin/JitestiCategoryManager.tsx` and `src/pages/admin/JitestiTestManager.tsx`.
- [x] **Routing:** Add new admin routes to `src/App.tsx` guarded by `AdminRoleBasedRoute`.
- [x] **Category Manager UI:** Build the UI in `JitestiCategoryManager.tsx` with a table, and a dialog form for creating/editing categories (`title`, `price`, `duration`, `pass mark`, `isActive`).
- [x] **Category Manager Logic:** Implement full Firestore CRUD functionality for categories using `react-query` mutations.
- [x] **Test Assembly UI:** Build the UI in `JitestiTestManager.tsx`. It should feature a dropdown to select a category and a table to show associated questions.
- [x] **Test Assembly Logic:** Implement the logic to add/remove question IDs from a category's `questionIds` array in Firestore.
- [x] **Security Rules:** Write and deploy the complete `firestore.rules` for all new collections.
- [x] **Data Seeding:** Manually add a few sample categories and questions to the Firestore database to facilitate development.

### Phase 2: Core Driver Test Flow (No Payment)
*Purpose: To validate the entire test-taking experience with "free" tests.*

- [x] **Driver UI:** Create the `/jitesti` listing page (`TestCategories.tsx`) that fetches and displays all *active* categories from Firestore in a card layout.
- [x] **Payment Placeholder:** Create a confirmation page (`PaymentPage.tsx`) that shows test details. For this phase, a "Proceed" button will simulate a successful payment.
- [x] **Logic:** On "Proceed", create the `test_attempts` document with `status: 'started'` and redirect the user.
- [x] **Driver UI:** Build the timed test interface at `/jitesti/test/:testAttemptId`. It should display one question at a time, a progress indicator, and the countdown timer.
- [x] **Logic:** Fetch the test data and questions. Implement state management for the current question and user answers. The state should be resilient to page reloads.
- [x] **FIXED: Logic:** On test completion or auto-submission, calculate the score, update the `test_attempts` document with the score, answers, and `status: 'completed'`.
- [x] **Driver UI:** Build the results page at `/jitesti/test/:testAttemptId`, which shows the user their score, whether they passed, and a link back to the dashboard.
- [x] **Security Rules:** Refine and test the `test_attempts` rules to ensure they are robust.
- [x] **Testing:** QA the entire free test flow from category selection to viewing results.
    - **NOTE/FIX (Oct 27, 2023):** Initial testing revealed that questions were not loading on the `TestPage`. The root cause was a missing link between a `jitesti-category` and its questions. The `TestPage`'s logic correctly queries the `tests` collection to find a document whose `courseId` matches the category ID (e.g., "VIP"). This document must contain an array of `questionIds`.
    - **Solution:** The original seeding scripts only seeded questions into the `Test Question` collection without creating the essential linking document in the `tests` collection. A new, reusable script (`scripts/seedCategoryTest.cjs`) was created to fix this. This script reads a JSON file (e.g., `vip_seed_data.json`) and performs two critical actions: 1) It seeds the questions into the `Test Question` collection. 2) It creates a single document in the `tests` collection that contains the `courseId` and the corresponding array of `questionIds`, correctly establishing the relationship and fixing the data fetching issue.

### Phase 3: Payment Integration (Selcom)
*Purpose: To replace the payment simulation with a real payment gateway.*

- [ ] **Backend (Firebase Function):** If required by Selcom, create a Cloud Function to handle server-to-server callbacks for payment verification.
- [ ] **Payment Logic:** Update the `PaymentPage.tsx` to integrate the Selcom API.
- [ ] **Payment Flow:** On "Pay", initiate a payment request. The UI should show a pending state.
- [ ] **Verification:** Use the successful response from Selcom (or a webhook from the Firebase Function) to update the `payments` document status to `Completed` and add the `selcomTransactionId`.
- [ ] **Error Handling:** Implement robust error handling for failed payments, timeouts, or other gateway issues.
- [ ] **Security Rules:** Ensure `payments` and `test_attempts` rules are correctly interacting.
- [ ] **Testing:** Conduct end-to-end tests with sandbox/test credentials from Selcom.

### Phase 4: Certificate Generation & Finalization
*Purpose: To automatically generate and issue certificates for passed tests.*

- [ ] **Backend (Firebase Function):** Create a new Cloud Function triggered by the creation of a `test_attempts` document where `pass == true`.
- [ ] **PDF Generation:** Inside the function, use a library like `pdf-lib` or an external API to generate a PDF certificate with the driver's name, test category, and date.
- [ ] **Storage:** Save the generated PDF to a secure folder in Google Cloud Storage.
- [ ] **Logic:** Update the corresponding `certificates` document with the URL of the generated PDF.
- [ ] **Driver UI:** Create a new "My Certificates" section in the user's dashboard or profile to list their earned certificates.
- [ ] **UI Link:** On the test results page, if the user passed, show a prominent link to view or download their new certificate.
- [ ] **Final QA:** Perform a full regression test of the entire JiTesti module.
