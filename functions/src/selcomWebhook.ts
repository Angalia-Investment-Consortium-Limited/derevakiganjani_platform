
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already done
if (admin.apps.length === 0) {
    admin.initializeApp();
}

interface SelcomWebhookData {
    order_id: string;
    reference: string;
    result: 'SUCCESS' | 'FAIL';
    message: string;
    msisdn?: string;
}

export const selcomWebhook = onRequest({ cpu: 1, memory: '256MiB', region: 'us-central1' }, async (req, res) => {
    logger.info("--- selcomWebhook: Start ---", { body: req.body });

    // 1. Basic Validation
    if (req.method !== "POST") {
        logger.warn("Webhook called with invalid method:", req.method);
        res.status(405).send("Method Not Allowed");
        return;
    }

    const data: SelcomWebhookData = req.body;
    if (!data.order_id || !data.result) {
        logger.error("Webhook received invalid data:", data);
        res.status(400).send("Invalid webhook data");
        return;
    }

    let paymentQuerySnapshot: admin.firestore.QuerySnapshot | undefined;

    try {
        // 2. Find Payment and Test Attempt documents
        const paymentsRef = admin.firestore().collection("payments");
        paymentQuerySnapshot = await paymentsRef.where("selcomTransactionId", "==", data.order_id).limit(1).get();

        if (paymentQuerySnapshot.empty) {
            logger.error(`No payment document found for Selcom order ID: ${data.order_id}`);
            res.status(404).send("Payment not found");
            return;
        }

        const paymentDoc = paymentQuerySnapshot.docs[0];
        const paymentId = paymentDoc.id;

        const testAttemptsRef = admin.firestore().collection("test_attempts");
        const testAttemptQuerySnapshot = await testAttemptsRef.where("paymentId", "==", paymentId).limit(1).get();

        if (testAttemptQuerySnapshot.empty) {
            logger.error(`No test attempt found for payment ID: ${paymentId}`);
            // Still update the payment status even if the test attempt is missing
        }

        const testAttemptDoc = testAttemptQuerySnapshot.docs[0];

        // 3. Update Status based on Webhook result
        if (data.result === 'SUCCESS') {
            logger.info(`Payment successful for order ID: ${data.order_id}`);
            await paymentDoc.ref.update({ status: 'completed', selcomReference: data.reference, message: data.message });
            if (testAttemptDoc) {
                await testAttemptDoc.ref.update({ status: 'started', startTime: admin.firestore.FieldValue.serverTimestamp() });
            }
        } else { // FAIL
            logger.error(`Payment failed for order ID: ${data.order_id}`, { message: data.message, reference: data.reference });
            await paymentDoc.ref.update({ status: 'failed', selcomReference: data.reference, message: data.message });
            if (testAttemptDoc) {
                await testAttemptDoc.ref.update({ status: 'payment_failed' });
            }
        }

        // 4. Acknowledge the webhook
        logger.info("--- selcomWebhook: Success ---");
        res.status(200).send({ success: true });

    } catch (error: any) {
        // 5. Error Handling
        logger.error("Error processing Selcom webhook:", { orderId: data.order_id, error });
        res.status(500).send("Internal Server Error");
    }
});
