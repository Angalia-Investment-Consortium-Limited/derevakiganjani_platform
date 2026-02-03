import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const TestQuestions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalQuestions = 25;
  const progress = (currentQuestion / totalQuestions) * 100;

  // Sample question data
  const question = {
    id: currentQuestion,
    text: 'What does a red traffic light signal mean?',
    image: null,
    options: [
      { id: 'a', text: 'Proceed with caution' },
      { id: 'b', text: 'Stop completely' },
      { id: 'c', text: 'Slow down' },
      { id: 'd', text: 'Yield to other vehicles' },
    ],
    correctAnswer: 'b',
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      toast({
        title: "No answer selected",
        description: "Please select an answer before submitting",
        variant: "destructive",
      });
      return;
    }

    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) setScore(score + 1);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedAnswer('');
    
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Test completed
      navigate('/test/result', { state: { score, total: totalQuestions } });
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
              <BreadcrumbLink href="/jitesti">JiTesti</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Test</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Question {currentQuestion} of {totalQuestions}</span>
              <span className="text-muted-foreground">Score: {score}/{currentQuestion - 1}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Question {currentQuestion}</CardTitle>
              <CardDescription>{question.text}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {question.image && (
                <div className="rounded-lg border p-4 bg-muted">
                  <img src={question.image} alt="Question" className="w-full rounded" />
                </div>
              )}

              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button onClick={handleSubmitAnswer} className="w-full" size="lg">
                Submit Answer
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Feedback Dialog */}
      <AlertDialog open={showFeedback} onOpenChange={setShowFeedback}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              {isCorrect ? (
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
              )}
            </div>
            <AlertDialogTitle className="text-center text-2xl">
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {isCorrect
                ? 'Great job! You selected the right answer.'
                : `The correct answer is: ${question.options.find(o => o.id === question.correctAnswer)?.text}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={handleNext} className="w-full">
              {currentQuestion < totalQuestions ? 'Next Question' : 'View Results'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestQuestions;
