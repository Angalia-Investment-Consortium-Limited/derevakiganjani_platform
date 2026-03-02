# Jitesti Test Manager Update & Implementation Plan

This document outlines the plan to implement the test assembly and management features within the `JitestiTestManager` component in the admin dashboard.

## Phase 3: Admin Test Assembly & Management

**Objective:** To provide an interface for administrators to visually assemble and manage the questions associated with each Jitesti category. This addresses the missing step of linking questions to tests.

**File to Modify:** `src/pages/admin/JitestiTestManager.tsx`

### 1. File & Component Analysis

*   **`src/pages/admin/JitestiTestManager.tsx`**: Currently displays a list of tests with create, edit, and delete functionality. The new test assembly UI will be integrated into this file, replacing the existing table of tests with a more interactive test assembly interface.

*   **`src/components/shared/DataTable.tsx`**: This is a reusable data table component. My inspection revealed that its row selection state is managed internally. I will need to modify this component to accept and manage selection state from its parent (`JitestiTestManager`). This is a critical change to allow the pre-selection of questions based on the selected test category.

*   **`src/components/admin/questions/Columns.tsx`**: This file does not currently exist. I will create it to define the column layout for the questions that will be displayed in the `DataTable`. It will include a checkbox column for selection.

### 2. Test Assembly UI

The UI will be built within `JitestiTestManager.tsx` and will consist of the following components:

1.  **Category Selector:**
    *   A `<Select>` dropdown component populated with all available categories from the `jitesti-categories` collection. This will be the primary driver of the interface.

2.  **Question Bank Table:**
    *   The modified `<DataTable>` component to display all questions from the `Test Question` collection.
    *   **Columns (defined in `src/components/admin/questions/Columns.tsx`):**
        *   A `Checkbox` for selection.
        *   `Question Text (EN)`
        *   `Category`
        *   `Difficulty`
    *   **Selection State:** When a category is selected from the dropdown, the checkboxes in this table will be automatically checked for questions whose IDs are present in the `questionIds` array of the corresponding `tests` document.

3.  **Action Buttons:**
    *   A `Save Changes` button that becomes active when there are pending changes. Clicking this will trigger the update logic.

### 3. Test Assembly Logic & Data Flow

We will leverage `@tanstack/react-query` for all data fetching and mutations.

1.  **`useFetchJitestiCategories` Query:**
    *   Fetches all documents from the `jitesti-categories` collection to populate the category selector.

2.  **`useFetchAllQuestions` Query:**
    *   Fetches all documents from the `Test Question` collection to populate the question selection data table.

3.  **`useFetchTestByCategoryId` Query (New):**
    *   **Purpose:** Fetches the specific test configuration linked to the selected Jitesti category.
    *   **Trigger:** Runs when a category is selected from the dropdown.
    *   **Logic:** Queries the `tests` collection for a document where the `courseId` field matches the `id` of the selected category.
    *   **Returns:** The test document, including the crucial `questionIds` array. This array will be used to set the initial state of the checkboxes in the question table.

4.  **`useUpdateTestQuestions` Mutation (New):**
    *   **Purpose:** To update the list of questions associated with a test.
    *   **Trigger:** Called when the administrator clicks the `Save Changes` button.
    *   **Input:**
        *   `testId`: The document ID of the test being updated in the `tests` collection.
        *   `newQuestionIds`: The updated array of selected question IDs.
    *   **Logic:** Uses `updateDoc` to replace the `questionIds` field in the specified `tests` document with the `newQuestionIds` array.
    *   **On Success:** Invalidates the `useFetchTestByCategoryId` query to ensure the UI reflects the saved changes. A success toast notification will be displayed.

### 4. State Management

*   **`selectedCategory` (`useState<string | null>`):** Stores the ID of the category chosen from the dropdown.
*   **`rowSelection` (`useState<Record<string, boolean>>`):** Manages the selection state of the `DataTable`. The keys of the record are the row IDs (question IDs) and the values are booleans. This will be passed to and managed by the modified `DataTable`.

---

## Implementation Steps

1.  **Modify `DataTable.tsx`:**
    *   Update the `DataTableProps` to accept `rowSelection` and `onRowSelectionChange` as props.
    *   Pass these props to the `useReactTable` hook.

2.  **Create `Columns.tsx`:**
    *   Create the file `src/components/admin/questions/Columns.tsx`.
    *   Define the columns for the question data table, including a header checkbox for select/deselect all and a row checkbox for individual selection.

3.  **Update `JitestiTestManager.tsx`:**
    *   Replace the existing test list table with the new test assembly UI.
    *   Add state management hooks: `useState` for `selectedCategory` and `rowSelection`.
    *   Implement the data fetching queries (`useFetchJitestiCategories`, `useFetchAllQuestions`, `useFetchTestByCategoryId`).
    *   Build the UI with the category dropdown and the `DataTable`.
    *   Implement the selection logic, initializing and updating `rowSelection` based on user interaction and fetched test data.
    *   Implement the `useUpdateTestQuestions` mutation and the `Save Changes` button logic.

4.  **Testing and Refinement:**
    *   Manually test the entire workflow: selecting a category, seeing the correct questions pre-selected, changing the selection, and saving the changes.
    *   Verify in Firestore that the `questionIds` array is correctly updated.
    *   Ensure loading and error states are handled gracefully in the UI.