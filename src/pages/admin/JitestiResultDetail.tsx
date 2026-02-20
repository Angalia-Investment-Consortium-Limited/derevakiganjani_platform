
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, Download, ArrowLeft, User, Mail, Calendar } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Loader2 } from 'lucide-react';

// --- Type Definitions ---
type TestAnswer = {
    questionId: string;
    questionText: string;
    selectedAnswerIndex: number;
    correctAnswerIndex: number;
    isCorrect: boolean;
    category: string;
};

type TestAttempt = {
    id: string;
    userId: string;
    categoryTitle: string;
    completedAt: { toDate: () => Date };
    passMark: number;
    score: number;
    isPassed: boolean;
    answers: TestAnswer[];
    certificateId?: string;
    certificateUrl?: string;
};

type User = {
    id: string;
    full_name?: string;
    email?: string;
}

type CombinedResult = {
    attempt: TestAttempt;
    user: User | null;
};

// --- Data Fetching ---
const fetchTestResultDetail = async (attemptId: string): Promise<CombinedResult> => {
    const attemptDocRef = doc(db, 'test_attempts', attemptId);
    const attemptDocSnap = await getDoc(attemptDocRef);
    if (!attemptDocSnap.exists()) {
        throw new Error("Test result not found.");
    }
    const attempt = { id: attemptDocSnap.id, ...attemptDocSnap.data() } as TestAttempt;

    let user: User | null = null;
    if (attempt.userId) {
        const userDocRef = doc(db, 'users', attempt.userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            user = { id: userDocSnap.id, ...userDocSnap.data() } as User;
        }
    }

    return { attempt, user };
};


const JitestiResultDetail: React.FC = () => {
    const { attemptId = '' } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery<CombinedResult>({
        queryKey: ['test-result-detail', attemptId],
        queryFn: () => fetchTestResultDetail(attemptId),
        enabled: !!attemptId,
    });
    
    const result = data?.attempt;
    const user = data?.user;

    const performanceByTopic = useMemo(() => {
        if (!result?.answers) return [];

        const topics = new Map<string, { score: number; total: number }>();

        for (const answer of result.answers) {
            const category = answer.category || 'General';
            const topic = topics.get(category) || { score: 0, total: 0 };
            topic.total++;
            if (answer.isCorrect) {
                topic.score++;
            }
            topics.set(category, topic);
        }
        return Array.from(topics.entries()).map(([topic, data]) => ({ topic, ...data }));

    }, [result]);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                 <div className="flex justify-center items-center h-full text-red-500">Error: {(error as Error).message}</div>
            </AdminLayout>
        );
    }

    if (!result) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-full">No result data found.</div>
            </AdminLayout>
        );
    }

    const totalQuestions = result.answers.length;
    const passed = result.isPassed;

    const handleDownloadCertificate = () => {
        if (result.certificateUrl) {
            window.open(result.certificateUrl, '_blank');
        }
    };

    return (
        <AdminLayout>
            <main className="flex-1 container py-8">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/jitesti/results">Jitesti Results</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Result Details</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="max-w-4xl mx-auto space-y-6">
                     <div className="flex justify-between items-center mb-6">
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Results
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                             <Card>
                                <CardHeader className="text-center pb-4">
                                    <div className={`inline-block px-6 py-2 rounded-full text-2xl font-bold mb-4 ${
                                        passed ? 'bg-green-600 text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                                    }`}>
                                        {passed ? 'Passed' : 'Failed'}
                                    </div>
                                    <CardTitle className="text-4xl font-bold">{result.score}/{totalQuestions}</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                     <div>
                                        <h3 className="font-semibold mb-4">Performance by Topic</h3>
                                        <div className="space-y-3">
                                            {performanceByTopic.map((item) => {
                                                const topicPercentage = Math.round((item.score / item.total) * 100);
                                                return (
                                                    <div key={item.topic} className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>{item.topic}</span>
                                                            <span className="font-medium">{item.score}/{item.total}</span>
                                                        </div>
                                                        <Progress value={topicPercentage} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {passed && (
                                        <Button onClick={handleDownloadCertificate} disabled={!result.certificateUrl} className="w-full">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Certificate
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                             <Card>
                                <CardHeader>
                                    <CardTitle>User Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                   {user ? (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-medium">{user.full_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{user.email || 'N/A'}</span>
                                            </div>
                                        </>
                                   ) : <p className="text-sm text-muted-foreground">User details not available.</p>}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Test Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm">{result.completedAt ? new Date(result.completedAt.toDate()).toLocaleString() : 'N/A'}</span>
                                    </div>
                                    <div>
                                         <p className="text-sm text-muted-foreground mt-2">Test Reference</p>
                                         <p className="font-mono text-xs mt-1">{result.id}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </div>
            </main>
        </AdminLayout>
    );
};

export default JitestiResultDetail;
