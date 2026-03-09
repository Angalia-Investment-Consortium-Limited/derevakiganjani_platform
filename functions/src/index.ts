
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

admin.initializeApp();

const SELCOM_API_KEY = 'TILL61231447-fcffa665b91a415085cd64b07e4f1a75';
const SELCOM_API_SECRET = '4a19e7-221273-452a9c-b0f8fc-0d7d75-49';
const SELCOM_BASE_URL = "https://apigw.selcommobile.com/v1";

// Type definitions for request data
interface CategoryData {
    title: string;
    price: number;
    passMark: number;
    durationInMinutes: number;
}

interface UserData {
    email: string | null;
}

interface RequestData {
    categoryId: string;
    phone: string;
    category: CategoryData;
    user: UserData;
}

export const initiateSelcomPayment = onCall({ cpu: 1 }, async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to make a payment.");
    }
    const uid = request.auth.uid;

    // 2. Data Validation
    const { categoryId, phone, category, user } = request.data as RequestData;
    if (!categoryId || !phone || !category || !user) {
        throw new HttpsError("invalid-argument", "Missing required payment information.");
    }
    if (!phone.match(/^255[0-9]{9}$/)) {
        throw new HttpsError("invalid-argument", "Please enter a valid phone number in the format 255712345678.");
    }

    // 3. Get User's Full Name from Firestore (Server-side)
    let firstName = "JiTesti";
    let lastName = "User";
    try {
        const userDoc = await admin.firestore().collection("users").doc(uid).get();
        const firestoreUser = userDoc.data();

        if (userDoc.exists && firestoreUser?.full_name) {
            const nameParts = firestoreUser.full_name.split(" ").filter((p: string) => p);
            firstName = nameParts[0] || "JiTesti";
            lastName = nameParts.slice(1).join(" ") || "User";
        } else if (user.email) { // Fallback to email from client
            const emailParts = user.email.split("@");
            firstName = emailParts[0];
            lastName = emailParts.length > 1 ? emailParts[1] : "User";
        }
    } catch (error) {
        logger.error("Error fetching user from Firestore:", error);
        if (user.email) {
            const emailParts = user.email.split("@");
            firstName = emailParts[0];
            lastName = emailParts.length > 1 ? emailParts[1] : "User";
        }
    }

    const orderId = uuidv4();
    let paymentDocRef: admin.firestore.DocumentReference | undefined;
    let testAttemptDocRef: admin.firestore.DocumentReference | undefined;

    try {
        // 4. Create Pending Records in Firestore
        paymentDocRef = await admin.firestore().collection("payments").add({
            userId: uid,
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
            userId: uid,
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

        // 5. Make API Calls to Selcom
        const token = Buffer.from(`${SELCOM_API_KEY}:${SELCOM_API_SECRET}`).toString("base64");
        const authHeader = `Bearer ${token}`;

        const createOrderResponse = await fetch(`${SELCOM_BASE_URL}/checkout/create-order-minimal`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: authHeader },
            body: JSON.stringify({
                order_id: orderId,
                amount: category.price,
                currency: "TZS",
                email: user.email || "no-email@provided.com",
                phone: phone,
                first_name: firstName,
                last_name: lastName,
                no_of_items: 1,
            }),
        });

        const createOrderResult = await createOrderResponse.json() as any;
        if (createOrderResult.result !== "SUCCESS") {
            throw new HttpsError("internal", createOrderResult.message || "Failed to create Selcom order.");
        }

        const walletPaymentResponse = await fetch(`${SELCOM_BASE_URL}/checkout/wallet-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: authHeader },
            body: JSON.stringify({ order_id: orderId, msisdn: phone }),
        });

        const walletResult = await walletPaymentResponse.json() as any;
        if (walletResult.result !== "SUCCESS") {
            throw new HttpsError("internal", walletResult.message || "Failed to initiate USSD push.");
        }

        // 6. Success
        return { success: true, testAttemptId: testAttemptDocRef.id };

    } catch (error: any) {
        // 7. Error Handling & Rollback
        logger.error("Payment failed:", { orderId, error });
        if (paymentDocRef) await paymentDocRef.update({ status: "failed" });
        if (testAttemptDocRef) await testAttemptDocRef.update({ status: "payment_failed" });

        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "An unexpected error occurred during payment.");
    }
});
