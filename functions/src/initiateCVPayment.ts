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
    const eatTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const year = eatTime.getUTCFullYear();
    const month = String(eatTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(eatTime.getUTCDate()).padStart(2, '0');
    const hours = String(eatTime.getUTCHours()).padStart(2, '0');
    const minutes = String(eatTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(eatTime.getUTCSeconds()).padStart(2, '0');
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

interface RequestData {
    phone: string;
}

export const initiateCVPayment = onCall({ 
    cpu: 1, 
    memory: '256MiB', 
    region: 'us-central1', 
    enforceAppCheck: false,
    vpcConnector: 'selcom-connector',
    vpcConnectorEgressSettings: 'ALL_TRAFFIC' 
}, async (request) => {
    logger.info("--- initiateCVPayment: Start ---", { data: request.data });

    if (!request.auth) {
        logger.error("Authentication check failed: User is not logged in.");
        throw new HttpsError("unauthenticated", "You must be logged in.");
    }
    const uid = request.auth.uid;
    const userEmail = request.auth.token.email;

    const { phone } = request.data as RequestData;
    if (!phone) {
        logger.error("Data validation failed: Missing required fields.", { phone });
        throw new HttpsError("invalid-argument", "Missing required phone number.");
    }
    if (!phone.match(/^255[0-9]{9}$/)) {
        logger.error(`Data validation failed: Invalid phone format - ${phone}`);
        throw new HttpsError("invalid-argument", "Invalid phone number format.");
    }

    let buyerName = userEmail?.split('@')[0] || "Driver User";
    let buyerPhone = phone;

    try {
        const userDoc = await admin.firestore().collection("users").doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData?.full_name) buyerName = userData.full_name;
        }
    } catch (error) {
        logger.warn("Could not fetch user's full name, using fallback.", { error });
    }

    const orderId = uuidv4();
    let paymentDocRef: admin.firestore.DocumentReference | undefined;
    let cvRequestDocRef: admin.firestore.DocumentReference | undefined;

    const cvPrice = 7000;

    try {
        paymentDocRef = await admin.firestore().collection("payments").add({
            userId: uid, amount: cvPrice, status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(), selcomTransactionId: orderId,
            phone, provider: "Selcom", service: "CVCreation",
        });

        cvRequestDocRef = await admin.firestore().collection("cv_requests").add({
            userId: uid,
            driverName: buyerName,
            driverPhone: buyerPhone,
            amount: cvPrice,
            paymentStatus: "Pending",
            requestStatus: "Requested",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            paymentId: paymentDocRef.id,
        });

        const orderTimestamp = getEATTimestamp();
        const encodedApiKey = Buffer.from(SELCOM_API_KEY).toString('base64');
        const webhookUrl = "https://selcomwebhook-jjncpkwfrq-uc.a.run.app";
        const base64Webhook = Buffer.from(webhookUrl).toString('base64');
        const orderJson = {
            vendor: "TILL61231447",
            order_id: orderId,
            buyer_email: userEmail || "no-email@provided.com",
            buyer_name: buyerName,
            buyer_phone: phone,
            amount: cvPrice,
            currency: "TZS",
            no_of_items: 1,
            buyer_remarks: `Payment for Kiganjani CV Service`,
            merchant_remarks: "Kiganjani CV Creation",
            webhook: base64Webhook,
        };
        
        const { digest: orderDigest, signedFields: orderSignedFields } = generateSignature(orderTimestamp, orderJson);

        const createOrderResponse = await fetch(`${SELCOM_BASE_URL}/checkout/create-order-minimal`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `SELCOM ${encodedApiKey}`,
                "Digest-Method": "HS256",
                "Digest": orderDigest,
                "Timestamp": orderTimestamp,
                "Signed-Fields": orderSignedFields
            },
            body: JSON.stringify(orderJson)
        });

        const createOrderResult = await createOrderResponse.json();

        if (createOrderResult.result !== "SUCCESS") {
            logger.error("Failed to create Selcom order", { response: createOrderResult });
            throw new HttpsError("internal", createOrderResult.message || "Failed to create Selcom order.");
        }
        
        const transid = createOrderResult.data[0]?.payment_token;

        if (!transid) {
            logger.error("Could not extract payment_token from Selcom response", { response: createOrderResult });
            throw new HttpsError("internal", "Failed to retrieve payment token from provider.");
        }

        logger.info(`Extracted transid (payment_token): ${transid}`);

        const walletTimestamp = getEATTimestamp();
        const walletJson = { order_id: orderId, transid: transid, msisdn: phone };
        const { digest: walletDigest, signedFields: walletSignedFields } = generateSignature(walletTimestamp, walletJson);

        const walletResponse = await fetch(`${SELCOM_BASE_URL}/checkout/wallet-payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `SELCOM ${encodedApiKey}`,
                "Digest-Method": "HS256",
                "Digest": walletDigest,
                "Timestamp": walletTimestamp,
                "Signed-Fields": walletSignedFields
            },
            body: JSON.stringify(walletJson)
        });
        const walletResult = await walletResponse.json();

        if (walletResult.result !== "SUCCESS") {
            logger.error("Failed to initiate wallet payment", { response: walletResult });
            throw new HttpsError("internal", walletResult.message || "Failed to initiate USSD push.");
        }

        await paymentDocRef.update({ selcomPaymentToken: transid, status: "processing" });

        logger.info(`--- initiateCVPayment: Success ---`, { cvRequestId: cvRequestDocRef.id });
        return { success: true, cvRequestId: cvRequestDocRef.id };

    } catch (error: any) {
        logger.error("An error occurred during payment initiation:", { orderId, error });
        if (paymentDocRef) await paymentDocRef.update({ status: "failed", error: error.message });
        if (cvRequestDocRef) await cvRequestDocRef.update({ paymentStatus: "Failed", error: error.message });

        if (error instanceof HttpsError) throw error;
        throw new HttpsError("internal", "An unexpected error occurred.");
    }
});
