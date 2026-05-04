import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  doc, 
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CVRequest {
  id: string;
  userId: string;
  amount: number;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  requestStatus: 'Requested' | 'Drafting' | 'Completed';
  createdAt: any;
  updatedAt: any;
  cvUrl?: string;
  driverName?: string;
  driverPhone?: string;
}

export const useCVCreation = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [currentRequest, setCurrentRequest] = useState<CVRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    const q = query(
      collection(db, 'cv_requests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        setCurrentRequest({ id: docSnap.id, ...docSnap.data() } as CVRequest);
      } else {
        setCurrentRequest(null);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching CV request:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const requestCV = async (phone: string) => {
    if (!user?.uid || !phone) return;
    setIsLoading(true);
    try {
      toast({
        title: "Initiating Payment",
        description: "Sending USSD push for 7,000 TZS...",
      });
      
      const functions = getFunctions();
      const initiateCVPayment = httpsCallable(functions, 'initiateCVPayment');
      
      const result = await initiateCVPayment({ phone });
      const data = result.data as any;
      
      if (!data.success) {
        throw new Error("Failed to initiate payment.");
      }

      toast({
        title: "Payment Initiated",
        description: "Please check your phone for the USSD prompt.",
        variant: "default",
      });
      
    } catch (err: any) {
      console.error("Error requesting CV:", err);
      toast({
        title: "Payment Failed",
        description: err.message || "Could not process your request at this time.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { currentRequest, isLoading, requestCV };
};
