import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';

export interface TopMatch {
  driverId: string;
  name: string;
  score: number;
  reasoning: string;
  category: string;
  experience: string;
}

export interface JobMatchData {
  jobId: string;
  employerId: string;
  totalMatchesFound: number;
  lastCalculatedAt: any;
  topMatches: TopMatch[];
}

export interface JobWithMatches {
  id: string;
  jobTitle: string;
  employer: string;
  status: string;
  postedDate: any;
  matchData?: JobMatchData;
}

export const useMatchingMonitor = () => {
  const queryClient = useQueryClient();

  const { data: jobsWithMatches = [], isLoading, refetch } = useQuery({
    queryKey: ['admin_matching_monitor'],
    queryFn: async () => {
      // 1. Fetch active jobs (Open, Published - handling case variations)
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, where('status', 'in', ['Open', 'open', 'Published', 'published']));
      const snapshot = await getDocs(q);
      
      const jobs: JobWithMatches[] = [];
      const matchPromises = snapshot.docs.map(async (jobDoc) => {
        const data = jobDoc.data();
        
        // 2. Fetch match data for each job
        const matchDocRef = doc(db, 'job_matches', jobDoc.id);
        const matchDocSnap = await getDoc(matchDocRef);
        let matchData: JobMatchData | undefined;

        if (matchDocSnap.exists()) {
          matchData = matchDocSnap.data() as JobMatchData;
        }

        jobs.push({
          id: jobDoc.id,
          jobTitle: data.job_title || 'Untitled Job',
          employer: data.employerName || 'Unknown Employer',
          status: data.status,
          postedDate: data.posted_date,
          matchData
        });
      });

      await Promise.all(matchPromises);
      
      // Sort jobs by posted date descending
      jobs.sort((a, b) => {
        const dateA = a.postedDate?.toMillis?.() || 0;
        const dateB = b.postedDate?.toMillis?.() || 0;
        return dateB - dateA;
      });
      
      return jobs;
    }
  });

  const calculateMatchesMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const functions = getFunctions();
      const calculateJobMatches = httpsCallable(functions, 'calculateJobMatches');
      return await calculateJobMatches({ jobId });
    },
    onSuccess: (result: any) => {
      if (result.data?.success) {
        toast.success(`Successfully calculated matches (${result.data.matchesCount} found).`);
        queryClient.invalidateQueries({ queryKey: ['admin_matching_monitor'] });
      } else {
        toast.info(result.data?.message || 'Calculation completed but no matches found.');
      }
    },
    onError: (error: any) => {
      console.error('Error calculating matches:', error);
      toast.error(error.message || 'Failed to calculate matches using Vertex AI.');
    }
  });

  return {
    jobsWithMatches,
    isLoading,
    refetch,
    calculateMatches: calculateMatchesMutation.mutate,
    isCalculating: calculateMatchesMutation.isPending,
    calculatingJobId: calculateMatchesMutation.variables 
  };
};
