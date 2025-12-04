import { useState } from "react";
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

const PracticeQuiz = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  const questions = [
    {
      id: 1,
      question: "What should you do when approaching a pedestrian crosswalk?",
      options: [
        "Speed up to cross before pedestrians",
        "Slow down and be prepared to stop",
        "Honk to warn pedestrians",
        "Maintain your current speed"
      ],
      correct: 1,
      explanation: "You should always slow down and be prepared to stop when approaching a crosswalk to ensure pedestrian safety."
    },
    {
      id: 2,
      question: "What is the maximum speed limit in a school zone during school hours?",
      options: [
        "30 km/h",
        "40 km/h",
        "50 km/h",
        "60 km/h"
      ],
      correct: 0,
      explanation: "The speed limit in school zones is typically 30 km/h during school hours to protect children."
    },
    {
      id: 3,
      question: "When must you yield to pedestrians?",
      options: [
        "Only at marked crosswalks",
        "Only when they have pressed the crossing button",
        "At all crosswalks, marked or unmarked",
        "Never, pedestrians must yield to vehicles"
      ],
      correct: 2,
      explanation: "Drivers must yield to pedestrians at all crosswalks, whether marked or unmarked."
    },
    {
      id: 4,
      question: "What should you do if you see a pedestrian with a white cane?",
      options: [
        "Honk to alert them of your presence",
        "Pass quickly to avoid causing delays",
        "Give them extra time and space",
        "Flash your lights"
      ],
      correct: 2,
      explanation: "A white cane indicates a visually impaired pedestrian. You should give them extra time and space to cross safely."
    },
    {
      id: 5,
      question: "When turning at an intersection, you should:",
      options: [
        "Turn quickly before pedestrians reach the street",
        "Always check for pedestrians before turning",
        "Only check if the light is red",
        "Assume pedestrians will stop for you"
      ],
      correct: 1,
      explanation: "Always check for pedestrians before making any turn, even if you have a green light."
    }
  ];

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
      const score = Math.round((answers.filter((ans, idx) => parseInt(ans) === questions[idx].correct).length / questions.length) * 100);
      navigate(`/elimika/course/${courseId}`, { state: { quizScore: score } });
    }
  };

  const question = questions[currentQuestion];
  const isCorrect = showFeedback && parseInt(selectedAnswer) === question.correct;
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
              <BreadcrumbPage>Practice Quiz</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <CardTitle>Practice Quiz</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
                
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showFeedback}>
                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <div key={index} className={`flex items-center space-x-2 p-4 rounded-lg border ${
                        showFeedback 
                          ? index === question.correct 
                            ? "border-success bg-success/10" 
                            : parseInt(selectedAnswer) === index 
                              ? "border-destructive bg-destructive/10"
                              : ""
                          : ""
                      }`}>
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                        {showFeedback && index === question.correct && (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                        {showFeedback && parseInt(selectedAnswer) === index && index !== question.correct && (
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
                  <p className="text-sm">{question.explanation}</p>
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
