import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp, collection, deleteField, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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
import { Plus, Save, X, Loader2, AlertCircle, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import type { TestQuestion, AnswerOption, Difficulty } from "@/types/management";

// This interface no longer needs `is_correct`
interface FormAnswer {
  text_en: string;
  text_sw: string;
}

interface JitestiCategory {
    id: string;
    name_en: string;
    name_sw: string;
}

const QuestionEditor = () => {
  const navigate = useNavigate();
  const { questionId } = useParams<{ questionId: string }>();
  const { toast } = useToast();
  const isNew = questionId === "new";

  const [formData, setFormData] = useState<Partial<TestQuestion> & { answers?: FormAnswer[] }>({});
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jitestiCategories, setJitestiCategories] = useState<JitestiCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, "jitesti-categories");
        const snapshot = await getDocs(categoriesCollection);
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JitestiCategory));
        setJitestiCategories(categories);
      } catch (error) {
        console.error("Error fetching Jitesti categories: ", error);
      }
    };

    fetchCategories();
  }, []);

  const setDefaultData = useCallback(() => {
    setFormData({
      question_text_en: "",
      question_text_sw: "",
      category: "",
      question_type: "MCQ",
      difficulty: "Easy",
      is_active: 0,
      answers: [
        { text_en: "", text_sw: "" },
        { text_en: "", text_sw: "" },
        { text_en: "", text_sw: "" },
      ],
    });
    setCorrectAnswerIndex(0);
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
          const dbData = docSnap.data() as any;
          const answers: FormAnswer[] = [];
          let loadedCorrectIndex = 0;

          const safeKey = (k: any) => String(k || '').trim().toUpperCase();

          if (dbData.options && Array.isArray(dbData.options)) {
            const correctKey = safeKey(dbData.correctAnswer);
            dbData.options.forEach((opt: any, index: number) => {
              answers.push({ text_en: opt.optionTextEn || "", text_sw: opt.optionTextSw || "" });
              if (safeKey(opt.optionKey) === correctKey) {
                loadedCorrectIndex = index;
              }
            });
          } else {
            const correctKey = safeKey(dbData.correct_answer || dbData.correctAnswer);
            const optionMap: AnswerOption[] = ['A', 'B', 'C', 'D'];
            optionMap.forEach((option, index) => {
              const enKey = `option_${option.toLowerCase()}_en`;
              const swKey = `option_${option.toLowerCase()}_sw`;
              if (dbData[enKey] !== undefined) {
                answers.push({ text_en: dbData[enKey], text_sw: dbData[swKey] });
                if (safeKey(option) === correctKey) {
                  loadedCorrectIndex = answers.length - 1;
                }
              }
            });
          }
          
          setCorrectAnswerIndex(loadedCorrectIndex);
          setFormData(prev => ({
            ...prev,
            ...dbData,
            name: docSnap.id,
            answers: answers.length > 0 ? answers : prev.answers,
            difficulty: dbData.difficulty || 'Easy',
          }));

          if (dbData.image) {
            setImagePreview(dbData.image);
          }

        } else {
          setError("Question not found. It may have been deleted.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load question data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, isNew, setDefaultData]);

  const handleFieldChange = (field: keyof TestQuestion, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => { setImagePreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    handleFieldChange('image', deleteField());
  };

  const handleAddAnswer = () => {
    setFormData(prev => {
      if (prev.answers && prev.answers.length < 4) {
        return { ...prev, answers: [...prev.answers, { text_en: "", text_sw: "" }] };
      }
      return prev;
    });
  };

  const handleRemoveAnswer = (index: number) => {
    setFormData(prev => {
        if (!prev.answers || prev.answers.length <= 2) return prev;
        const newAnswers = prev.answers.filter((_, i) => i !== index);
        if (index === correctAnswerIndex) {
            setCorrectAnswerIndex(0);
        } else if (index < correctAnswerIndex) {
            setCorrectAnswerIndex(prevIndex => prevIndex - 1);
        }
        return { ...prev, answers: newAnswers };
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

  const handleSave = async () => {
    if (!formData.question_text_en && !formData.question_text_sw) {
      return toast({ variant: "destructive", title: "Validation Error", description: "Question text in either English or Swahili is required." });
    }
    
    if (!formData.question_text_en || !formData.question_text_sw) {
      const missingLang = !formData.question_text_en ? "English" : "Swahili";
      const proceed = window.confirm(`Warning: The ${missingLang} question text is missing. Do you want to proceed and save? (Click Cancel to amend)`);
      if (!proceed) return;
    }

    if (!formData.answers || formData.answers.some(a => !a.text_en && !a.text_sw)) {
      return toast({ variant: "destructive", title: "Validation Error", description: "All answer choices must have at least one text (English or Swahili)." });
    }
    
    if (formData.answers.some(a => !a.text_en || !a.text_sw)) {
      const proceed = window.confirm(`Warning: Some answer choices are missing either the English or Swahili text. Do you want to proceed and save? (Click Cancel to amend)`);
      if (!proceed) return;
    }

    setIsSaving(true);
    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `question_images/${questionId || Date.now()}/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => { setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100); },
            (error) => { console.error("Upload failed", error); reject(error); },
            async () => { imageUrl = await getDownloadURL(uploadTask.snapshot.ref); resolve(); }
          );
        });
      }

      const { answers, ...restOfData } = formData;
      const dataToSave: any = { ...restOfData, modified: serverTimestamp(), image: imageUrl };
      
      const optionKeys: AnswerOption[] = ['A', 'B', 'C', 'D'];
      dataToSave.correctAnswer = optionKeys[correctAnswerIndex];
      dataToSave.options = answers?.map((ans, index) => ({
        optionKey: optionKeys[index],
        optionTextEn: ans.text_en,
        optionTextSw: ans.text_sw,
      })) || [];

      optionKeys.forEach(key => { 
          delete dataToSave[`option_${key.toLowerCase()}_en`];
          delete dataToSave[`option_${key.toLowerCase()}_sw`];
      });
      delete dataToSave.correct_answer;
      delete dataToSave.name;

      if (isNew) { dataToSave.creation = serverTimestamp(); }

      const docId = isNew ? doc(collection(db, "Test Question")).id : questionId!;
      await setDoc(doc(db, "Test Question", docId), dataToSave, { merge: true });

      toast({ title: `Question ${isNew ? 'Created' : 'Updated'}` });
      navigate("/admin/questions");

    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Save Failed", description: "An error occurred. See console for details." });
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };


  if (isLoading) { return <AdminLayout><Loader>Loading question editor...</Loader></AdminLayout>; }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error} <Button variant="link" onClick={() => navigate("/admin/questions")}>Return to Bank</Button></AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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
                        <Label htmlFor="category">Test Category</Label>
                        <Select value={formData.category} onValueChange={(value) => handleFieldChange('category', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {jitestiCategories.map(category => (
                              <SelectItem key={category.id} value={category.id}>{category.name_en} / {category.name_sw}</SelectItem>
                            ))}
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
            <CardHeader>
                <CardTitle>Media (Optional)</CardTitle>
                <CardDescription>Upload an image for the question.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="image-upload">Question Image</Label>
                    <div className="flex items-center gap-4">
                        <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        <Button asChild variant="outline">
                            <Label htmlFor="image-upload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Choose Image
                            </Label>
                        </Button>
                        {imagePreview && (
                            <div className="relative">
                                <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-md border" />
                                <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={handleRemoveImage}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                    {isSaving && uploadProgress > 0 && <Progress value={uploadProgress} className="w-full mt-2" />}
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
               <RadioGroup value={correctAnswerIndex.toString()} onValueChange={(value) => setCorrectAnswerIndex(parseInt(value))}>
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
