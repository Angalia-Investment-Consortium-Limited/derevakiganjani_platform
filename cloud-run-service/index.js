
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
    const token = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    config.headers.Authorization = `Basic ${token}`;
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

// --- API Endpoints ---

app.get('/', (req, res) => res.send('ELIMIKA Cloud Run Payment Service is running!'));

/**
 * Creates a new order on Selcom.
 * This proxies the request to Selcom to keep API keys secure.
 */
app.post('/create-order', async (req, res) => {
    const { amount, currency, order_id, customer_email, customer_phone, remarks } = req.body;

    if (!amount || !order_id) {
        return res.status(400).send('Bad Request: Missing amount or order_id');
    }

    try {
        const response = await selcomClient.post('/checkout/create-order-minimal', {
            vendor: "MDVFLEET",
            order_id,
            buyer_email: customer_email,
            buyer_phone: customer_phone,
            amount,
            currency: currency || 'TZS',
            remarks: remarks || 'ELIMIKA Course Payment',
            no_of_items: 1
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error creating Selcom order:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    }
});

/**
 * Checks the status of an existing order.
 */
app.get('/order-status/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        const response = await selcomClient.get(`/checkout/order-status?order_id=${orderId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error checking Selcom order status:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    }
});

/**
 * Webhook endpoint for Selcom to send payment status updates.
 */
app.post('/selcom-webhook', async (req, res) => {
    if (!verifyWebhookSignature(req)) {
        console.error('Unauthorized: Invalid webhook signature');
        return res.status(401).send('Unauthorized: Invalid signature');
    }

    const { order_id, payment_status } = req.body;

    if (!order_id || !payment_status) {
        return res.status(400).send('Bad Request: Missing order_id or payment_status');
    }

    try {
        const updatedPayment = await updatePaymentStatus(order_id, payment_status, req.body);
        if (updatedPayment) {
            console.log(`Successfully updated payment ${updatedPayment.id} to ${payment_status}`);
        }
        res.status(200).send({ status: 'received' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
