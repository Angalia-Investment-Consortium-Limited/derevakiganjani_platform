import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Save, X, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  text: string;
  imageUrl: string;
  videoUrl: string;
  answers: Answer[];
  explanation: string;
}

const QuizBuilder = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "",
      imageUrl: "",
      videoUrl: "",
      answers: [
        { id: 1, text: "", isCorrect: true },
        { id: 2, text: "", isCorrect: false }
      ],
      explanation: ""
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        text: "",
        imageUrl: "",
        videoUrl: "",
        answers: [
          { id: 1, text: "", isCorrect: true },
          { id: 2, text: "", isCorrect: false }
        ],
        explanation: ""
      }
    ]);
  };

  const handleRemoveQuestion = (questionId: number) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleAddAnswer = (questionId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.answers.length < 5) {
        return {
          ...q,
          answers: [...q.answers, { id: q.answers.length + 1, text: "", isCorrect: false }]
        };
      }
      return q;
    }));
  };

  const handleRemoveAnswer = (questionId: number, answerId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.answers.length > 2) {
        return {
          ...q,
          answers: q.answers.filter(a => a.id !== answerId)
        };
      }
      return q;
    }));
  };

  const handleSave = () => {
    toast({
      title: "Quiz Saved",
      description: "The quiz questions have been saved successfully.",
    });
    navigate(`/admin/course/edit/${courseId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Quiz Builder</h1>
          <p className="text-muted-foreground">Create practice questions for your course</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {questions.map((question, qIndex) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Question {qIndex + 1}</CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveQuestion(question.id)}
                      disabled={questions.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.text}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].text = e.target.value;
                        setQuestions(updated);
                      }}
                      placeholder="Enter the question text..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Image URL (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={question.imageUrl}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIndex].imageUrl = e.target.value;
                            setQuestions(updated);
                          }}
                          placeholder="Enter image URL"
                        />
                        <Button variant="outline" size="icon">
                          <Image className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>YouTube Video URL (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={question.videoUrl}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIndex].videoUrl = e.target.value;
                            setQuestions(updated);
                          }}
                          placeholder="Enter video URL"
                        />
                        <Button variant="outline" size="icon">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Answer Choices</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddAnswer(question.id)}
                        disabled={question.answers.length >= 5}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Add Answer
                      </Button>
                    </div>

                    <RadioGroup
                      value={question.answers.findIndex(a => a.isCorrect).toString()}
                      onValueChange={(value) => {
                        const updated = [...questions];
                        updated[qIndex].answers = updated[qIndex].answers.map((a, i) => ({
                          ...a,
                          isCorrect: i === parseInt(value)
                        }));
                        setQuestions(updated);
                      }}
                    >
                      {question.answers.map((answer, aIndex) => (
                        <div key={answer.id} className="flex items-center gap-2">
                          <RadioGroupItem value={aIndex.toString()} id={`q${qIndex}-a${aIndex}`} />
                          <Input
                            value={answer.text}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIndex].answers[aIndex].text = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder={`Answer ${aIndex + 1}`}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAnswer(question.id, answer.id)}
                            disabled={question.answers.length <= 2}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">Select the correct answer by clicking the radio button</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      value={question.explanation}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].explanation = e.target.value;
                        setQuestions(updated);
                      }}
                      placeholder="Explain why this is the correct answer..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full" onClick={handleAddQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Add Another Question
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Quiz
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/admin/course/edit/${courseId}`)}>
                  Cancel
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With Images:</span>
                  <span className="font-medium">{questions.filter(q => q.imageUrl).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With Videos:</span>
                  <span className="font-medium">{questions.filter(q => q.videoUrl).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Answers:</span>
                  <span className="font-medium">
                    {(questions.reduce((acc, q) => acc + q.answers.length, 0) / questions.length).toFixed(1)}
                  </span>
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
