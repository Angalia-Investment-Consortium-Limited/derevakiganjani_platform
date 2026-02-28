# Elimika Module: Implementation Plan & Engineering Roadmap

**Document Version:** 1.0  
**Author:** Firebase Architect

---

## 1. Overview

This document provides a complete engineering roadmap for implementing the **Elimika (E-learning)** module on the Dereva Kiganjani Platform. The primary goal is to create a robust and scalable driver training platform using a serverless architecture centered on Firebase Authentication, Firestore, and Firebase Storage, with a strict constraint of **no Cloud Functions**.

### 1.1. Module Purpose

Elimika will provide drivers with access to a catalog of free and paid courses, including lessons, quizzes, and certificates. This enhances driver skills, improves safety, and creates a new revenue stream for the platform.

### 1.2. User Roles

1.  **Driver (Learner):** The end-user who enrolls in and consumes course content. They can browse courses, take lessons, complete quizzes, and earn certificates.
2.  **Admin:** The platform administrator responsible for managing all aspects of the Elimika module, including course creation, content management, enrollment monitoring, and certificate issuance.

---

## 2. Collections & Data Model

The implementation will adhere to the existing `firestore_schema.md`. One new collection is proposed to handle quizzes effectively.

### 2.1. Existing Collections to be Used

-   `users`: To identify the user and their role.
-   `admins`: To authorize admin users.
-   `driver_profiles`: To link enrollments to a specific driver.
-   `courses`: The main collection for course definitions.
-   `lessons`: For individual lesson content and metadata.
-   `course_enrollments`: To track a driver's progress in a course.
-   `payments`: To log and verify all transactions for paid courses.
-   `certificates`: To store records of issued certificates.

### 2.2. Proposed New Collection: `quizzes`

While the schema has a `tests` collection, a dedicated `quizzes` collection aligned with courses is cleaner. Embedding quizzes within `lessons` is not scalable as it complicates updates and reuse.

**Collection:** `quizzes`
**Document ID:** Auto-generated unique ID.

| Field | Type | Description |
| :--- | :--- | :--- |
| `courseId` | String | Foreign key to the `courses` collection. *(Indexed)* |
| `lessonId` | String | (Optional) Foreign key if the quiz is tied to a specific lesson. |
| `title_en` | String | The quiz title in English. |
| `title_sw` | String | The quiz title in Swahili. |
| `pass_mark` | Number | The minimum percentage score required to pass (e.g., 80). |
| `questions` | Array of Maps | An array containing the quiz questions and answers. |

**Example `questions` Array Element:**
```json
{
  "question_text_en": "What is the speed limit in a residential area?",
  "question_text_sw": "Kikomo cha kasi katika eneo la makazi ni nini?",
  "media_url": "gs://storage-bucket/quiz_images/speed_limit.jpg",
  "options": [
    { "id": "A", "text_en": "30 km/h", "text_sw": "30 km/h" },
    { "id": "B", "text_en": "50 km/h", "text_sw": "50 km/h" },
    { "id": "C", "text_en": "80 km/h", "text_sw": "80 km/h" }
  ],
  "correct_option_id": "B"
}
```

### 2.3. Proposed New Collection: `quiz_attempts`

To track user attempts per quiz.

**Collection:** `quiz_attempts`
**Document ID:** Auto-generated unique ID.

| Field | Type | Description |
| :--- | :--- | :--- |
| `quizId` | String | Foreign key to the `quizzes` collection. |
| `userId` | String | Foreign key to the `users` collection. *(Indexed)* |
| `enrollmentId` | String | Foreign key to the `course_enrollments` collection. *(Indexed)* |
| `started_at` | Timestamp | When the attempt began. |
| `completed_at` | Timestamp | When the attempt was submitted. |
| `score` | Number | The calculated score for the attempt. |
| `passed` | Boolean | Flag indicating if the pass mark was met. |
| `answers` | Map | A map of `question_id` to the selected `option_id`. |

---

## 3. Page-by-Page Requirements

### 3.1. Driver / Learner (Web + Mobile)

-   **Browse Courses Page:**
    -   Display a list of all courses where `is_active == 1`.
    -   Show `course_name`, `price` (or "Free"), and `course_category`.
    -   Implement client-side filters for: track, category, free/paid, level.
-   **Course Details Page:**
    -   Show all course details (`description`, `duration_hours`, etc.), rendering `_en` or `_sw` fields based on user's language preference.
    -   Display a list of lessons for the course.
    -   "Enroll" / "Start Learning" / "Continue Learning" button.
-   **Lesson Viewer Page:**
    -   Display lesson content (`text`, PDF viewer, embedded video, or image).
    -   Navigation to move between lessons (`lesson_order`).
    -   "Mark as Complete" button.
-   **Quiz Page:**
    -   Render quiz questions and MCQ options.
    -   Timer for timed quizzes.
    -   "Submit" button.
-   **My Learning / Dashboard Page:**
    -   List all enrolled courses with `progress_percentage`.
    -   Link to earned certificates.

### 3.2. Admin (Web Portal)

-   **Admin Dashboard:**
    -   High-level stats: total enrollments, completions, revenue.
-   **Courses Management Page:**
    -   CRUD interface for the `courses` collection.
-   **Lessons Management Page:**
    -   CRUD interface for `lessons`.
    -   Interface to upload PDF/image/video files to Firebase Storage.
-   **Quiz Management Page:**
    -   CRUD interface for the `quizzes` collection.
-   **Enrollments Monitoring Page:**
    -   View all `course_enrollments` documents.
    -   Filter by `courseId` or `driverId`.
-   **Certificate Management Page:**
    -   View all `certificates` documents.
    -   Manually trigger certificate generation or upload a pre-generated certificate.

### 3.3. Application Route Definitions (for Reference)

This section maps the planned pages to the React component route structure.

#### Driver Routes
```javascript
<Route path="/elimika" element={
    <ProtectedRoute>
        <CourseCatalog />
    </ProtectedRoute>
} />
<Route path="/elimika/course/:courseId" element={
    <ProtectedRoute>
        <CourseDetail />
    </ProtectedRoute>
} />
<Route path="/elimika/lesson/:lessonId" element={
    <ProtectedRoute>
        <LessonViewer />
    </ProtectedRoute>
} />
<Route path="/elimika/quiz/:courseId" element={
    <ProtectedRoute>
        <PracticeQuiz />
    </ProtectedRoute>
} />
<Route path="/elimika/completion/:courseId" element={
    <ProtectedRoute>
        <CourseCompletion />
    </ProtectedRoute>
} />
<Route path="/elimika/my-learning" element={
    <ProtectedRoute>
        <MyLearning />
    </ProtectedRoute>
} />
```

#### Admin Routes
```javascript
<Route path="/admin/courses" element={
    <AdminRoleBasedRoute>
        <CourseManager />
    </AdminRoleBasedRoute>
} />
<Route path="/admin/course/:courseId" element={
    <AdminRoleBasedRoute>
        <CourseEditor />
    </AdminRoleBasedRoute>
} />
<Route path="/admin/course/:courseId/lesson/:lessonId" element={
    <AdminRoleBasedRoute>
        <LessonBuilder />
    </AdminRoleBasedRoute>
} />
<Route path="/admin/course/:courseId/quiz" element={
    <AdminRoleBasedRoute>
        <QuizBuilder />
    </AdminRoleBasedRoute>
} />
<Route path="/admin/learners" element={
    <AdminRoleBasedRoute>
        <LearnerProgress />
    </AdminRoleBasedRoute>
} />
```

---

## 4. Technical Flows (Step-by-Step)

### 4.1. Driver Enrollment & Learning Flow

1.  **Browse:** Client fetches `courses` where `is_active == 1`.
2.  **Select Course:** User navigates to the details page for a specific `courseId`.
3.  **Enrollment Decision:**
    -   **If Free:** User clicks "Enroll". The client directly creates a new document in the `course_enrollments` collection with the user's `uid`, `courseId`, and `status: "In Progress"`.
    -   **If Paid:** User clicks "Pay & Enroll". This triggers the **Payment Flow (Section 7)**.
4.  **Start Learning:** After successful enrollment, the user is redirected to the first lesson.
5.  **View Lesson:** Client fetches `lessons` where `course == courseId`, ordered by `lesson_order`.
6.  **Update Progress:** On clicking "Mark as Complete", the client:
    -   Fetches the `course_enrollments` document.
    -   Increments `completed_lessons`.
    -   Recalculates and updates `progress_percentage`.
    -   Updates `last_accessed` to the current timestamp.
7.  **Take Quiz:** Client fetches the relevant `quiz` document and renders the questions.
8.  **Submit Quiz:** Client calculates the score. A new document is created in `quiz_attempts`. The result (pass/fail) is shown to the user.
9.  **Course Completion:** When `progress_percentage` reaches 100, the client updates the enrollment `status` to "Completed" and `completion_date` to now. It then triggers the **Certificate Flow**.

### 4.2. Certificate Generation Flow (No Functions)

**Constraint:** Cannot generate files on the backend. This requires a carefully chosen client-side or admin-led approach.

**Recommended Approach: Admin-Issued Certificates**
This is the most secure and reliable method without server-side logic.

1.  **Flag for Issuance:** When a driver completes a course, the client-side logic updates the `course_enrollments` document with `status: "Completed"`.
2.  **Admin Notification:** The admin portal will have a view showing all enrollments with a status of "Completed" but no `certificate_issued` value.
3.  **Admin Action:** An admin uses an internal tool (or a simple web-based certificate generator) to create the PDF certificate.
4.  **Upload & Link:** The admin uploads the generated PDF to a predefined path in Firebase Storage (e.g., `certificates/{userId}/{enrollmentId}.pdf`).
5.  **Create Record:** The admin then creates a new document in the `certificates` collection, filling in `driverId`, `courseId`, `issue_date`, and the `certificate_url` from the upload.
6.  **Update Enrollment:** The admin finally updates the original `course_enrollments` document, setting `certificate_issued` to the new certificate document ID.

**Alternative (Less Secure): Client-Side Generation**
-   **Method:** Use a library like `jsPDF` or `pdf-lib` to generate the PDF in the user's browser.
-   **Risk Analysis:**
    -   **High Risk of Forgery:** A technically savvy user can manipulate the client-side code to generate a certificate for a course they haven't completed or alter the details (e.g., name, date).
    -   **Inconsistent Output:** PDF generation can vary across browsers and devices.
    -   **Not Recommended for official documents.** This approach is only suitable for non-critical, informal certificates.

---

## 5. Firestore Read/Write Map

| Action | Page/Component | Firestore Reads | Firestore Writes |
| :--- | :--- | :--- | :--- |
| Browse courses | Course List | `courses` | - |
| View course details | Course Details | `courses`, `lessons` | - |
| Enroll (Free) | Course Details | - | `course_enrollments` (new doc) |
| Mark lesson complete | Lesson Viewer | `course_enrollments` (own) | `course_enrollments` (update) |
| Submit Quiz | Quiz Page | `quizzes` | `quiz_attempts` (new doc) |
| View progress | Dashboard | `course_enrollments` (own) | - |
| View certificates | Dashboard | `certificates` (own) | - |
| **Admin: Manage Course** | Admin Portal | - | `courses` (create/update) |
| **Admin: Manage Lesson** | Admin Portal | - | `lessons` (create/update) |
| **Admin: Issue Cert** | Admin Portal | `course_enrollments` | `certificates` (new doc), `course_enrollments` (update) |

---

## 6. Storage Plan

All user-facing files will be stored in a single Firebase Storage bucket with a clear path structure.

-   **Access Control:** Use Firebase Storage Security Rules.
    -   Public read for course/lesson content.
    -   Authenticated read for user-specific files (certificates).
    -   Admin-only write access.

-   **Folder Structure:**
    -   `courses/{courseId}/images/{imageName.jpg}` - Course promotional images.
    -   `lessons/{lessonId}/media/{fileName.pdf}` - Lesson materials (PDFs, images).
    -   `quizzes/{quizId}/media/{fileName.jpg}` - Images/videos for quiz questions.
    -   `certificates/{userId}/{certificateId}.pdf` - Issued certificates. **Restricted access.**

---

## 7. Payment Integration Plan (Selcom - No Functions)

This flow is critical and must be designed to prevent users from bypassing payment.

### 7.1. Technical Flow

1.  **Initiate Payment:**
    -   User clicks "Pay & Enroll" for a paid course.
    -   The client creates a **new document** in the `payments` collection.
    -   **Crucially, this document ID will be our internal `order_id`**.
    -   *Example `payments` document:*
        ```json
        // Document ID: client-generated-uuid-12345
        {
          "userId": "driver-uid-abc",
          "service": "Elimika",
          "amount": 5000,
          "referenceId": "COURSE-001", // The course they are buying
          "status": "PENDING",
          "provider": "Selcom",
          "timestamp": serverTimestamp()
        }
        ```
2.  **Create Selcom Order:**
    -   The client now calls the Selcom `create-order-minimal` API endpoint.
    -   **Security:** This requires exposing the Selcom API key on the client. **This is a major security risk.**
    -   **Mitigation:** The recommended best practice is to proxy this request through a secure server endpoint (like a Cloud Function). Since that is not an option, we must rely on Selcom's security features (e.g., IP whitelisting, transaction signing if available) and accept the risk. The API keys must be stored in a secure, environment-specific configuration file and not hardcoded.
    -   The `order_id` sent to Selcom **MUST** be the Firestore document ID from Step 1.
3.  **Redirect to Gateway:**
    -   The client receives a payment gateway URL or token from Selcom and redirects the user to complete the payment.
4.  **Verify Payment (Polling):**
    -   After the user is redirected back to the app, the client must verify the payment status.
    -   The client starts a **polling mechanism**, calling the Selcom `/order-status/{order_id}` endpoint every 5-10 seconds for a limited duration (e.g., 2 minutes).
    -   The `order_id` used here is the Firestore document ID.
5.  **Handle Statuses:**
    -   **`COMPLETED`:** The polling stops. The client updates the Firestore `payments` document status to "COMPLETED". The client then proceeds to create the `course_enrollments` document.
    -   **`PENDING` / `INPROGRESS`:** The polling continues.
    -   **`FAILED`:** The polling stops. The client updates the `payments` doc to "FAILED" and shows the user an error message.
    -   **`AMBIGUOUS`:** Treat as `PENDING` and continue polling for a short time before timing out.

### 7.2. Preventing Bypass

The `course_enrollments` document is the "source of truth" for access. It is **only created after** the client has successfully verified a `COMPLETED` payment status from Selcom and written that status to our `payments` collection. Security rules will prevent a user from creating an enrollment for a paid course without a corresponding completed payment.

### 7.3. Idempotency & Refresh Handling

-   **Idempotency:** When the user lands on the payment page, the client first checks if there is already a `payments` document for that `userId` and `courseId` with a `PENDING` status. If so, it reuses that `order_id` instead of creating a new one.
-   **Refresh Handling:** If the user refreshes the page during polling, the logic restarts: it checks the `payments` document's status. If still `PENDING`, it resumes polling the Selcom endpoint.

---

## 8. Security Rules Plan

This logic is the primary enforcement mechanism without backend code.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Admins can do anything
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Courses are readable by anyone, writable only by admins
    match /courses/{courseId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Lessons are readable by enrolled users, writable by admins
    match /lessons/{lessonId} {
      allow read: if exists(/databases/$(database)/documents/course_enrollments/{enrollmentId}) && get(/databases/$(database)/documents/course_enrollments/{enrollmentId}).data.driverId == request.auth.uid;
      allow write: if isAdmin();
    }

    // Users can create/update their own enrollments, but with conditions
    match /course_enrollments/{enrollmentId} {
      allow read: if resource.data.driverId == request.auth.uid || isAdmin();
      
      // Allow create only for free courses OR if a completed payment exists
      allow create: if (request.resource.data.driverId == request.auth.uid && 
                      (get(/databases/$(database)/documents/courses/$(request.resource.data.courseId)).data.is_free == 1 ||
                       exists(/databases/$(database)/documents/payments/{paymentId}) && get(/databases/$(database)/documents/payments/{paymentId}).data.userId == request.auth.uid && get(/databases/$(database)/documents/payments/{paymentId}).data.status == 'COMPLETED')));

      // Allow update only by the user on their own progress fields
      allow update: if resource.data.driverId == request.auth.uid && request.resource.data.keys().hasOnly(['completed_lessons', 'progress_percentage', 'last_accessed', 'status']);
    }

    // Users can only create payments for themselves
    match /payments/{paymentId} {
      allow read: if resource.data.userId == request.auth.uid || isAdmin();
      allow create: if request.resource.data.userId == request.auth.uid;
      // IMPORTANT: Do NOT allow users to update payment status
      allow update: if isAdmin(); 
    }

    // Certificates are read-only for the owner
    match /certificates/{certificateId} {
      allow read: if resource.data.driverId == request.auth.uid || isAdmin();
      allow write: if isAdmin();
    }
    
    // Quizzes are readable, but not writable by drivers
    match /quizzes/{quizId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Users can create their own quiz attempts
    match /quiz_attempts/{attemptId} {
        allow read: if resource.data.userId == request.auth.uid || isAdmin();
        allow create: if request.resource.data.userId == request.auth.uid;
        allow update: if false; // No updates allowed
    }
  }
}
```

---

## 9. Edge Cases & Failure Handling

-   **Network Loss during Payment:** The polling mechanism will handle this. When connectivity is restored, the app checks the `payments` document and resumes polling if the status is still `PENDING`.
-   **User Closes App Before Verification:** Same as above. On next app open, a background check can look for pending payments and complete the enrollment if the payment went through.
-   **Selcom API Downtime:** The client should implement proper error handling with user-friendly messages and perhaps a "retry" button for API calls.

---

## 10. Implementation Phases & Milestones

**Phase 1: Foundation & Course Catalog (Target: 2 Weeks)**
-   Goal: Admins can create courses/lessons; Drivers can browse them.

**Phase 2: Free Enrollment & Learning (Target: 2 Weeks)**
-   Goal: Drivers can enroll in free courses, view content, and have their progress tracked.

**Phase 3: Paid Enrollment via Selcom (Target: 3 Weeks)**
-   Goal: Fully implement the client-side Selcom payment and verification flow.

**Phase 4: Quizzes & Completion (Target: 2 Weeks)**
-   Goal: Implement the quiz engine and attempt tracking.

**Phase 5: Certificate Management (Target: 1 Week)**
-   Goal: Implement the admin-led certificate issuance process.

---

## 11. Progress Tracker Checklists

### Phase 1 – Foundation & Course Catalog
-   [ ] **Admin:** Build UI for Course CRUD.
-   [ ] **Admin:** Build UI for Lesson CRUD (including media uploads).
-   [ ] **Driver:** Build UI to fetch and display active courses from Firestore.
-   [ ] **Driver:** Implement client-side filters (track, level, free/paid).
-   [ ] **Driver:** Build Course Details page.
-   [ ] **Shared:** Implement bilingual rendering based on language selection.

### Phase 2 – Free Enrollment & Learning
-   [ ] **Driver:** Implement "Enroll" logic for free courses.
-   [ ] **Driver:** Create `course_enrollments` document on enrollment.
-   [ ] **Driver:** Build Lesson Viewer to render all content types (text, PDF, video, image).
-   [ ] **Driver:** Implement "Mark as Complete" logic to update `course_enrollments`.
-   [ ] **Driver:** Display progress on "My Learning" dashboard.

### Phase 3 – Paid Enrollment via Selcom
-   [ ] **Client:** Create `payments` document with `PENDING` status.
-   [ ] **Client:** Integrate Selcom `create-order-minimal` API call.
-   [ ] **Client:** Implement secure handling of Selcom API keys.
-   [ ] **Client:** Implement redirect/display of payment gateway.
-   [ ] **Client:** Build client-side polling mechanism for Selcom `/order-status`.
-   [ ] **Client:** Logic to update `payments` doc status based on polling result.
-   [ ] **Client:** Logic to create `course_enrollments` doc ONLY after payment is `COMPLETED`.
-   [ ] **Firestore:** Deploy Security Rules to prevent enrollment bypass.

### Phase 4 – Quizzes & Completion
-   [ ] **Data Model:** Create `quizzes` and `quiz_attempts` collections.
-   [ ] **Admin:** Build UI for Quiz & Question CRUD.
-   [ ] **Driver:** Build UI to render a quiz from Firestore data.
-   [ ] **Driver:** Implement logic to submit a quiz, calculate score, and store in `quiz_attempts`.
-   [ ] **Driver:** Implement logic to check for 100% course completion.

### Phase 5 – Certificate Management
-   [ ] **Admin:** Build UI to view enrollments awaiting certification.
-   [ ] **Admin:** Build UI to upload a PDF to Storage and create a `certificates` document.
-   [ ] **Admin:** Link the certificate back to the `course_enrollments` document.
-   [ ] **Driver:** Build UI for users to view and download their earned certificates.

---

## 12. Testing / QA Checklist

-   **Enrollment:**
    -   [ ] Verify a user can enroll in a free course.
    -   [ ] Verify a user CANNOT enroll in a paid course without paying.
    -   [ ] Test payment flow: successful payment leads to enrollment.
    -   [ ] Test payment flow: failed payment does NOT lead to enrollment.
    -   [ ] Test payment flow: close and reopen app during payment; check if state is recovered.
-   **Learning:**
    -   [ ] Verify progress percentage updates correctly.
    -   [ ] Verify all lesson content types render correctly on Web and Mobile.
-   **Security:**
    -   [ ] Attempt to bypass security rules (e.g., create enrollment for paid course via console).
    -   [ ] Verify users can only update their own progress.
    -   [ ] Verify admins can edit courses, but drivers cannot.
-   **Admin:**
    -   [ ] Verify all CRUD operations for courses, lessons, and quizzes work as expected.
    -   [ ] Verify the certificate issuance flow is smooth.

---

## 13. Risks & Mitigations

1.  **Selcom API Key Exposure on Client**
    -   **Risk:** High. A malicious actor could decompile the client application and extract the API keys, potentially leading to fraudulent API calls.
    -   **Mitigation:**
        -   **Strictly enforce IP whitelisting** on the Selcom merchant portal to only allow requests from your known infrastructure (if applicable for client-side calls).
        -   If Selcom supports it, use **transaction signing** where a unique signature is generated for each request, making stolen keys less useful.
        -   Obfuscate the client-side code to make reverse-engineering harder.
        -   **Long-term:** The only truly secure solution is to introduce a trusted server environment (like a Cloud Function) to proxy these calls. This plan proceeds under the "no functions" constraint but this risk must be formally accepted.

2.  **Insecure Certificate Generation**
    -   **Risk:** Medium. If client-side generation is chosen, certificates can be easily forged.
    -   **Mitigation:** The plan recommends **Admin-Issued Certificates**, which completely mitigates this risk by making generation a trusted, manual process.

3.  **Client-Side Business Logic Complexity**
    -   **Risk:** Medium. The payment verification, polling, and progress tracking logic is complex to manage on the client, potentially leading to bugs.
    -   **Mitigation:**
        -   Implement robust state management (e.g., Redux, MobX, or provider models).
        -   Write comprehensive unit and integration tests for this logic.
        -   Use background tasks to handle state recovery when the app is reopened.
