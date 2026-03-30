import { useState, useCallback, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase';
import type { AdminReportsData } from '@/types/reports';
import { toast } from 'sonner';

interface UseAdminReportsProps {
  dateFrom: string;
  dateTo: string;
  region: string;
}

export const useAdminReports = (dateFrom: string, dateTo: string, region: string) => {
  const [data, setData] = useState<AdminReportsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const functions = getFunctions(app, 'us-central1'); // Must match deploy region
      const getAdminReportsCallable = httpsCallable<UseAdminReportsProps, AdminReportsData>(functions, 'getAdminReports');
      
      const result = await getAdminReportsCallable({
        dateFrom,
        dateTo,
        region
      });
      
      setData(result.data);
    } catch (err: any) {
      console.error("Error fetching admin reports:", err);
      setError(err);
      toast.error(err.message || 'Failed to fetch reports.');
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, region]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchReports
  };
};
