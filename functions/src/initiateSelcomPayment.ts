
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

const SELCOM_API_KEY = 'TILL61231447-fcffa665b91a415085cd64b07e4f1a75';
const SELCOM_API_SECRET = '4a19e7-221273-452a9c-b0f8fc-0d7d75-49';
const SELCOM_BASE_URL = "https://apigw.selcommobile.com/v1";

const getEATTimestamp = () => {
    const now = new Date();
    // EAT is UTC+3. We create a new date object representing the time in EAT.
    const eatTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const year = eatTime.getUTCFullYear();
    const month = String(eatTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(eatTime.getUTCDate()).padStart(2, '0');
    const hours = String(eatTime.getUTCHours()).padStart(2, '0');
    const minutes = String(eatTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(eatTime.getUTCSeconds()).padStart(2, '0');

    // Format the timestamp as YYYY-MM-DDTHH:mm:ss+03:00
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+03:00`;
};

const generateSignature = (timestamp: string, params: Record<string, any>) => {
    const sortedKeys = Object.keys(params).sort();
    const signedFields = sortedKeys.join(',');

    let dataToSign = `timestamp=${timestamp}`;
    for (const key of sortedKeys) {
        dataToSign += `&${key}=${params[key]}`;
    }

    const hmac = crypto.createHmac('sha256', SELCOM_API_SECRET);
    hmac.update(dataToSign);
    const digest = hmac.digest('base64');
    
    return { digest, signedFields };
};

interface CategoryData {
    id: string;
    title: string;
    price: number;
    durationInMinutes: number;
    passMark?: number;
}

interface RequestData {
    categoryId: string;
    phone: string;
    category: CategoryData;
}

export const initiateSelcomPayment = onCall({ 
    cpu: 1, 
    memory: '256MiB', 
    region: 'us-central1', 
    enforceAppCheck: false,
    vpcConnector: 'selcom-connector',
    vpcConnectorEgressSettings: 'ALL_TRAFFIC' 
}, async (request) => {
    logger.info("--- initiateSelcomPayment: Start ---");
    logger.info("Received data:", request.data);

    // 1. Auth Check
    if (!request.auth) {
        logger.error("Authentication check failed: User is not logged in.");
        throw new HttpsError("unauthenticated", "You must be logged in.");
    }
    const uid = request.auth.uid;
    const userEmail = request.auth.token.email;
    logger.info(`Authenticated user: ${uid} (${userEmail})`);

    // 2. Data Validation
    const { categoryId, phone, category } = request.data as RequestData;
    if (!categoryId || !phone || !category) {
        logger.error("Data validation failed: Missing required fields.", { categoryId, phone, category });
        throw new HttpsError("invalid-argument", "Missing required payment information.");
    }
    if (!phone.match(/^255[0-9]{9}$/)) {
        logger.error(`Data validation failed: Invalid phone format - ${phone}`);
        throw new HttpsError("invalid-argument", "Invalid phone number format.");
    }
    logger.info("Data validation successful.");

    const passMark = category.passMark || 0;

    // 3. Get User's Full Name
    let buyerName = userEmail?.split('@')[0] || "JiTesti User";
    try {
        const userDoc = await admin.firestore().collection("users").doc(uid).get();
        if (userDoc.exists && userDoc.data()?.full_name) {
            buyerName = userDoc.data()!.full_name;
            logger.info(`Found user's full name: ${buyerName}`);
        }
    } catch (error) {
        logger.warn("Could not fetch user's full name, using fallback.", { error });
    }

    const orderId = uuidv4();
    let paymentDocRef: admin.firestore.DocumentReference | undefined;
    let testAttemptDocRef: admin.firestore.DocumentReference | undefined;

    try {
        // 4. Create Pending Firestore Records
        paymentDocRef = await admin.firestore().collection("payments").add({
            userId: uid, categoryId, amount: category.price, status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(), selcomTransactionId: orderId,
            phone, provider: "Selcom", service: "JiTesti",
        });
        testAttemptDocRef = await admin.firestore().collection("test_attempts").add({
            userId: uid, categoryId, categoryTitle: category.title, durationInMinutes: category.durationInMinutes,
            passMark: passMark, 
            startTime: null, status: "pending_payment", score: null,
            answers: {}, paymentId: paymentDocRef.id,
        });
        logger.info(`Created pending documents. Payment ID: ${paymentDocRef.id}, Test Attempt ID: ${testAttemptDocRef.id}`);

        // 5. Call Selcom API with all corrections
        const timestamp = getEATTimestamp();
        const encodedApiKey = Buffer.from(SELCOM_API_KEY).toString('base64');
        const orderJson = {
            vendor: "TILL61231447",
            order_id: orderId,
            buyer_email: userEmail || "no-email@provided.com",
            buyer_name: buyerName,
            buyer_phone: phone,
            amount: category.price,
            currency: "TZS",
            no_of_items: 1,
            buyer_remarks: `Payment for JiTesti: ${category.title}`,
            merchant_remarks: "JiTesti Payment",
        };
        
        const { digest: orderDigest, signedFields: orderSignedFields } = generateSignature(timestamp, orderJson);

        const createOrderResponse = await fetch(`${SELCOM_BASE_URL}/checkout/create-order-minimal`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `SELCOM ${encodedApiKey}`,
                "Digest-Method": "HS256",
                "Digest": orderDigest,
                "Timestamp": timestamp,
                "Signed-Fields": orderSignedFields
            },
            body: JSON.stringify(orderJson)
        });
        const createOrderResult = await createOrderResponse.json();

        if (createOrderResult.result !== "SUCCESS") {
             logger.error("Failed to create Selcom order", createOrderResult);
            throw new HttpsError("internal", createOrderResult.message || "Failed to create Selcom order.");
        }
        logger.info("Selcom order created successfully.", createOrderResult);

        const walletJson = { order_id: orderId, msisdn: phone };
        const { digest: walletDigest, signedFields: walletSignedFields } = generateSignature(timestamp, walletJson);

        const walletResponse = await fetch(`${SELCOM_BASE_URL}/checkout/wallet-payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `SELCOM ${encodedApiKey}`,
                "Digest-Method": "HS256",
                "Digest": walletDigest,
                "Timestamp": timestamp,
                "Signed-Fields": walletSignedFields
            },
            body: JSON.stringify(walletJson)
        });
        const walletResult = await walletResponse.json();

        if (walletResult.result !== "SUCCESS") {
            logger.error("Failed to initiate wallet payment", walletResult);
            throw new HttpsError("internal", walletResult.message || "Failed to initiate USSD push.");
        }
        logger.info("Selcom wallet payment initiated successfully.", walletResult);

        // 6. Success
        logger.info(`--- initiateSelcomPayment: Success ---`, { testAttemptId: testAttemptDocRef.id });
        return { success: true, testAttemptId: testAttemptDocRef.id };

    } catch (error: any) {
        // 7. Error Handling
        logger.error("An error occurred during payment initiation:", { orderId, error });
        if (paymentDocRef) await paymentDocRef.update({ status: "failed" });
        if (testAttemptDocRef) await testAttemptDocRef.update({ status: "payment_failed" });

        if (error instanceof HttpsError) throw error;
        throw new HttpsError("internal", "An unexpected error occurred.");
    }
});
