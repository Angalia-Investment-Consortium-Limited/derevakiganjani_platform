import React from 'react';
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Component's Type Definition
type JitestiCategory = {
  id: string;
  title: string;
  description: string;
  price: number;
  durationInMinutes: number;
  passMark: number;
};

// Fetch function with correct Firestore field mapping
const fetchCategory = async (categoryId: string): Promise<JitestiCategory | null> => {
    if (!categoryId) return null;
    const docRef = doc(db, 'jitesti-categories', categoryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            title: data.name_en || 'Untitled Test',       // Map from name_en
            description: data.description_en || '', // Map from description_en
            price: data.price || 0,
            durationInMinutes: data.duration_minutes || 0, // Map from duration_minutes
            passMark: data.pass_mark || 0,             // Map from pass_mark
        };
    }
    return null;
};

const PaymentPage: React.FC = () => {
  const { categoryId = '' } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the authenticated user
  const { toast } = useToast();

  const { data: category, isLoading, error } = useQuery<JitestiCategory | null>({ 
    queryKey: ['jitesti-category', categoryId], 
    queryFn: () => fetchCategory(categoryId),
    enabled: !!categoryId, 
  });

  const createTestAttemptMutation = useMutation({
    mutationFn: async () => {
      if (!user || !category) {
        throw new Error("You must be logged in and a category must be selected to start a test.");
      }

      const testAttemptData = {
        userId: user.uid,
        categoryId: categoryId,
        categoryTitle: category.title, // This will now be correctly populated
        durationInMinutes: category.durationInMinutes,
        passMark: category.passMark,
        startTime: serverTimestamp(),
        status: 'started',
        score: null,
        answers: {},
      };

      const docRef = await addDoc(collection(db, 'test_attempts'), testAttemptData);
      return docRef.id;
    },
    onSuccess: (testAttemptId) => {
      navigate(`/jitesti/test/${testAttemptId}`);
    },
    onError: (err) => {
      // Use a more specific error type if available, otherwise fallback to a generic message
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast({
        title: "Error Starting Test",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleStartTest = () => {
    createTestAttemptMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
    <Header/>
    <main className="flex-grow container mx-auto px-4 py-8">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbLink href="/jitesti">Jitesti Categories</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Payment Confirmation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
    <div className="container mx-auto py-10 flex items-center justify-center">
       <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Confirm Your Test</CardTitle>
            <CardDescription>You are about to start the following test.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <p className="text-xs text-muted-foreground text-center">
                This is a simulated payment. No real transaction will be made.
            </p>
            <Button 
                className="w-full" 
                disabled={!category || createTestAttemptMutation.isPending}
                onClick={handleStartTest}
            >
                {createTestAttemptMutation.isPending ? 'Starting Test...' : 'Proceed to Test (Simulated)'}
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
