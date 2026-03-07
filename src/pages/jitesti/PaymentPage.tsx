
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 
import { useAuth } from '@/contexts/AuthContext';
import { getAuth } from 'firebase/auth';

const PaymentPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [status, setStatus] = useState('Initializing...');
    const [error, setError] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showPhoneInput, setShowPhoneInput] = useState(false);

    useEffect(() => {
        if (user && !user.phoneNumber) {
            setShowPhoneInput(true);
            setStatus('Please provide your phone number to proceed.');
        } else if (user) {
            initiatePayment(user.phoneNumber);
        }
    }, [user, categoryId, navigate]);

    const handlePhoneSubmit = () => {
        if (!phoneNumber.match(/^255[0-9]{9}$/)) {
            setError("Please enter a valid phone number in the format 255712345678.");
            return;
        }
        setError(null);
        initiatePayment(phoneNumber);
    };

    const initiatePayment = async (phone: string) => {
        if (!categoryId) {
            setError('No category ID provided.');
            return;
        }

        setShowPhoneInput(false);
        setStatus('Initializing payment...');

        try {
            setStatus("Fetching category details...");
            const categoryRef = doc(db, "jitesti-categories", categoryId);
            const categorySnap = await getDoc(categoryRef);

            if (!categorySnap.exists()) {
                throw new Error("Test category not found.");
            }
            const categoryData = categorySnap.data();

            setStatus('Contacting payment processor...');

            const auth = getAuth();
            const idToken = await auth.currentUser?.getIdToken();

            if (!idToken) {
                throw new Error("Authentication token not available.");
            }

            const response = await fetch('https://us-central1-derevakiganjani.cloudfunctions.net/initiatePayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    categoryId,
                    phone: phone,
                    category: {
                        price: categoryData.price,
                        passMark: categoryData.passMark,
                        durationInMinutes: categoryData.duration_minutes
                    },
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to initiate payment.');
            }

            const result = await response.json();
            const { success, testAttemptId } = result;

            if (success && testAttemptId) {
                setStatus('Payment initiated. Waiting for confirmation...');
                const testAttemptRef = doc(db, 'test_attempts', testAttemptId);
                const unsubscribe = onSnapshot(testAttemptRef, (snapshot) => {
                    const data = snapshot.data();
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 bg-white shadow-lg rounded-lg text-center max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">Payment Processing</h1>
                <p className="text-lg mb-4">Status: {status}</p>
                {error && <p className="text-red-500 text-lg font-semibold">Error: {error}</p>}

                {showPhoneInput ? (
                    <div className="mt-4">
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="e.g., 255712345678"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                            onClick={handlePhoneSubmit}
                            className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Submit Phone Number
                        </button>
                    </div>
                ) : (
                    <div className="mt-6">
                        <p className="text-sm text-gray-600">Please do not refresh this page.</p>
                        <p className="text-sm text-gray-600">You will be redirected automatically once the payment is confirmed.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
