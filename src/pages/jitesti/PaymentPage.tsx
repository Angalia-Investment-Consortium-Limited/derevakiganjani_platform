import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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

const functions = getFunctions();
const initiateSelcomPayment = httpsCallable(functions, 'initiateSelcomPayment');

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
         if (!phone.match(/^255[0-9]{9}$/)) {
            throw new Error("Please enter a valid phone number in the format 255712345678.");
        }

        const result = await initiateSelcomPayment({
            categoryId,
            phone,
            category, // Send the whole category object
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            } 
        });

        return result.data as { success: boolean; testAttemptId: string };
    },
    onSuccess: (data) => {
        if (data.success) {
            toast({
                title: "Payment Initiated",
                description: "Check your phone and enter your PIN to approve the payment.",
            });
            navigate(`/jitesti/payment-pending/${data.testAttemptId}`);
        } else {
            throw new Error('The payment initiation failed. Please try again.');
        }
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
