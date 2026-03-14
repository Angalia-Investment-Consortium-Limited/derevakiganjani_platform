import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useElimika } from "@/hooks/useElimika";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Question } from "@/types/elimika";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PracticeQuiz = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { language } = useLanguage();
  const { useQuiz, useCourse } = useElimika();

  const { data: quiz, isLoading: quizLoading, isError: quizError } = useQuiz(courseId);
  const { data: course, isLoading: courseLoading, isError: courseError } = useCourse(courseId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  const questions = useMemo(() => quiz?.questions || [], [quiz]);

  const handleSubmit = () => {
    setShowFeedback(true);
    setAnswers([...answers, selectedAnswer]);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setShowFeedback(false);
    } else {
      const correctAnswers = answers.filter((ans, idx) => {
        const question = questions[idx];
        const correctOption = question.options.find(opt => opt.option_id === question.correct_answer);
        return correctOption ? ans === correctOption.option_id : false;
      }).length;
      const score = Math.round((correctAnswers / questions.length) * 100);
      navigate(`/elimika/completion/${courseId}`, { state: { quizScore: score, totalQuestions: questions.length, correctAnswers } });
    }
  };
  
  const isLoading = quizLoading || courseLoading;
  const error = quizError || courseError;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{language === 'en' ? 'Error' : 'Kosa'}</AlertTitle>
                <AlertDescription>
                    {language === 'en' ? 'Failed to load quiz. Please try again later.' : 'Imeshindwa kupakia jaribio. Tafadhali jaribu tena baadaye.'}
                </AlertDescription>
            </Alert>
            <Button className="mt-4" onClick={() => navigate(-1)}>{language === 'en' ? 'Go Back' : 'Rudi Nyuma'}</Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
     return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {language === 'en' ? 'No Questions Found' : 'Hakuna Maswali Yaliyopatikana'}
                    </h1>
                    <p className="mt-4 text-muted-foreground">
                        {language === 'en' ? 'This quiz does not have any questions yet.' : 'Jaribio hili halina maswali bado.'}
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => navigate(`/elimika/course/${courseId}`)}>{language === 'en' ? 'Back to Course' : 'Rudi kwenye Kozi'}</Button>
                    </div>
                </div>
            </main>
            <Footer />
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = showFeedback && selectedAnswer === question.correct_answer;
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const quizTitle = language === 'en' ? (quiz.title_en || 'Practice Quiz') : (quiz.title_sw || quiz.title_en || 'Zoezi la Mazoezi');
  const courseName = language === 'en' ? (course?.course_name_en || '') : (course?.course_name_sw || course?.course_name_en || '')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/dashboard">{language === 'en' ? 'Home' : 'Nyumbani'}</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/elimika">Elimika</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href={`/elimika/course/${courseId}`}>{courseName}</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{quizTitle}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <CardTitle>{quizTitle}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Question' : 'Swali'} {currentQuestion + 1} {language === 'en' ? 'of' : 'kati ya'} {questions.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">{language === 'en' ? question.question_text_en : (question.question_text_sw || question.question_text_en)}</h3>
                
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showFeedback}>
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <div key={option.option_id} className={`flex items-center space-x-2 p-4 rounded-lg border ${
                        showFeedback 
                          ? option.option_id === question.correct_answer 
                            ? "border-success bg-success/10" 
                            : selectedAnswer === option.option_id
                              ? "border-destructive bg-destructive/10"
                              : ""
                          : ""
                      }`}>
                        <RadioGroupItem value={option.option_id} id={option.option_id} />
                        <Label htmlFor={option.option_id} className="flex-1 cursor-pointer">
                          {language === 'en' ? option.option_text_en : (option.option_text_sw || option.option_text_en)}
                        </Label>
                        {showFeedback && option.option_id === question.correct_answer && <CheckCircle2 className="h-5 w-5 text-success" />}
                        {showFeedback && selectedAnswer === option.option_id && option.option_id !== question.correct_answer && <XCircle className="h-5 w-5 text-destructive" />}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {showFeedback && (
                <div className={`p-4 rounded-lg ${isCorrect ? "bg-success/10" : "bg-destructive/10"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span className="font-semibold text-success">{language === 'en' ? 'Correct!' : 'Sahihi!'}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-destructive" />
                        <span className="font-semibold text-destructive">{language === 'en' ? 'Incorrect' : 'Si Sahihi'}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate(`/elimika/course/${courseId}`)}>{language === 'en' ? 'Exit Quiz' : 'Toka kwenye Jaribio'}</Button>
                {!showFeedback ? (
                  <Button onClick={handleSubmit} disabled={!selectedAnswer}>{language === 'en' ? 'Submit Answer' : 'Wasilisha Jibu'}</Button>
                ) : (
                  <Button onClick={handleNext}>
                    {currentQuestion < questions.length - 1 ? (language === 'en' ? 'Next Question' : 'Swali Linalofuata') : (language === 'en' ? 'Finish Quiz' : 'Maliza Jaribio')}
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
};

export default PracticeQuiz;
