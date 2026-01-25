import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Eye, Loader2, AlertCircle } from "lucide-react";
import { useFrappeGetDocList, useFrappeDocTypeEventListener } from "frappe-react-sdk";
import type { Course } from "@/types/management";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CourseManager = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch courses from Frappe
  const filters = useMemo(() => {
    const f: any[] = [];
    if (statusFilter !== "all") {
      f.push(['status', '=', statusFilter === 'published' ? 'Published' : 'Draft']);
    }
    return f;
  }, [statusFilter]);

  const { data: courses, isLoading, error, mutate } = useFrappeGetDocList<Course>('Course', {
    fields: [
      'name',
      'course_name_en',
      'course_name_sw',
      'status',
      'total_lessons',
      'price',
      'is_free',
      'modified'
    ],
    filters,
    orderBy: {
      field: 'modified',
      order: 'desc'
    }
  });

  // Real-time updates
  useFrappeDocTypeEventListener('Course', () => {
    mutate();
  });

  // Filter courses by search query
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    
    return courses.filter(course => {
      const matchesSearch = 
        course.course_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_name_sw.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [courses, searchQuery]);

  // Format price display
  const formatPrice = (course: Course) => {
    if (course.is_free === 1) return "Free";
    return course.price ? `KES ${course.price.toLocaleString()}` : "Free";
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Course Manager</h1>
        <p className="text-muted-foreground">Manage all ELIMIKA courses and content</p>
      </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => navigate("/admin/course/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading courses...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load courses. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No courses found.</p>
              <Button onClick={() => navigate("/admin/course/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first course
              </Button>
            </div>
          )}

          {!isLoading && !error && filteredCourses.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.name}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{course.course_name_en}</div>
                        <div className="text-sm text-muted-foreground">{course.course_name_sw}</div>
                      </div>
                    </TableCell>
                    <TableCell>{course.total_lessons || 0}</TableCell>
                    <TableCell>{formatPrice(course)}</TableCell>
                    <TableCell>
                      <Badge variant={course.status === "Published" ? "default" : "secondary"}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(course.modified)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/elimika/course/${course.name}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/course/${course.name}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default CourseManager;
