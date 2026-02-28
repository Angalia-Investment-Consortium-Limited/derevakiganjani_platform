
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();

// It's recommended to store these as environment variables for better security
const SELCOM_API_KEY = functions.config().selcom.key || 'TILL61231447-fcffa665b91a415085cd64b07e4f1a75';
const SELCOM_API_SECRET = functions.config().selcom.secret || '4a19e7-221273-452a9c-b0f8fc-0d7d75-49';
const SELCOM_BASE_URL = "https://apigw.selcommobile.com/v1";

exports.initiateSelcomPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to make a payment."
    );
  }

  const { categoryId, phone, category, user } = data;

  if (!categoryId || !phone || !category || !user) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required payment information (categoryId, phone, category, user)."
    );
  }
   if (!phone.match(/^255[0-9]{9}$/)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Please enter a valid phone number in the format 255712345678."
    );
  }


  const orderId = uuidv4();
  let paymentDocRef;
  let testAttemptDocRef;

  try {
    // 1. Create documents in Firestore with a PENDING status
    paymentDocRef = await admin.firestore().collection("payments").add({
      userId: user.uid,
      categoryId: categoryId,
      amount: category.price,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      selcomTransactionId: orderId,
      phone: phone,
      provider: "Selcom",
      service: "JiTesti",
    });

    testAttemptDocRef = await admin.firestore().collection("test_attempts").add({
      userId: user.uid,
      categoryId: categoryId,
      categoryTitle: category.title,
      durationInMinutes: category.durationInMinutes,
      passMark: category.passMark,
      startTime: null,
      status: "pending_payment",
      score: null,
      answers: {},
      paymentId: paymentDocRef.id,
    });

    // 2. Make server-to-server calls to Selcom API
    const authHeader = `Bearer ${Buffer.from(`${SELCOM_API_KEY}:${SELCOM_API_SECRET}`).toString("base64")}`;

    // Step 1: Create Order Minimal
    const createOrderResponse = await fetch(`${SELCOM_BASE_URL}/checkout/create-order-minimal`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({
        order_id: orderId,
        amount: category.price,
        currency: "TZS",
        email: user.email || "no-email@provided.com",
        phone: phone,
        first_name: user.displayName?.split(" ")[0] || "JiTesti",
        last_name: user.displayName?.split(" ")[1] || "User",
        no_of_items: 1,
      }),
    });

    const createOrderResult = await createOrderResponse.json();

    if (createOrderResult.result !== "SUCCESS") {
      throw new functions.https.HttpsError("internal", createOrderResult.message || "Failed to create Selcom order.");
    }

    // Step 2: Wallet Payment (Push USSD)
    const walletPaymentResponse = await fetch(`${SELCOM_BASE_URL}/checkout/wallet-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: JSON.stringify({ order_id: orderId, msisdn: phone }),
    });

    const walletPaymentResult = await walletPaymentResponse.json();

    if (walletPaymentResult.result !== "SUCCESS") {
      throw new functions.https.HttpsError("internal", walletPaymentResult.message || "Failed to initiate USSD push.");
    }

    // 3. Return success and the testAttemptId to the client
    return { success: true, testAttemptId: testAttemptDocRef.id };

  } catch (error) {
    // If any part fails, update Firestore docs and re-throw
    if (paymentDocRef) await paymentDocRef.update({ status: "failed" });
    if (testAttemptDocRef) await testAttemptDocRef.update({ status: "payment_failed" });
    
    // Ensure we throw an HttpsError
    if (error instanceof functions.https.HttpsError) {
        throw error;
    } else {
        throw new functions.https.HttpsError("internal", error.message || "An unexpected error occurred during payment.");
    }
  }
});
