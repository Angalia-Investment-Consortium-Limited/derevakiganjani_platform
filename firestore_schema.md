# Firestore Collection Schema
This document outlines the structure of the Firestore collections based on the provided screenshots.

---

### `users`
This collection stores basic information about all registered users, linking them to their roles and profiles.

**Document ID:** User's UID from Firebase Authentication.

| Field | Type | Description |
| :--- | :--- | :--- |
| `createdAt` | Timestamp | The date and time the user account was created. |
| `email` | String | The user's email address. |
| `enabled` | Boolean | Flag to indicate if the user account is active. |
| `full_name` | String | The user's full name. |
| `mobile_no` | String | The user's mobile number. |
| `phoneNumber`| String | The user's phone number. |
| `roles` | Array | An array of strings representing user roles (e.g., `["Driver"]`). |
| `status` | String | The current status of the user account (e.g., "Active"). |
| `uid` | String | The user's unique ID from Firebase Authentication. |

---

### `admins`
Stores profile information for users with the "Admin" role.

**Document ID:** User's UID from Firebase Authentication.

| Field | Type | Description |
| :--- | :--- | :--- |
| `createdAt` | Timestamp | Date the admin profile was created. |
| `email` | String | Admin's email. |
| `fullName` | String | Admin's full name. |
| `role` | String | Specific admin role (e.g., "SuperAdmin"). |
| `uid` | String | The admin's user ID. |

---

### `employers`
Stores profile information for users with the "Employer" role.

**Document ID:** User's UID from Firebase Authentication.

| Field | Type | Description |
| :--- | :--- | :--- |
| `account_creation_date` | Timestamp | The date and time the employer account was created. |
| `address` | Map | An object containing the company's address (`city`, `country`, `street`). |
| `company_email`| String | The company's primary contact email. |
| `company_name` | String | The name of the employer's company. |
| `company_phone`| String | The company's phone number. |
| `companyRegistration` | String | The company's registration number (from the registration form). |
| `contactPerson`| String | The name of the primary contact at the company. |
| `industry` | String | The industry the company operates in. |
| `userId` | String | The employer's unique user ID. |
| `verificationStatus` | String | The status of the employer's verification (e.g., "Verified", "Pending"). |
| `website` | String | The company's official website. |

---

### `driver_profiles`
Stores detailed profile information for users with the "Driver" role.

**Document ID:** User's UID from Firebase Authentication.

| Field | Type | Description |
| :--- | :--- | :--- |
| `bio` | String | A short biography of the driver. |
| `createdAt` | Timestamp | Date the driver profile was created. |
| `driverId` | String | A unique identifier for the driver. |
| `email` | String | The driver's email address. |
| `fullName` | String | The driver's full name. |
| `lastUpdated`| Timestamp | The timestamp of the last profile update. |
| `licenseNumber`| String | The driver's license number. |
| `phone_number`| String | The driver's phone number. |
| `skills` | Array | A list of the driver's skills. |
| `uid` | String | The driver's user ID. |

---

### `courses`
This collection contains the details for each e-learning course available.

**Document ID:** A custom identifier (e.g., `COURSE-001`).

| Field | Type | Description |
| :--- | :--- | :--- |
| `course_category` | String | The category of the course (e.g., "basic"). |
| `course_name_en` | String | The name of the course in English. |
| `course_name_sw` | String | The name of the course in Swahili. |
| `course_track` | String | The track the course belongs to (e.g., "professional"). |
| `description_en` | String | A description of the course in English. |
| `description_sw` | String | A description of the course in Swahili. |
| `duration_hours` | Number | The total duration of the course in hours. |
| `is_active` | Number | A flag indicating if the course is active (1 for true, 0 for false). |
| `is_free` | Number | A flag indicating if the course is free (1 for true, 0 for false). |
| `level` | String | The difficulty level of the course (e.g., "Advanced"). |
| `name` | String | A unique name or identifier for the course. |
| `price` | Number | The price of the course. |

---

### `course_enrollments`
This collection tracks the progress of drivers who are enrolled in courses.

**Document ID:** A unique ID for the enrollment.

| Field | Type | Description |
| :--- | :--- | :--- |
| `certificate_issued`| Null/String | The ID of the certificate when issued. |
| `completed_lessons` | Number | The number of lessons the driver has completed. |
| `completion_date` | Null/Timestamp | The date the driver completed the course. |
| `courseId` | String | The ID of the enrolled course. |
| `driverId` | String | The ID of the enrolled driver. |
| `enrollment_date` | Timestamp | The date the driver enrolled in the course. |
| `last_accessed` | Timestamp | The last time the driver accessed the course. |
| `progress_percentage`| Number | The driver's progress through the course as a percentage. |
| `status` | String | The current status of the enrollment (e.g., "In Progress"). |
| `total_lessons` | Number | The total number of lessons in the course. |

---

### `certificates`
This collection stores information about certificates issued to drivers upon course completion.

**Document ID:** A unique ID for the certificate.

| Field | Type | Description |
| :--- | :--- | :--- |
| `certificate_url` | String | A URL to the certificate file in Firebase Storage. |
| `courseId` | String | The ID of the course for which the certificate was issued. |
| `course_name` | String | The name of the course. |
| `driverId` | String | The ID of the driver who received the certificate. |
| `issue_date` | Timestamp | The date the certificate was issued. |
| `onRollmentId` | String | The ID of the course enrollment (Note: likely a typo, should be enrollmentId). |

---

### `jitesti-categories`
This collection defines the categories for the "JiTesti" driving tests.

**Document ID:** A custom identifier (e.g., `BASIC`).

| Field | Type | Description |
| :--- | :--- | :--- |
| `createdAt` | Timestamp | The date the category was created. |
| `description_en`| String | Description of the test in English. |
| `description_sw`| String | Description of the test in Swahili. |
| `duration_minutes`| Number | The duration of the test in minutes. |
| `id` | String | The unique ID for the category. |
| `license_class`| String | The license class this test applies to (e.g., "B"). |
| `name_en` | String | The name of the test in English. |
| `name_sw` | String | The name of the test in Swahili. |
| `pass_mark` | Number | The score required to pass. |
| `price` | Number | The cost of the test. |
| `status` | String | The status of the category (e.g., "active"). |
| `total_questions`| Number | The total number of questions in the test. |

---

### `tests`
This collection stores the structure of individual tests.

**Document ID:** A custom identifier (e.g., `TEST-001`).

| Field | Type | Description |
| :--- | :--- | :--- |
| `courseId` | String | The ID of the course this test belongs to. |
| `pass_mark_percentage` | Number | The passing percentage for the test. |
| `questionIds` | Array | A list of question IDs included in the test. |
| `test_title_en` | String | The title of the test in English. |
| `category_name_en` | String | The category name in English. |
| `category_name_sw` | String | The category name in Swahili. |
| `questions` | Array | An array of question objects directly embedded in the test. |

---

### `questions`
This collection holds individual questions that can be used in tests.

**Document ID:** A unique ID for the question.

| Field | Type | Description |
| :--- | :--- | :--- |
| `optionKey` | String | The key for the correct option. |
| `optionTextEn` | String | The text for an option in English. |
| `optionTextSw` | String | The text for an option in Swahili. |
| `questionTextEn`| String | The main text of the question in English. |
| `questionTextSw`| String | The main text of the question in Swahili. |
| `questionType` | String | The type of question (e.g., "MCQ"). |
| `options` | Map | A map of options for the question. |
| `correct_option_index` | Number | The index of the correct answer in the options. |
| `media_url` | String | A URL to an image or video for the question. |

---

### `lessons`
This collection stores individual lessons for the "Elimika" e-learning platform.

**Document ID:** A custom identifier (e.g., `LESSON-001`).

| Field | Type | Description |
| :--- | :--- | :--- |
| `content_type`| String | The type of content (e.g., "video", "text"). |
| `course` | String | The ID of the course this lesson belongs to. |
| `duration_minutes`| Number | The estimated duration of the lesson. |
| `is_active` | Boolean | Whether the lesson is currently active. |
| `is_locked` | Boolean | Whether the lesson is locked until prerequisites are met. |
| `lesson_order`| Number | The order of the lesson within the course. |
| `lesson_title_en`| String | The lesson title in English. |
| `lesson_title_sw`| String | The lesson title in Swahili. |
| `name` | String | A unique name or identifier for the lesson. |
| `summary_en` | String | A summary of the lesson in English. |
| `summary_sw` | String | A summary of the lesson in Swahili. |

---

### `job_applications`
This collection tracks job applications submitted by drivers.

**Document ID:** A unique ID for the application.

| Field | Type | Description |
| :--- | :--- | :--- |
| `application_date`| Timestamp | The date the application was submitted. |
| `driverId` | String | The ID of the driver who applied. |
| `employerId` | String | The ID of the employer who posted the job. |
| `jobId` | String | The ID of the job being applied for. |
| `status` | String | The current status of the application (e.g., "Applied", "Viewed", "Shortlisted"). |

---

### `payments`
This collection logs all payment transactions that occur on the platform.

**Document ID:** A unique ID for the payment.

| Field | Type | Description |
| :--- | :--- | :--- |
| `amount` | Number | The amount of the transaction. |
| `provider` | String | The payment provider used (e.g., "Selcom"). |
| `referenceId` | String | A reference ID for the transaction. |
| `service` | String | The service that was paid for (e.g., "License Application Fee"). |
| `status` | String | The status of the payment (e.g., "Completed"). |
| `timestamp` | Timestamp | The date and time of the transaction. |
| `transactionId` | String | The unique ID from the payment provider. |
| `userId` | String | The ID of the user who made the payment. |

---
### `license_applications`
This collection stores information about license applications submitted by users.

**Document ID:** A unique ID for the application.

| Field | Type | Description |
| :--- | :--- | :--- |
| `applicationType`| String | The type of license application (e.g., "LATRA Exam"). |
| `district` | String | The district where the applicant resides. |
| `documents` | Array | An array of document objects, each containing `documentType`, `fileName`, and `fileUrl`. |
| `email` | String | The applicant's email address. |
| `fullName` | String | The applicant's full name. |
| `fullNameNormalized` | String | The applicant's full name in lowercase for searching. |
| `licenseCategory` | String | The category of license being applied for (e.g., "A"). |
| `phoneNumber` | String | The applicant's phone number. |
| `region` | String | The region where the applicant resides. |
| `status` | String | The current status of the application (e.g., "rejected"). |
| `submittedOn` | Timestamp | The date and time the application was submitted. |
| `userId` | String | The ID of the user who submitted the application. |


*This document will be updated as more collections are added or modified.*
