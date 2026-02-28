
import * as admin from "firebase-admin";

admin.initializeApp();

// Import and re-export all functions from their respective files

// Aggregations
export * from "./aggregations/counters";

// Auth
export * from "./auth/customClaims";
export * from "./auth/resetPassword";

// Notifications
export * from "./notifications/email";
export * from "./notifications/triggers";

// Storage
export * from "./storage/imageProcessing";


import * as functions from "firebase-functions";

const db = admin.firestore();

export const initiateSelcomPayment = functions.https.onCall(async (data, context) => {
    // 1. Input validation
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { categoryId, phone, category, user } = data;
    if (!categoryId || !phone || !category || !user) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required data for payment initiation.');
    }

    const { uid } = user;

    try {
        // 2. Create a payment record
        const paymentRef = await db.collection('payments').add({
            userId: uid,
            categoryId: categoryId,
            amount: category.price,
            status: 'pending',
            service: 'JiTesti',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 3. Create a test attempt record
        const testAttemptRef = await db.collection('test_attempts').add({
            userId: uid,
            categoryId: categoryId,
            paymentId: paymentRef.id,
            status: 'payment_pending',
            startedAt: admin.firestore.FieldValue.serverTimestamp(),
            score: null,
            passMark: category.passMark,
            durationInMinutes: category.durationInMinutes
        });

        // 4. (This is a placeholder) Integrate with Selcom API to create an order
        const selcomTransactionId = `SELCOM-${testAttemptRef.id}`;

        await paymentRef.update({ selcomTransactionId: selcomTransactionId });


        // 5. Return the test attempt ID to the client
        return { success: true, testAttemptId: testAttemptRef.id };

    } catch (error) {
        functions.logger.error('Error initiating Selcom payment:', error);
        throw new functions.https.HttpsError('internal', 'An error occurred while initiating the payment.');
    }
});


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

        
        let newStatus = "";
        if (status === "COMPLETED") {
            newStatus = "completed";
        } else if (status === "FAILED") {
            newStatus = "failed";
        } else {
            newStatus = "pending"; 
        }

        
        await db.collection("payments").doc(paymentId).update({ status: newStatus });
        functions.logger.info(`Payment ${paymentId} status updated to ${newStatus}`);

        
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
