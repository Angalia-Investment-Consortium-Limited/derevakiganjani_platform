# Static Content Analysis Report

This document lists the pages and components that currently contain hardcoded, static content. The recommendation is to refactor these components to fetch their content from the `site_content` collection in Firestore to allow for easier content management.

## Pages with Static Content

- **`src/pages/Home.tsx`**: The hero section title, subtitle, and description, as well as the list of services, are all hardcoded.

- **`src/pages/Services.tsx`**: Contains a large amount of static content, including detailed service descriptions and features, a "How It Works" section, and a Frequently Asked Questions (FAQ) section.

- **`src/pages/Contact.tsx`**: The contact information (address, phone, email) and office hours are hardcoded.

- **`src/pages/PrivacyPolicy.tsx`**: The entire privacy policy is hardcoded directly in the JSX.

- **`src/pages/WhatsAppPrivacyPolicy.tsx`**: Similar to the main privacy policy, the content for the WhatsApp privacy policy is hardcoded.

- **`src/pages/NotFound.tsx`**: The "404 Not Found" message is hardcoded.

## Hybrid Pages with Static Content

- **`src/pages/LicenseRequest.tsx`**: While this page dynamically fetches user-specific license application data, it also contains a significant amount of static informational content. The hardcoded sections include:
    - The list of available license `services`.
    - The descriptions of `statusTypes`.
    - The list of "Required Documents".
    - The "Help Section" with contact details.
