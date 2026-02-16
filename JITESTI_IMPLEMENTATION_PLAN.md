# Production Implementation Plan: JiTesti Module

**Document Version:** 1.2  
**Date:** 2024-07-26  
**Author:** Gemini (Senior Firebase Systems Architect)  
**Status:** Approved for Implementation  

---

## 1. System Overview

The **JiTesti (Test Yourself)** module is a core component of the Dereva Kiganjani platform. It provides drivers with a way to take practice and certification tests to improve their skills and credentials.

This implementation plan details the architecture and step-by-step roadmap for building the JiTesti module on a **Firestore-only backend**, without the use of Firebase Cloud Functions. All business logic, including payment verification and test administration, will be handled client-side with security enforced by robust Firestore Security Rules.

**Architectural Cornerstones:**
-   **Serverless & Client-Heavy:** The client application (React) holds the responsibility for business logic.
-   **Security First:** Firestore Security Rules are the primary mechanism for protecting data integrity and preventing unauthorized access.
-   **Payment via Polling:** Integration with the Selcom payment gateway is achieved through a client-side redirect and polling model, forgoing webhooks.

---

## 2. Firestore Collections Used

This module will primarily interact with the following collections, as defined in `firestore_Schema.md`.

| Collection           | Purpose                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `users`              | Stores user role (`driver`, `admin`). Used in security rules to grant access.                             |
| `driver_profiles`    | Stores driver-specific data.                                                                            |
| `jitesti-categories` | (Admin-managed) Stores test categories, including metadata like `title`, `price`, `duration`, and `passMark`. |
| `tests`              | (Admin-managed) Defines a test by linking a `jitesti-category` to a list of `questionIds`.                |
| `questions`          | (Admin-managed) A global pool of questions, each with `questionText`, `options`, and `correctAnswerIndex`.|
| `payments`           | Records every payment attempt. `status` field (`Pending`, `Completed`, `Failed`) is critical for access control. |
| **`test_attempts`**    | **(New)** Records each instance of a driver taking a test. This is the central collection for the driver flow. |
| `certificates`       | Stores references to certificates issued upon passing a test.                                           |

### Required New Collection: `test_attempts`

To track a driver's journey through a test, a new collection is required.

**Collection Path:** `/test_attempts/{attemptId}`

**Schema:**
```javascript
{
  "userId": "string", // UID of the driver
  "categoryId": "string", // ID from jitesti-categories
  "testId": "string", // ID from tests collection
  "paymentId": "string", // Reference to the payment document
  "status": "string", // "not-started" | "in-progress" | "completed"
  "startedAt": "timestamp", // Set when the test begins
  "completedAt": "timestamp", // Set when the test is submitted
  "expiresAt": "timestamp", // calculated as startedAt + category.duration
  "answers": [
    { "questionId": "string", "selectedOption": "number" }
  ],
  "score": "number", // Calculated and set client-side on completion
  "pass": "boolean", // Determined client-side based on passMark
  "certificateId": "string" // (Optional) Reference to the certificate if passed
}
```

---

## 3. Driver Flow (Step-by-Step)

This outlines the user journey from selecting a test to receiving a certificate.

1.  **View Categories:** Driver navigates to the JiTesti page. The client fetches and displays all documents from `jitesti-categories` where `isActive == true`.
2.  **Select Category:** Driver chooses a test category. The client displays details like `price`, `duration`, and a "Start Test" button.
3.  **Initiate Payment (if not free):**
    *   Client creates a document in `/payments` with `status: 'Pending'`, `userId`, `amount`, and `relatedId: categoryId`.
    *   Client calls the Selcom API to create an order, then redirects the user to the Selcom payment page.
4.  **Verify Payment:**
    *   Upon returning from Selcom, the client polls the Selcom `order-status` endpoint.
    *   If the order is `COMPLETED`, the client updates the corresponding `/payments/{paymentId}` document, setting `status: 'Completed'`.
5.  **Start Test:**
    *   The "Start Test" button is now enabled.
    *   Client queries `test_attempts` for any `in-progress` attempts for this `categoryId` and `userId` to prevent concurrent sessions.
    *   Client creates a new document in `test_attempts` with `status: 'not-started'` and the `paymentId`.
    *   Client fetches the `test` document associated with the `categoryId` and then fetches all `questions` using the `questionIds` array. **The correct answers are NOT sent to the client.**
    *   Client updates the `test_attempts` document, setting `status: 'in-progress'`, `startedAt`, and `expiresAt`. The test interface loads.
6.  **Take Test:**
    *   The client displays one question at a time and starts a countdown timer based on `expiresAt`.
    *   As the driver answers, the selections are stored in the client's state.
    *   On page refresh, the client re-fetches the `test_attempt` document. If `status` is `in-progress` and not expired, the test resumes from the saved state.
7.  **Submit Test:**
    *   **Auto-submission:** If the timer reaches zero, the client automatically triggers the submission logic.
    *   **Manual Submission:** The driver clicks "Submit".
    *   The client sends the collected `answers` to be stored in the `/test_attempts/{attemptId}` document.
8.  **Calculate Score & Finalize:**
    *   After writing the answers, the client fetches the `questions` again, this time including the `correctAnswerIndex`.
    *   It compares the user's `answers` with the correct answers to calculate the `score`.
    *   It updates the `test_attempts` document with the `score`, `pass` status (score >= passMark), `completedAt`, and sets `status: 'completed'`. Security rules will lock this document from further writes.
9.  **Issue Certificate (If Passed):**
    *   If `pass == true`, the client generates a certificate (e.g., using a client-side library like `pdf-lib`).
    *   The PDF is uploaded to Firebase Storage at a path like `/certificates/{userId}/{attemptId}.pdf`.
    *   A new document is created in the `certificates` collection containing the `userId`, `categoryId`, `issuedAt`, and `storagePath`.
    *   The `test_attempts` document is updated with the new `certificateId`.
10. **View Results:** The driver is redirected to a results page showing their score, pass/fail status, and a link to download the certificate if applicable.

---

## 4. Admin Flow (Step-by-Step)

1.  **Manage Categories (`/admin/jitesti/categories`):**
    *   CRUD interface for `jitesti-categories`.
    *   Fields: `title`, `description`, `price`, `durationInMinutes`, `passMark` (percentage), `isActive` (boolean).
2.  **Manage Questions (`/admin/questions`):**
    *   Utilize the existing CRUD interface for `questions`.
    *   Fields: `questionText`, `options` (array of strings), `correctAnswerIndex` (number), `explanation` (optional).
    *   Ability to tag questions by subject for easier filtering.
3.  **Assemble Tests (`/admin/jitesti/tests`):**
    *   CRUD interface for `tests`.
    *   Admin selects a `jitesti-category`.
    *   Admin uses a multi-select UI to add `questionIds` from the `questions` collection to this test.
    *   A test document links a category to a specific set of questions. This allows questions to be updated without affecting historical test attempts.
4.  **Monitor Attempts (`/admin/jitesti/attempts`):**
    *   A dashboard to view all documents in the `test_attempts` collection.
    *   Filter by `driver`, `category`, `pass/fail` status, and date range.
    *   Ability to view a driver's specific answers for a given attempt.
    *   Export functionality (e.g., to CSV) for performance analysis.

---

## 5. Payment Flow (Selcom - No Cloud Functions)

This flow is designed to be secure without a backend webhook validator, relying on Firestore rules and client-side polling.

**Diagrammatic Explanation:**

```
(Client)                          (Firestore)                         (Selcom)
   |                                  |                                  |
1. Create Payment Doc ---------------> payments/{id} (status: Pending)    |
   |                                  |                                  |
2. Create Order ---------------------------------------------------------> Selcom API
   |                                                                     |
3. Redirect User -------------------------------------------------------> Selcom Page
   |                                                                     |
   <---------------------------------------------------------------------- User Pays
   |
4. User Returns to App
   |
5. Poll Order Status ---------------------------------------------------> Selcom API
   | (loop until conclusive)                                             |
   |                                                                     |
6. Receive 'COMPLETED'                                                   |
   |                                                                     |
7. Update Payment Doc ---------------> payments/{id} (status: Completed)  |
   |                                  |                                  |
8. Read Payment Status <--------------- (status: Completed)                |
   |                                  |
9. Grant Access to Test               |
```

**Security & Integrity:**
-   **Preventing Fake Completion:** Firestore security rules will prevent the client from writing `status: 'Completed'` to the payment document directly. The rule will only allow this transition if a `selcomTransactionId` (retrieved from a successful poll) is also included in the write. The client can only get this ID from Selcom.
-   **Preventing Price Tampering:** The `amount` in the `/payments/{paymentId}` document is written by the client. The security rule for creating a `test_attempt` will read both the `payment` document and the `jitesti-category` document, ensuring `payment.amount >= category.price`.
-   **Handling Refresh:** If the user refreshes after returning from Selcom, the app's entry point should check the URL for Selcom's transaction parameters, retrieve the associated payment document from Firestore, and resume the polling process.

---

## 6. Security Rules Plan

The following rules are critical for protecting the JiTesti module.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check for Admin role
    function isAdmin() {
      return exists(/admins/$(request.auth.uid));
    }

    // Drivers can read categories, Admins can do anything
    match /jitesti-categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Drivers can't read tests directly (prevents fetching answers), Admins can manage
    match /tests/{testId} {
      allow read, write: if isAdmin();
    }

    // Drivers can't read question answers directly, Admins can manage
    match /questions/{questionId} {
      allow write: if isAdmin();
      // Allow reading only the question text and options, not the answer
      allow read: if request.auth != null && !("correctAnswerIndex" in resource.data);
    }

    // Rules for creating and managing payments
    match /payments/{paymentId} {
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
      // Allow creation with 'Pending' status
      allow create: if request.auth.uid == request.resource.data.userId
                      && request.resource.data.status == 'Pending';
      // Allow update to 'Completed' ONLY if a selcom transaction ID is provided
      // This is our primary webhook-less security check.
      allow update: if request.auth.uid == resource.data.userId
                      && resource.data.status == 'Pending'
                      && request.resource.data.status == 'Completed'
                      && request.resource.data.selcomTransactionId != null;
    }

    // The core rules for test attempts
    match /test_attempts/{attemptId} {
      allow read: if request.auth.uid == resource.data.userId || isAdmin();

      // Allow creation if linked to a COMPLETED payment
      allow create: if request.auth.uid == request.resource.data.userId
                      && request.resource.data.status == 'not-started'
                      && get(/databases/$(database)/documents/payments/$(request.resource.data.paymentId)).data.status == 'Completed';
      
      // Allow updates only while 'in-progress' and before expiry
      allow update: if request.auth.uid == resource.data.userId
                      && resource.data.status == 'in-progress'
                      && request.time < resource.data.expiresAt
                      // Prevent changing immutable fields
                      && request.resource.data.userId == resource.data.userId
                      && request.resource.data.testId == resource.data.testId
                      // Score can only be written once when moving to 'completed'
                      && (request.resource.data.score == null || resource.data.score == null);

      // Prevent any further modification once completed
      allow update: if false; 
    }

    // Certificate access rules
    match /certificates/{certId} {
      allow read: if request.auth.uid == resource.data.userId || isAdmin();
      // Certificates are created by the client, but only if the linked test_attempt was passed
      allow create: if request.auth.uid == request.resource.data.userId
                      && get(/databases/$(database)/documents/test_attempts/$(request.resource.data.attemptId)).data.pass == true;
    }
  }
}
```

---

## 7. UI Pages Checklist (Audited & Finalized)

**Driver-Facing:**
- [ ] **`/jitesti`** (Existing) - Test Categories Listing Page (`TestCategories.tsx`)
- [ ] **`/jitesti/payment/:categoryCode`** (Existing) - Payment Page (`PaymentPage.tsx`)
- [ ] **`/jitesti/test/:categoryCode`** (Existing) - Pre-test checks, attempt creation, and redirect (`TestTaking.tsx`)
- [ ] **`/jitesti/session/:attemptId`** (New) - The timed test interface (`TestSession.tsx`)
- [ ] **`/jitesti/results/:attemptId`** (New) - Results page showing score and certificate link (`TestResult.tsx`)
- [ ] **`/profile/certificates`** (New) - Page listing all earned certificates (`MyCertificates.tsx`)

**Admin-Facing:**
- [ ] **`/admin/jitesti/categories`** (New) - CRUD for Test Categories (`JitestiCategoryManager.tsx`)
- [ ] **`/admin/jitesti/tests`** (New) - Assemble tests from questions (`JitestiTestManager.tsx`)
- [ ] **`/admin/questions`** (Leverage Existing) - CRUD for Questions (`QuestionBankManager.tsx`)
- [ ] **`/admin/jitesti/attempts`** (New) - View and Filter Test Attempts (`JitestiAttemptMonitor.tsx`)

---

## 8. Testing & QA Checklist

-   **Payment Flow:**
    -   [ ] Verify test access is denied if payment is `Pending` or `Failed`.
    -   [ ] Verify test access is granted immediately after `Completed` status is polled.
    -   [ ] Test price tamper-proofing security rule.
    -   [ ] Test manual payment status update is blocked by security rules.
    -   [ ] Test payment flow with page refresh after Selcom redirect.
-   **Test Session:**
    -   [ ] Verify timer starts correctly based on `durationInMinutes`.
    -   [ ] Verify test auto-submits when timer expires.
    -   [ ] Verify page refresh resumes test from last known state without resetting timer.
    -   [ ] Verify network disconnect and reconnect allows test to continue if time remains.
    -   [ ] Verify double-submission is prevented.
    -   [ ] Verify security rules prevent updating a completed attempt.
-   **Scoring & Certification:**
    -   [ ] Verify score calculation is accurate.
    -   [ ] Verify `pass` status is set correctly based on `passMark`.
    -   [ ] Verify certificate is generated and stored only on passing.
    -   [ ] Verify certificate download link works.
-   **Admin:**
    -   [ ] Verify all admin CRUD operations work as expected.
    -   [ ] Verify admin can view but not alter a user's test attempt.
    -   [ ] Verify data filtering and export works.

---

## 9. Known Risks & Mitigation Strategy

| Risk                                     | Severity | Mitigation Strategy                                                                                                                                                                                                            |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cheating (Client-Side Scoring)**       | High     | While unavoidable without a server, we will obfuscate the code that fetches answers and calculates the score. **Acceptance Criteria:** Acknowledge this is a "best-effort" for an MVP. A future version will use Cloud Functions for scoring. |
| **Selcom API Downtime**                  | Medium   | Implement robust error handling on the client-side. If the `order-status` endpoint is down, display a clear message to the user asking them to try again later and that their payment will be processed.                 |
| **Inaccurate Client-Side Timers**        | Medium   | The authoritative timer is the `expiresAt` timestamp in Firestore. The client-side timer is for UI only. Security rules will reject any submission sent after `expiresAt`, preventing extra time exploits.         |
| **Race Conditions (e.g., double payment)** | Low      | Structure the UI to disable the "Pay" button immediately after the first click. Firestore's atomic writes will prevent duplicate document creation with the same ID, but client-side controls are the first line of defense. |

---

## 10. Phase-by-Phase Implementation Plan & Progress Tracking

### Phase 0: Route Planning & Audit
*Purpose: To ensure new routes are consistent with the existing application structure and avoid conflicts.*
- [x] **Audit Routes:** Carefully review `src/App.tsx` to identify and list all existing routes.
- [x] **Finalize Routes:** Based on the audit, confirm the final URL structure for all new Driver and Admin UI pages listed in section 7.
- [x] **Update Plan:** Update the UI Pages Checklist in this document with the finalized, conflict-free routes.

### Phase 1: Admin Foundation & Data Seeding
*Purpose: To enable content managers to populate the tests before releasing to drivers.*
- [ ] **Data Models:** Finalize TypeScript types for all new and existing collections.
- [ ] **Admin UI:** Build the CRUD interface for `jitesti-categories` at `/admin/jitesti/categories`.
- [ ] **Admin UI:** Build the UI for assembling `tests` from questions at `/admin/jitesti/tests`.
- [ ] **Firebase:** Deploy initial, restrictive security rules for admin-only access.

### Phase 2: Core Driver Test Flow (No Payment)
*Purpose: To validate the entire test-taking experience with "free" tests.*
- [ ] **Driver UI:** Enhance the existing `/jitesti` listing page.
- [ ] **Logic:** Implement test creation and redirect logic in `/jitesti/test/:categoryCode`.
- [ ] **Driver UI:** Build the timed test interface at `/jitesti/session/:attemptId`.
- [ ] **Logic:** Implement test state management (resume on refresh).
- [ ] **Logic:** Implement timer and auto-submission.
- [ ] **Logic:** Implement client-side scoring and result finalization.
- [ ] **Driver UI:** Build the results page at `/jitesti/results/:attemptId`.
- [ ] **Security Rules:** Implement the full `test_attempts` rule set.
- [ ] **Testing:** QA the entire free test flow from start to finish.

### Phase 3: Selcom Payment Integration
*Purpose: To gate access to paid tests via the Selcom client-side polling flow.*
- [ ] **Payment Logic:** Enhance the existing `/jitesti/payment/:categoryCode` page to handle the full Selcom flow.
- [ ] **Payment Logic:** Build the post-payment polling mechanism to check `order-status`.
- [ ] **UI:** Connect payment status to enable the test entrypoint.
- [ ] **Security Rules:** Implement and test the `payments` rules, including the transaction ID check.
- [ ] **Security Rules:** Test the rule that cross-references payment status before creating a `test_attempt`.

### Phase 4: Certification & Finalization
*Purpose: To handle the post-test rewards and reporting.*
- [ ] **Certificate Logic:** Implement client-side PDF generation for certificates.
- [ ] **Certificate Logic:** Implement file upload to Firebase Storage.
- [ ] **Certificate Logic:** Implement creation of `certificates` document in Firestore.
- [ ] **Driver UI:** Build the `/profile/certificates` page to list all earned certificates.
- [ ] **Admin UI:** Build the `test_attempts` monitoring dashboard at `/admin/jitesti/attempts`.

### Phase 5: Deployment & Go-Live
*Purpose: Final checks and release.*
- [ ] **QA:** Complete the full Testing & QA checklist.
- [ ] **Documentation:** Ensure all code is commented and pull requests are descriptive.
- [ ] **Monitoring:** Set up basic Firestore read/write monitoring in the Firebase console.
- [ ] **Deployment:** Deploy to production.
- [ ] **Post-Launch:** Monitor for errors and user feedback for 1-2 weeks.
