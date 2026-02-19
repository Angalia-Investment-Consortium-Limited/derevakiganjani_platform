# Jitesti Test Manager: Implementation Plan

**Author:** Gemini AI
**Date:** October 27, 2023
**Status:** In Progress

---

## 1. Executive Summary

This document outlines the implementation plan for the **Jitesti Test Manager**, a critical administrative tool for the Ajiriwa platform. The current method of creating tests relies on technical intervention via seeding scripts, which is not scalable or user-friendly for non-technical administrators.

The Test Manager will provide a graphical user interface (GUI) within the admin dashboard to create, view, edit, and delete tests. This empowers administrators to directly manage the test content and its relationship with the `jitesti-categories` without requiring any code changes or script execution.

---

## 2. Key Features

- **List All Tests:** A comprehensive view of all tests currently in the `tests` collection.
- **Create New Test:** A user-friendly form to create a new test, associate it with a category, and select questions.
- **Edit Existing Test:** Modify the title, pass mark, and the list of questions for any existing test.
- **Delete Test:** Remove a test from the system.
- **Interactive Question Selection:** A dual-list component to easily add or remove questions from a test.
- **Search/Filter Questions:** Quickly find relevant questions from the master `Test Question` bank.

---

## 3. Component & UI/UX Breakdown

### 3.0. Architectural Guideline

- **Layout Consistency:** All admin pages must be wrapped in the `<AdminLayout>` component to ensure a consistent sidebar, header, and overall page structure. The `<AdminBreadcrumbs />` component should also be included at the top of the content area to provide clear navigation for the user.

The primary work will be done in the existing `src/pages/admin/JitestiTestManager.tsx` file.

### 3.1. Main Test List View

- **Component:** A `<DataTable>` (reusing the existing ShadCN table component).
- **Columns:**
    - `Test Title`: The `test_title_en` field from the `tests` document.
    - `Category ID`: The `courseId` field, linking to a `jitesti-category`.
    - `No. of Questions`: The length of the `questionIds` array.
    - `Actions`: A dropdown menu with "Edit" and "Delete" options.
- **Header:** A "Create New Test" button that opens the Create/Edit dialog.

### 3.2. Create/Edit Test Dialog

- **Component:** A `<Dialog>` or `<Sheet>` component from ShadCN.
- **Form Fields:**
    - `Test Title (English)`: A text input for `test_title_en`.
    - `Category`: A `<Select>` dropdown populated with all available `jitesti-categories` (by their ID).
    - `Pass Mark (%)`: A number input for `pass_mark_percentage`.
- **Question Selector Component (The Core Feature):**
    - This will be a custom component, likely structured with Flexbox or CSS Grid.
    - **Left Side ("Available Questions"):**
        - A searchable list of all questions from the `Test Question` collection.
        - Each item will display the question text (`question_text_sw` or `question_text_en`).
        - A `+` or `>` button next to each question to move it to the right side.
    - **Right Side ("Included Questions"):**
        - A list of questions currently in this test's `questionIds` array.
        - Each item will display the question text.
        - A `-` or `<` button next to each question to move it back to the left side.
- **Footer:** "Save Changes" and "Cancel" buttons.

---

## 4. Data Flow & Firestore Logic

*All Firestore interactions will be managed using `@tanstack/react-query` for efficient data fetching, caching, and state management.*

1.  **`useFetchTests` Query:**
    - Fetches all documents from the `tests` collection.
    - Provides the data for the main `<DataTable>`. 

2.  **`useFetchJitestiCategories` Query:**
    - Fetches all documents from the `jitesti-categories` collection.
    - Used to populate the "Category" dropdown in the Create/Edit dialog.

3.  **`useFetchAllQuestions` Query:**
    - Fetches all documents from the `Test Question` collection.
    - Provides the data for the "Available Questions" list in the question selector.

4.  **`useCreateTest` Mutation:**
    - Triggered when saving a new test.
    - Takes the form data (title, categoryId, pass mark) and the final array of `questionIds`.
    - Creates a new document in the `tests` collection.
    - On success, it will invalidate the `useFetchTests` query to refresh the main table.

5.  **`useUpdateTest` Mutation:**
    - Triggered when saving an existing test.
    - Takes the test's document ID and the updated data.
    - Updates the corresponding document in the `tests` collection.
    - On success, it invalidates the `useFetchTests` query.

6.  **`useDeleteTest` Mutation:**
    - Triggered from the "Delete" action.
    - Takes the test's document ID.
    - Deletes the document from the `tests` collection.
    - **Important:** This will NOT delete the questions themselves from the `Test Question` bank, allowing them to be reused.
    - On success, it invalidates the `useFetchTests` query.

---

## 5. Implementation Steps Checklist

1.  [x] **Set Up Page Structure in `JitestiTestManager.tsx`:** Modify the page to use the `<AdminLayout>` and `<AdminBreadcrumbs>` components, ensuring it conforms to the standard admin UI layout.
2.  [ ] **Implement `useFetchTests`:** Create and integrate the query to fetch and display the list of tests.
3.  [ ] **Build the Create/Edit Dialog:** Create the basic shell of the dialog with the simple form fields (Title, Category, Pass Mark).
4.  [ ] **Implement `useFetchJitestiCategories`:** Populate the "Category" dropdown.
5.  [ ] **Build the Question Selector Component:**
    - [ ] Fetch all questions using `useFetchAllQuestions`.
    - [ ] Create the dual-list UI.
    - [ ] Implement the state logic to manage the `available` and `included` question arrays.
    - [ ] Add search/filter functionality for the "Available Questions" list.
6.  [ ] **Implement `useCreateTest` Mutation:** Wire up the "Save" button for creating new tests.
7.  [ ] **Implement `useUpdateTest` Mutation:** Wire up the "Save" button for editing existing tests.
8.  [ ] **Implement `useDeleteTest` Mutation:** Wire up the "Delete" action button.
9.  [ ] **Final Styling and QA:** Polish the UI/UX and perform thorough testing of all CRUD operations.
