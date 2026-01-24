import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJiTesti } from '@/hooks/useJiTesti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TestTimer } from '@/components/jitesti/TestTimer';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AnswerOption } from '@/types/jitesti';

interface Question {
  id: string;
  question_text_en: string;
  question_text_sw: string;
  question_type: string;
  image?: string;
  video_url?: string;
  option_a_en: string;
  option_a_sw: string;
  option_b_en: string;
  option_b_sw: string;
  option_c_en?: string;
  option_c_sw?: string;
  option_d_en?: string;
  option_d_sw?: string;
}

interface TestData {
  attempt_id: string;
  duration_minutes: number;
  total_questions: number;
  pass_mark: number;
  questions: Question[];
}

export default function TestTaking() {
  const { categoryCode } = useParams<{ categoryCode: string }>();
  const [searchParams] = useSearchParams();
  const paymentRef = searchParams.get('payment');
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startTest, submitAnswer, completeTest } = useJiTesti();

  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  // Time is managed by TestTimer component
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  // Initialize test
  useEffect(() => {
    const initializeTest = async () => {
      if (!categoryCode || !paymentRef) {
        toast({
          title: t('error') || 'Error',
          description: t('invalidAccess') || 'Invalid access to test',
          variant: 'destructive',
        });
        navigate('/jitesti');
        return;
      }

      try {
        const response = await startTest(categoryCode, paymentRef);

        if (response?.success && response.attempt_id && response.duration_minutes && response.total_questions && response.pass_mark && response.questions) {
          const data: TestData = {
            attempt_id: response.attempt_id,
            duration_minutes: response.duration_minutes,
            total_questions: response.total_questions,
            pass_mark: response.pass_mark,
            questions: response.questions
          };
          setTestData(data);
        } else {
          throw new Error(response?.message || 'Failed to start test');
        }
      } catch (error: any) {
        toast({
          title: t('error') || 'Error',
          description: error.message || t('testStartFailed') || 'Failed to start test',
          variant: 'destructive',
        });
        navigate('/jitesti');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTest();
  }, [categoryCode, paymentRef, startTest, navigate, toast, t]);

  // Auto-save answers
  const saveAnswer = useCallback(async (questionId: string, answer: string) => {
    if (!testData) return;

    try {
      await submitAnswer(testData.attempt_id, questionId, answer as AnswerOption);

      setAnswers(prev => ({ ...prev, [questionId]: answer }));
    } catch (error: any) {
      console.error('Failed to save answer:', error);
      // Still update local state even if save fails
      setAnswers(prev => ({ ...prev, [questionId]: answer }));
    }
  }, [testData, submitAnswer]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answer: string) => {
    saveAnswer(questionId, answer);
  };

  // Handle question navigation
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (testData?.questions.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  };

  // Toggle mark for review
  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Handle time up
  const handleTimeUp = async () => {
    await submitTest();
  };

  // Submit test
  const submitTest = async () => {
    if (!testData) return;

    setIsSubmitting(true);
    try {
      const response = await completeTest(testData.attempt_id);

      if (response?.success) {
        setTestResults(response.result);
        setShowResults(true);
      } else {
        throw new Error(response?.message || 'Failed to submit test');
      }
    } catch (error: any) {
      toast({
        title: t('error') || 'Error',
        description: error.message || t('testSubmitFailed') || 'Failed to submit test',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get question status for navigation
  const getQuestionStatus = (questionId: string, index: number) => {
    const isAnswered = answers[questionId];
    const isMarked = markedForReview.has(questionId);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) return 'current';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t('loadingTest') || 'Loading your test...'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('error') || 'Error'}</AlertTitle>
            <AlertDescription>
              {t('testNotFound') || 'Test not found or access denied'}
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (showResults && testResults) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {testResults.pass_status === 'Passed' ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-6 w-6" />
                      {t('congratulations') || 'Congratulations!'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <AlertCircle className="h-6 w-6" />
                      {t('testCompleted') || 'Test Completed'}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {testResults.score_percentage.toFixed(1)}%
                  </div>
                  <div className="text-muted-foreground">
                    {t('passMark') || 'Pass Mark'}: {testData.pass_mark}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{testResults.correct_answers}</div>
                    <div className="text-muted-foreground">{t('correct') || 'Correct'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{testResults.wrong_answers}</div>
                    <div className="text-muted-foreground">{t('wrong') || 'Wrong'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{testResults.unanswered}</div>
                    <div className="text-muted-foreground">{t('unanswered') || 'Unanswered'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{testResults.total_questions}</div>
                    <div className="text-muted-foreground">{t('total') || 'Total'}</div>
                  </div>
                </div>

                {testResults.pass_status === 'Passed' && testResults.certificate_id && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>{t('certificateReady') || 'Certificate Ready'}</AlertTitle>
                    <AlertDescription>
                      {t('certificateGenerated') || 'Your certificate has been generated and is ready for download.'}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate('/jitesti/my-tests')}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('viewAllTests') || 'View All Tests'}
                  </Button>
                  {testResults.pass_status === 'Passed' && testResults.certificate_id && (
                    <Button
                      onClick={() => navigate(`/jitesti/certificate/${testResults.certificate_id}`)}
                      className="flex-1"
                    >
                      {t('viewCertificate') || 'View Certificate'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testData.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">
                  {t('question') || 'Question'} {currentQuestionIndex + 1} {t('of') || 'of'} {testData.questions.length}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span>{t('answered') || 'Answered'}: {answeredCount}</span>
                  <span>{t('marked') || 'Marked'}: {markedCount}</span>
                </div>
              </div>

              <TestTimer
                durationMinutes={testData.duration_minutes}
                onTimeUp={handleTimeUp}
              />
            </div>

            {/* Progress Bar */}
            <Progress value={progress} className="mb-4" />

            {/* Question Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-relaxed">
                    {language === 'sw' ? currentQuestion.question_text_sw : currentQuestion.question_text_en}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMarkForReview(currentQuestion.id)}
                    className={markedForReview.has(currentQuestion.id) ? 'text-orange-600' : ''}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>

                {currentQuestion.image && (
                  <div className="mt-4">
                    <img
                      src={currentQuestion.image}
                      alt="Question"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionText = language === 'sw'
                      ? currentQuestion[`option_${option.toLowerCase()}_sw` as keyof Question] as string
                      : currentQuestion[`option_${option.toLowerCase()}_en` as keyof Question] as string;

                    const isSelected = answers[currentQuestion.id] === option;

                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                            isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
                          }`}>
                            {option}
                          </div>
                          <div className="flex-1">{optionText}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t('previous') || 'Previous'}
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToQuestion(0)}
                  >
                    {t('first') || 'First'}
                  </Button>
                )}

                {currentQuestionIndex < testData.questions.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToQuestion(testData.questions.length - 1)}
                  >
                    {t('last') || 'Last'}
                  </Button>
                )}
              </div>

              {currentQuestionIndex === testData.questions.length - 1 ? (
                <Button
                  onClick={submitTest}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('submitting') || 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('submitTest') || 'Submit Test'}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                >
                  {t('next') || 'Next'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('questionNavigator') || 'Questions'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {testData.questions.map((question, index) => {
                    const status = getQuestionStatus(question.id, index);
                    const isMarked = markedForReview.has(question.id);

                    return (
                      <button
                        key={question.id}
                        onClick={() => goToQuestion(index)}
                        className={`relative w-10 h-10 rounded border-2 text-sm font-medium transition-colors ${
                          status === 'current'
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : status === 'answered'
                            ? 'border-green-500 bg-green-500 text-white'
                            : status === 'marked'
                            ? 'border-orange-500 bg-orange-100 text-orange-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {index + 1}
                        {isMarked && (
                          <Flag className="absolute -top-1 -right-1 h-3 w-3 text-orange-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>{t('answered') || 'Answered'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                    <span>{t('notAnswered') || 'Not Answered'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
                    <span>{t('markedForReview') || 'Marked for Review'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 border-2 border-blue-500 rounded"></div>
                    <span>{t('currentQuestion') || 'Current'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
