import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp, collection, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, X, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TestQuestion, AnswerOption, Difficulty } from "@/types/management";

interface FormAnswer {
  text_en: string;
  text_sw: string;
  is_correct: boolean;
}

const QuestionEditor = () => {
  const navigate = useNavigate();
  const { questionId } = useParams<{ questionId: string }>();
  const { toast } = useToast();
  const isNew = questionId === "new";

  const [formData, setFormData] = useState<Partial<TestQuestion> & { answers?: FormAnswer[] }>({});
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setDefaultData = useCallback(() => {
    setFormData({
      question_text_en: "",
      question_text_sw: "",
      category: "B",
      question_type: "MCQ",
      difficulty: "Easy", // Default difficulty
      is_active: 0,
      answers: [
        { text_en: "", text_sw: "", is_correct: true },
        { text_en: "", text_sw: "", is_correct: false },
        { text_en: "", text_sw: "", is_correct: false },
      ],
    });
  }, []);

  useEffect(() => {
    if (isNew) {
      setIsLoading(false);
      setDefaultData();
      return;
    }

    const fetchQuestion = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, "Test Question", questionId!);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dbData = docSnap.data() as TestQuestion;
          const answers: FormAnswer[] = [];
          const optionMap: AnswerOption[] = ['A', 'B', 'C', 'D'];

          optionMap.forEach(option => {
            const enKey = `option_${option.toLowerCase()}_en` as keyof TestQuestion;
            const swKey = `option_${option.toLowerCase()}_sw` as keyof TestQuestion;
            if (dbData[enKey]) {
              answers.push({
                text_en: dbData[enKey] as string,
                text_sw: dbData[swKey] as string,
                is_correct: dbData.correct_answer === option,
              });
            }
          });
          
          // Ensure form has default values for fields that might be missing from Firestore
          setFormData(prev => ({
            ...prev, // Keep any previous state (though likely none)
            ...dbData, // Load data from DB
            name: docSnap.id,
            answers: answers.length ? answers : prev.answers, // Keep default answers if none loaded
            difficulty: dbData.difficulty || 'Easy', // Set default if missing
          }));

        } else {
          setError("Question not found. It may have been deleted.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load question data. Please check the console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, isNew, setDefaultData]);


  const handleFieldChange = (field: keyof TestQuestion, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAnswer = () => {
    setFormData(prev => {
      if (prev.answers && prev.answers.length < 4) {
        return { ...prev, answers: [...prev.answers, { text_en: "", text_sw: "", is_correct: false }] };
      }
      return prev;
    });
  };

  const handleRemoveAnswer = (index: number) => {
    setFormData(prev => {
      if (prev.answers && prev.answers.length > 2) {
        let newAnswers = prev.answers.filter((_, i) => i !== index);
        if (!newAnswers.some(a => a.is_correct)) {
          newAnswers[0].is_correct = true; // Ensure one answer is always correct
        }
        return { ...prev, answers: newAnswers };
      }
      return prev;
    });
  };

  const handleAnswerChange = (index: number, field: 'text_en' | 'text_sw', value: string) => {
    setFormData(prev => {
      if (!prev.answers) return prev;
      const newAnswers = [...prev.answers];
      newAnswers[index] = { ...newAnswers[index], [field]: value };
      return { ...prev, answers: newAnswers };
    });
  };

  const handleCorrectAnswerChange = (index: number) => {
    setFormData(prev => {
      if (!prev.answers) return prev;
      const newAnswers = prev.answers.map((ans, i) => ({ ...ans, is_correct: i === index }));
      return { ...prev, answers: newAnswers };
    });
  }

  const handleSave = async () => {
    if (!formData.question_text_en || !formData.question_text_sw) {
      return toast({ variant: "destructive", title: "Validation Error", description: "Question text in both English and Swahili is required." });
    }
    if (!formData.answers || formData.answers.some(a => !a.text_en || !a.text_sw)) {
      return toast({ variant: "destructive", title: "Validation Error", description: "All answer choices must have text in both English and Swahili." });
    }

    setIsSaving(true);
    try {
      const { answers, ...restOfData } = formData;
      const dataToSave: any = { ...restOfData, modified: serverTimestamp() };

      const optionMap: AnswerOption[] = ['A', 'B', 'C', 'D'];
      answers?.forEach((ans, index) => {
        const option = optionMap[index];
        dataToSave[`option_${option.toLowerCase()}_en`] = ans.text_en;
        dataToSave[`option_${option.toLowerCase()}_sw`] = ans.text_sw;
        if (ans.is_correct) {
          dataToSave.correct_answer = option;
        }
      });

      for (let i = answers?.length || 0; i < 4; i++) {
        const option = optionMap[i];
        dataToSave[`option_${option.toLowerCase()}_en`] = deleteField();
        dataToSave[`option_${option.toLowerCase()}_sw`] = deleteField();
      }

      if (isNew) {
        dataToSave.creation = serverTimestamp();
      }
      
      delete dataToSave.name;

      const docId = isNew ? doc(collection(db, "Test Question")).id : questionId!;
      await setDoc(doc(db, "Test Question", docId), dataToSave, { merge: true });

      toast({ title: `Question ${isNew ? 'Created' : 'Updated'}` });
      navigate("/admin/questions");

    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Save Failed", description: "An error occurred. Check the console for details." });
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumb = (
    <Breadcrumb className="mb-8">
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">Admin</Link></BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/questions">Question Bank</Link></BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>{isNew ? "Create" : "Edit"}</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  if (isLoading) {
    return <AdminLayout><Loader>Loading question editor...</Loader></AdminLayout>;
  }

  if (error) {
    return (
      <AdminLayout>
        {breadcrumb}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error} <Button variant="link" onClick={() => navigate("/admin/questions")}>Return to Bank</Button></AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {breadcrumb}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">{isNew ? "Create New Question" : "Edit Question"}</h1>
          <p className="text-muted-foreground">{isNew ? "Build a new test question" : `Editing question ID: ${questionId}`}</p>
        </div>
         <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/questions")}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {formData.is_active === 1 ? "Save & Publish" : "Save Draft"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Question Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Vehicle Category</Label>
                        <Select value={formData.category} onValueChange={(value) => handleFieldChange('category', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Category A - Motorcycles</SelectItem>
                            <SelectItem value="B">Category B - Cars</SelectItem>
                            <SelectItem value="C">Category C - Light Trucks</SelectItem>
                            <SelectItem value="D">Category D - Heavy Trucks</SelectItem>
                            <SelectItem value="E">Category E - Passenger Service</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={formData.difficulty} onValueChange={(value) => handleFieldChange('difficulty', value as Difficulty)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="text">Question Text (English)</Label>
                <Textarea id="text" value={formData.question_text_en || ''} onChange={(e) => handleFieldChange('question_text_en', e.target.value)} placeholder="Enter the question..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="textSw">Question Text (Swahili)</Label>
                <Textarea id="textSw" value={formData.question_text_sw || ''} onChange={(e) => handleFieldChange('question_text_sw', e.target.value)} placeholder="Ingiza swali..." rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Media (Optional)</CardTitle><CardDescription>Provide a URL for an image or YouTube video.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" value={formData.image || ''} onChange={(e) => handleFieldChange('image', e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">YouTube Video URL</Label>
                <Input id="videoUrl" value={formData.video_url || ''} onChange={(e) => handleFieldChange('video_url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Answer Choices</CardTitle>
                <Button size="sm" variant="outline" onClick={handleAddAnswer} disabled={!formData.answers || formData.answers.length >= 4}><Plus className="mr-2 h-3 w-3" />Add Answer</Button>
              </div>
               <CardDescription>Select the correct answer by clicking the radio button. A maximum of 4 answers are allowed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <RadioGroup value={formData.answers ? formData.answers.findIndex(a => a.is_correct).toString() : "-1"} onValueChange={(value) => handleCorrectAnswerChange(parseInt(value))}>
                {(formData.answers || []).map((answer, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 border rounded-md bg-muted/20">
                    <RadioGroupItem value={index.toString()} id={`answer-${index}`} className="mt-2.5" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 flex-1">
                       <Input value={answer.text_en} onChange={(e) => handleAnswerChange(index, 'text_en', e.target.value)} placeholder={`Answer ${index + 1} (English)`} />
                       <Input value={answer.text_sw} onChange={(e) => handleAnswerChange(index, 'text_sw', e.target.value)} placeholder={`Jibu ${index + 1} (Swahili)`} />
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handleRemoveAnswer(index)} disabled={!formData.answers || formData.answers.length <= 2}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Explanation (Optional)</CardTitle><CardDescription>This is shown after a user answers.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (English)</Label>
                <Textarea id="explanation" value={formData.explanation_en || ''} onChange={(e) => handleFieldChange('explanation_en', e.target.value)} placeholder="Explain why this is the correct answer..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="explanationSw">Explanation (Swahili)</Label>
                <Textarea id="explanationSw" value={formData.explanation_sw || ''} onChange={(e) => handleFieldChange('explanation_sw', e.target.value)} placeholder="Eleza kwa nini hii ndiyo jibu sahihi..." rows={3} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <Label htmlFor="status" className="font-medium">Publish Question</Label>
                <Switch id="status" checked={formData.is_active === 1} onCheckedChange={(checked) => handleFieldChange('is_active', checked ? 1 : 0)} />
              </div>
              <p className="text-xs text-muted-foreground">{formData.is_active === 1 ? "This question will be visible in tests." : "This question is saved as a draft."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default QuestionEditor;
