
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import cors from "cors";

const db = admin.firestore();

// Initialize cors middleware
const corsHandler = cors({ origin: true });

export const initiatePayment = onRequest(async (request, response) => {
    corsHandler(request, response, async () => {
        functions.logger.info("initiatePayment function triggered.", { body: request.body });

        const idToken = request.headers.authorization?.split('Bearer ')[1];
        if (!idToken) {
            functions.logger.error("Unauthorized: No ID token provided.");
            response.status(401).send({ error: 'Unauthorized' });
            return;
        }

        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (error) {
            functions.logger.error('Error verifying Firebase ID token:', error);
            response.status(401).send({ error: 'Unauthorized' });
            return;
        }

        const uid = decodedToken.uid;
        const { categoryId, phone, category } = request.body;

        functions.logger.info("Extracted data:", { uid, categoryId, phone, category });

        if (!uid) {
            functions.logger.warn("Authentication successful, but no UID found in token.");
            response.status(401).send({ error: "User must be authenticated." });
            return;
        }

        if (!categoryId || !phone || !category || !category.price || !category.passMark || !category.durationInMinutes) {
            functions.logger.error("Bad Request: Missing required data for payment initiation.", { categoryId, phone, category });
            response.status(400).send({ error: "Missing required data for payment initiation." });
            return;
        }

        try {
            functions.logger.log("Attempting to create payment and test_attempt documents.");
            const paymentRef = await db.collection("payments").add({
                userId: uid,
                categoryId: categoryId,
                amount: category.price,
                status: "pending",
                service: "JiTesti",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            const testAttemptRef = await db.collection("test_attempts").add({
                userId: uid,
                categoryId: categoryId,
                paymentId: paymentRef.id,
                status: "payment_pending",
                startedAt: admin.firestore.FieldValue.serverTimestamp(),
                score: null,
                passMark: category.passMark,
                durationInMinutes: category.durationInMinutes
            });

            const selcomTransactionId = `SELCOM-${testAttemptRef.id}`;

            await paymentRef.update({ selcomTransactionId: selcomTransactionId, testAttemptId: testAttemptRef.id });
            functions.logger.info("Successfully created documents and updated payment.", { paymentId: paymentRef.id, testAttemptId: testAttemptRef.id });

            response.status(200).send({ success: true, testAttemptId: testAttemptRef.id });

        } catch (error) {
            functions.logger.error("Critical Error: Failed to interact with Firestore during payment initiation.", { error });
            response.status(500).send({ error: "An error occurred while initiating the payment." });
        }
    });
});


export const selcomWebhook = onRequest(async (request, response) => {
    functions.logger.info("Selcom webhook received!", { body: request.body });

    let data;
    try {
        data = (typeof request.body === 'string') ? JSON.parse(request.body) : request.body;
    } catch (error) {
        functions.logger.error("Failed to parse request body:", error);
        response.status(400).send("Invalid JSON format");
        return;
    }

    const { order_id, status } = data;

    if (!order_id) {
        functions.logger.error("Webhook payload missing 'order_id'.", { payload: data });
        response.status(400).send("Missing 'order_id'");
        return;
    }

    try {
        const paymentsRef = db.collection("payments");
        const querySnapshot = await paymentsRef.where("selcomTransactionId", "==", order_id).get();

        if (querySnapshot.empty) {
            functions.logger.error(`No payment found with selcomTransactionId: ${order_id}`);
            response.status(404).send("Payment not found");
            return;
        }

        const paymentDoc = querySnapshot.docs[0];
        const paymentId = paymentDoc.id;
        const paymentData = paymentDoc.data();

        if (paymentData.status === 'completed' || paymentData.status === 'failed') {
            functions.logger.warn(`Payment ${paymentId} already in a final state: ${paymentData.status}. Ignoring webhook.`);
            response.status(200).send("Webhook ignored, payment already processed.");
            return;
        }

        let newStatus = paymentData.status;
        if (status === "COMPLETED") {
            newStatus = "completed";
        } else if (status === "FAILED" || status === "REJECTED") {
            newStatus = "failed";
        }

        const updatePayload = {
            status: newStatus,
            selcomWebhookData: data
        };

        await db.collection("payments").doc(paymentId).update(updatePayload);
        functions.logger.info(`Payment ${paymentId} status updated to ${newStatus}`);

        if (newStatus === "completed" && paymentData.service === "JiTesti" && paymentData.testAttemptId) {
            const testAttemptRef = db.collection("test_attempts").doc(paymentData.testAttemptId);
            const testAttemptDoc = await testAttemptRef.get();

            if (testAttemptDoc.exists) {
                if(testAttemptDoc.data()?.status === 'payment_pending') {
                    await testAttemptRef.update({ status: "started" });
                    functions.logger.info(`Test attempt ${paymentData.testAttemptId} status updated to 'started'`);
                } else {
                    functions.logger.warn(`Test attempt ${paymentData.testAttemptId} was not in 'pending_payment' state. Current state: ${testAttemptDoc.data()?.status}`);
                }
            } else {
                 functions.logger.error(`Test attempt with ID ${paymentData.testAttemptId} not found.`);
            }
        }

        response.status(200).send("Webhook processed successfully.");

    } catch (error) {
        functions.logger.error("Error processing webhook:", error);
        response.status(500).send("Internal Server Error");
    }
});
