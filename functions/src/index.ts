import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

const db = admin.firestore();

const selcomBaseUrl = "https://apigw.selcommobile.com/v1";
const selcomApiKey = functions.config().selcom.apikey;
const selcomApiSecret = functions.config().selcom.apisecret;
const vendor = "TILL61231447";

// Helper function to get authorization token
const getAuthToken = async () => {
  const response = await axios.post(`${selcomBaseUrl}/checkout/token`, {
    vendor,
  }, {
    headers: {
      "Authorization": `Bearer ${selcomApiKey}:${selcomApiSecret}`,
      "Content-Type": "application/json",
    },
  });
  return response.data.token;
};

export const initiateSelcomPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { categoryCode, paymentMethod, phoneNumber } = data;
  const userId = context.auth.uid;

  try {
    const authToken = await getAuthToken();

    // 1. Get the category details from Firestore to get the price
    const categoryRef = db.collection("jitesti_categories").doc(categoryCode);
    const categorySnap = await categoryRef.get();
    const category = categorySnap.data();

    if (!category) {
      throw new functions.https.HttpsError("not-found", "Test category not found");
    }

    const amount = category.price;
    const orderId = `JITESTI-${categoryCode}-${userId}-${Date.now()}`;

    // 2. Create an order with Selcom
    const createOrderResponse = await axios.post(`${selcomBaseUrl}/checkout/create-order-minimal`, {
      "vendor": vendor,
      "order_id": orderId,
      "buyer_email": "test@example.com",
      "buyer_name": "Test User",
      "buyer_phone": phoneNumber,
      "amount": amount,
      "currency": "TZS",
      "redirect_url": "https://your-app-url.com/payment-callback", // Replace with your callback URL
      "cancel_url": "https://your-app-url.com/payment-cancelled", // Replace with your cancel URL
      "webhook": "https://your-app-url.com/selcom-webhook", // Replace with your webhook URL
      "buyer_remarks": `Payment for JiTesti: ${category.name_en}`,
      "merchant_remarks": `Payment for JiTesti: ${category.name_en}`,
      "no_of_items": 1
    }, {
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const orderData = createOrderResponse.data;

    if (orderData.result_code !== "000") {
      throw new functions.https.HttpsError("internal", "Failed to create Selcom order", orderData.message);
    }

    const selcomOrderId = orderData.data.order_id;

    // 3. Trigger USSD push
    const walletPaymentResponse = await axios.post(`${selcomBaseUrl}/checkout/wallet-payment`, {
      "vendor": vendor,
      "order_id": selcomOrderId,
      "payer_msisdn": phoneNumber,
      "payment_method": paymentMethod.toUpperCase().replace(" ", "_")
    }, {
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const walletPaymentData = walletPaymentResponse.data;

    if (walletPaymentData.result_code !== "000") {
      throw new functions.https.HttpsError("internal", "Failed to trigger USSD push", walletPaymentData.message);
    }

    // 4. Create a payment document in Firestore
    const paymentRef = db.collection("payments").doc();
    await paymentRef.set({
      id: paymentRef.id,
      userId,
      serviceType: "JiTesti",
      serviceId: categoryCode,
      paymentMethod,
      referenceNumber: orderId,
      selcomOrderId,
      status: "Pending",
      datePaid: admin.firestore.FieldValue.serverTimestamp(),
      amount,
      phoneNumber,
    });

    return { success: true, message: "Payment initiated successfully", referenceNumber: orderId };
  } catch (error) {
    console.error("Payment initiation failed:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    let detail = "No further details available.";
    if (error instanceof Error) {
        detail = error.message;
    }
    throw new functions.https.HttpsError(
        "internal",
        "An unexpected error occurred during payment initiation.",
        detail
    );
  }
});