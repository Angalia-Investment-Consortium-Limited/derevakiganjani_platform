import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface Certificate {
  id: string;
  driverId: string;
  course_name: string;
  issue_date: any;
  status: string;
  score?: number;
  certificate_url?: string;
  testAttemptId?: string;
}

export const useCertificates = (driverId?: string) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    if (!driverId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'certificates'), 
        where('driverId', '==', driverId),
        where('status', '==', 'Active')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Certificate[];
      
      setCertificates(data);
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch certificates');
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return { certificates, isLoading, error, refetch: fetchCertificates };
};
