
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
import { Plus, Save, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { Course } from "@/types/elimika";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

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
  const [lessons, setLessons] = useState<{ id: number; title: string; duration: string; order: number }[]>([
    { id: 1, title: "", duration: "", order: 1 }
  ]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;

    const fetchCourse = async () => {
      if (!courseId) return;
      setIsLoading(true);
      try {
        const courseRef = doc(db, "Course", courseId);
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
    setFormData(prev => ({...prev, [id]: isFreeValue, price: isFreeValue === 1 ? 0 : prev.price}));
  };

  const handleSave = async () => {
    if (!formData.course_name_en) {
      toast({ variant: "destructive", title: "Validation Error", description: "Course Title (English) is required." });
      return;
    }
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        price: formData.is_free === 1 ? 0 : Number(formData.price || 0),
        duration_hours: Number(formData.duration_hours || 0),
        total_lessons: lessons.length,
        modified: serverTimestamp(),
      };

      if (isNew) {
        const courseRef = await addDoc(collection(db, "Course"), {
          ...dataToSave,
          name: formData.course_name_en.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
          created: serverTimestamp(),
        });
        await setDoc(doc(db, "Course", courseRef.id), { name: courseRef.id }, { merge: true });

      } else {
        if (!courseId) return;
        const courseRef = doc(db, "Course", courseId);
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
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/admin">Admin</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/admin/courses">Courses</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{isNew ? "New Course" : "Edit"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
                <Switch id="is_free" checked={formData.is_free === 1} onCheckedChange={(checked) => handleSwitchChange('is_free', checked)} disabled={isSaving}/>
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
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="level">Difficulty Level</Label>
                <Select value={formData.level} onValueChange={(value) => handleSelectChange('level', value)} disabled={isSaving}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_hours">Estimated Duration (Hours)</Label>
                <Input id="duration_hours" type="number" value={formData.duration_hours} onChange={handleInputChange} placeholder="e.g., 4" disabled={isSaving}/>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseEditor;
