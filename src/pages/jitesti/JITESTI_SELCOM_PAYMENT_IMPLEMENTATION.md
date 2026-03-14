
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

### Phase 2: Server-Side Selcom API Integration (Cloud Function)

-   [x] **Create Cloud Function:** Develop an `onCall` Firebase Function named `initiateSelcomPayment`.
-   [x] **API Credentials:** Securely store and access Selcom API credentials within the Firebase environment.
-   [x] **Payment Request:** The Cloud Function will implement the two-step "Push USSD Direct" flow:
    1.  Call `/v1/checkout/create-order-minimal`.
    2.  Call `/v1/checkout/wallet-payment` using the `order_id` from the previous step.
-   [x] **Error Handling:** Implement robust error handling and logging within the function.

### Phase 3: Document Creation & Linking

-   [x] **Create `payments` Document:** Within the Cloud Function, before initiating the Selcom request, create a document in the `payments` collection with a status of `pending`.
-   [x] **Create `test_attempts` Document:** Create a corresponding document in `test_attempts` with a status of `pending_payment` and link it to the payment via the `paymentId`.

### Phase 4: Payment Verification (Webhooks)

-   [x] **Webhook Endpoint:** A Cloud Function (`selcomWebhook`) has been created to serve as the webhook endpoint.
-   [x] **Automatic Updates:** The webhook automatically receives status updates from Selcom and updates the `payments` and `test_attempts` documents in Firestore to `completed` or `failed`.

## 3. Selcom API Credentials & Guidelines

-   **Vendor**: `TILL61231447`
-   **API Key**: `TILL61231447-fcffa665b91a415085cd64b07e4f1a75`
-   **API Secret**: `4a19e7-221273-452a9c-b0f8fc-0d7d75-49`
-   **Base URL**: `https://apigw.selcommobile.com/v1`
-   **IP Whitelisting**: `199.36.158.100`
-   **Official Docs**: [https://developers.selcommobile.com/#introduction](https://developers.selcommobile.com/#introduction)

## 4. Payment Flow Diagrams

### eCommerce (End to End Flow)

1.  **Customer Checkout:** The user initiates the checkout process on the JiTesti website.
2.  **Create Order:** The website backend calls the Selcom `createOrder` API.
3.  **Response:** Selcom returns a `Payment URL` and a `buyer_token`.
4.  **Redirect Customer:** The website redirects the customer to the Selcom `Payment URL`.
5.  **Submit Payment:** The customer submits their payment information on the Selcom page.
6.  **Webhook Call:** Selcom sends a webhook notification to the pre-configured endpoint.
7.  **Redirect:** Selcom redirects the customer back to the website.
8.  **Fetch Order Status:** The website backend fetches the final order status from Selcom.
9.  **Show Confirmation:** The website displays the order confirmation to the customer.

## 5. Selcom API Endpoint Reference

### Implementing Push USSD Direct (JiTesti Method)

This is the primary method used by JiTesti for mobile money payments.

1.  **Step 1:** Use the `/v1/checkout/create-order-minimal` endpoint to generate an `order_id`.
2.  **Step 2:** Use the `order_id` and the user's phone number (`msisdn`) with the `/v1/checkout/wallet-payment` endpoint to initiate the USSD push to the user's phone.

---

### **`POST /v1/checkout/create-order-minimal`**

Creates a new order for non-card payments. Ideal for mobile wallet push payments.

**Sample Request**
```javascript
//import package
const {apigwClient } = require("selcom-apigw-client");

// initalize a new Client instace with values of the base url, api key and api secret
const apiKey = '202cb962ac59075b964b07152d234b70';
const apiSecret = '81dc9bdb52d04dc20036dbd8313ed055';
const baseUrl = "http://example.com"

const client = new apigwClient(baseUrl, apiKey, apiSecret);

//data
var orderJson = {
    "vendor":"VENDORTILL",
    "order_id":"1218d5Qb",
    "buyer_email": "john@example.com",
    "buyer_name": "John Joh",
    "buyer_phone": "255082555555",
    "amount":  8000,
    "currency":"TZS",
    "buyer_remarks":"None",
    "merchant_remarks":"None",
    "no_of_items":  1
}
// path relatiive to base url
var orderPath = "/v1/checkout/create-order-minimal"

//create new order
var orderRespose = client.postFunc(orderPath, orderJson)
```

**Sample Response**
```json
{
  "reference" : "0289999288",
  "resultcode" : "000",
  "result" : "SUCCESS",
  "message" : "Payment notification logged",
  "data": [{"gateway_buyer_uuid":"12344321", "payment_token":"80008000", "qr":"QR", "payment_gateway_url":"aHR0cDpleGFtcGxlLmNvbS9wZy90MTIyMjI="}]
}
```
**Payload Parameters**
| Parameter | Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `vendor` | Mandatory | SHOP203 | Vendor/Merchant ID allocated by Selcom |
| `order_id` | Mandatory | 123 | A unique Order ID |
| `buyer_email` | Mandatory | customer@example.com | Buyer's email |
| `buyer_name` | Mandatory | Joe John | Buyer's full name |
| `buyer_phone` | Mandatory | 255781234XXX | Buyer's MSISDN |
| `amount` | Mandatory | 5000 | Order amount |
| `currency` | Mandatory | TZS | Currency code (TZS, USD) |
| `webhook` | Optional | aHR0cDovL3VybC5jb20= | Base64 encoded webhook callback URL |
| `no_of_items` | Mandatory | 1 | Number of items in the order |

---

### **`POST /v1/checkout/wallet-payment`**

Initiates a USSD push payment to the user's mobile wallet.

_(Note: The documentation did not provide a full sample for this endpoint, but it is used in Step 2 of the Push USSD flow, requiring `order_id` and `msisdn` in the body.)_

---

### **`GET /v1/checkout/order-status`**

Get the status of a specific order.

**HTTP Request**
`GET /v1/checkout/order-status?order_id={order_id}`

**Sample Response**
```json
{
  "reference" : "0289999288",
  "resultcode" : "000",
  "result" : "SUCCESS",
  "message" : "Order fetch successful",
  "data": [{"order_id":"123", "creation_date":"2019-06-06 22:00:00", "amount":"1000", "payment_status":"PENDING","transid":null,"channel":null,"reference":null,"phone":null}]
}
```
**Response `data` fields**
| Parameter | Description |
| :--- | :--- |
| `payment_status` | PENDING, COMPLETED, CANCELLED, etc. |
| `transid` | Unique transaction ID from the payment channel. |
| `channel` | Channel name (e.g., AIRTELMONEY). |
| `reference` | PG unique payment identifier. |
| `msisdn` | Mobile number involved in the payment. |

---

### **`DELETE /v1/checkout/cancel-order`**

Cancels an order before the customer completes the payment.

**HTTP Request**
`DELETE /v1/checkout/cancel-order?order_id={order_id}`

**Sample Response**
```json
{
  "reference" : "0289999288",
  "resultcode" : "000",
  "result" : "SUCCESS",
  "message" : "Order cancelled successfully",
  "data": []
}
```

---

### **`GET /v1/checkout/list-orders`**

Lists all orders within a specified date range.

**HTTP Request**
`GET /v1/checkout/list-orders?fromdate={YYYY-MM-DD}&todate={YYYY-MM-DD}`

**Sample Response**
```json
{
  "reference" : "0289999288",
  "resultcode" : "000",
  "result" : "SUCCESS",
  "message" : "Order fetch successful",
  "data": [{"order_id":"123", "creation_date":"2019-06-06 22:00:00", "amount":"1000",  "payment_status":"PENDING"}, {"order_id":"124", "creation_date":"2019-06-06 22:10:00", "amount":"2000",  "payment_status":"CANCEL"}]
}
```

---
## 6. Webhook Callback

Payment status callback API from the payment gateway to the ecommerce website. **Note: Webhook only on successful transactions.**

### Webhook Payload Sample
```json
{
  "result": "SUCCESS",
  "resultcode": "000",
  "order_id": "602021152",
  "transid": "7945454515",
  "reference": "856266164161",
  "channel": "TIGOPESATZ",
  "amount": "10000",
  "phone": "255000000001",
  "payment_status": "COMPLETED"
}
```

### HTTP Request Parameters

| Parameter      | Type      | Example    | Description                                       |
| :------------- | :-------- | :--------- | :------------------------------------------------ |
| `transid`      | Mandatory | A1234      | Third-party transaction ID (same as payment request) |
| `order_id`     | Mandatory | 123        | Order ID                                          |
| `reference`    | Mandatory | 0289124234 | Selcom Gateway transaction reference              |
| `result`       | Mandatory | SUCCESS    | Status of the transaction (SUCCESS, FAIL)         |
| `resultcode`   | Mandatory | 000        | Error code                                        |
| `payment_status` | Mandatory | COMPLETE   | Status of the payment (COMPLETED, CANCELLED, etc.)   |


---

## 7. Files to be Modified / Created

-   **`functions/src/index.ts`** (Cloud Function implementation)
-   **`src/pages/jitesti/PaymentPage.tsx`** (Client-side UI and function trigger)
-   **`src/pages/jitesti/JITESTI_SELCOM_PAYMENT_IMPLEMENTATION.md`** (This file)

## 8. Firestore Schema Reference
_(Schema definitions remain the same)_
