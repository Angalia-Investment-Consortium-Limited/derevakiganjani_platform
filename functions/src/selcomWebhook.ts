
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

// This function will be called by Selcom to notify of payment status updates
export const selcomWebhook = onRequest({ region: 'us-central1' }, async (req, res) => {
    logger.info("--- selcomWebhook: Received a request ---", { body: req.body });

    // 1. Extract data from Selcom's POST request
    const { order_id, transid, result, resultcode, message } = req.body;

    if (!order_id) {
        logger.error("Webhook called without an order_id.", { body: req.body });
        res.status(400).send("Bad Request: Missing order_id");
        return;
    }

    const db = admin.firestore();

    try {
        // 2. Find the payment document using the order_id from the webhook
        const paymentsRef = db.collection("payments");
        const paymentQuery = await paymentsRef.where("selcomTransactionId", "==", order_id).limit(1).get();

        if (paymentQuery.empty) {
            logger.error(`No payment document found for order_id: ${order_id}`);
            // Respond with 200 so Selcom doesn't retry. The issue is on our end.
            res.status(200).send(`Not Found: No payment for order_id ${order_id}`);
            return;
        }

        const paymentDoc = paymentQuery.docs[0];
        const paymentData = paymentDoc.data();

        // Avoid reprocessing a completed/failed payment
        if (paymentData.status === 'completed' || paymentData.status === 'failed') {
            logger.warn(`Payment for order_id ${order_id} has already been processed. Status: ${paymentData.status}`);
            res.status(200).send("Acknowledged: Already processed");
            return;
        }

        // 3. Determine the new status and update the 'payments' document
        const newPaymentStatus = resultcode === '000' && result === 'SUCCESS' ? 'completed' : 'failed';
        
        const updateData: any = {
            status: newPaymentStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (resultcode !== undefined) updateData.selcomResultCode = String(resultcode);
        if (message !== undefined) updateData.selcomResultMessage = String(message);
        if (transid !== undefined) updateData.selcomTransactionId = String(transid);

        await paymentDoc.ref.update(updateData);

        logger.info(`Updated payment ${paymentDoc.id} to status: ${newPaymentStatus}`);

        // 4. Update the corresponding 'test_attempts' or 'license_applications' document
        if (paymentData.service === 'Leseni' && paymentData.applicationId) {
            const appRef = db.collection("license_applications").doc(paymentData.applicationId);
            const newAppStatus = newPaymentStatus === 'completed' ? 'pending-review' : 'payment-failed';
            await appRef.update({ status: newAppStatus });
            logger.info(`Updated license_application ${paymentData.applicationId} to status: ${newAppStatus}`);
        } else {
            const testAttemptsRef = db.collection("test_attempts");
            const testAttemptQuery = await testAttemptsRef.where("paymentId", "==", paymentDoc.id).limit(1).get();

            if (!testAttemptQuery.empty) {
                const testAttemptDoc = testAttemptQuery.docs[0];
                const newTestAttemptStatus = newPaymentStatus === 'completed' ? 'not_started' : 'payment_failed';
                await testAttemptDoc.ref.update({ status: newTestAttemptStatus });
                logger.info(`Updated test_attempt ${testAttemptDoc.id} to status: ${newTestAttemptStatus}`);
            } else {
                logger.error(`Could not find a matching document for payment ${paymentDoc.id}`);
            }
        }

        // 5. Respond to Selcom to acknowledge receipt
        res.status(200).send("Webhook processed successfully");

    } catch (error: any) {
        logger.error("Error processing Selcom webhook:", { error: error.message || error, stack: error.stack, order_id });
        // Respond with 500 to signal an internal error, Selcom might retry.
        res.status(500).send("Internal Server Error");
    }
});
