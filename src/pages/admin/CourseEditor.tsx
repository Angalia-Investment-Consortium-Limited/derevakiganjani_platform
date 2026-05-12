
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, X, Loader2, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { useElimika } from "@/hooks/useElimika";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, deleteDoc, updateDoc } from "firebase/firestore";
import type { Course } from "@/types/elimika";

const CourseEditor = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const isNew = courseId === "new";

  const [formData, setFormData] = useState<Partial<Course>>({
    course_name_en: "",
    course_name_sw: "",
    description_en: "",
    description_sw: "",
    level: "Basic",
    duration_hours: 0,
    price: 0,
    is_free: 1,
    status: "Draft",
  });
  const { useLessons } = useElimika();
  const { data: fetchedLessons, isLoading: isLessonsLoading } = useLessons(!isNew ? courseId : undefined);
  const [orderedLessons, setOrderedLessons] = useState<any[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (fetchedLessons) {
      setOrderedLessons([...fetchedLessons].sort((a, b) => (a.lesson_order || 0) - (b.lesson_order || 0)));
    }
  }, [fetchedLessons]);

  useEffect(() => {
    if (isNew) return;

    const fetchCourse = async () => {
      if (!courseId) return;
      setIsLoading(true);
      try {
        const courseRef = doc(db, "courses", courseId);
        const docSnap = await getDoc(courseRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data() as Course);
        } else {
          toast({
            variant: "destructive",
            title: "Not Found",
            description: "Could not find the requested course.",
          });
          navigate("/admin/courses");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load course data.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, isNew, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    const isFreeValue = checked ? 1 : 0;
    setFormData(prev => ({ ...prev, [id]: isFreeValue, price: isFreeValue === 1 ? 0 : prev.price }));
  };

  const handleSave = async () => {
    if (!formData.course_name_en) {
      toast({ variant: "destructive", title: "Validation Error", description: "Course Title (English) is required." });
      return;
    }
    setIsSaving(true);
    try {
      const dataToSave: any = {
        ...formData,
        price: formData.is_free === 1 ? 0 : Number(formData.price || 0),
        duration_hours: Number(formData.duration_hours || 0),
        total_lessons: fetchedLessons?.length || 0,
        is_active: 1,
        modified: serverTimestamp(),
      };

      if (formData.status === 'Published') {
        dataToSave.published_date = new Date().toISOString().split('T')[0];
      }

      if (isNew) {
        const courseRef = await addDoc(collection(db, "courses"), {
          ...dataToSave,
          name: formData.course_name_en.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
          created: serverTimestamp(),
        });
        await setDoc(doc(db, "courses", courseRef.id), { name: courseRef.id }, { merge: true });

      } else {
        if (!courseId) return;
        const courseRef = doc(db, "courses", courseId);
        await setDoc(courseRef, dataToSave, { merge: true });
      }

      toast({
        title: "Course Saved",
        description: `The course has been successfully ${isNew ? 'created' : 'updated'}.`,
      });
      navigate("/admin/courses");

    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "An error occurred while saving the course.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew || !courseId) return;
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      setIsSaving(true);
      try {
        await deleteDoc(doc(db, "courses", courseId));
        toast({
          title: "Course Deleted",
          description: "The course has been successfully deleted.",
        });
        navigate("/admin/courses");
      } catch (error) {
        console.error("Error deleting course:", error);
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: "An error occurred while deleting the course.",
        });
        setIsSaving(false);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrdered = [...orderedLessons];
    const draggedItem = newOrdered[draggedIndex];
    newOrdered.splice(draggedIndex, 1);
    newOrdered.splice(index, 0, draggedItem);

    setOrderedLessons(newOrdered);
    setDraggedIndex(null);

    try {
      await Promise.all(newOrdered.map((lesson, idx) => {
        const lessonRef = doc(db, 'lessons', lesson.name);
        // Also update local state order property so UI reflects it immediately
        lesson.lesson_order = idx + 1;
        return updateDoc(lessonRef, { lesson_order: idx + 1 });
      }));
      toast({
        title: "Lessons Reordered",
        description: "The lesson order has been saved.",
      });
    } catch (error) {
      console.error("Error reordering lessons:", error);
      toast({
        variant: "destructive",
        title: "Reorder Failed",
        description: "Could not save the new lesson order.",
      });
    }
  };

  const handleRemoveLesson = async (e: React.MouseEvent, lesson: any) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${lesson.lesson_title_en}" from this course? The lesson will not be deleted, just unassigned.`)) {
      try {
        const lessonRef = doc(db, 'lessons', lesson.name);
        await updateDoc(lessonRef, { course: null, course_id: null });
        setOrderedLessons(prev => prev.filter(l => l.name !== lesson.name));
        toast({
          title: "Lesson Removed",
          description: "The lesson has been removed from this course.",
        });
      } catch (error) {
        console.error("Error removing lesson:", error);
        toast({
          variant: "destructive",
          title: "Remove Failed",
          description: "Could not remove the lesson from the course.",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-4">Loading Course Editor...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{isNew ? "Create New Course" : "Edit Course"}</h1>
        <p className="text-muted-foreground">Fill in the course details and manage lessons.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Course Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course_name_en">Course Title (English)</Label>
                  <Input id="course_name_en" value={formData.course_name_en} onChange={handleInputChange} placeholder="e.g., Road Safety Fundamentals" disabled={isSaving} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course_name_sw">Course Title (Swahili)</Label>
                  <Input id="course_name_sw" value={formData.course_name_sw} onChange={handleInputChange} placeholder="e.g., Misingi ya Usalama Barabarani" disabled={isSaving} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea id="description_en" value={formData.description_en} onChange={handleInputChange} placeholder="Enter course description" rows={3} disabled={isSaving} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_sw">Description (Swahili)</Label>
                <Textarea id="description_sw" value={formData.description_sw} onChange={handleInputChange} placeholder="Enter course description in Swahili" rows={3} disabled={isSaving} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)} disabled={isSaving}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_free" className="flex flex-col space-y-1">
                  <span>Free Course</span>
                  <span className="font-normal leading-snug text-muted-foreground">Is this course free for all users?</span>
                </Label>
                <Switch id="is_free" checked={formData.is_free === 1} onCheckedChange={(checked) => handleSwitchChange('is_free', checked)} disabled={isSaving} />
              </div>
              {formData.is_free === 0 && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (KES)</Label>
                  <Input id="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="e.g., 500" disabled={isSaving} />
                </div>
              )}
              <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isNew ? "Create Course" : "Save Changes"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin/courses")} disabled={isSaving}>
                Cancel
              </Button>
              {!isNew && (
                <Button variant="destructive" className="w-full" onClick={handleDelete} disabled={isSaving}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="level">Experience Level</Label>
                <Select value={formData.level} onValueChange={(value) => handleSelectChange('level', value)} disabled={isSaving}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_hours">Estimated Duration (Hours)</Label>
                <Input id="duration_hours" type="number" value={formData.duration_hours} onChange={handleInputChange} placeholder="e.g., 4" disabled={isSaving} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lessons</CardTitle>
              <Button size="sm" onClick={() => navigate(`/admin/course/${courseId}/lesson/new`)} disabled={isNew || isSaving}>
                <Plus className="h-4 w-4 mr-1" /> Add Lesson
              </Button>
            </CardHeader>
            <CardContent>
              {isNew ? (
                <p className="text-sm text-muted-foreground">Save the course first before adding lessons.</p>
              ) : isLessonsLoading ? (
                <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading lessons...</p>
              ) : (
                <div className="space-y-2">
                  {orderedLessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No lessons yet.</p>
                  ) : (
                    orderedLessons.map((lesson, idx) => (
                      <div
                        key={lesson.name || idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`flex items-center justify-between p-3 border rounded-md cursor-move hover:bg-muted/50 transition-colors ${draggedIndex === idx ? 'opacity-50 border-primary' : ''}`}
                        title="Drag to reorder"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{lesson.lesson_title_en}</span>
                          <span className="text-xs text-muted-foreground">Order: {lesson.lesson_order} • Duration: {lesson.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/course/${courseId}/lesson/${lesson.name}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleRemoveLesson(e, lesson)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseEditor;
