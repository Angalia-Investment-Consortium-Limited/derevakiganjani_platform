
# LESENI (License Services) Module: Implementation Plan

**Document Version:** 1.5
**Date:** 2023-10-27
**Authors:** Gemini AI (Firebase Architect)

This document provides a complete technical engineering roadmap for the implementation of the LESENI (License Services) module on the Dereva Kiganjani platform. It is designed for production-grade deployment and adheres strictly to the existing Firestore-only architecture.

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
- **Selcom Payment Gateway:** For processing license fees via client-side integration.
- **Constraint:** This implementation **MUST NOT** use Firebase Cloud Functions.

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
*This structure remains as previously defined for formal applications.*

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | `string` | UID of the applicant. |
| `paymentId`| `string` | ID of the corresponding entry in `payments`. |
| `status` | `string` | "pending-payment", "pending-review", etc. |
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
- **Function:** The main wizard for submitting a formal application (New, Renewal, LATRA).

**Page: `/license/confirmation/:refNo` (Component: `ApplicationConfirmation`)**
- **Function:** Manages the post-payment process and Selcom status polling.

**Page: `/license/my-applications` (Component: `MyLicenseApplications`)**
- **Function:** Allows a driver to view all their formal license applications.

**Page: `/license/application/:id` (Component: `ApplicationDetails`)**
- **Function:** Shows a detailed view of a single formal application.

### GENERAL REQUEST FLOW

**Page: `/license-request` (Component: `LicenseRequest`)**
- **Function:** Provides a simple form for drivers to submit general inquiries (e.g., questions about requirements, data correction requests).
- **Process:** On submission, a new document is created in the `license_requests` collection with a status of `"submitted"`.

**Page: `/license/my-requests` (Component: `MyLicenseRequests`)**
- **Function:** Allows a driver to view the history and status of their general requests.
- **Firestore Read:** Queries the `license_requests` collection where `userId == currentUser.uid`.

---

## 6. Admin Flow (Step-by-Step)

*Admin flow for `license_applications` remains as previously defined. An additional section for managing `license_requests` will be required.*

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
- [x] On submit, create `license_applications` and `payments` docs.
- [x] Redirect to the Selcom payment gateway.

### Phase 2 – Selcom Payment & Confirmation
- [x] Implement the `ApplicationConfirmation` page as the callback URL.
- [x] Integrate Selcom `order-status` polling.
- [x] Implement Firestore status updates based on poll results.

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

*This section will be updated by the engineering team during development.*

- [x] **Phase 1 – Core Application & Submission:** Completed
- [x] **Phase 2 – Selcom Payment & Confirmation:** Completed
- [x] **Phase 3 – Driver Status Tracking:** Completed
- [x] **Phase 4 – General License Requests:** In Progress
- [x] **Phase 5 – Admin Dashboard & Statistics:** Completed
- [x] **Phase 6 – Admin Review & Actions:** In Progress
- [ ] **Deployment Readiness:** Not Started
- [ ] **Final QA & Sign-off:** Not Started

