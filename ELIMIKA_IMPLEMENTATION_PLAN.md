# ELIMIKA Engineering Implementation Plan

**Project:** Dereva Kiganjani Platform (MDV Vehicle Fleet Limited)
**Module:** ELIMIKA (E-learning / Driver Training)

## 1. Overview

This document outlines the engineering roadmap for implementing the **ELIMIKA** module, an e-learning platform for driver training within the Dereva Kiganjani ecosystem. The plan is designed to work within the strict backend constraint of using **Firebase Authentication, Firestore, and Firebase Storage ONLY**, with no reliance on Firebase Cloud Functions.

### User Roles

-   **Driver (Learner):** End-user who enrolls in courses, consumes content, takes quizzes, and earns certificates.
-   **Admin:** Manages all aspects of the e-learning module, including courses, lessons, enrollments, and payments.

---

## 2. Collections & Data Model

The implementation will leverage the existing Firestore schema. One new collection is proposed to manage quizzes effectively.

### Existing Collections (from `firestore_schema.md`)

-   `users`: Core user data.
-   `driver_profiles`: Driver-specific information.
-   `courses`: Course catalog.
-   `lessons`: Individual lesson content.
-   `course_enrollments`: Tracks driver progress.
-   `certificates`: Stores issued certificate records.
-   `payments`: Logs all Selcom transactions.
-   `admins`: Admin user profiles.

### Proposed New Collection: `quizzes`

To keep the data model clean and scalable, we propose a new `quizzes` collection instead of embedding quizzes within lessons.

**Collection:** `quizzes`
**Document ID:** Auto-generated ID

| Field | Type | Description |
| :--- | :--- | :--- |
| `courseId` | String | Foreign key to the `courses` collection. |
| `lessonId` | String | (Optional) Foreign key to a `lessons` doc if the quiz is lesson-specific. |
| `title_en` | String | Quiz title in English. |
| `title_sw` | String | Quiz title in Swahili. |
| `questions` | Array | An array of question objects. |
| `pass_mark` | Number | The percentage required to pass (e.g., 80). |
| `createdAt` | Timestamp | Timestamp of creation. |

**Example `question` object in the `questions` array:**

```json
{
  "question_text_en": "What is the speed limit in a residential area?",
  "question_text_sw": "Kasi ya ukomo katika eneo la makazi ni ipi?",
  "media_url": "gs://your-bucket/quizzes/images/residential_speed_sign.png",
  "options": [
    { "key": "A", "text_en": "30 km/h", "text_sw": "30 km/h" },
    { "key": "B", "text_en": "50 km/h", "text_sw": "50 km/h" },
    { "key": "C", "text_en": "80 km/h", "text_sw": "80 km/h" }
  ],
  "correct_option_key": "A"
}
```

### New Collection: `quiz_attempts`
This collection will store the results of each quiz attempt.

**Collection:** `quiz_attempts`
**Document ID:** Auto-generated ID

| Field | Type | Description |
| :--- | :--- | :--- |
| `quizId` | String | Foreign key to the `quizzes` collection. |
| `driverId`| String | The ID of the driver who took the quiz. |
| `courseId`| String | The ID of the course. |
| `score` | Number | The user's score on the test.|
| `status` | String | The status of the test attempt (e.g., "passed", "failed"). |
| `startedAt`| Timestamp | The time the user started the test. |
| `completedAt` | Timestamp | The time the user completed the test. |
| `answers` | Map | A map of the user's answers. |

---

## 3. Page-by-Page Requirements

### Driver Web/Mobile

-   **Course Catalog:** View all `is_active` courses. Filter by `course_track`, `is_free`, `level`. Display bilingual titles and thumbnails.
-   **Course Detail:** Show full course info (`description_en`/`sw`, `price`, `duration_hours`). Display a prominent "Enroll" or "Buy Now" button.
-   **Lesson Viewer:** Render lesson content based on `content_type` (Text, PDF, Video, Image). Navigate between lessons in `lesson_order`.
-   **Quiz Page:** Present MCQ questions from the `quizzes` collection. Submit answers and show immediate results.
-   **My Learning:** List all enrolled courses from `course_enrollments`. Show progress and last accessed date.
-   **Certificate Viewer:** View and download generated certificates.

### Admin Portal

-   **Dashboard:** High-level stats on enrollments, completions, and revenue.
-   **Course Management:** CRUD interface for the `courses` collection.
-   **Lesson Management:** CRUD interface for the `lessons` collection, including media uploads to Firebase Storage.
-   **Quiz Management:** CRUD interface for the `quizzes` collection.
-   **Enrollment Monitoring:** View and manage `course_enrollments`.
-   **Certificate Management:** Manually issue, revoke, and re-upload certificates.

---

## 3.5 Frontend Routes & Page Mapping

The existing React front-end routes provide a strong foundation for the ELIMIKA module. This section maps the component pages to their corresponding routes as defined in `app.tsx`.

### Driver/Learner Routes

| Route Path | Component | Purpose |
| :--- | :--- | :--- |
| `/elimika` | `<CourseCatalog />` | Main entry point. Lists all available courses. |
| `/elimika/course/:courseId` | `<CourseDetail />` | Shows details for a specific course and handles enrollment. |
| `/elimika/lesson/:lessonId` | `<LessonViewer />` | Displays lesson content (text, video, etc.) |
| `/elimika/quiz/:courseId` | `<PracticeQuiz />` | Presents a quiz for a specific course. |
| `/elimika/completion/:courseId` | `<CourseCompletion />` | The page shown after a user successfully completes a course. |
| `/elimika/my-learning` | `<MyLearning />` | A dashboard for the driver to see all their enrolled courses and progress. |

### Admin Routes

| Route Path | Component | Purpose |
| :--- | :--- | :--- |
| `/admin/courses` | `<CourseManager />` | Admin dashboard to view and manage all courses. |
| `/admin/course/:courseId`| `<CourseEditor />` | Form to edit the details of a specific course. |
| `/admin/course/:courseId/lesson/:lessonId` | `<LessonBuilder />` | Interface for creating and editing course lessons. |
| `/admin/course/:courseId/quiz` | `<QuizBuilder />` | Interface for creating and managing quizzes for a course. |
| `/admin/learners` | `<LearnerProgress />`| Dashboard to monitor the progress of all enrolled learners. |

This structure aligns directly with the technical flows and page requirements outlined in this plan.

---

## 4. Technical Flows

### Browse → Enroll → Learn → Quiz → Complete → Certificate

1.  **Browse:** Client fetches `courses` where `is_active` == 1.
2.  **Select Course:** User clicks on a course. Client displays details from the selected course document.
3.  **Enrollment:**
    -   **Free Course:** User clicks "Enroll". Client creates a new document in `course_enrollments` with `status: "In Progress"`, `progress_percentage: 0`, and links `courseId` and `driverId`.
    -   **Paid Course:** User clicks "Buy Now". Client initiates the **Selcom Payment Flow** (see Section 7). Only upon successful payment verification does the client create the `course_enrollments` document.
4.  **Learn:**
    -   Client fetches `lessons` where `course` == `courseId`, ordered by `lesson_order`.
    -   As the user navigates, the client renders the content based on `content_type`, fetching media from Storage URLs.
5.  **Update Progress:** On "Mark as Complete" button click, the client updates the corresponding `course_enrollments` document:
    -   Increments `completed_lessons`.
    -   Recalculates `progress_percentage`.
    -   Updates `last_accessed` to the current timestamp.
6.  **Take Quiz:**
    -   Client fetches the relevant quiz from the `quizzes` collection.
    -   User submits answers. Client scores the quiz and provides immediate feedback.
    -   Client writes the result to a new `quiz_attempts` document.
7.  **Course Completion:**
    -   When `progress_percentage` in `course_enrollments` reaches 100, the client updates the status to `"Completed"` and sets the `completion_date`.
8.  **Certificate Generation (Client-Side Approach):**
    -   Upon completion, the client fetches a predefined certificate template (e.g., an SVG file from Storage).
    -   It populates the template with the driver's name, course name, and date.
    -   It uses a library like `pdf-lib` or `html2canvas` to convert the populated template into a PDF.
    -   The PDF is uploaded to Firebase Storage at a path like `certificates/{driverId}/{courseId}.pdf`.
    -   Finally, a new document is created in the `certificates` collection with the Storage URL.

---

## 5. Firestore Read/Write Map

| Action | Screen/Flow | Collection(s) | Operation |
| :--- | :--- | :--- | :--- |
| View Courses | Course Catalog | `courses` | Read |
| Enroll (Free) | Course Detail | `course_enrollments`| Create |
| Enroll (Paid) | Payment Flow | `payments`, `course_enrollments`| Create, Update |
| View Lessons | Lesson Viewer | `lessons` | Read |
| Update Progress | Lesson Viewer | `course_enrollments`| Update |
| Take Quiz | Quiz Page | `quizzes`, `quiz_attempts` | Read, Create |
| View Certificate | Certificate Viewer| `certificates` | Read |
| Admin CRUD | Admin Portal | `courses`, `lessons`, `quizzes` | Create, Read, Update, Delete |

---

## 6. Storage Plan

-   **Paths:**
    -   Course Thumbnails: `courses/{courseId}/thumbnail.jpg`
    -   Lesson Media: `lessons/{lessonId}/{fileName}.(pdf|jpg|mp4)`
    -   Quiz Media: `quizzes/{quizId}/media/{fileName}.jpg`
    -   Certificates: `certificates/{driverId}/{enrollmentId}.pdf`
-   **Access Control:** Use Firestore Security Rules to control access. Authenticated users can read public course/lesson assets. Only the owning driver or an admin can read a certificate.

---

## 7. Payment Integration Plan (Selcom without Cloud Functions)

This flow is critical and must be implemented carefully to prevent bypass.

1.  **Create PENDING Payment:**
    -   User clicks "Buy Now" for a paid course.
    -   The client generates a unique `order_id` (e.g., `elimika-courseId-driverId-timestamp`).
    -   A new document is created in the `payments` collection with:
        -   `status: "PENDING"`
        -   `order_id: generated_order_id`
        -   `userId: driverId`
        -   `service: "Elimika"`
        -   `amount: course.price`
2.  **Initiate Selcom Order:**
    -   The client makes a **proxied API call** to your secure backend endpoint, which in turn calls Selcom's `create-order-minimal` API with the `order_id` and `amount`.
    -   **Security:** Never call Selcom's API directly from the client with your API key and secret. This MUST be proxied through a secure, non-Firebase-Function environment (e.g., a simple Cloud Run or other serverless endpoint).
3.  **Handle Selcom Response:**
    -   Your proxy returns the Selcom payment gateway URL or token to the client.
    -   The client redirects the user or displays the payment method.
4.  **Verify Payment (Client-Side Polling):**
    -   After the user attempts payment, the client starts polling your secure proxy endpoint, which calls Selcom's `/order-status` API with the `order_id`.
    -   **Polling Logic:** Poll every 5 seconds for up to 2 minutes.
5.  **Update Payment Status:**
    -   **On `COMPLETED`:** The proxy returns success. The client updates the `payments` document in Firestore to `status: "COMPLETED"`, storing the `transactionId` from Selcom.
    -   **On `PENDING`/`INPROGRESS`:** Continue polling.
    -   **On `FAILED`/`CANCELLED`:** Stop polling and inform the user.
6.  **Create Enrollment (Final Step):**
    -   After successfully updating the Firestore `payments` document to `"COMPLETED"`, the client proceeds to create the `course_enrollments` document. The UI can now unlock the course content.

### Security & Idempotency

-   **Prevent Bypass:** The `course_enrollments` document is the source of truth for access. It is only created *after* the `payments` doc is confirmed as `COMPLETED` in Firestore.
-   **Idempotency:** Before creating a new `PENDING` payment, the client should query the `payments` collection for an existing `PENDING` or `COMPLETED` payment with the same `courseId` and `driverId` to prevent duplicate orders.

---

## 8. Security Rules Plan

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Drivers can read active courses and their own enrollments/certificates
    match /courses/{courseId} {
      allow read: if request.auth != null && get(/databases/$(database)/documents/courses/$(courseId)).data.is_active == 1;
      allow write: if hasAdminRole(); // Admins only
    }

    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if hasAdminRole();
    }

    match /course_enrollments/{enrollmentId} {
      allow read, update: if request.auth.uid == resource.data.driverId;
      allow create: if request.auth.uid == request.resource.data.driverId;
      allow delete: if hasAdminRole();
    }

    match /certificates/{certificateId} {
      allow read: if request.auth.uid == resource.data.driverId || hasAdminRole();
      allow create, write: if hasAdminRole() || request.auth.uid == request.resource.data.driverId;
    }

    // Drivers can only create and update their own pending payments
    match /payments/{paymentId} {
      allow read: if request.auth.uid == resource.data.userId || hasAdminRole();
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update: if request.auth.uid == resource.data.userId && resource.data.status == 'PENDING'; // Can only update their own pending payments
    }

    // Admin functions
    function hasAdminRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles[0] == 'Admin';
    }
  }
}
```

---

## 9. Implementation Phases & Milestones

### Phase 1: Core Content & Free Enrollment
-   Goal: Drivers can browse and complete free courses.
-   [ ] **Admin:** Build CRUD for `courses` and `lessons` (text & image only).
-   [ ] **Driver:** Build Course Catalog and Detail pages.
-   [ ] **Driver:** Implement free enrollment flow (`course_enrollments` creation).
-   [ ] **Driver:** Build Lesson Viewer for text and image content.
-   [ ] **Driver:** Implement progress tracking logic.

### Phase 2: Quizzes & Certificate Generation
-   Goal: Add assessments and reward completion.
-   [ ] **Admin:** Build CRUD for `quizzes` collection.
-   [ ] **Driver:** Build Quiz page and scoring logic.
-   [ ] **Driver:** Implement client-side certificate generation (SVG/Canvas to PDF).
-   [ ] **Storage:** Set up Storage paths and rules for certificates.
-   [ ] **Firestore:** Implement `certificates` collection logic.

### Phase 3: Paid Courses & Selcom Integration
-   Goal: Monetize courses.
-   [ ] **Backend:** Deploy the secure proxy for Selcom API calls.
-   [ ] **Driver:** Implement the full client-side payment and verification flow.
-   [ ] **Firestore:** Harden security rules for the `payments` collection.
-   [ ] **Admin:** Build a `payments` monitoring table.

### Phase 4: Advanced Features & Reporting
-   Goal: Enhance content and provide admin insights.
-   [ ] **Content:** Add support for PDF and Video lessons.
-   [ ] **Admin:** Build basic reporting dashboards (enrollments, revenue).
-   [ ] **Mobile:** Ensure all features are responsive and functional on mobile.

---

## 10. Risks & Mitigations

-   **Risk:** Client-side certificate generation could be manipulated.
    -   **Mitigation:** The `certificates` document in Firestore is the "source of truth". An admin can always verify a certificate against the Firestore record. For higher security, a future phase could move this to an admin-only "issue certificate" button.
-   **Risk:** Selcom API keys exposed on the client.
    -   **Mitigation:** **This is the highest risk.** It is mitigated by using a secure, server-side proxy that holds the API credentials. This proxy is a non-negotiable part of the architecture.
-   **Risk:** Client-side payment verification logic is complex.
    -   **Mitigation:** Thoroughly test all edge cases (network failure, browser refresh, duplicate clicks). Implement robust logging to track the payment state machine on the client.

