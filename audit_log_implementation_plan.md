# Admin Audit Log Implementation Plan

This document outlines the plan to implement a real-time user audit log for the Dereva Kiganjani admin panel.

## 1. Phase 1: Firestore Setup

### 1.1. Create `audit_logs` Collection

Create a new root-level collection in Firestore named `audit_logs`.

### 1.2. Define Security Rules

Update `firestore.rules` to define access control for the `audit_logs` collection.
- **Writes:** Should only be allowed from Cloud Functions (or a trusted admin/server environment). Client-side writes should be disallowed to ensure log integrity.
- **Reads:** Should only be allowed for users with the "Admin" role.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... existing rules

    // Audit logs can only be read by admins and created by functions
    match /audit_logs/{logId} {
      allow read: if request.auth.token.role == 'Admin';
      allow write: if false; // Disallow client-side writes
    }
  }
}
```

## 2. Phase 2: Cloud Functions for Logging

### 2.1. Set up Functions Environment

Ensure you have a Firebase project with the Blaze plan to use Cloud Functions. Initialize Firebase Functions in your project if you haven't already.

### 2.2. Log User Authentication Events

Create Cloud Functions that trigger on Firebase Authentication events.

- **`onUserCreate`:** When a new user is created, log a `USER_CREATE` action.
- **`onUserDelete`:** When a user is deleted, log a `USER_DELETE` action.

### 2.3. Log Firestore Document Changes

Create Cloud Functions that trigger on changes to your important Firestore collections.

- **`users` collection:**
  - `onUpdate`: Log `USER_PROFILE_UPDATE` actions. The function should calculate the changes between the old and new document snapshots and store them in the `changes` field of the audit log.
- **`jobs` collection:**
  - `onCreate`: Log `JOB_POST_CREATE`.
  - `onUpdate`: Log `JOB_POST_UPDATE`.
  - `onDelete`: Log `JOB_POST_DELETE`.
- **`licenseApplications` collection:**
  - `onCreate`: Log `LICENSE_APP_CREATE`.
  - `onUpdate`: Log `LICENSE_APP_UPDATE`.

**Example Function (`functions/src/logging/triggers.ts`):**

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Function to log when a job is created
export const onJobCreated = functions.firestore
  .document("jobs/{jobId}")
  .onCreate(async (snap, context) => {
    const jobData = snap.data();
    const jobId = context.params.jobId;

    const logEntry = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: jobData.employerId, // Assuming you store who created the job
      userRole: "Employer",
      action: "JOB_POST_CREATE",
      entity: {
        type: "job",
        id: jobId,
      },
    };

    return db.collection("audit_logs").add(logEntry);
  });
```

## 3. Phase 3: Admin Panel UI

### 3.1. Create `AuditLog` Page

Create a new page component at `src/pages/admin/AuditLog.tsx`.

### 3.2. Fetch and Display Logs

- Use the `onSnapshot` listener from the Firebase SDK to get a real-time stream of documents from the `audit_logs` collection.
- Order the query by `timestamp` in descending order.
- Display the logs in a `Table` component, similar to the existing `DriverManagement.tsx` page.

### 3.3. Implement Filtering and Search

- Add `Input` components for filtering by:
  - User Email
  - User Role
  - Action Type
- Add a date range picker to filter by `timestamp`.
- Implement client-side or server-side filtering based on performance needs. For a large number of logs, server-side filtering with composite indexes in Firestore is recommended.

### 3.4. Add Navigation

Add a link to the "Audit Log" page in the `AdminSidebar.tsx` component.
