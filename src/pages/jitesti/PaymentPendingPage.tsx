import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { doc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2 } from 'lucide-react';

const PaymentPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('order_id');

  const checkPaymentStatusMutation = useMutation({
    mutationFn: async () => {
      if (!orderId) {
        throw new Error("No order ID found to check status.");
      }

      const response = await fetch(`https://apigw.selcommobile.com/v1/checkout/order-status?order_id=${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${btoa('TILL61231447-fcffa665b91a415085cd64b07e4f1a75:4a19e7-221273-452a9c-b0f8fc-0d7d75-49')}`,
        },
      });

      const result = await response.json();

      if (result.result !== 'SUCCESS' || !result.data || result.data.length === 0) {
        throw new Error(result.message || 'Failed to fetch payment status.');
      }

      const paymentStatus = result.data[0].payment_status;

      const paymentsQuery = query(collection(db, 'payments'), where('selcomTransactionId', '==', orderId));
      const testAttemptsQuery = query(collection(db, 'test_attempts'), where('paymentId', '==', orderId));
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const testAttemptsSnapshot = await getDocs(testAttemptsQuery);

      if (paymentStatus === 'COMPLETED') {
        if (!paymentsSnapshot.empty) {
          const paymentDoc = paymentsSnapshot.docs[0];
          await updateDoc(doc(db, 'payments', paymentDoc.id), { status: 'completed' });
        }

        if (!testAttemptsSnapshot.empty) {
          const testAttemptDoc = testAttemptsSnapshot.docs[0];
          await updateDoc(doc(db, 'test_attempts', testAttemptDoc.id), { status: 'started' });
          return testAttemptDoc.id;
        } else {
          throw new Error('Could not find test attempt to start.');
        }
      } else if (['REJECTED', 'CANCELLED', 'USERCANCELLED'].includes(paymentStatus)) {
        if (!paymentsSnapshot.empty) {
          const paymentDoc = paymentsSnapshot.docs[0];
          await updateDoc(doc(db, 'payments', paymentDoc.id), { status: 'failed' });
        }
        if (!testAttemptsSnapshot.empty) {
            const testAttemptDoc = testAttemptsSnapshot.docs[0];
            await updateDoc(doc(db, 'test_attempts', testAttemptDoc.id), { status: 'payment_failed' });
        }
        throw new Error(`Payment was not successful. Status: ${paymentStatus}`)
      } else {
        // PENDING or INPROGRESS
        return null; // Indicates that the payment is still pending and we should keep polling.
      }
    },
    onSuccess: (testAttemptId) => {
        if(testAttemptId){
            toast({
                title: "Payment Successful!",
                description: "Your payment has been confirmed. Starting your test now...",
            });
            navigate(`/jitesti/test/${testAttemptId}`);
        } else {
             toast({
                title: "Payment Still Pending",
                description: "Your payment is still being processed. Please wait a moment and try again.",
            });
        }
    },
    onError: (err) => {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
        toast({
            title: "Payment Status Check Failed",
            description: errorMessage,
            variant: "destructive",
        });
        navigate('/jitesti'); // Optionally navigate back to categories on failure
    },
  });

  const handleCheckStatus = () => {
    checkPaymentStatusMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Processing</CardTitle>
            <CardDescription>
              Your payment is being processed. Please check your phone for a USSD prompt to enter your PIN.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">
              If you've approved the payment, click the button below to check the status.
            </p>
            <Button 
                className="w-full"
                disabled={checkPaymentStatusMutation.isPending}
                onClick={handleCheckStatus}
            >
                {checkPaymentStatusMutation.isPending ? 'Checking Status...' : 'Check Payment Status'}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentPendingPage;
