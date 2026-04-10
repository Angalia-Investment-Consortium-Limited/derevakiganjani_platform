import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, documentId, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { generateCertificate } from '@/services/CertificateGenerationService';
import { notificationService } from '@/services/notificationService';
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
import type { TestSection } from '@/components/admin/tests/Columns';

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
    status: 'not_started' | 'started' | 'completed';
    score?: number;
    savedAnswers?: { [qid: string]: number };
};

type Question = {
    id: string;
    text: string;
    options: string[];
    correctAnswerIndex: number;
    category: string;
    imageUrl?: string;
};

type PreparedQuestion = Question & {
    sectionTitle: string;
};

type TestDefinition = {
    id: string;
    test_title_en?: string;
    instructions_en?: string;
    instructions_sw?: string;
    sections?: TestSection[];
    questionIds?: string[];
};

// --- Data Fetching ---
const fetchTestAttempt = async (attemptId: string): Promise<TestAttempt | null> => {
    const docRef = doc(db, 'test_attempts', attemptId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as TestAttempt : null;
};

const fetchTestWithMetadata = async (lookupId: string | undefined): Promise<{ testDef: TestDefinition; questions: PreparedQuestion[] } | null> => {
    if (!lookupId) return null;
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

    const testDoc = testQuerySnapshot.docs[0];
    const testData = { id: testDoc.id, ...testDoc.data() } as TestDefinition;

    let sections = testData.sections;
    if (!sections || sections.length === 0) {
        if (testData.questionIds && testData.questionIds.length > 0) {
            sections = [{
                id: 'legacy',
                title: 'General Knowledge',
                questionIds: testData.questionIds,
                shuffle: true
            }];
        } else {
            return { testDef: testData, questions: [] };
        }
    }

    // Deduplicate IDs just in case they appear multiple times
    const allQuestionIds = Array.from(new Set(sections.flatMap(s => s.questionIds)));
    if (allQuestionIds.length === 0) return { testDef: testData, questions: [] };

    const questionsRef = collection(db, 'Test Question');
    const questionsMap = new Map<string, Question>();

    for (let i = 0; i < allQuestionIds.length; i += 30) {
        const chunk = allQuestionIds.slice(i, i + 30);
        const questionsQuery = query(questionsRef, where(documentId(), 'in', chunk));
        const questionsSnapshot = await getDocs(questionsQuery);

        questionsSnapshot.forEach(qDoc => {
            const data = qDoc.data();
            const optionsData = data.options || {};
            const sortedOptions = Object.entries(optionsData)
                .sort(([keyA], [keyB]) => parseInt(keyA) - parseInt(keyB))
                .map(([, val]: [string, any]) => val.optionTextSw || val.optionTextEn || '');
            
            let correctIndex = -1;
            const correctAnsStr = data.correct_answer || data.correctAnswer;
            if (data.correct_option_index !== undefined) {
                correctIndex = data.correct_option_index;
            } else if (correctAnsStr) {
                switch(correctAnsStr) {
                    case 'A': correctIndex = 0; break;
                    case 'B': correctIndex = 1; break;
                    case 'C': correctIndex = 2; break;
                    case 'D': correctIndex = 3; break;
                }
            }

            questionsMap.set(qDoc.id, {
                id: qDoc.id,
                text: data.question_text_sw || data.questionTextSw || data.questionTextEn || "Question text missing",
                options: sortedOptions.length > 0 ? sortedOptions : [
                    data.option_a_sw || data.option_a_en,
                    data.option_b_sw || data.option_b_en,
                    data.option_c_sw || data.option_c_en,
                    data.option_d_sw || data.option_d_en
                ].filter(Boolean) as string[],
                correctAnswerIndex: correctIndex,
                category: data.category || 'General',
                imageUrl: data.image,
            });
        });
    }

    const finalQuestions: PreparedQuestion[] = [];
    
    sections.forEach(section => {
        let qsForSection = section.questionIds
            .map(id => questionsMap.get(id))
            .filter((q): q is Question => !!q);
            
        if (section.shuffle) {
            for (let i = qsForSection.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [qsForSection[i], qsForSection[j]] = [qsForSection[j], qsForSection[i]];
            }
        }
        
        finalQuestions.push(...qsForSection.map(q => ({
            ...q,
            sectionTitle: section.title
        })));
    });

    return { testDef: testData, questions: finalQuestions };
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

    // Initial Hydration from Firestore
    const [isHydrated, setIsHydrated] = useState(false);

    const { data: testAttempt, isLoading: isLoadingAttempt, error: attemptError } = useQuery<TestAttempt | null>({
        queryKey: ['test-attempt', testAttemptId], queryFn: () => fetchTestAttempt(testAttemptId), staleTime: Infinity
    });

    const testLookupId = testAttempt?.categoryId || testAttempt?.testId || testAttempt?.categoryTitle;
    
    const { data: testPrepData, isLoading: isLoadingQuestions, error: questionsError } = useQuery({
        queryKey: ['test-prep', testLookupId], 
        queryFn: () => fetchTestWithMetadata(testLookupId), 
        enabled: !!testLookupId, 
        staleTime: Infinity
    });

    const questions = testPrepData?.questions || [];
    const testDef = testPrepData?.testDef;

    useEffect(() => {
        if (testAttempt?.savedAnswers && !isHydrated) {
            setSelectedAnswers(testAttempt.savedAnswers || {});
            setIsHydrated(true);
        }
    }, [testAttempt, isHydrated]);

    // Browser unload interception
    useEffect(() => {
        if (testAttempt?.status === 'started' && timeLeft !== null && timeLeft > 0) {
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = '';
            };
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [testAttempt?.status, timeLeft]);

    useEffect(() => {
        if (!testAttempt || testAttempt.status === 'completed' || !testAttempt.startTime || !questions.length) return;
        const duration = testAttempt.durationInMinutes || 120;
        const endTime = testAttempt.startTime.toDate().getTime() + duration * 60 * 1000;
        
        if (Date.now() >= endTime && testAttempt.status === 'started') {
             if (!submitTestMutation.isPending && !submitTestMutation.isSuccess) {
                 toast({ title: "Test Expired", description: "Time ran out while you were away.", variant: "destructive" });
                 submitTestMutation.mutate();
             }
             return;
        }

        const timer = setInterval(() => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) { 
                clearInterval(timer); 
                if (!submitTestMutation.isPending && !submitTestMutation.isSuccess) {
                    submitTestMutation.mutate(); 
                }
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [testAttempt, questions.length]);

    const submitTestMutation = useMutation({
        mutationFn: async () => {
            if (!user || !testAttempt || !questions.length) throw new Error("Missing data for submission.");

            let score = 0;
            const answers = questions.map(q => {
                const selectedIdx = selectedAnswers[q.id] ?? -2; // Prevents matching -1 if unanswered
                const isCorrect = selectedIdx === q.correctAnswerIndex;
                if (isCorrect) score++;
                return { questionId: q.id, questionText: q.text, selectedAnswerIndex: selectedIdx, correctAnswerIndex: q.correctAnswerIndex, isCorrect, category: q.category };
            });

            const isPassed = (score / questions.length) * 100 >= (testAttempt.passMark || 0);

            await updateDoc(doc(db, 'test_attempts', testAttemptId), { status: 'completed', score, answers, completedAt: serverTimestamp(), isPassed });
            
            try {
                const baseUrl = window.location.origin;
                if (isPassed) {
                    await notificationService.sendSystem(user.uid, 'Test Passed', `Congratulations! You passed the ${testAttempt.categoryTitle} test with a score of ${score}/${questions.length}.`, { testAttemptId });
                    if (user.email) {
                        await notificationService.sendEmail(user.email, 'Test Passed', `Congratulations! You passed the ${testAttempt.categoryTitle} test with a score of ${score}/${questions.length}.\n\nYour certificate is being generated. You can view your detailed test results here: ${baseUrl}/jitesti/results/${testAttemptId}\n\nYou can view and download your certificate from your Learning Dashboard at: ${baseUrl}/elimika/my-learning`, user.uid);
                    }
                } else {
                    await notificationService.sendSystem(user.uid, 'Test Failed', `You scored ${score}/${questions.length} on the ${testAttempt.categoryTitle} test. Keep studying and try again!`, { testAttemptId });
                    if (user.email) {
                        await notificationService.sendEmail(user.email, 'Test Failed', `You scored ${score}/${questions.length} on the ${testAttempt.categoryTitle} test which is below the pass mark. Keep studying and try again!\n\nYou can view your detailed test results here: ${baseUrl}/jitesti/results/${testAttemptId}`, user.uid);
                    }
                }
            } catch (e) {
                console.error("Failed to send notification: ", e);
            }

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

    if (isLoadingAttempt || isLoadingQuestions) return <div className="p-8 text-center">Loading test environment...</div>;
    if (attemptError || !testAttempt) return <div className="text-red-500 p-8">Error loading test ticket. It may be invalid.</div>;
    if (questionsError) return <div className="text-red-500 p-8">Error loading test definition. Please try again.</div>;
    if (!user || user.uid !== testAttempt.userId) return <div className="text-red-500 p-8">You are not authorized to take this test.</div>;

    if (testAttempt.status === 'not_started' || !testAttempt.startTime) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
                    <Card className="max-w-2xl w-full text-left shadow-lg border-2 border-primary/20">
                         <CardHeader className="bg-primary/5 pb-6 border-b text-center">
                             <CardTitle className="text-3xl font-bold uppercase tracking-tight">
                                 {testDef?.test_title_en?.trim() || testAttempt.categoryTitle}
                             </CardTitle>
                             {(testDef?.test_title_en?.trim() !== testAttempt.categoryTitle) && (
                                 <CardDescription className="text-lg">({testAttempt.categoryTitle})</CardDescription>
                             )}
                         </CardHeader>
                         <CardContent className="pt-6 px-8">
                             <div className="mb-8">
                                 <h3 className="text-xl font-bold mb-4 text-foreground/80">Maelekezo (Instructions):</h3>
                                 <ul className="list-decimal list-outside ml-6 space-y-2 text-md leading-relaxed">
                                     <li>Huu mtihani una jumla ya maswali <span className="font-bold">{questions.length}</span>.</li>
                                     <li>Jibu maswali yote.</li>
                                     <li>Una <span className="font-bold">{testAttempt.durationInMinutes || 120}</span> dakika kujibu maswali yote.</li>
                                     <li>Unatakiwa kupata alama <span className="font-bold">{testAttempt.passMark}%</span> kufaulu huu mtihani.</li>
                                     <li className="text-muted-foreground italic">This test has a total of <span className="font-bold">{questions.length}</span> questions.</li>
                                     <li className="text-muted-foreground italic">Answer all questions.</li>
                                     <li className="text-muted-foreground italic">You have <span className="font-bold">{testAttempt.durationInMinutes || 120}</span> minutes to answer all questions.</li>
                                     <li className="text-muted-foreground italic">You must score <span className="font-bold">{testAttempt.passMark}%</span> to pass this test.</li>
                                     
                                     {testDef?.instructions_sw && (
                                         testDef.instructions_sw.split('\n').map((line, i) => (
                                             line.trim() ? <li key={`sw-${i}`}>{line.replace(/^-\s*/, '')}</li> : null
                                         ))
                                     )}
                                     {testDef?.instructions_en && (
                                         testDef.instructions_en.split('\n').map((line, i) => (
                                             line.trim() ? <li key={`en-${i}`} className="text-muted-foreground italic">{line.replace(/^-\s*/, '')}</li> : null
                                         ))
                                     )}
                                 </ul>
                                 <p className="mt-8 font-bold text-primary tracking-widest text-center">TUNAKUTAKIA KILA LA KHERI.</p>
                             </div>
                         </CardContent>
                         <CardFooter className="bg-muted/30 pt-6">
                             <Button onClick={async () => {
                                 try {
                                     await updateDoc(doc(db, 'test_attempts', testAttemptId), { status: 'started', startTime: serverTimestamp() });
                                     await queryClient.invalidateQueries({ queryKey: ['test-attempt', testAttemptId] });
                                 } catch (e: any) {
                                     toast({ title: "Error starting test", description: e.message, variant: "destructive" });
                                 }
                             }} size="lg" className="w-full text-xl py-8 shadow-md">
                                 START TEST NOW
                             </Button>
                         </CardFooter>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = questions.length ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <Breadcrumb className="mb-6 container"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/dashboard">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="/jitesti">Jitesti</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Test In Progress</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
            
            <main className="flex-grow container mx-auto px-4 py-8">
                <Card className="max-w-4xl mx-auto shadow-md">
                    <CardHeader className="bg-muted/10 border-b pb-4">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                               <CardTitle className="uppercase text-xl text-primary">{testDef?.test_title_en || testAttempt.categoryTitle}</CardTitle>
                            </div>
                            <div className="text-lg font-bold bg-primary text-primary-foreground px-4 py-1.5 rounded-full shadow-sm">
                                {timeLeft !== null ? formatTime(timeLeft) : "..."}
                            </div>
                        </div>
                        {currentQuestion && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-semibold tracking-wider">SEHEMU X</span>
                                <span className="font-semibold text-lg text-foreground/80">{currentQuestion.sectionTitle}</span>
                            </div>
                        )}
                        <div className="mt-4 flex items-center gap-4">
                            <Progress value={progress} className="flex-grow h-2" />
                            <span className="text-sm font-medium whitespace-nowrap">Q: {currentQuestionIndex + 1} / {questions.length}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="min-h-[350px] pt-8">
                         {currentQuestion ? (
                            <div className="max-w-3xl mx-auto">
                                <p className="text-2xl font-medium mb-8 leading-relaxed">{currentQuestionIndex + 1}. {currentQuestion.text}</p>
                                {currentQuestion.imageUrl && (
                                    <div className="mb-8 flex justify-center bg-muted/10 p-4 rounded-lg border">
                                        <img src={currentQuestion.imageUrl} alt="Question Component" className="max-w-full max-h-80 object-contain rounded shadow-sm" />
                                    </div>
                                )}
                                <RadioGroup value={selectedAnswers[currentQuestion.id] !== undefined ? selectedAnswers[currentQuestion.id].toString() : ""} onValueChange={async (v) => {
                                    const val = parseInt(v);
                                    setSelectedAnswers(p => ({ ...p, [currentQuestion.id]: val }));
                                    try {
                                        await updateDoc(doc(db, 'test_attempts', testAttemptId), {
                                            [`savedAnswers.${currentQuestion.id}`]: val
                                        });
                                    } catch (e) {
                                        console.error("Auto-save failed", e);
                                    }
                                }}>
                                    {currentQuestion.options.map((option, index) => (
                                        <div key={index} className="flex items-center space-x-4 mb-4 p-4 border-2 rounded-lg transition-all hover:border-primary/50 has-[:checked]:bg-primary/5 has-[:checked]:border-primary shadow-sm">
                                            <RadioGroupItem value={index.toString()} id={`q${currentQuestion.id}-opt${index}`} className="w-5 h-5" />
                                            <Label htmlFor={`q${currentQuestion.id}-opt${index}`} className="flex-1 cursor-pointer text-lg">{option}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        ) : <p className="text-center text-muted-foreground mt-20">There are no questions assigned to this test.</p>}
                    </CardContent>
                    <CardFooter className="flex justify-between border-t bg-muted/5 pt-6">
                        <Button variant="outline" size="lg" onClick={() => setCurrentQuestionIndex(p => p - 1)} disabled={currentQuestionIndex === 0} className="w-32">
                            PREVIOUS
                        </Button>
                        {currentQuestionIndex === questions.length - 1 ? (
                            <Button size="lg" onClick={() => submitTestMutation.mutate()} disabled={submitTestMutation.isPending || !questions.length} className="bg-green-600 hover:bg-green-700 w-48 text-white">
                                {submitTestMutation.isPending ? 'Submitting...' : 'FINISH & SUBMIT'}
                            </Button>
                        ) : (
                            <Button size="lg" onClick={() => setCurrentQuestionIndex(p => p + 1)} disabled={!questions.length} className="w-32">
                                NEXT
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}

export default TestPage;
