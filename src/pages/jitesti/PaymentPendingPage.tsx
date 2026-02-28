import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Define the type for a test attempt
type TestAttempt = {
  status: string;
  categoryId: string;
};

const PaymentPendingPage: React.FC = () => {
  const { testAttemptId } = useParams<{ testAttemptId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!testAttemptId) {
      toast({ title: "Error", description: "No test attempt ID found.", variant: "destructive" });
      navigate('/jitesti');
      return;
    }

    const unsub = onSnapshot(doc(db, "test_attempts", testAttemptId), 
      async (docSnap) => {
        if (docSnap.exists()) {
          const testAttempt = docSnap.data() as TestAttempt;

          if (testAttempt.status === 'active') {
            toast({
              title: "Payment Confirmed!",
              description: "Your test is ready. Starting now...",
            });
            navigate(`/jitesti/test/${testAttemptId}`);
          } else if (testAttempt.status === 'payment_failed') {
            toast({
              title: "Payment Failed",
              description: "Your payment could not be processed. Please try again.",
              variant: "destructive",
            });
            navigate(`/jitesti/payment/${testAttempt.categoryId}`); // Redirect back to payment
          }
          // If status is still 'pending_payment', we just keep listening.

        } else {
          toast({ title: "Error", description: "Could not find your test attempt.", variant: "destructive" });
          navigate('/jitesti');
        }
      },
      (error) => {
        console.error("Error listening to test attempt:", error);
        toast({ title: "Error", description: "There was an error verifying payment.", variant: "destructive" });
        navigate('/jitesti');
      }
    );

    // Cleanup listener on component unmount
    return () => unsub();
  }, [testAttemptId, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Processing Payment</CardTitle>
            <CardDescription>
              Please approve the payment on your phone. This page will update automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">
              Waiting for payment confirmation... Do not refresh the page.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentPendingPage;
