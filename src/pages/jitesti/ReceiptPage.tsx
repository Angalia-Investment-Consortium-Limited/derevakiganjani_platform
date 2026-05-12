import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import ReceiptViewer from '@/components/shared/ReceiptViewer';

const ReceiptPage: React.FC = () => {
  const { testAttemptId } = useParams<{ testAttemptId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceiptData = async () => {
      if (!testAttemptId || !user) return;
      
      try {
        const attemptRef = doc(db, 'test_attempts', testAttemptId);
        const attemptSnap = await getDoc(attemptRef);
        
        if (attemptSnap.exists()) {
          const data = attemptSnap.data();
          const userName = user.full_name || 'Unknown User';
          
          setReceipt({
            id: `rcpt_${testAttemptId}`,
            referenceNumber: `TST${data.categoryId?.substring(0, 4) || 'XXXX'}${testAttemptId.substring(0, 4).toUpperCase()}`,
            issuedAt: data.startTime ? new Date(data.startTime.seconds * 1000).toISOString() : new Date().toISOString(),
            userName: userName,
            serviceName: data.categoryTitle || 'Driving Test Exam',
            paymentMethod: data.paymentMethod || 'mpesa',
            currency: 'TZS',
            amount: data.price || 30000,
          });
        } else {
          setError('Receipt not found');
        }
      } catch (err) {
        console.error('Error fetching receipt:', err);
        setError('Failed to load receipt details');
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptData();
  }, [testAttemptId, user]);

  const handleContinue = () => {
    // Check if there's a custom next route in state
    if (location.state?.next) {
      navigate(location.state.next);
    } else {
      navigate(`/jitesti/test/${testAttemptId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>
          <button
            onClick={handleContinue}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReceiptViewer 
      receipt={receipt} 
      onContinue={handleContinue} 
      continueText="Continue to Test" 
    />
  );
};

export default ReceiptPage;
