
# Implementation Plan: Admin Quick Create and Manager Pages Enhancement

**Objective:** To streamline the creation of new content for administrators and improve the functionality of the manager pages.

### Phase 1: Update App.tsx Routes

1.  **Add/Update Admin Routes:**
    *   Ensure a route exists for creating a new job post: `/admin/jobs/new` should render the `JobPostForm` component.
    *   Ensure a route exists for creating new question: `/admin/question/new` should render the `QuestionEditor` component. 
    *   Ensure a route exists for creating new course :`/admin/course/new` should render the `CourseEditor` component. 

### Phase 2: Global "Quick Create" Component

1.  **Create a `QuickCreate.tsx` component:**
    *   This component will feature a prominent "Quick Create" button, possibly a Floating Action Button (FAB) or a button in the main admin header's top bar.
    *   The button will be a dropdown menu with three options:
        *   "New Job Post": Navigates to `/admin/jobs/new`.
        *   "New Question": Navigates to `/admin/question/new`.
        *   "New Course": Navigates to `/admin/course/new`.
    *   This component will be integrated into the `AdminLayout.tsx` to be accessible from all admin pages.

### Phase 3: `QuestionBankManager.tsx` Enhancements

1.  **Implement Deletion Functionality:**
    *   The current "Delete" button lacks an `onClick` handler.
    *   Implement a function that calls the Firebase API to delete the selected question.
    *   Add a confirmation dialog to prevent accidental deletions.

2.  **Implement Bulk Actions:**
    *   Add checkboxes for bulk selection.
    *   Display a "Bulk Actions" dropdown with options like "Publish", "Unpublish", and "Delete" when items are selected.
    *   Create backend functions (Firebase Cloud Functions) to handle these bulk operations.

### Phase 4: `CourseManager.tsx` Enhancements

1.  **Implement Deletion Functionality:**
    *   Implement the `onClick` handler for the "Delete" button, including a confirmation dialog.

2.  **Implement Bulk Actions:**
    *   Add checkboxes and a "Bulk Actions" dropdown, similar to the `QuestionBankManager`.

### Phase 5: Backend (Firebase)

1.  **Create Bulk API Endpoints:**
    *   Develop new server-side functions (in Firebase Functions) to handle the bulk actions.
