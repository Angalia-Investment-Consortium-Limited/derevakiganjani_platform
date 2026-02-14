# License Requests Management - Admin Enhancement Plan

## 1. Goal

To enhance the **admin-side** of the License Requests Management workflow by allowing multi-category applications, adding internal notes and applicant advice features, and expanding filtering capabilities. This plan maintains the current two-page admin structure and focuses exclusively on the admin experience.

## 2. Proposed Admin-Side Enhancements

### 2.1. Data Model Update (`license_applications` collection)

To support the new admin features, the data structure for each application will be updated:

*   **`category` (String) will become `categories` (Array of Strings):** The data model will be changed to store an array of license category codes (e.g., `['C1', 'E']`). *This assumes the driver-side application is already providing this data as an array.*
*   **`adminNotes` (String):** A new field for internal notes visible only to admins.
*   **`applicantAdvice` (String):** A new field for feedback that admins can prepare.

### 2.2. Admin Review Page (`LicenseApplicationReview.tsx`)

This page will be updated to provide a more comprehensive review experience.

*   **Display Multiple Categories:** The UI will be modified to clearly display all categories included in the application, for instance, by using multiple tags.
*   **Add "Internal Admin Notes":** A `textarea` will be added where admins can write and review internal notes about the application. This content will be saved to the `adminNotes` field.
*   **Add "Advice for Applicant":** A `textarea` will be added for admins to write feedback for the driver. This will be saved to the `applicantAdvice` field and can be used in the future.
*   The "Approve" and "Reject" logic will be updated to save the contents of these new fields to Firestore.

### 2.3. Admin List Page (`LicenseApplicationsManagement.tsx`)

The main admin dashboard will be enhanced for better filtering and display.

*   **Display Multiple Categories:** The "Category" column in the applications table will be updated to display all categories for each request (e.g., as a comma-separated list or with tags).
*   **Expand Filters:** The filter section will be enhanced:
    *   **Type:** A dropdown to filter by "New" or "Renewal".
    *   **Category:** A dropdown to filter by a *single* category. The system will show all applications that *include* the selected category in their `categories` array.

## 3. Admin-Side Implementation Steps

1.  **Update Data Structures:** Modify the application's TypeScript types to change `category: string` to `categories: string[]` and to add the optional `adminNotes` and `applicantAdvice` fields.
2.  **Enhance Admin Review Page:** Edit `src/pages/admin/LicenseApplicationReview.tsx` to display categories as a list/tags and add the two new `textarea` fields for notes and advice.
3.  **Update Save Logic:** Modify the approve/reject functions in the review page to correctly save the new `adminNotes` and `applicantAdvice` fields to Firestore.
4.  **Enhance Admin List Page:** Edit `src/pages/admin/LicenseApplicationsManagement.tsx` to display multiple categories in the table and add the new dropdown filters for "Type" and "Category".
5.  **Implement Filter Logic:** Update the Firestore query (likely within the `useLicenseApplications` hook) to handle the new filters, using an `array-contains` query for the category filter.
6.  **Testing:** Conduct thorough testing of the enhanced admin portal, focusing on the multi-category display, new note fields, and advanced filtering.
