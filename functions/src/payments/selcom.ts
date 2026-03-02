
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const cors = require("cors");

const corsHandler = cors({ origin: true });

const db = admin.firestore();

export const initiateSelcomPayment = functions.https.onRequest((request, response) => {
    corsHandler(request, response, async () => {

        // Note: Authentication handling is different for onRequest vs onCall.
        // You would typically verify a Firebase ID token from the Authorization header.
        // This implementation will be updated to properly handle authentication.

        const { categoryId, phone, category, user } = request.body;
        if (!categoryId || !phone || !category || !user) {
            response.status(400).json({ error: "Missing required data for payment initiation." });
            return;
        }

        const { uid } = user;
        if (!uid) {
            response.status(400).json({ error: "User ID is missing." });
            return;
        }

        try {
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

            await paymentRef.update({ selcomTransactionId: selcomTransactionId });

            response.status(200).json({ success: true, testAttemptId: testAttemptRef.id });

        } catch (error) {
            functions.logger.error("Error initiating Selcom payment:", error);
            response.status(500).json({ error: "An error occurred while initiating the payment." });
        }
    });
});
