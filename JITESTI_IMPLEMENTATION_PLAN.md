# JiTesti Online Testing Module: Implementation Plan

**Author:** Gemini AI
**Date:** October 26, 2023
**Status:** Core Functionality Complete. Awaiting Payment Integration and Certificate Generation.

---

## 1. Executive Summary

This document outlines a phased, risk-mitigated plan to implement the "JiTesti" online testing module for the Ajiriwa platform. The goal is to create a robust, secure, and user-friendly system for drivers to take paid online tests, view results, and earn certificates, while providing administrators with the tools to manage the entire process.

The implementation is divided into four distinct phases:

1.  **Admin Foundation & Data Seeding:** Build the backend management tools and security rules.
2.  **Core Driver Test Flow (No Payment):** Implement the end-to-end test-taking experience, simulating payment to focus on core logic.
3.  **Payment Integration (Selcom):** Integrate the Selcom payment gateway to handle real transactions.
4.  **Certificate Generation & Finalization:** Implement automated certificate creation and finalize the user flow.

This phased approach allows for incremental development, testing, and deployment, reducing risk and ensuring each component is solid before building upon it.

---

## 2. Data Models (Firestore)

We will create the following new collections in Firestore:

1.  **`jitesti-categories`**: Stores the metadata for each test category.
    *   `title`: (string) e.g., "Basic Road Signs"
    *   `description`: (string) A brief overview of the test.
    *   `price`: (number) Cost of the test in TZS.
    *   `durationInMinutes`: (number) Time allowed to complete the test.
    *   `passMark`: (number) The percentage required to pass (e.g., 80).
    *   `isActive`: (boolean) Determines if the category is visible to drivers.
    *   `questionIds`: (array of strings) An ordered list of question document IDs associated with this test. *This will be added in the Test Manager phase.*

2.  **`questions`**: A central bank of all questions.
    *   `text`: (string) The question itself.
    *   `options`: (array of strings) The possible answers.
    *   `correctAnswerIndex`: (number) The index of the correct answer in the `options` array.
    *   `topic`: (string, optional) e.g., "Road Signs", "Emergency Procedures"

3.  **`test_attempts`**: Tracks a user's specific attempt at a test.
    *   `userId`: (string) The UID of the driver taking the test.
    *   `categoryId`: (string) The ID of the `jitesti-categories` document.
    *   `paymentId`: (string) The ID of the corresponding `payments` document.
    *   `status`: (string) "not-started", "in-progress", "completed".
    *   `startedAt`: (timestamp)
    *   `completedAt`: (timestamp)
    *   `expiresAt`: (timestamp) `startedAt` + `durationInMinutes`.
    *   `answers`: (map) e.g., `{ "questionId1": 2, "questionId2": 0 }`
    *   `score`: (number) The final calculated score.
    *   `pass`: (boolean) Whether the score met the `passMark`.

4.  **`payments`**: Records payment transactions for audit and verification.
    *   `userId`: (string)
    *   `categoryId`: (string)
    *   `amount`: (number)
    *   `status`: (string) "Pending", "Completed", "Failed".
    *   `selcomTransactionId`: (string, optional) The unique ID from Selcom.
    *   `createdAt`: (timestamp)
    *   `updatedAt`: (timestamp)

5.  **`certificates`**: Stores information about earned certificates.
    *   `userId`: (string)
    *   `categoryId`: (string)
    *   `attemptId`: (string) The ID of the successful `test_attempts` document.
    *   `issuedAt`: (timestamp)
    *   `certificateUrl`: (string, optional) Link to a generated PDF in Cloud Storage.

---

## 3. Security (Firestore Rules)

Security is paramount. The `firestore.rules` file will be updated *before* any UI is built to enforce the following:

*   **Admins:** Have full CRUD (Create, Read, Update, Delete) access to `jitesti-categories` and `questions`.
*   **Drivers (Authenticated Users):**
    *   Can **read** active `jitesti-categories`.
    *   Can **create** a `payments` document with a "Pending" status.
    *   Can **update** their own `payments` document from "Pending" to "Completed" *only if* they provide a valid `selcomTransactionId` (this is a key security check).
    *   Can **create** a `test_attempts` document *only if* it's linked to a "Completed" payment.
    *   Can **update** their own `test_attempts` document *only while* the status is "in-progress" and the current time is before `expiresAt`.
    *   Can **read** their own `test_attempts` and `certificates`.
*   **Public/Unauthenticated:** No access.

This ensures that tests cannot be taken without a completed payment and cannot be tampered with after submission.

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
- [x] **Logic:** Implement the timer. On expiration, it must automatically submit the test.
- [x] **Logic:** On test completion or auto-submission, calculate the score, update the `test_attempts` document with the score, answers, and `status: 'completed'`.
- [x] **Driver UI:** Build the results page at `/jitesti/test/:testAttemptId`, which shows the user their score, whether they passed, and a link back to the dashboard.
- [x] **Security Rules:** Refine and test the `test_attempts` rules to ensure they are robust.
- [x] **Testing:** QA the entire free test flow from category selection to viewing results.

### Phase 3: Payment Integration (Selcom)
*Purpose: To replace the payment simulation with a real payment gateway.*

- [x] **Payment Placeholder:** The `PaymentPage.tsx` currently simulates a successful payment.
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

---

## 9. Known Risks & Mitigation Strategy

1.  **Payment Gateway Integration Complexity:**
    *   **Risk:** The Selcom API may have a complex integration process or poor documentation.
    *   **Mitigation:** Allocate dedicated time for research and integration in Phase 3. Develop a wrapper/service to isolate gateway code, making it easier to manage or even replace in the future. Start with the simplest possible API endpoint (e.g., hosted checkout) before attempting more complex integrations.

2.  **Test Cheating/Exploits:**
    *   **Risk:** Users could try to find ways to see test answers, tamper with scores, or extend timers.
    *   **Mitigation:** The Firestore rules are the primary defense. By never sending the `correctAnswerIndex` to the client during a test and making `test_attempts` documents immutable after completion, we significantly reduce this risk. The server-side timer enforcement (auto-submission) is also critical.

3.  **State Management on Test Page:**
    *   **Risk:** A user could lose their progress if they accidentally refresh the page during a test.
    *   **Mitigation:** Implement logic to save the `answers` map and `status` to Firestore on each answer selection. When the test page loads, it will check if an `in-progress` attempt exists and resume from the last saved state.

4.  **PDF Generation Performance:**
    *   **Risk:** On-the-fly PDF generation within a Firebase Function could be slow or resource-intensive, leading to timeouts.
    *   **Mitigation:** Use a simple, efficient PDF library. Design a clean, minimalist certificate template. If performance is still an issue, the function can trigger a longer-running process on Google Cloud Run.
