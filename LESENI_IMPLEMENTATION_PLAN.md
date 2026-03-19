
# LESENI (License Services) Module: Implementation Plan

**Document Version:** 1.6
**Date:** 2023-10-28
**Authors:** Gemini AI (Firebase Architect)

This document provides a complete technical engineering roadmap for the implementation of the LESENI (License Services) module on the Dereva Kiganjani platform.

---

## 1. Module Overview

The LESENI module is a digital interface for drivers to apply for various license services and for administrators to manage these applications efficiently. It includes two primary workflows:
1.  **Formal License Applications:** A structured wizard for New, Renewal, and LATRA Exam applications, involving payments and document uploads.
2.  **General License Requests:** A simpler form for drivers to submit general inquiries or requests for information not covered by the formal application types.

---

## 2. System Dependencies

- **Firebase Authentication:** For user identification and role-based access control.
- **Firestore:** Primary database for all application and request data.
- **Firebase Storage:** For secure upload and storage of applicant documents.
- **Firebase Cloud Functions:** For secure, server-side business logic, including payment gateway integration.
- **Selcom Payment Gateway:** For processing license fees via the `initiateLicensePayment` Cloud Function.

---

## 3. Firestore Collections Used

- **`license_applications`:** The core collection for formal license service applications.
- **`license_requests`:** A collection for general-purpose inquiries and requests from drivers.
- **`payments`:** A centralized log for all financial transactions.
- **`users`:** To retrieve user details and enforce security rules.

---

## 4. Document Structures

### `license_applications`
**Document ID:** Auto-generated unique ID.

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | `string` | UID of the applicant. |
| `paymentId`| `string` | ID of the corresponding entry in `payments`. |
| `status` | `string` | "pending-payment", "pending-review", "payment-failed", etc. |
| ... | ... | ... |

### `license_requests` (New)
**Document ID:** Auto-generated unique ID.

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | `string` | UID of the user making the request. |
| `subject` | `string` | The subject or title of the request. |
| `details` | `string` | The full body content of the request. |
| `status` | `string` | "submitted", "in-review", "resolved", "closed". |
| `submittedOn`| `timestamp`| Server timestamp of the request submission. |
| `lastUpdated`| `timestamp`| Server timestamp of the last modification. |
| `adminNotes` | `string` | **Admin-only.** Internal review notes. |

### `payments`
**Document ID:** Auto-generated unique ID.
*This structure remains as previously defined.*

---

## 5. Driver Flow (Step-by-Step)

### FORMAL APPLICATION FLOW

**Page: `/license` (Component: `LicenseDashboard`)**
- **Function:** Main entry point. Displays service types and recent application statuses.

**Page: `/license/apply/:type` (Component: `LicenseApplicationWizard`)**
- **Function:** The main wizard for submitting a formal application. On submission, it calls the `initiateLicensePayment` Cloud Function to trigger the payment process.

**Page: `/license/confirmation/:refNo` (Component: `ApplicationConfirmation`)**
- **Function:** Displays payment instructions to the user and listens for real-time status updates from Firestore to confirm payment completion.

**Page: `/license/my-applications` (Component: `MyLicenseApplications`)**
- **Function:** Allows a driver to view all their formal license applications.

**Page: `/license/application/:id` (Component: `ApplicationDetails`)**
- **Function:** Shows a detailed view of a single formal application.

### GENERAL REQUEST FLOW

**Page: `/license-request` (Component: `LicenseRequest`)**
- **Function:** Provides a simple form for drivers to submit general inquiries.

**Page: `/license/my-requests` (Component: `MyLicenseRequests`)**
- **Function:** Allows a driver to view the history and status of their general requests.

---

## 6. Admin Flow (Step-by-Step)

*Admin flow remains as previously defined.*

---

## 7. UI Pages Checklist (Aligned with Existing Routes)

### Driver Routes
- [x] `<Route path="/license" element={<LicenseDashboard />} />`
- [x] `<Route path="/license-request" element={<ProtectedRoute><LicenseRequest /></ProtectedRoute>} />`
- [x] `<Route path="/license/my-requests" element={<ProtectedRoute><MyLicenseRequests /></ProtectedRoute>} />`
- [x] `<Route path="/license/apply/:type" element={<ProtectedRoute><LicenseApplicationWizard /></ProtectedRoute>} />`
- [x] `<Route path="/license/confirmation/:refNo" element={<ProtectedRoute><ApplicationConfirmation /></ProtectedRoute>} />`
- [x] `<Route path="/license/track" element={<TrackStatus />} />`
- [x] `<Route path="/license/my-applications" element={<ProtectedRoute><MyLicenseApplications /></ProtectedRoute>} />`
- [x] `<Route path="/license/application/:id" element={<ProtectedRoute><ApplicationDetails /></ProtectedRoute>} />`

### Admin Routes
- [x] `<Route path="/admin/license-applications" element={<AdminRoleBasedRoute><LicenseApplicationsManagement /></AdminRoleBasedRoute>} />`
- [x] `<Route path="/admin/license-application/:id" element={<AdminRoleBasedRoute><LicenseApplicationReview /></AdminRoleBasedRoute>} />`
- [x] `<Route path="/admin/license-statistics" element={<AdminRoleBasedRoute><LicenseStatistics /></AdminRoleBasedRoute>} />`

---

## 8. Phase-by-Phase Implementation Plan

### Phase 1 – Core Application & Submission
- [x] Implement `LicenseApplicationWizard` UI and validation.
- [x] Implement document upload to Firebase Storage.
- [x] On submit, create initial `license_applications` document with `status: "draft"`.
- [x] Call the `initiateLicensePayment` Cloud Function with application and phone details.

### Phase 1.5 – Backend Payment Integration
- [x] Create the `initiateLicensePayment` Firebase Cloud Function.
- [x] Function handles creating `payments` document and interacting with the Selcom API to initiate the USSD push.
- [x] Function updates `license_applications` with `paymentId` and `status: "pending-payment"`.

### Phase 2 – Payment Confirmation & Status Update
- [x] Implement the `ApplicationConfirmation` page to show payment instructions.
- [x] Use Firestore real-time listeners to automatically detect status changes on the `license_applications` document.
- [x] Implement the `selcomWebhook` to securely receive payment status updates from Selcom and update Firestore accordingly.

### Phase 3 – Driver Status Tracking
- [x] Implement `LicenseDashboard` with a recent applications view.
- [x] Implement `MyLicenseApplications` to list all formal applications.
- [x] Implement `ApplicationDetails` for a detailed view of an application.
- [x] Implement `TrackStatus` for public status checking.

### Phase 4 - General License Requests
- [x] Implement `LicenseRequest` form and Firestore submission logic.
- [x] Implement `MyLicenseRequests` to display submitted requests.
- [ ] Create corresponding Admin UI for reviewing these requests.

### Phase 5 – Admin Dashboard & Statistics
- [x] Implement `LicenseApplicationsManagement` data table with filtering.
- [x] Implement `LicenseStatistics` page with charts.
- [x] Ensure role-based access control is enforced.

### Phase 6 – Admin Review & Actions
- [x] Implement `LicenseApplicationReview` page.
- [ ] Gate "Approve" button based on verified payment status.
- [ ] Implement the update logic for `status`, `adminNotes`, and `applicantAdvice`.

---

## 9. Progress Tracking

- [x] **Phase 1 – Core Application & Submission:** Completed
- [x] **Phase 1.5 – Backend Payment Integration:** Completed
- [x] **Phase 2 – Payment Confirmation & Status Update:** Completed
- [x] **Phase 3 – Driver Status Tracking:** Completed
- [x] **Phase 4 – General License Requests:** In Progress
- [x] **Phase 5 – Admin Dashboard & Statistics:** Completed
- [x] **Phase 6 – Admin Review & Actions:** In Progress
- [ ] **Deployment Readiness:** Not Started
- [ ] **Final QA & Sign-off:** Not Started
