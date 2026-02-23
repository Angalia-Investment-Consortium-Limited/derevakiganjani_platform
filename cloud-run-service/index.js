
const express = require('express');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// --- Firebase Admin SDK Initialization ---
initializeApp();

const db = getFirestore();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// --- Selcom API Configuration ---
const selcomBaseUrl = process.env.SELCOM_BASE_URL || 'https://apigw.selcommobile.com/v1';

const selcomClient = axios.create({
    baseURL: selcomBaseUrl,
    headers: { 'Content-Type': 'application/json' }
});

selcomClient.interceptors.request.use(config => {
    const apiKey = process.env.SELCOM_API_KEY;
    const apiSecret = process.env.SELCOM_API_SECRET;
    config.headers.Authorization = `Bearer ${apiKey}:${apiSecret}`;
    return config;
});

// --- Utility Functions ---

const updatePaymentStatus = async (orderId, newStatus, selcomData = {}) => {
    const paymentsRef = db.collection('payments');
    const q = paymentsRef.where('selcomOrderId', '==', orderId).limit(1);
    const snapshot = await q.get();

    if (snapshot.empty) {
        console.warn(`Webhook received for unknown selcomOrderId: ${orderId}`);
        return null;
    }

    const paymentDocRef = snapshot.docs[0].ref;
    const updateData = {
        status: newStatus,
        selcomResponse: selcomData,
        lastUpdated: new Date()
    };
    await paymentDocRef.update(updateData);
    return { id: paymentDocRef.id, ...updateData };
};

/**
 * Verifies the signature of an incoming webhook request.
 * This is a critical security measure.
 */
const verifyWebhookSignature = (req) => {
    const signature = req.headers['x-selcom-signature'];
    const secret = process.env.SELCOM_WEBHOOK_SECRET;
    if (!signature || !secret) {
        console.warn('Webhook verification failed: Missing signature or secret.');
        return false;
    }

    const hmac = crypto.createHmac('sha1', secret);
    hmac.update(JSON.stringify(req.body));
    const computedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
};


// --- API Endpoints ---

app.get('/', (req, res) => res.send('JiTesti Cloud Run Payment Service is running!'));

// ... (other endpoints: /create-order, /order-status)

/**
 * Webhook endpoint for Selcom to send payment status updates.
 */
app.post('/selcom-webhook', async (req, res) => {
    // if (!verifyWebhookSignature(req)) {
    //     return res.status(401).send('Unauthorized: Invalid signature');
    // }

    const { order_id, payment_status } = req.body;

    if (!order_id || !payment_status) {
        return res.status(400).send('Bad Request: Missing order_id or payment_status');
    }

    try {
        const updatedPayment = await updatePaymentStatus(order_id, payment_status, req.body);
        if (updatedPayment) {
            console.log(`Successfully updated payment ${updatedPayment.id} to ${payment_status}`);
            // You might want to trigger other business processes here, 
            // e.g., sending a confirmation email.
        }
        // Always respond with a 200 to acknowledge receipt of the webhook.
        res.status(200).send({ status: 'received' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
