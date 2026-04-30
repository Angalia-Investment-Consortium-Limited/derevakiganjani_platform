import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Upload, FileText, Image, Video, Loader2, Plus, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { db, uploadFile } from "@/lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection, query, getDocs } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
// Local interfaces for the form state
interface FormAnswerOption {
  local_id: string;
  is_correct: boolean;
  option_id?: string;
  option_text_en: string;
  option_text_sw: string;
}

interface FormQuestion {
  local_id: string;
  id: string;
  question_text_en: string;
  question_text_sw?: string;
  options: FormAnswerOption[];
  explanation_en: string;
  explanation_sw?: string;
}

const generateLocalId = () => `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const LessonBuilder = () => {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const { toast } = useToast();
  const isNew = !lessonId || lessonId === "new";

  const [formData, setFormData] = useState({
    title: "",
    titleSw: "",
    summaryEn: "",
    summarySw: "",
    duration: "",
    content: "",
    contentSw: "",
    videoUrl: "",
    pdfUrl: "",
    imageUrl: "",
    order: 1
  });
  
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [courses, setCourses] = useState<{ id: string, name: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || "");

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  };

  useEffect(() => {
    // If we're opening LessonBuilder globally without a specific courseId
    if (!courseId) {
       const fetchCourses = async () => {
         try {
           setIsLoading(true);
           const q = query(collection(db, "courses"));
           const snapshot = await getDocs(q);
           const cList = snapshot.docs.map(d => ({
             id: d.id,
             name: d.data().course_name_en || d.id
           }));
           setCourses(cList);
         } catch (err) {
           toast({ variant: "destructive", title: "Error", description: "Failed to load courses." });
         } finally {
           setIsLoading(false);
         }
       };
       fetchCourses();
    }
  }, [courseId, toast]);

  useEffect(() => {
    if (isNew) return;
    const fetchLesson = async () => {
      if (!lessonId) return;
      setIsLoading(true);
      try {
        const docSnap = await getDoc(doc(db, "lessons", lessonId));
        if (docSnap.exists()) {
          const data: any = docSnap.data();
          setFormData({
            title: data.lesson_title_en || "",
            titleSw: data.lesson_title_sw || "",
            summaryEn: data.summary_en || "",
            summarySw: data.summary_sw || "",
            duration: data.duration_minutes ? String(data.duration_minutes) : "",
            content: data.content_en || "",
            contentSw: data.content_sw || "",
            videoUrl: data.video_url || "",
            pdfUrl: data.pdf_url || "",
            imageUrl: data.image_url || "",
            order: data.lesson_order || 1
          });

          if (data.interactive_questions && Array.isArray(data.interactive_questions)) {
             setQuestions(data.interactive_questions.map((q: any): FormQuestion => {
               return {
                 ...q,
                 local_id: generateLocalId(),
                 options: q.options.map((o: any) => ({
                   ...o,
                   local_id: generateLocalId(),
                   is_correct: q.correct_answer === o.option_id
                 }))
               };
             }));
          }
        } else {
          toast({ variant: "destructive", title: "Error", description: "Lesson not found." });
          navigate(`/admin/course/${courseId}`);
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load lesson." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, courseId, isNew, navigate, toast]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        local_id: generateLocalId(),
        id: `q_${Date.now()}`,
        question_text_en: "",
        question_text_sw: "",
        explanation_en: "",
        explanation_sw: "",
        options: [
          { local_id: generateLocalId(), option_text_en: "", option_text_sw: "", is_correct: true },
          { local_id: generateLocalId(), option_text_en: "", option_text_sw: "", is_correct: false },
        ]
      }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
        const file = files[0];
        const path = `lessons/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const url = await uploadFile(file, path);
        
        let newFormData = { ...formData };
        if (file.type.startsWith('image/')) {
            newFormData.imageUrl = url;
            toast({ title: 'Image Uploaded', description: 'Image successfully attached to lesson.' });
        } else if (file.type.startsWith('video/')) {
            newFormData.videoUrl = url;
            toast({ title: 'Video Uploaded', description: 'Video successfully attached to lesson.' });
        } else if (file.type.includes('pdf')) {
            newFormData.pdfUrl = url;
            toast({ title: 'PDF Uploaded', description: 'PDF document successfully attached.' });
        } else {
            toast({ variant: 'destructive', title: 'Unsupported format', description: 'Please upload an Image, PDF, or Video.' });
        }
        
        setFormData(newFormData);
    } catch (err) {
        toast({ variant: 'destructive', title: 'Upload failed', description: 'Failed to upload resource. Ensure you have the right permissions.' });
    } finally {
        setIsUploading(false);
        if (e.target) e.target.value = '';
    }
  };

  const handleSave = async () => {
    const activeCourseId = courseId || selectedCourseId;
    if (!formData.title || !activeCourseId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Title and Course are required." });
      return;
    }
    setIsSaving(true);
    try {
      const interactive_questions = questions.map((formQuestion, qIndex) => {
        const questionId = formQuestion.id.startsWith('q_')
            ? `${activeCourseId}_lq_${Date.now()}_${qIndex}`
            : formQuestion.id;

        let correctOptionId = '';
        
        const options = formQuestion.options.map((formOption, oIndex) => {
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
            id: questionId,
            question_text_en: formQuestion.question_text_en,
            question_text_sw: formQuestion.question_text_sw,
            explanation_en: formQuestion.explanation_en,
            explanation_sw: formQuestion.explanation_sw,
            options: options,
            correct_answer: correctOptionId,
        };
      });

      const dataToSave = {
        lesson_title_en: formData.title,
        lesson_title_sw: formData.titleSw,
        summary_en: formData.summaryEn,
        summary_sw: formData.summarySw,
        content_en: formData.content,
        content_sw: formData.contentSw,
        duration_minutes: parseInt(formData.duration) || 0,
        video_url: formData.videoUrl,
        image_url: formData.imageUrl,
        pdf_url: formData.pdfUrl,
        lesson_order: formData.order,
        course_id: activeCourseId,
        course: activeCourseId,
        is_active: 1,
        content_type: formData.videoUrl ? 'video' : 'text',
        lesson_type: formData.videoUrl ? 'video' : 'text',
        interactive_questions
      };

      if (isNew) {
        const newLessonRef = await addDoc(collection(db, "lessons"), { ...dataToSave, lesson_id: '' });
        await setDoc(newLessonRef, { lesson_id: newLessonRef.id, name: newLessonRef.id }, { merge: true });
      } else {
        if (!lessonId) return;
        await setDoc(doc(db, "lessons", lessonId), dataToSave, { merge: true });
      }
      toast({ title: "Lesson Saved", description: "The lesson has been saved successfully." });
      navigate(`/admin/course/${activeCourseId}`);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save lesson." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
           <span className="ml-2">Loading lesson...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{isNew ? "Create New Lesson" : "Edit Lesson"}</h1>
        <p className="text-muted-foreground">Build engaging lesson content with text, media, and resources</p>
      </div>

      {!courseId && (
        <div className="mb-6 max-w-sm">
          <Label>Select Course to add Lesson to</Label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Lesson Title (English)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Introduction to Road Safety"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleSw">Lesson Title (Swahili)</Label>
                    <Input
                      id="titleSw"
                      value={formData.titleSw}
                      onChange={(e) => setFormData({...formData, titleSw: e.target.value})}
                      placeholder="e.g., Utangulizi wa Usalama Barabarani"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="summaryEn">Short Summary (English)</Label>
                    <Textarea
                      id="summaryEn"
                      value={formData.summaryEn}
                      onChange={(e) => setFormData({...formData, summaryEn: e.target.value})}
                      placeholder="Brief overview of the lesson..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summarySw">Short Summary (Swahili)</Label>
                    <Textarea
                      id="summarySw"
                      value={formData.summarySw}
                      onChange={(e) => setFormData({...formData, summarySw: e.target.value})}
                      placeholder="Muhtasari mfupi wa somo..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 15 min"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lesson Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Main Content (English)</Label>
                  <div className="bg-background [&_.ql-container]:min-h-[200px] [&_.ql-container]:text-base [&_.ql-toolbar]:bg-muted/50 [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:rounded-b-md [&_.ql-editor]:min-h-[200px]">
                    <ReactQuill 
                      theme="snow"
                      value={formData.content}
                      onChange={(value) => setFormData({...formData, content: value})}
                      modules={quillModules}
                      placeholder="Enter the lesson content..."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Supports HTML formatting</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentSw">Main Content (Swahili)</Label>
                  <div className="bg-background [&_.ql-container]:min-h-[200px] [&_.ql-container]:text-base [&_.ql-toolbar]:bg-muted/50 [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:rounded-b-md [&_.ql-editor]:min-h-[200px]">
                    <ReactQuill 
                      theme="snow"
                      value={formData.contentSw}
                      onChange={(value) => setFormData({...formData, contentSw: value})}
                      modules={quillModules}
                      placeholder="Enter the lesson content in Swahili..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media & Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">YouTube Video URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <Button variant="outline" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Will be embedded in the lesson viewer</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="Enter image URL or upload"
                    />
                    <Button variant="outline" size="icon">
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Supported formats: PNG, JPG, WEBP</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdfUrl">PDF Document URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pdfUrl"
                      value={formData.pdfUrl}
                      onChange={(e) => setFormData({...formData, pdfUrl: e.target.value})}
                      placeholder="Enter PDF URL or upload"
                    />
                    <Button variant="outline" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="relative p-8 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,video/*,application/pdf" onChange={handleFileUpload} disabled={isUploading} />
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
                        <p className="text-sm font-medium text-foreground">Uploading resource...</p>
                        <p className="text-xs text-muted-foreground mt-1">Please wait</p>
                    </div>
                  ) : (
                    <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Drag and drop files here or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports: Images, PDFs, Videos</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Interactive Questions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question, qIndex) => (
                  <Card key={question.local_id} className="border border-muted">
                    <CardHeader className="bg-muted/30 py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-md">Question {qIndex + 1}</CardTitle>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveQuestion(question.local_id)}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <Label>Answer Choices (Select Correct)</Label>
                          <Button type="button" size="sm" variant="outline" onClick={() => handleAddAnswer(question.local_id)} disabled={question.options.length >= 5}>
                            <Plus className="mr-2 h-3 w-3" /> Add Option
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
                                <Input placeholder="Option (English)" value={answer.option_text_en} onChange={e => {
                                  const newQuestions = [...questions];
                                  const option = newQuestions[qIndex].options.find(o => o.local_id === answer.local_id);
                                  if (option) option.option_text_en = e.target.value;
                                  setQuestions(newQuestions);
                                }} />
                                <Input placeholder="Option (Swahili)" value={answer.option_text_sw} onChange={e => {
                                  const newQuestions = [...questions];
                                  const option = newQuestions[qIndex].options.find(o => o.local_id === answer.local_id);
                                  if (option) option.option_text_sw = e.target.value;
                                  setQuestions(newQuestions);
                                }} />
                              </div>
                              <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveAnswer(question.local_id, answer.local_id)} disabled={question.options.length <= 2}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label>Feedback Explanation (English)</Label>
                          <Textarea placeholder="Explain why the correct answer is correct..." value={question.explanation_en} onChange={e => {
                            const newQuestions = [...questions];
                            newQuestions[qIndex].explanation_en = e.target.value;
                            setQuestions(newQuestions);
                          }} />
                        </div>
                        <div className="space-y-2">
                          <Label>Feedback Explanation (Swahili)</Label>
                          <Textarea placeholder="Eleza kwanini jibu sahihi ni hilo..." value={question.explanation_sw || ''} onChange={e => {
                            const newQuestions = [...questions];
                            newQuestions[qIndex].explanation_sw = e.target.value;
                            setQuestions(newQuestions);
                          }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button type="button" variant="outline" className="w-full border-dashed" onClick={handleAddQuestion}>
                  <Plus className="mr-2 h-4 w-4" /> Add Interactive Question
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleSave} disabled={isSaving || (!courseId && !selectedCourseId)}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Lesson
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(courseId ? `/admin/course/${courseId}` : '/admin/courses')} disabled={isSaving}>
                  Cancel
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium">{formData.title || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{formData.duration || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Has Video:</span>
                  <span className="font-medium">{formData.videoUrl ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Has PDF:</span>
                  <span className="font-medium">{formData.pdfUrl ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Has Image:</span>
                  <span className="font-medium">{formData.imageUrl ? "Yes" : "No"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </AdminLayout>
  );
};

export default LessonBuilder;
