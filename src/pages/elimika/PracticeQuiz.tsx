
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import type { Quiz, Question } from "@/types/elimika";
import { Loader } from "@/components/ui/loader";

const PracticeQuiz = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [quizTitle, setQuizTitle] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!courseId) {
        setError("Course ID is missing.");
        setLoading(false);
        return;
      }
      try {
        const quizzesCollection = collection(db, 'Quiz');
        const q = query(quizzesCollection, where('course_id', '==', courseId), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("No quiz found for this course.");
          setQuestions([]);
        } else {
          const quizDoc = querySnapshot.docs[0].data() as Quiz;
          setQuestions(quizDoc.questions || []);
          setQuizTitle(quizDoc.title_en || "Practice Quiz");
        }
      } catch (err) {
        setError("Failed to fetch quiz data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId]);

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
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {error}
            </h1>
            <p className="mt-4 text-muted-foreground">
                There was an issue loading the quiz. Please try again later.
            </p>
            <div className="mt-6">
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
     return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                No Questions Found
            </h1>
            <p className="mt-4 text-muted-foreground">
                This quiz does not have any questions yet.
            </p>
            <div className="mt-6">
                <Button onClick={() => navigate(`/elimika/course/${courseId}`)}>Back to Course</Button>
            </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = showFeedback && selectedAnswer === question.correct_answer;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/elimika">Elimika</BreadcrumbLink>
            </BreadcrumbItem>
             <BreadcrumbSeparator />
            <BreadcrumbItem>
               <BreadcrumbLink href={`/elimika/course/${courseId}`}>Course</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{quizTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <CardTitle>{quizTitle}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">{question.question_text_en}</h3>
                
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
                          {option.option_text_en}
                        </Label>
                        {showFeedback && option.option_id === question.correct_answer && (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                        {showFeedback && selectedAnswer === option.option_id && option.option_id !== question.correct_answer && (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
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
                        <span className="font-semibold text-success">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-destructive" />
                        <span className="font-semibold text-destructive">Incorrect</span>
                      </>
                    )}
                  </div>
                  {/* The explanation part needs to be added to the Question type if we want to show it */}
                  {/* <p className="text-sm">{question.explanation}</p> */}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate(`/elimika/course/${courseId}`)}>
                  Exit Quiz
                </Button>
                {!showFeedback ? (
                  <Button onClick={handleSubmit} disabled={!selectedAnswer}>
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
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
