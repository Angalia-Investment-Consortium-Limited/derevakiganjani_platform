# Jitesti Test Manager Update & Implementation Plan

This document outlines the plan to implement the test assembly and management features within the `JitestiTestManager` component in the admin dashboard.

## Phase 3: Admin Test Assembly & Management

**Objective:** To provide an interface for administrators to visually assemble and manage the questions associated with each Jitesti category. This addresses the missing step of linking questions to tests.

**File to Modify:** `src/pages/admin/JitestiTestManager.tsx`

### 1. File & Component Analysis

*   **`src/pages/admin/JitestiTestManager.tsx`**: Initially displayed a list of tests with basic CRUD. This was replaced with the new test assembly UI.

*   **`src/components/shared/DataTable.tsx`**: This is a reusable data table component. The initial inspection revealed its row selection state was managed internally. This was a blocker for pre-selecting questions based on the chosen test. The component was modified to accept and manage selection state from its parent (`JitestiTestManager`).

*   **`src/components/admin/questions/Columns.tsx`**: This file did not exist and was created to define the column layout for the questions `DataTable`. It includes a checkbox for selection and formats the question text to show Swahili as primary.

### 2. Post-Implementation Fix: TypeScript Error

*   **Issue:** After implementation, a TypeScript error (`TS1484`) was reported in `src/components/admin/questions/Columns.tsx`.
*   **Cause:** The project's `tsconfig.json` has `verbatimModuleSyntax` enabled. This requires that type-only imports (like `ColumnDef`) must be explicitly marked as `import type`.
*   **Resolution:** The import statement for `ColumnDef` in `Columns.tsx` was updated to `import type { ColumnDef } from ...`. A check of other modified files (`DataTable.tsx` and `JitestiTestManager.tsx`) confirmed they were already using correct type-only imports.

### 3. Implementation Steps

- [x] **Modify `DataTable.tsx`:** Update `DataTableProps` to accept `rowSelection` and `onRowSelectionChange` as props and pass them to the `useReactTable` hook.
- [x] **Create `Columns.tsx`:** Create the file `src/components/admin/questions/Columns.tsx` and define the columns for the question data table, including selection checkboxes.
- [x] **Update `JitestiTestManager.tsx`:** Replace the old test list with the new test assembly UI, including state management, data fetching queries, the category dropdown, and the modified `DataTable`.
- [x] **Fix TypeScript Errors:** Correct the `import` statements to be `import type` where required by the `verbatimModuleSyntax` setting.
- [ ] **Final Verification:** Run the build process to ensure there are no remaining errors.

