
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// --- Type Definitions ---
type TestAttemptHistory = {
    id: string;
    categoryTitle: string;
    completedAt: { toDate: () => Date };
    score: number;
    isPassed: boolean;
    totalQuestions: number;
};

// --- Data Fetching ---
const fetchTestHistory = async (userId: string): Promise<TestAttemptHistory[]> => {
    const attemptsRef = collection(db, 'test_attempts');
    const q = query(
        attemptsRef,
        where('userId', '==', userId),
        where('status', '==', 'completed'),
        orderBy('completedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            categoryTitle: data.categoryTitle,
            completedAt: data.completedAt,
            score: data.score,
            isPassed: data.isPassed,
            totalQuestions: Array.isArray(data.answers) ? data.answers.length : 0,
        };
    });
};

const TestHistoryPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: history = [], isLoading, error } = useQuery<TestAttemptHistory[]>({
        queryKey: ['testHistory', user?.uid],
        queryFn: () => fetchTestHistory(user!.uid),
        enabled: !!user,
    });

    const handleViewResult = (attemptId: string) => {
        navigate(`/jitesti/results/${attemptId}`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container py-8">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="/dashboard">Home</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="/jitesti">Jitesti</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbPage>My Test History</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <Card>
                    <CardHeader>
                        <CardTitle>My Test History</CardTitle>
                        <CardDescription>A record of all the tests you have completed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <p>Loading your test history...</p>}
                        {error && <p className="text-red-500">Error loading history: {(error as Error).message}</p>}
                        {!isLoading && !error && history.length === 0 && (
                            <div className="text-center text-muted-foreground py-12">
                                <p>You haven't completed any tests yet.</p>
                                <Button onClick={() => navigate('/jitesti')} className="mt-4">Start a New Test</Button>
                            </div>
                        )}
                        {!isLoading && history.length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Test Title</TableHead>
                                        <TableHead>Date Completed</TableHead>
                                        <TableHead className="text-center">Result</TableHead>
                                        <TableHead className="text-right">Score</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((attempt) => (
                                        <TableRow key={attempt.id}>
                                            <TableCell className="font-medium">{attempt.categoryTitle}</TableCell>
                                            <TableCell>{attempt.completedAt.toDate().toLocaleDateString()}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={attempt.isPassed ? 'default' : 'destructive'}>
                                                    {attempt.isPassed ? 'Passed' : 'Failed'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{attempt.score} / {attempt.totalQuestions}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleViewResult(attempt.id)}>
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default TestHistoryPage;
