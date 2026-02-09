# Payment Project Plan

This document outlines the plan for implementing payment functionality in the application.

## Phased Implementation Plan

### Phase 1: Core Payment Infrastructure (MVP)

**Goal:** Implement the basic payment flow for a single service to validate the integration with Selcom.

1.  **Backend (Firebase Functions):**
    *   Create a new Firebase Function to handle the Selcom integration.
    *   Implement the `/create-order-minimal` and `/wallet-payment` API calls.
    *   Create the `payments` collection in Firestore.
    *   Implement Firestore security rules for the `payments` collection.

2.  **Frontend (React):**
    *   Flesh out the `src/pages/jitesti/PaymentPage.tsx`.
    *   Add a "Pay Now" button that triggers the payment flow.
    *   Integrate with the Firebase Function to create a payment order.
    *   Handle the redirect to the Selcom checkout page.
    *   Implement a callback page to handle the response from Selcom.

3.  **Access Control:**
    *   Implement a basic access control mechanism to lock the JiTesti service until the payment is marked as "Completed".

### Phase 2: Expanding Services & Admin Management

**Goal:** Extend the payment functionality to all driver-facing services and provide administrators with the tools to manage payments.

1.  **Backend (Firebase Functions):**
    *   Extend the Firebase Function to support payments for all services (Elimika, Leseni, etc.).

2.  **Frontend (React):**
    *   Add "Pay Now" buttons to all paid services.
    *   Create the `src/pages/admin/PaymentsManagement.tsx` page.
    *   Display a list of all payments with their status.
    *   Implement filtering and searching for payments.
    *   Allow admins to view payment details.

3.  **Manual Payments:**
    *   Implement the functionality for admins to manually "Verify" or "Reject" payments.

### Phase 3: Employer Features & Invoicing

**Goal:** Implement the payment and invoicing features for employers.

1.  **Backend (Firebase Functions):**
    *   Create the `invoices` collection in Firestore.
    *   Create a Firebase Function to automatically generate invoices for employer services.

2.  **Frontend (React):**
    *   Create pages for employers to view their invoices and make payments.
    *   Implement subscription handling for recurring payments.
    *   Create a payment history page for employers.

### Phase 4: Advanced Features & Reporting

**Goal:** Implement advanced features such as reconciliation, notifications, and reporting.

1.  **Backend (Firebase Functions):**
    *   Implement a reconciliation function to compare Selcom records with Firestore data.
    *   Integrate with a notification service (SMS, WhatsApp) to send payment confirmations.

2.  **Frontend (React):**
    *   Build a dashboard for administrators to view revenue and payment statistics.
    *   Create a reporting center to export payment data.

3.  **Manual Payment Upload:**
    *   Implement the functionality for users to upload proof of payment for manual verification.


## Service Pricing

### Dereva Kiganjani Membership

| Member Type | Price (TZS) | Schedule | Package |
| --- | --- | --- | --- |
| Ordinary | 2,000.00 | Monthly | Gets a WhatsApp notification about the Driver Job Adverts.<br>Receives SMS notifications for Driver Job Advertisements<br>Access to the Elimika Platform<br>Access to a specific Driver's Test<br>Access to Driver's Jobs Adverts (for Job Seekers) |
| VIP | 5,000.00 | Monthly | Gets a WhatsApp notification about the Driver Job Adverts.<br>Receives SMS notifications for Driver Job Advertisements<br>Access to the Elimika Platform<br>Access to a specific Driver's Test<br>Access to Driver's Jobs Adverts (for Job Seekers)<br>Profile and Contact Access by Employers (for Job Seekers)<br>Gets a WhatsApp and SMS notification about Shortlisting and Interview Schedule |
| Employer | 35,000.00 | Monthly | Post Driver Job Advertisements - free<br>Quick Access to Professional and highly experienced Drivers<br>Access to drivers' profiles and contacts<br>Job Match and Shortlisting<br>Schedule and send an interview invitation via SMS and WhatsApp. |

### Ajira ya Udereva

| Service Description | Price (TZS) | Payment Schedule | Payment Method |
| --- | --- | --- | --- |
| Create Your Profile | - | - | - |
| Driver Job Adverts | - | - | - |
| Kuandaliwa CV | 7,000.00 | | Pay Number |
| Fungua Account Ajira Portal | 5,000.00 | | Pay Number |
| Omba Kazi ya Udereva | 3,000.00 | | Pay Number |

### JiTesti

| Service Description | Price (TZS) | Payment Schedule | Payment Method |
| --- | --- | --- | --- |
| JiTest - Motorcycle/Bajaj Riders | 3,000.00 | | Pay Number |
| JiTest - Basic Driving | 3,000.00 | | Pay Number |
| JiTest - Professional PSV Drivers | 3,000.00 | | Pay Number |
| JiTest - Professional HGV Drivers | 3,000.00 | | Pay Number |
| JiTest - Professional VIP Drivers | 3,000.00 | | Pay Number |
| JiTest - School Children | 2,000.00 | | Pay Number |
| JiTesti - Pre-interview Driver's Test | 5,000.00 | | Pay Number |

### Elimika

| Service Description | Price (TZS) | Payment Schedule | Payment Method |
| --- | --- | --- | --- |
| Elimika - School Children | 1,500.00 | Monthly | Pay Number |
| Elimika - Motorcycle/Bajaj Riders | 3,000.00 | Monthly | Pay Number |
| Elimika - Basic Drivers | 5,000.00 | Monthly | Pay Number |
| Elimika - Professional (VIP) Drivers | 5,000.00 | Monthly | Pay Number |
| Elimika - Professional (PSV & HGV) Drivers | 5,000.00 | Monthly | Pay Number |

### Leseni

| Service Description | Price (TZS) | Payment Schedule | Payment Method |
| --- | --- | --- | --- |
| License registration | 3,000.00 | | Pay Number |
| Licence renewal | 3,000.00 | | Pay Number |
| Jisajili Mtihani wa LATRA | 2,000.00 | | Pay Number |


## Payment Information

The following is the data structure for a single payment record:

-   **`id`**: `string` - The unique identifier for the payment.
-   **`userId`**: `string` - The ID of the user making the payment.
-   **`driverName`**: `string` - The name of the driver making the payment.
-   **`serviceType`**: `'JiTesti' | 'Elimika' | 'Leseni' | 'Job Post'` - The type of service being paid for.
-   **`paymentMethod`**: `'M-Pesa' | 'Airtel Money' | 'Bank Transfer' | 'Selcom'` - The method of payment.
-   **`referenceNumber`**: `string` - The transaction reference number from the payment provider.
-   **`status`**: `'Pending' | 'Verified' | 'Rejected'` - The status of the payment.
-   **`datePaid`**: `string` - The date the payment was made.
-   **`amount`**: `string` - The amount paid.
-   **`proofUrl`**: `string` (optional) - A URL to the proof of payment.

## Selcom API Credentials

*   **Vendor**: `TILL61231447`
*   **API Key**: `TILL61231447-fcffa665b91a415085cd64b07e4f1a75`
*   **API Secret**: `4a19e7-221273-452a9c-b0f8fc-0d7d75-49`
*   **Base URL**: `https://apigw.selcommobile.com/v1`

## Selcom API Endpoints

### Checkout APIs for eCommerce Platform

*   `/create-order`
*   `/create-order-minimal`
*   `/order-status`
*   `/wallet-payment`
*   `/cancel-order`
*   `/list-orders`

### Implementing Push USSD Direct

1.  Use the `/create-order-minimal` endpoint.
2.  Use the `order_id` created in the above step and include it in the `/wallet-payment` endpoint.

### Recurring/Subscription Payments - eCommerce

1.  Create Order by Using `createOrder` API.
2.  Fetch Stored Cards (API).
3.  Create Payment API.
4.  Web hook.
5.  Fetch Order Status.
6.  Notify Customer.

### eCommerce (End to End Flow)

1.  **Customer Checkout:** The buyer (customer) starts the checkout process on the eCommerce website.
2.  **Create Order:** The website uses the `createOrder` API to create an order with the Selcom platform.
3.  **Response:** Selcom sends back a `Payment URL` and a `buyer Token`.
4.  **Redirect Customer:** The website redirects the customer to the provided `Payment URL`.
5.  **Submit Payment:** The customer submits their payment on the Selcom platform. This includes 3DS for card payments.
6.  **Web hook Call:** Selcom makes a webhook call to the website.
7.  **Redirect to redirect_url:** Selcom redirects the customer to the `redirect_url` that was provided in step 2.
8.  **Fetch Order Status:** The website fetches the order status from Selcom.
9.  **Show Order Confirmation:** The website shows the order confirmation to the buyer.

## DRIVER PAYMENT FEATURES

### 1. Pay for Services
- Pay for JiTesti exams
- Pay for Elimika courses
- Pay for Leseni services (New, Renew, LATRA)
- Pay for Ajira ya Udereva membership
- Pay for CV creation
- Pay for MDV apply-for-me service

### 2. Payment Methods
- Mobile money: M-Pesa, Airtel, Tigo, HaloPesa (via Selcom)
- Cards (future-ready via Selcom)
- Manual payment upload (optional fallback)

### 3. Payment UX
- “Pay Now” button on each paid service
- Auto redirect to Selcom checkout or USSD push
- Show:
    - Amount
    - Service name
    - Reference number
- Loading / processing state

### 4. Payment Status
- View payment status:
    - Pending
    - Completed
    - Failed
    - Cancelled
- Real-time update after Selcom confirmation
- Ability to retry failed payments

### 5. Receipts & Records
- View and download receipt
- View payment history
- Each payment linked to a service request

### 6. Access Control
- Service locked until payment = COMPLETED
- Automatic unlock after successful payment

## EMPLOYER PAYMENT FEATURES

### 1. Pay for Employer Services
- Pay for:
    - Job posting
    - Hire a Driver (placement fee)
    - Outsource a Driver (monthly)
    - Featured job posts
    - Employer subscription plans

### 2. Invoicing
- Auto-generated invoice per service
- View invoices list
- Download invoice PDF
- See outstanding balance (if subscription)

### 3. Payment Flow
- “Pay Invoice” or “Pay Now” button
- Selcom checkout redirect
- Payment confirmation screen

### 4. Subscription Handling
- Monthly / contract-based payments
- Show:
    - Active subscription
    - Expiry date
- Auto lock features if unpaid

### 5. Payment History
- View all past payments
- Filter by:
    - Service
    - Date
    - Status

## ADMIN / FINANCE PAYMENT FEATURES

### 1. Payment Dashboard
- Total revenue (daily, weekly, monthly)
- Breakdown by service:
    - JiTesti
    - Elimika
    - Leseni
    - Ajira
    - Ajiri Dereva

### 2. Order Management
- View all Selcom orders
- Filter by:
    - Pending
    - Completed
    - Failed
    - Cancelled
- Search by:
    - Phone
    - Reference
    - Service
    - User

### 3. Manual Review
- Review uploaded receipts (if manual)
- Approve or reject manual payments
- Add admin notes

### 4. Reconciliation
- Compare:
    - Selcom callbacks
    - Firebase records
- Detect mismatches
- Mark resolved

### 5. Receipts & Invoices
- Generate official receipts
- Resend receipts
- Export invoices (PDF/Excel)

### 6. Service Unlock Control
- Manually unlock services if needed
- Suspend services if payment reversed

### 7. Reports
- Export:
    - Revenue reports
    - Service usage vs payments
    - Employer billing
- Date range filters

## SHARED CORE PAYMENT FEATURES (ALL SIDES)

- Unique order_id / reference number
- Firebase collections:
    - payments
    - invoices
    - service_requests
- Webhooks from Selcom update Firebase
- Audit trail (no delete, only status changes)
- Notifications:
    - SMS
    - WhatsApp (Botpress)
    - In-app

## Project Plan

### Frontend

1.  **Payment Page (`src/pages/jitesti/PaymentPage.tsx`)**:
    *   This page will allow users to initiate a payment for a service.
    *   It should include a form to select the payment method and enter payment details.
    *   It should handle the integration with the chosen payment gateway.
    *   Upon successful payment, it should create a new payment document in Firestore, including the `userId`.

2.  **Admin Payments Management (`src/pages/admin/PaymentsManagement.tsx`)**:
    *   This page will be used by administrators to manage payments.
    *   It will display a list of all payments.
    *   It will allow admins to filter payments by status, payment method, and service type.
    *   Admins will be able to view payment details, including the proof of payment.
    *   Admins will have the ability to "Verify" or "Reject" payments.

### Backend (Firestore & Firebase Functions)

1.  **`payments` Collection**:
    *   A new collection named `payments` will be created in Firestore.
    *   Each document in this collection will represent a single payment and will follow the data structure defined above.

2.  **Firestore Security Rules (`firestore.rules`)**:
    *   The following security rules will be added to `firestore.rules` to secure the `payments` collection:

    ```
    match /payments/{paymentId} {
      // Users can create their own payments
      allow create: if request.auth != null;

      // Users can read their own payments
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;

      // Admins can read, list and update (verify/reject) all payments
      allow list, update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    ```

3.  **Firebase Functions (`functions/src/index.ts`)**:
    *   Create a new Firebase Function to handle the communication with the Selcom API.
    *   This function will be responsible for:
        *   Receiving payment requests from the frontend.
        *   Making API calls to Selcom to process payments.
        *   Updating the payment status in Firestore based on the response from Selcom.