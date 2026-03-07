# Selcom Payment Integration for JiTesti

This document outlines the correct, secure process for integrating Selcom payments into the JiTesti application. This approach uses a Firebase Cloud Function to securely handle communication with the Selcom API, which is a critical security requirement.

An initial suggestion to perform this implementation purely on the client-side was incorrect as it would expose sensitive API keys. The following plan details the secure and correct architecture.

## 1. Architecture Overview

The payment flow is a multi-step process involving the client application, a Firebase Cloud Function, the Selcom API, and a webhook to receive payment confirmation.

1.  **Client (Payment Page)**: The user enters their phone number on the `PaymentPage.tsx` and clicks "Pay".
2.  **Firebase Function (`initiateSelcomPayment`)**: The client calls this Cloud Function, passing the user's details and the selected test category.
3.  **Secure API Call**: The Cloud Function, which securely stores the Selcom API key and secret, makes a server-to-server call to the Selcom API to create a payment order.
4.  **USSD Push**: Selcom sends a USSD push notification to the user's phone, prompting them to enter their PIN to authorize the payment.
5.  **Webhook Notification**: Once the user completes (or cancels) the payment, Selcom sends a notification with the transaction status to a pre-configured webhook URL.
6.  **Webhook Handler (`selcomWebhook`)**: Another Firebase Function, acting as the webhook, receives this notification. It verifies the data and updates the payment status in the Firestore database (e.g., from `pending` to `completed` or `failed`).
7.  **Real-time UI Update**: The client application, listening for real-time changes to the Firestore document, sees the status update and automatically navigates the user to the test page on success or shows an error on failure.

## 2. Existing Webhook

You have an existing webhook URL: `https://derevakiganjani.mdvfleet.co.tz/api/selcomWebhook`. We will proceed by creating a new Firebase Function to handle requests to this endpoint.

---

## Plan for Implementation

Here is the step-by-step plan to successfully implement the Selcom payment feature.

### **Phase 1: Fix the Cloud Function Deployment**

The primary blocker has been the failure of the `initiateSelcomPayment` function to deploy due to a Node.js version mismatch.

1.  **Align Runtimes**: I will ensure the Node.js runtime is consistently set to a supported version (e.g., Node.js 20) across all relevant configuration files (`firebase.json` and `functions/package.json`).
2.  **Redeploy**: I will then redeploy the `initiateSelcomPayment` function to Firebase.

### **Phase 2: Implement the Selcom Webhook Handler**

A new Firebase Function must be created to handle the webhook notifications from Selcom.

1.  **Create Function**: I will create a new HTTPS-triggered Cloud Function named `selcomWebhook`.
2.  **Implement Logic**: This function will:
    *   Receive the POST request from Selcom.
    *   Parse the payment status and transaction ID from the request body.
    *   Query the `payments` collection in Firestore to find the document with the matching transaction ID.
    *   Update the `status` of the payment document to `completed` or `failed`.
    *   Update the corresponding `test_attempts` document's status.
3.  **Deploy Webhook**: I will deploy this new function.

### **Phase 3: Enhance the Client-Side User Experience**

The final step is to ensure the UI reacts to the payment status changes in real-time.

1.  **Review `PaymentPendingPage.tsx`**: I will inspect this component to confirm it listens for real-time Firestore updates on the payment record.
2.  **Implement Redirects**:
    *   On seeing the payment status change to `completed`, the page will automatically redirect the user to the test-taking page (`/jitesti/test/...`).
    *   If the status changes to `failed`, the page will display an error message and provide an option to retry the payment.

I will now begin with **Phase 1, Step 1: Aligning the runtimes** by first checking the `firebase.json` file.
