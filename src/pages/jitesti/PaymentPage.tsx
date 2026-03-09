import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, functions, auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';

// Define the structure for the category data passed in navigation state
interface Category {
    id: string;
    title: string;
    price: number;
    durationInMinutes: number;
    passMark: number;
}

// Helper function to format the phone number correctly for the payment gateway
const formatPhoneNumber = (phone: string): string => {
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.substring(1);
    }
    if (formattedPhone.startsWith('0')) {
        return '255' + formattedPhone.substring(1);
    }
    return formattedPhone;
};

const PaymentPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading } = useAuth(); // Use isLoading from AuthContext

    const [category] = useState<Category | null>(location.state?.category || null);
    const [status, setStatus] = useState('Initializing...');
    const [error, setError] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showPhoneInput, setShowPhoneInput] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setStatus('Authenticating...');
            return; // Wait for authentication to complete
        }

        if (!category) {
            setError("Missing test category details. Please go back and select a test again.");
            setStatus("Error");
            return;
        }

        if (user && !user.phoneNumber) {
            setShowPhoneInput(true);
            setStatus('Please provide your phone number to proceed.');
        } else if (user) {
            initiatePayment(user.phoneNumber);
        }
    }, [user, category, navigate, isLoading]);

    const handlePhoneSubmit = () => {
        const formattedPhone = formatPhoneNumber(phoneNumber);
        if (!formattedPhone.match(/^255[0-9]{9}$/)) {
            setError("Please enter a valid Tanzanian phone number (e.g., 0712345678 or 255712345678).");
            return;
        }
        setError(null);
        initiatePayment(formattedPhone);
    };

    const initiatePayment = async (phone: string | null) => {
        const currentUser = auth.currentUser;

        if (!category || !phone || !currentUser) {
            setError('Your session is invalid. Please log in again.');
            setStatus('Payment failed.');
            return;
        }

        const formattedPhone = formatPhoneNumber(phone);
        setShowPhoneInput(false);
        setStatus('Initializing secure payment...');

        try {
            const initiateSelcomPayment = httpsCallable(functions, 'initiateSelcomPayment');

            const requestData = {
                categoryId: category.id,
                phone: formattedPhone,
                category: {
                    title: category.title,
                    price: category.price,
                    passMark: category.passMark,
                    durationInMinutes: category.durationInMinutes,
                },
                user: { // Use the complete user object from Auth
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName
                }
            };
            
            console.log("Calling 'initiateSelcomPayment' with data:", JSON.stringify(requestData, null, 2));
            setStatus('Requesting payment from your provider...');

            const result: any = await initiateSelcomPayment(requestData);

            const { success, testAttemptId } = result.data;

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
                            setError('Payment failed. Please try again or check your balance.');
                        }
                    }
                });
            } else {
                throw new Error('Failed to initiate the payment process.');
            }
        } catch (err: any) {
            console.error('Error calling the payment function:', err);
            setError(err.message || 'An unknown error occurred while initiating payment.');
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
                        <p className="text-sm text-gray-600">A USSD prompt has been sent to your phone. Please enter your PIN to authorize the payment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
