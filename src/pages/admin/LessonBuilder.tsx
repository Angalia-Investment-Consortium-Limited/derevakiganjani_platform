import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Upload, FileText, Image, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";

const LessonBuilder = () => {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();
  const { toast } = useToast();
  const isNew = lessonId === "new";

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
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    if (!formData.title || !courseId) {
      toast({ variant: "destructive", title: "Validation Error", description: "Title is required." });
      return;
    }
    setIsSaving(true);
    try {
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
        course_id: courseId,
        course: courseId,
        is_active: 1,
        content_type: formData.videoUrl ? 'video' : 'text',
        lesson_type: formData.videoUrl ? 'video' : 'text'
      };

      if (isNew) {
        const newLessonRef = await addDoc(collection(db, "lessons"), { ...dataToSave, lesson_id: '' });
        await setDoc(newLessonRef, { lesson_id: newLessonRef.id, name: newLessonRef.id }, { merge: true });
      } else {
        if (!lessonId) return;
        await setDoc(doc(db, "lessons", lessonId), dataToSave, { merge: true });
      }
      toast({ title: "Lesson Saved", description: "The lesson has been saved successfully." });
      navigate(`/admin/course/${courseId}`);
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
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Enter the lesson content in HTML or plain text..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Supports HTML formatting</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentSw">Main Content (Swahili)</Label>
                  <Textarea
                    id="contentSw"
                    value={formData.contentSw}
                    onChange={(e) => setFormData({...formData, contentSw: e.target.value})}
                    placeholder="Enter the lesson content in Swahili..."
                    rows={10}
                    className="font-mono text-sm"
                  />
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

                <div className="p-4 border-2 border-dashed rounded-lg text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports: Images, PDFs, Videos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Lesson
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/admin/course/${courseId}`)} disabled={isSaving}>
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
