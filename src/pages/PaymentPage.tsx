
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { functions, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const PaymentPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get the current user
    const [status, setStatus] = useState('Initializing payment...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initiatePayment = async () => {
            if (!categoryId) {
                setError('No category ID provided.');
                return;
            }
            if (!user || !user.phoneNumber) {
                setError('User phone number is not available.');
                return;
            }

            try {
                // Fetch the category details from Firestore
                setStatus("Fetching category details...");
                const categoryRef = doc(db, "jitesti-categories", categoryId);
                const categorySnap = await getDoc(categoryRef);

                if (!categorySnap.exists()) {
                    throw new Error("Test category not found.");
                }
                const categoryData = categorySnap.data();

                setStatus('Contacting payment processor...');
                const initiateSelcomPayment = httpsCallable(functions, 'initiateSelcomPayment');
                const result = await initiateSelcomPayment({
                    categoryId,
                    phone: user.phoneNumber,
                    category: {
                        price: categoryData.price,
                        passMark: categoryData.passMark,
                        durationInMinutes: categoryData.duration_minutes
                    },
                });

                const { success, testAttemptId } = result.data as { success: boolean; testAttemptId: string; };

                if (success && testAttemptId) {
                    setStatus('Payment initiated. Waiting for confirmation...');
                    
                    const testAttemptRef = doc(db, 'test_attempts', testAttemptId);
                    const unsubscribe = onSnapshot(testAttemptRef, (doc) => {
                        const data = doc.data();
                        if (data) {
                            setStatus(`Payment status: ${data.status}`);
                            if (data.status === 'started') {
                                unsubscribe();
                                navigate(`/jitesti/test/${testAttemptId}`);
                            } else if (data.status === 'failed' || data.status === 'payment_failed') {
                                unsubscribe();
                                setError('Payment failed. Please try again.');
                            }
                        }
                    });
                } else {
                    throw new Error('Failed to initiate payment.');
                }
            } catch (err: any) {
                console.error('Payment initiation error:', err);
                setError(err.message || 'An unknown error occurred.');
                setStatus('Payment failed.');
            }
        };

        initiatePayment();
    }, [categoryId, navigate, user]);

    return (
        <div>
            <h1>Payment Processing</h1>
            <p>Status: {status}</p>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {/* You could add a loading spinner here */}
        </div>
    );
};

export default PaymentPage;
