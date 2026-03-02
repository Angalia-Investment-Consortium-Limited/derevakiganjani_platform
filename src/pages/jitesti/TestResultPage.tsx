
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, Download, RotateCcw, BookOpen, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCertificateGenerator } from '@/hooks/useCertificateGenerator';
import { useToast } from '@/hooks/use-toast';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
};

type CombinedResult = {
    attempt: TestAttempt;
    user: User | null;
};


// --- Data Fetching ---
const fetchTestResult = async (attemptId: string): Promise<CombinedResult> => {
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


const TestResultPage: React.FC = () => {
    const { testAttemptId = '' } = useParams<{ testAttemptId: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { generate, isGenerating } = useCertificateGenerator();

    const { data, isLoading, error, refetch } = useQuery<CombinedResult>({
        queryKey: ['test-result', testAttemptId],
        queryFn: () => fetchTestResult(testAttemptId),
        enabled: !!testAttemptId,
    });

    const result = data?.attempt;
    const user = data?.user;

    useEffect(() => {
        const autoGenerateCertificate = async () => {
            if (result?.isPassed && !result.certificateUrl && user && !isGenerating) {
                
                const certificateData = {
                  name: user.full_name || user.email || 'Anonymous',
                  course: result.categoryTitle,
                  date: new Date().toLocaleDateString(),
                };

                const firestoreData = {
                    driverId: user.id,
                    driverName: user.full_name || user.email || 'Anonymous',
                    course_name: result.categoryTitle,
                    testAttemptId: result.id,
                };

                try {
                    const url = await generate({ data: certificateData, userId: user.id, firestoreData });
                    
                    // Now update the test_attempts document with the new URL
                    const attemptDocRef = doc(db, 'test_attempts', result.id);
                    await updateDoc(attemptDocRef, { certificateUrl: url });

                    toast({
                        title: "Certificate Generated",
                        description: "Your certificate has been successfully generated.",
                    });
                    
                    // Refetch data to get the updated certificate URL
                    refetch();

                } catch (e) {
                    // The hook will show a toast on error
                }
            }
        };

        autoGenerateCertificate();
    }, [result, user, generate, isGenerating, refetch, toast]);


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
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {(error as Error).message}</div>;
    }

    if (!result) {
        return <div className="flex justify-center items-center min-h-screen">No result data found.</div>;
    }

    const totalQuestions = result.answers.length;
    const percentage = totalQuestions > 0 ? Math.round((result.score / totalQuestions) * 100) : 0;
    const passed = result.isPassed;

    const handleDownloadCertificate = () => {
        if (result.certificateUrl) {
            window.open(result.certificateUrl, '_blank');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container py-8">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/jitesti">Jitesti</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Test Result</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="max-w-3xl mx-auto space-y-6">
                    <Card>
                        <CardHeader className="text-center pb-4">
                            <div className="flex justify-center mb-4">
                                <div className={`h-24 w-24 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <Award className={`h-12 w-12 ${passed ? 'text-green-600' : 'text-red-600'}`} />
                                </div>
                            </div>
                            <div className={`inline-block px-6 py-2 rounded-full text-2xl font-bold mb-4 ${
                                passed ? 'bg-green-600 text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                            }`}>
                                {passed ? t('passed') : t('failed')}
                            </div>
                            <CardTitle className="text-4xl font-bold">{result.score}/{totalQuestions}</CardTitle>
                            <CardDescription className="text-lg">{percentage}% Score</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {passed ? (
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/20 rounded-lg text-center">
                                    <p className="font-medium text-green-800 dark:text-green-300">Congratulations! You have passed the driver test.</p>
                                     {isGenerating && <p className="text-sm text-muted-foreground mt-1">Please wait, your certificate is being generated...</p>}
                                     {!isGenerating && result.certificateUrl && <p className="text-sm text-muted-foreground mt-1">Your certificate is ready for download.</p>}
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/20 rounded-lg text-center">
                                    <p className="font-medium text-red-800 dark:text-red-300">You need {result.passMark}% or higher to pass.</p>
                                    <p className="text-sm text-muted-foreground mt-1">Don't worry, you can retake the test.</p>
                                </div>
                            )}

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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                                {passed && (
                                    <Button onClick={handleDownloadCertificate} disabled={!result.certificateUrl || isGenerating}>
                                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                        {isGenerating ? t('generatingCertificate') : t('downloadCertificate')}
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => navigate('/jitesti')}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    {t('retakeTest')}
                                </Button>
                                <Button variant="secondary" onClick={() => navigate('/elimika')}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Go to {t('elimika')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Test Reference Number</p>
                                <p className="font-mono font-medium mt-1">{result.id}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TestResultPage;
