
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, documentId, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { generateCertificate } from '@/services/CertificateGenerationService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// --- Type Definitions ---
type TestAttempt = {
    id: string;
    userId: string;
    categoryId?: string;
    testId?: string;
    categoryTitle: string;
    startTime: { toDate: () => Date };
    durationInMinutes: number;
    passMark: number;
    status: 'started' | 'completed';
    score?: number;
};

type Question = {
    id: string;
    text: string;
    options: string[];
    correctAnswerIndex: number;
    category: string;
};

// --- Data Fetching ---
const fetchTestAttempt = async (attemptId: string): Promise<TestAttempt | null> => {
    const docRef = doc(db, 'test_attempts', attemptId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as TestAttempt : null;
};

const fetchTestQuestions = async (lookupId: string | undefined): Promise<Question[]> => {
    if (!lookupId) return [];
    const testsRef = collection(db, 'tests');
    let testQuerySnapshot = await getDocs(query(testsRef, where('courseId', '==', lookupId)));

    if (testQuerySnapshot.empty) {
        const categoryDocSnap = await getDoc(doc(db, 'jitesti-categories', lookupId));
        if (categoryDocSnap.exists()) {
            const categoryData = categoryDocSnap.data();
            if (categoryData?.category_code) {
                testQuerySnapshot = await getDocs(query(testsRef, where('courseId', '==', categoryData.category_code)));
            }
        }
    }

    if (testQuerySnapshot.empty) {
        const s3_categorySnapshot = await getDocs(query(collection(db, 'jitesti-categories'), where('name_en', '==', lookupId)));
        if (!s3_categorySnapshot.empty) {
            const categoryData = s3_categorySnapshot.docs[0].data();
            if (categoryData?.category_code) {
                testQuerySnapshot = await getDocs(query(testsRef, where('courseId', '==', categoryData.category_code)));
            }
        }
    }

    if (testQuerySnapshot.empty) throw new Error("Test definition not found.");

    const { questionIds } = testQuerySnapshot.docs[0].data() as { questionIds: string[] };
    if (!questionIds || questionIds.length === 0) return [];

    const questionsRef = collection(db, 'Test Question');
    const questionsQuery = query(questionsRef, where(documentId(), 'in', questionIds));
    const questionsSnapshot = await getDocs(questionsQuery);

    const questionsMap = new Map<string, Question>();
    questionsSnapshot.forEach(qDoc => {
        const data = qDoc.data();
        const optionsData = data.options || {};
        const sortedOptions = Object.entries(optionsData)
            .sort(([keyA], [keyB]) => parseInt(keyA) - parseInt(keyB))
            .map(([, val]: [string, any]) => val.optionTextSw || val.optionTextEn || '');
        
        let correctIndex = data.correct_option_index ?? -1;

        questionsMap.set(qDoc.id, {
            id: qDoc.id,
            text: data.question_text_sw || data.questionTextSw || data.questionTextEn || "Question text missing",
            options: sortedOptions,
            correctAnswerIndex: correctIndex,
            category: data.category || 'General',
        });
    });

    return questionIds.map(id => questionsMap.get(id)).filter((q): q is Question => !!q);
};

const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const TestPage: React.FC = () => {
    const { testAttemptId = '' } = useParams<{ testAttemptId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [qid: string]: number }>({});
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const { data: testAttempt, isLoading: isLoadingAttempt, error: attemptError } = useQuery<TestAttempt | null>({
        queryKey: ['test-attempt', testAttemptId], queryFn: () => fetchTestAttempt(testAttemptId), staleTime: Infinity
    });

    const testLookupId = testAttempt?.categoryId || testAttempt?.testId || testAttempt?.categoryTitle;
    const { data: questions = [], isLoading: isLoadingQuestions, error: questionsError } = useQuery<Question[]>({
        queryKey: ['test-questions', testLookupId], queryFn: () => fetchTestQuestions(testLookupId), enabled: !!testLookupId, staleTime: Infinity
    });

    useEffect(() => {
        if (!testAttempt || testAttempt.status === 'completed') return;
        const endTime = testAttempt.startTime.toDate().getTime() + testAttempt.durationInMinutes * 60 * 1000;
        const timer = setInterval(() => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) { clearInterval(timer); submitTestMutation.mutate(); }
        }, 1000);
        return () => clearInterval(timer);
    }, [testAttempt]);

    const submitTestMutation = useMutation({
        mutationFn: async () => {
            if (!user || !testAttempt || !questions.length) throw new Error("Missing data for submission.");

            let score = 0;
            const answers = questions.map(q => {
                const selectedIdx = selectedAnswers[q.id] ?? -1;
                const isCorrect = selectedIdx === q.correctAnswerIndex;
                if (isCorrect) score++;
                return { questionId: q.id, questionText: q.text, selectedAnswerIndex: selectedIdx, correctAnswerIndex: q.correctAnswerIndex, isCorrect, category: q.category };
            });

            const isPassed = (score / questions.length) * 100 >= (testAttempt.passMark || 0);

            await updateDoc(doc(db, 'test_attempts', testAttemptId), { status: 'completed', score, answers, completedAt: serverTimestamp(), isPassed });
            return { testAttemptId, isPassed, userId: user.uid, categoryTitle: testAttempt.categoryTitle, userName: user.displayName || 'Anonymous' };
        },
        onSuccess: async (data) => {
            if (data.isPassed) {
                try {
                    toast({ title: "Congratulations!", description: "Generating your certificate..." });
                    await generateCertificate({
                        name: data.userName,
                        course: data.categoryTitle,
                        date: new Date().toLocaleDateString(),
                    }, data.userId);
                } catch (error) {
                    toast({ title: "Certificate Error", description: "Could not generate certificate.", variant: "destructive" });
                }
            }
            toast({ title: "Test Submitted!", description: "Redirecting to your results..." });
            await queryClient.invalidateQueries({ queryKey: ['test-attempt', data.testAttemptId] });
            navigate(`/jitesti/results/${data.testAttemptId}`);
        },
        onError: (e) => toast({ title: "Submission Error", description: (e as Error).message, variant: "destructive" }),
    });

    useEffect(() => {
        if (testAttempt?.status === 'completed') {
            navigate(`/jitesti/results/${testAttemptId}`);
        }
    }, [testAttempt, navigate, testAttemptId]);

    if (isLoadingAttempt) return <div>Loading test...</div>;
    if (attemptError || !testAttempt) return <div className="text-red-500">Error loading test. It may be invalid.</div>;
    if (!user || user.uid !== testAttempt.userId) return <div className="text-red-500">You are not authorized to take this test.</div>;

    const currentQuestion = questions[currentQuestionIndex];
    const progress = questions.length ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <Breadcrumb className="mb-6 container"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/dashboard">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="/jitesti">Jitesti</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Test In Progress</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
            <main className="flex-grow container mx-auto px-4 py-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                               <CardTitle>{testAttempt.categoryTitle}</CardTitle>
                               <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                            </div>
                            <div className="text-lg font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-md">
                                {timeLeft !== null ? formatTime(timeLeft) : "..."}
                            </div>
                        </div>
                        <Progress value={progress} className="mt-4" />
                    </CardHeader>
                    <CardContent className="min-h-[300px]">
                         {isLoadingQuestions ? <p>Loading questions...</p> : questionsError ? <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{questionsError.message}</AlertDescription></Alert> : currentQuestion ? (
                            <div>
                                <p className="text-xl font-semibold mb-6">{currentQuestion.text}</p>
                                <RadioGroup value={selectedAnswers[currentQuestion.id]?.toString()} onValueChange={(v) => setSelectedAnswers(p => ({ ...p, [currentQuestion.id]: parseInt(v) }))}>
                                    {currentQuestion.options.map((option, index) => (
                                        <div key={index} className="flex items-center space-x-2 mb-3 p-3 border rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary">
                                            <RadioGroupItem value={index.toString()} id={`q${currentQuestion.id}-opt${index}`} />
                                            <Label htmlFor={`q${currentQuestion.id}-opt${index}`} className="flex-1 cursor-pointer">{option}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        ) : <p>There are no questions for this test.</p>}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => setCurrentQuestionIndex(p => p - 1)} disabled={currentQuestionIndex === 0}>Previous</Button>
                        {currentQuestionIndex === questions.length - 1 ? (
                            <Button onClick={() => submitTestMutation.mutate()} disabled={submitTestMutation.isPending || !questions.length} className="bg-green-600 hover:bg-green-700">
                               {submitTestMutation.isPending ? 'Submitting...' : 'Finish & Submit'}
                            </Button>
                        ) : (
                            <Button onClick={() => setCurrentQuestionIndex(p => p + 1)} disabled={!questions.length}>Next</Button>
                        )}
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}

export default TestPage;
