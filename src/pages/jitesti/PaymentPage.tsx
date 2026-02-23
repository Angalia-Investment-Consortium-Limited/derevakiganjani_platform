import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { v4 as uuidv4 } from 'uuid';

// --- Type Definitions ---
type JitestiCategory = {
  id: string;
  title: string;
  description: string;
  price: number;
  durationInMinutes: number;
  passMark: number;
};

// --- Data Fetching ---
const fetchCategory = async (categoryId: string): Promise<JitestiCategory | null> => {
    if (!categoryId) return null;
    const docRef = doc(db, 'jitesti-categories', categoryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            title: data.name_en || 'Untitled Test',
            description: data.description_en || '',
            price: data.price || 0,
            durationInMinutes: data.duration_minutes || 0,
            passMark: data.pass_mark || 0,
        };
    }
    return null;
};

const PaymentPage: React.FC = () => {
  const { categoryId = '' } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');

  const { data: category, isLoading, error } = useQuery<JitestiCategory | null>({ 
    queryKey: ['jitesti-category', categoryId], 
    queryFn: () => fetchCategory(categoryId),
    enabled: !!categoryId, 
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async (phone: string) => {
        if (!user || !category) {
            throw new Error("You must be logged in and a category must be selected.");
        }
        if (!phone || !/^\d{10,12}$/.test(phone)) {
            throw new Error("Please enter a valid phone number (e.g., 255712345678).");
        }

        const orderId = uuidv4();

        // Create documents in Firestore first
        const paymentDocRef = await addDoc(collection(db, 'payments'), {
            userId: user.uid,
            categoryId: categoryId,
            amount: category.price,
            status: 'pending',
            createdAt: serverTimestamp(),
            selcomTransactionId: orderId,
            phone: phone,
            provider: 'Selcom',
            service: 'JiTesti',
        });

        const testAttemptDocRef = await addDoc(collection(db, 'test_attempts'), {
            userId: user.uid,
            categoryId: categoryId,
            categoryTitle: category.title,
            durationInMinutes: category.durationInMinutes,
            passMark: category.passMark,
            startTime: serverTimestamp(),
            status: 'pending_payment',
            score: null,
            answers: {},
            paymentId: paymentDocRef.id,
        });

        // Step 1: Create Order Minimal
        const createOrderResponse = await fetch('https://apigw.selcommobile.com/v1/checkout/create-order-minimal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${btoa('TILL61231447-fcffa665b91a415085cd64b07e4f1a75:4a19e7-221273-452a9c-b0f8fc-0d7d75-49')}`
            },
            body: JSON.stringify({
                "order_id": orderId,
                "amount": category.price,
                "currency": "TZS",
                "email": user.email,
                "phone": phone,
                "first_name": user.displayName?.split(' ')[0] || '',
                "last_name": user.displayName?.split(' ')[1] || '',
                "no_of_items": 1,
            })
        });

        const createOrderResult = await createOrderResponse.json();

        if (createOrderResult.result !== 'SUCCESS') {
            throw new Error(createOrderResult.message || 'Failed to create Selcom order.');
        }

        // Step 2: Wallet Payment
        const walletPaymentResponse = await fetch('https://apigw.selcommobile.com/v1/wallet-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${btoa('TILL61231447-fcffa665b91a415085cd64b07e4f1a75:4a19e7-221273-452a9c-b0f8fc-0d7d75-49')}`
            },
            body: JSON.stringify({
                "order_id": orderId,
                "phone": phone
            })
        });

        const walletPaymentResult = await walletPaymentResponse.json();

        if (walletPaymentResult.result !== 'SUCCESS') {
            throw new Error(walletPaymentResult.message || 'Failed to initiate USSD push.');
        }

        return { orderId, ...walletPaymentResult };
    },
    onSuccess: () => {
        toast({
            title: "Payment Initiated",
            description: "Please check your phone and enter your PIN to approve the payment.",
        });
        // The user will be polled for payment status on a separate page or via a webhook in a real app
        navigate('/jitesti/payment-pending'); // Redirect to a pending page
    },
    onError: (err) => {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
        toast({
            title: "Payment Error",
            description: errorMessage,
            variant: "destructive",
        });
    },
});

  const handlePayment = () => {
    initiatePaymentMutation.mutate(phoneNumber);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
    <Header/>
    <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="/jitesti">Jitesti Categories</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Payment</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="container mx-auto py-10 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Confirm Your Test</CardTitle>
                    <CardDescription>Review the details and enter your phone number to pay.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading && <p>Loading details...</p>}
                    {error && <p className="text-red-500">Could not load test details.</p>}
                    {category && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">{category.title}</h2>
                            <p className="text-muted-foreground">{category.description}</p>
                            <div className="border-t pt-4 mt-4">
                                <p className="flex justify-between"><span>Duration:</span> <strong>{category.durationInMinutes} minutes</strong></p>
                                <p className="flex justify-between mt-2 text-xl"><span>Price:</span> <strong>TZS {category.price.toLocaleString()}</strong></p>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (e.g., 255712345678)</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="255712345678"
                            disabled={initiatePaymentMutation.isPending}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                    <p className="text-xs text-muted-foreground text-center">
                        You will receive a USSD push notification on your phone to complete the payment.
                    </p>
                    <Button 
                        className="w-full"
                        disabled={!category || !phoneNumber || initiatePaymentMutation.isPending}
                        onClick={handlePayment}
                    >
                        {initiatePaymentMutation.isPending ? 'Initiating Payment...' : `Pay TZS ${category?.price.toLocaleString() || ''}`}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </main>
    <Footer />
    </div>
  );
};

export default PaymentPage;
