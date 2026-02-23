import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

export const selcomWebhook = functions.https.onRequest(async (request, response) => {
    functions.logger.info("Selcom webhook received!", { body: request.body });

    const { order_id, status } = request.body;

    if (!order_id) {
        functions.logger.error("Webhook payload missing 'order_id'.");
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

        // Determine the new status based on the webhook payload
        let newStatus = "";
        if (status === "COMPLETED") {
            newStatus = "completed";
        } else if (status === "FAILED") {
            newStatus = "failed";
        } else {
            newStatus = "pending"; // Or handle other statuses as needed
        }

        // Update the payment status
        await db.collection("payments").doc(paymentId).update({ status: newStatus });
        functions.logger.info(`Payment ${paymentId} status updated to ${newStatus}`);

        // If payment is completed, update the corresponding test_attempt
        if (newStatus === "completed" && paymentData.service === "JiTesti") {
            const testAttemptsRef = db.collection("test_attempts");
            const testAttemptQuery = await testAttemptsRef.where("paymentId", "==", paymentId).get();

            if (!testAttemptQuery.empty) {
                const testAttemptDoc = testAttemptQuery.docs[0];
                await db.collection("test_attempts").doc(testAttemptDoc.id).update({ status: "started" });
                functions.logger.info(`Test attempt ${testAttemptDoc.id} status updated to 'started'`);
            }
        }

        response.status(200).send("Webhook processed successfully.");

    } catch (error) {
        functions.logger.error("Error processing webhook:", error);
        response.status(500).send("Internal Server Error");
    }
});
