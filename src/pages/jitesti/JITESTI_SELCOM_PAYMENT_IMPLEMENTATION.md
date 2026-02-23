# JiTesti Selcom Payment Implementation Plan

This document outlines the plan for integrating the Selcom payment gateway into the JiTesti feature. It includes an analysis of the existing data structure, the implementation plan, and a detailed API reference.

## 1. Firestore Collections Analysis

-   [x] **`test_attempts`**: Stores records of each test taken by a user.
-   [x] **`tests`**: Defines the structure and question set for a specific test.
-   [x] **`jitesti-categories`**: Stores the different categories of tests available.
-   [x] **`Test Question`**: Contains the individual questions for all tests.
-   [x] **`payments`** (New): This collection will store all payment transaction details, including user information, category, amount, status (`pending`, `completed`, `failed`), and the Selcom transaction ID.

## 2. Implementation Phases

### Phase 1: User Interface (`PaymentPage.tsx`)

-   [x] **Add Phone Number Input:** Modify `PaymentPage.tsx` to include an input field for the user to enter their payment phone number.
-   [x] **Input Validation:** Implement client-side validation for the phone number.
-   [x] **State Management:** Manage the phone number input in the component's state.

### Phase 2: Client-Side Selcom API Integration (Push USSD)

-   [x] **API Credentials:** Securely manage Selcom API credentials.
-   [x] **Payment Request:** On button click, implement the two-step "Push USSD Direct" flow:
    1.  Call `/v1/checkout/create-order-minimal`.
    2.  Call `/v1/checkout/wallet-payment` using the `order_id` from the previous step.
-   [x] **UI Feedback:** Show a loading state and use toasts to inform the user about the payment status (e.g., "Check your phone to approve the payment").

### Phase 3: Document Creation

-   [x] **Create `payments` Document:** Before initiating the Selcom request, create a document in the `payments` collection with a status of `pending`.
-   [x] **Create `test_attempts` Document:** Create a corresponding document in `test_attempts` with a status of `pending_payment`.

### Phase 4: Admin Payment Management (UI Enhancement)

-   [x] **Modify `PaymentsManagement.tsx`:** Update the existing admin payments page to match the new UI prototype. This includes:
    -   Improved filtering options.
    -   A clearer table layout for payment transactions.
    -   A modal for viewing detailed payment information, including proof.
    -   Actions within the modal to verify or reject payments.

### Phase 5: Payment Verification (Webhooks)

-   [ ] **Webhook Endpoint:** Create a Firebase Cloud Function to serve as a webhook endpoint for Selcom to send server-to-server payment status updates.
-   [ ] **Automatic Updates:** This webhook will automatically update the status in the `payments` and `test_attempts` documents.

## 3. Selcom API Credentials & Guidelines

-   **Vendor**: `TILL61231447`
-   **API Key**: `TILL61231447-fcffa665b91a415085cd64b07e4f1a75`
-   **API Secret**: `4a19e7-221273-452a9c-b0f8fc-0d7d75-49`
-   **Base URL**: `https://apigw.selcommobile.com/v1`
-   **IP Whitelisting**: `45.32.216.48`
-   **Official Docs**: [https://developers.selcommobile.com/#introduction](https://developers.selcommobile.com/#introduction)

## 4. Selcom API Endpoint Reference

(Detailed endpoint documentation is included below...)

## 5. Files to be Modified / Created

-   **`src/pages/jitesti/PaymentPage.tsx`**
-   **`src/pages/admin/PaymentsManagement.tsx`** (To be modified)
-   **`src/pages/jitesti/JITESTI_SELCOM_PAYMENT_IMPLEMENTATION.md`** (This file)

## 6. Firestore Schema Reference

### `users`
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

### `payments`
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

### `test_attempts`
| Field | Type | Description |
| :--- | :--- | :--- |
| `answers` | Map | A map of the user's answers to the test questions. |
| `categoryId` | String | The ID of the test category. |
| `categoryTitle` | String | The title of the test category. |
| `durationInMinutes` | Number | The duration of the test in minutes. |
| `passMark` | Number | The score required to pass the test. |
| `score` | Null/Number | The user's score on the test. Null if the test is not yet graded. |
| `startTime` | Timestamp | The time the user started the test. |
| `status` | String | The status of the test attempt (e.g., "started", "completed"). |
| `userId` | String | The ID of the user who took the test. |

