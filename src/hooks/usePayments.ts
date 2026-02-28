
import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ApplicationStatus } from '@/types/license';
import { toast } from 'sonner';

// TODO: Replace with actual Selcom API details from environment variables
const SELCOM_API_KEY = import.meta.env.VITE_SELCOM_API_KEY || 'TILL61231447-fcffa665b91a415085cd64b07e4f1a75';
const SELCOM_API_SECRET = import.meta.env.VITE_SELCOM_API_SECRET || '4a19e7-221273-452a9c-b0f8fc-0d7d75-49';
const SELCOM_BASE_URL = 'https://api.selcommobile.com/v1'; // Use sandbox for testing

interface SelcomOrder {
    order_id: string;
    status: string;
    payment_status: string;
    // ... other fields from Selcom
}

// This hook will manage the entire payment lifecycle for a license application
export const usePaymentProcessing = (applicationId: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
    const { currentUser } = useAuth();

    // 1. Function to create a Selcom order
    const createPaymentOrder = useCallback(async () => {
        if (!applicationId) return;
        setIsLoading(true);
        setError(null);

        try {
            const appDocRef = doc(db, 'license_applications', applicationId);
            const appDoc = await getDoc(appDocRef);

            if (!appDoc.exists()) throw new Error('Application not found.');

            const applicationData = appDoc.data();
            const paymentDocRef = doc(db, 'payments', applicationData.paymentId);
            const paymentDoc = await getDoc(paymentDocRef);

            if (!paymentDoc.exists()) throw new Error('Payment record not found.');
            
            const { amount } = paymentDoc.data();

            // --- Selcom API Call to Create Order ---
            // This is a MOCK implementation. Replace with your actual API call.
            console.log('Creating Selcom order with:', {
                apiKey: SELCOM_API_KEY,
                order_id: `APP-${applicationId}`,
                amount,
                email: currentUser?.email,
                phone: currentUser?.phoneNumber,
            });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            const selcomOrderId = `SEL-${Date.now()}`;
            // --- End of Mock ---

            // Update our payment document with the Selcom Order ID
            await updateDoc(paymentDocRef, { selcomOrderId });
            setPaymentStatus('pending');

            // TODO: Redirect user to Selcom's checkout page with the selcomOrderId
            console.log(`Redirecting to Selcom checkout for order: ${selcomOrderId}`);
            toast.info("You will be redirected to complete your payment.");
            // window.location.href = `https://checkout.selcommobile.com?order_id=${selcomOrderId}`;

        } catch (err: any) {
            console.error("Error creating payment order:", err);
            setError(err.message || 'Failed to create payment order.');
            toast.error("Failed to initiate payment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [applicationId, currentUser]);

    // 2. Function to poll for payment status
    const pollPaymentStatus = useCallback(async (selcomOrderId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // --- Selcom API Call to Check Order Status ---
            // This is a MOCK implementation. Replace with actual polling.
            console.log(`Polling status for Selcom order: ${selcomOrderId}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            const mockResult = { result: 'COMPLETED' }; // Simulate a completed payment
            // --- End of Mock ---

            const appDocRef = doc(db, 'license_applications', applicationId);
            const appDoc = await getDoc(appDocRef);
            if (!appDoc.exists()) throw new Error("Application data not found.");
            const paymentDocRef = doc(db, 'payments', appDoc.data().paymentId);

            if (mockResult.result === 'COMPLETED') {
                // Update payment and application status in Firestore
                await updateDoc(paymentDocRef, { status: 'completed' });
                await updateDoc(appDocRef, { status: ApplicationStatus.PendingReview });
                setPaymentStatus('completed');
                toast.success("Payment successful! Your application is now under review.");
            } else if (mockResult.result === 'FAILED') {
                await updateDoc(paymentDocRef, { status: 'failed' });
                await updateDoc(appDocRef, { status: ApplicationStatus.PaymentFailed });
                setPaymentStatus('failed');
                toast.error("Payment failed. Please try again.");
            } else {
                // Still pending or in-progress
                setPaymentStatus('in-progress');
            }
        } catch (err: any) {
            console.error("Error polling payment status:", err);
            setError(err.message || 'Failed to update payment status.');
        } finally {
            setIsLoading(false);
        }
    }, [applicationId]);

    return { createPaymentOrder, pollPaymentStatus, isLoading, error, paymentStatus };
};
