
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/shared/DataTable';
import { columns } from '@/components/admin/jitesti/results/columns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Type for combined data
export interface JitestiResultRow {
  id: string;
  userName: string;
  userEmail: string;
  categoryTitle: string;
  score: number;
  status: string;
  completedAt: Date | null;
}

// Fetch all test attempts and all users
const fetchJitestiResults = async (): Promise<JitestiResultRow[]> => {
  const attemptsPromise = getDocs(query(collection(db, 'test_attempts'), orderBy('startTime', 'desc')));
  const usersPromise = getDocs(collection(db, 'users'));

  const [attemptsSnapshot, usersSnapshot] = await Promise.all([attemptsPromise, usersPromise]);

  const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));

  const results: JitestiResultRow[] = attemptsSnapshot.docs.map(doc => {
    const attempt = doc.data();
    const user = usersMap.get(attempt.userId);
    const status = attempt.passed ? 'Passed' : 'Failed';

    return {
      id: doc.id,
      userName: user?.full_name || 'N/A',
      userEmail: user?.email || 'N/A',
      categoryTitle: attempt.categoryTitle,
      score: attempt.score,
      status: attempt.status === 'completed' ? status : 'In Progress',
      completedAt: attempt.endTime?.toDate() || null,
    };
  });

  return results;
};

const JitestiResultsPage = () => {
  const { data: results, isLoading, error } = useQuery<JitestiResultRow[], Error>(
    {
      queryKey: ['jitestiResults'],
      queryFn: fetchJitestiResults,
    }
  );

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Jitesti Test Results</h1>

        <Card>
          <CardHeader>
            <CardTitle>All Test Attempts</CardTitle>
            <CardDescription>A complete history of all Jitesti test attempts.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && <p className="text-red-500">Error loading results: {error.message}</p>}
            {results && <DataTable columns={columns} data={results} filterColumn='userName' />}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default JitestiResultsPage;
