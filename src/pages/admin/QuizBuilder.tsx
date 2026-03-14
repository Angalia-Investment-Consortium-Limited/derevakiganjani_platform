import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Save, X, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useElimika } from "@/hooks/useElimika";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Quiz, Question as QuizQuestion, AnswerOption } from "@/types/elimika";

// Local interfaces for the form state, including temporary client-side IDs
interface FormAnswerOption {
  local_id: string;
  is_correct: boolean;
  option_id?: string; // Optional for new options not yet saved
  option_text_en: string;
  option_text_sw: string;
}

interface FormQuestion {
  local_id: string;
  question_id: string;
  question_text_en: string;
  question_text_sw?: string;
  question_type: 'multiple-choice' | 'true-false' | 'short-answer';
  options: FormAnswerOption[];
}

const generateLocalId = () => `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const QuizBuilder = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const { useQuiz, useSaveQuiz } = useElimika();

  const { data: initialQuiz, isLoading: isLoadingQuiz, isError: isErrorQuiz } = useQuiz(courseId);
  const { saveQuiz, loading: isSaving } = useSaveQuiz();

  const [title, setTitle] = useState({ en: "", sw: "" });
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [passingScore, setPassingScore] = useState(70);

  const transformToFormState = useCallback((quiz: Quiz | undefined | null) => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      setTitle({ en: "", sw: "" });
      setQuestions([
        {
          local_id: generateLocalId(),
          question_id: 'new_1',
          question_text_en: "",
          question_text_sw: "",
          question_type: 'multiple-choice',
          options: [
            { local_id: generateLocalId(), option_text_en: "", option_text_sw: "", is_correct: true },
            { local_id: generateLocalId(), option_text_en: "", option_text_sw: "", is_correct: false },
          ],
        },
      ]);
      return;
    }

    setTitle({ en: quiz.title_en || "", sw: quiz.title_sw || "" });
    setPassingScore(quiz.passing_score || 70);
    setQuestions(quiz.questions.map((q): FormQuestion => {
      const { correct_answer, ...restOfQuestion } = q;
      return {
        ...restOfQuestion,
        local_id: q.question_id || generateLocalId(),
        options: q.options.map(o => ({
          ...o,
          option_text_sw: o.option_text_sw || '',
          local_id: o.option_id || generateLocalId(),
          is_correct: correct_answer === o.option_id,
        })),
      };
    }));
  }, []);

  useEffect(() => {
    transformToFormState(initialQuiz);
  }, [initialQuiz, transformToFormState]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        local_id: generateLocalId(),
        question_id: `new_${questions.length + 1}`,
        question_text_en: "",
        question_text_sw: "",
        question_type: 'multiple-choice',
        options: [
          { local_id: generateLocalId(), option_text_en: "", option_text_sw: "", is_correct: true },
          { local_id: generateLocalId(), option_text_en: "", option_text_sw: "", is_correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (localId: string) => {
    setQuestions(questions.filter(q => q.local_id !== localId));
  };

  const handleAddAnswer = (questionLocalId: string) => {
    setQuestions(questions.map(q => {
      if (q.local_id === questionLocalId && q.options.length < 5) {
        return {
          ...q,
          options: [...q.options, { local_id: generateLocalId(), option_text_en: "", option_text_sw: "", is_correct: false }]
        };
      }
      return q;
    }));
  };

  const handleRemoveAnswer = (questionLocalId: string, answerLocalId: string) => {
    setQuestions(questions.map(q => {
      if (q.local_id === questionLocalId && q.options.length > 2) {
        const newOptions = q.options.filter(a => a.local_id !== answerLocalId);
        if (!newOptions.some(o => o.is_correct)) {
          newOptions[0].is_correct = true;
        }
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    if (!courseId) return;

    const quizData: Quiz = {
        name: initialQuiz?.name || courseId,
        course_id: courseId,
        title_en: title.en,
        title_sw: title.sw,
        passing_score: passingScore,
        questions: questions.map((formQuestion, qIndex): QuizQuestion => {
            const questionId = formQuestion.question_id.startsWith('new_')
                ? `${courseId}_q_${Date.now()}_${qIndex}`
                : formQuestion.question_id;

            let correctOptionId = '';
            
            const options: AnswerOption[] = formQuestion.options.map((formOption, oIndex) => {
                const optionId = formOption.option_id || `${questionId}_opt${oIndex + 1}`;
                if (formOption.is_correct) {
                    correctOptionId = optionId;
                }
                return {
                    option_id: optionId,
                    option_text_en: formOption.option_text_en,
                    option_text_sw: formOption.option_text_sw,
                };
            });

            if (!correctOptionId && options.length > 0) {
                correctOptionId = options[0].option_id;
            }

            return {
                question_id: questionId,
                question_text_en: formQuestion.question_text_en,
                question_text_sw: formQuestion.question_text_sw,
                question_type: formQuestion.question_type,
                options: options,
                correct_answer: correctOptionId,
            };
        }),
    };

    try {
        await saveQuiz(quizData);
        toast({ title: "Success", description: "Quiz saved successfully!" });
        navigate(`/admin/course/edit/${courseId}`);
    } catch (error) {
        toast({ title: "Error", description: "Failed to save quiz. Please try again.", variant: "destructive" });
        console.error(error);
    }
  };

  if (isLoadingQuiz) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (isErrorQuiz) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load quiz data. Please try again later.</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Quiz Builder</h1>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Input placeholder="Quiz Title (English)" value={title.en} onChange={e => setTitle({ ...title, en: e.target.value })} />
            <Input placeholder="Quiz Title (Swahili)" value={title.sw} onChange={e => setTitle({ ...title, sw: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {questions.map((question, qIndex) => (
              <Card key={question.local_id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Question {qIndex + 1}</CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveQuestion(question.local_id)} disabled={questions.length === 1}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea placeholder="Question Text (English)" value={question.question_text_en} onChange={e => {
                    const newQuestions = [...questions];
                    newQuestions[qIndex].question_text_en = e.target.value;
                    setQuestions(newQuestions);
                  }} />
                  <Textarea placeholder="Question Text (Swahili)" value={question.question_text_sw || ''} onChange={e => {
                    const newQuestions = [...questions];
                    newQuestions[qIndex].question_text_sw = e.target.value;
                    setQuestions(newQuestions);
                  }} />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Answer Choices</Label>
                      <Button size="sm" variant="outline" onClick={() => handleAddAnswer(question.local_id)} disabled={question.options.length >= 5}>
                        <Plus className="mr-2 h-3 w-3" /> Add Answer
                      </Button>
                    </div>
                    <RadioGroup value={question.options.find(o => o.is_correct)?.local_id} onValueChange={value => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].options = newQuestions[qIndex].options.map(o => ({ ...o, is_correct: o.local_id === value }));
                      setQuestions(newQuestions);
                    }}>
                      {question.options.map((answer) => (
                        <div key={answer.local_id} className="flex items-center gap-2">
                          <RadioGroupItem value={answer.local_id} id={answer.local_id} />
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input placeholder="Answer (English)" value={answer.option_text_en} onChange={e => {
                              const newQuestions = [...questions];
                              const option = newQuestions[qIndex].options.find(o => o.local_id === answer.local_id);
                              if (option) option.option_text_en = e.target.value;
                              setQuestions(newQuestions);
                            }} />
                            <Input placeholder="Answer (Swahili)" value={answer.option_text_sw} onChange={e => {
                              const newQuestions = [...questions];
                              const option = newQuestions[qIndex].options.find(o => o.local_id === answer.local_id);
                              if (option) option.option_text_sw = e.target.value;
                              setQuestions(newQuestions);
                            }} />
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveAnswer(question.local_id, answer.local_id)} disabled={question.options.length <= 2}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={handleAddQuestion}>
              <Plus className="mr-2 h-4 w-4" /> Add Another Question
            </Button>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Quiz
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/admin/course/edit/${courseId}`)}>
                  Cancel
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Label>Passing Score (%)</Label>
                <Input type="number" value={passingScore} onChange={e => setPassingScore(parseInt(e.target.value, 10))} min="0" max="100" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Quiz Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuizBuilder;
