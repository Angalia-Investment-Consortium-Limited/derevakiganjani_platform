import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CourseEditor = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { toast } = useToast();
  const isNew = courseId === "new";

  const [formData, setFormData] = useState({
    title: "",
    titleSw: "",
    description: "",
    descriptionSw: "",
    level: "Basic",
    duration: "",
    price: "Free",
    status: "draft",
    coverImage: ""
  });

  const [lessons, setLessons] = useState([
    { id: 1, title: "", duration: "", order: 1 }
  ]);

  const handleAddLesson = () => {
    setLessons([...lessons, { id: lessons.length + 1, title: "", duration: "", order: lessons.length + 1 }]);
  };

  const handleRemoveLesson = (id: number) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const handleSave = () => {
    toast({
      title: "Course Saved",
      description: "The course has been saved successfully.",
    });
    navigate("/admin/courses");
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{isNew ? "Create New Course" : "Edit Course"}</h1>
        <p className="text-muted-foreground">Fill in the course details and lessons</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title (English)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Road Safety Fundamentals"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleSw">Course Title (Swahili)</Label>
                  <Input
                    id="titleSw"
                    value={formData.titleSw}
                    onChange={(e) => setFormData({...formData, titleSw: e.target.value})}
                    placeholder="e.g., Misingi ya Usalama Barabarani"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (English)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter course description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionSw">Description (Swahili)</Label>
                <Textarea
                  id="descriptionSw"
                  value={formData.descriptionSw}
                  onChange={(e) => setFormData({...formData, descriptionSw: e.target.value})}
                  placeholder="Enter course description in Swahili"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Difficulty Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 4 hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="e.g., Free or KES 500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                  placeholder="Enter image URL or upload"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Course Lessons</CardTitle>
                <Button size="sm" onClick={handleAddLesson}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lesson
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="flex gap-2 items-start p-4 border rounded-lg">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <span className="text-sm font-medium text-muted-foreground min-w-[30px]">
                        {index + 1}.
                      </span>
                      <div className="flex-1 space-y-3">
                        <Input
                          placeholder="Lesson title"
                          value={lesson.title}
                          onChange={(e) => {
                            const updated = [...lessons];
                            updated[index].title = e.target.value;
                            setLessons(updated);
                          }}
                        />
                        <Input
                          placeholder="Duration (e.g., 15 min)"
                          value={lesson.duration}
                          onChange={(e) => {
                            const updated = [...lessons];
                            updated[index].duration = e.target.value;
                            setLessons(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveLesson(lesson.id)}
                    disabled={lessons.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                {formData.status === "published" ? "Save & Publish" : "Save Draft"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin/courses")}>
                Cancel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Lessons:</span>
                <span className="font-medium">{lessons.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level:</span>
                <span className="font-medium">{formData.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">{formData.price}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseEditor;
