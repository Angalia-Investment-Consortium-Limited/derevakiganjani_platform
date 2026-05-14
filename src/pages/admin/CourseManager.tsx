
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Edit, Trash2, Eye, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import type { Course } from "@/types/elimika";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  deleteDoc, 
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

const CourseManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    let q = query(collection(db, "courses"));

    if (statusFilter !== "all") {
      q = query(q, where("status", "==", statusFilter === 'published' ? 'Published' : 'Draft'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ ...doc.data(), name: doc.id } as Course));
      setCourses(coursesData);
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter]);

  // Filter courses by search query
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = 
        course.course_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_name_sw.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [courses, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourses(filteredCourses.map(c => c.name));
    } else {
      setSelectedCourses([]);
    }
  };

  const handleRowSelect = (courseName: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses(prev => [...prev, courseName]);
    } else {
      setSelectedCourses(prev => prev.filter(name => name !== courseName));
    }
  };

  // Format price display
  const formatPrice = (course: Course) => {
    if (course.is_free === 1) return "Free";
    return course.price ? `TZS ${course.price.toLocaleString()}` : "Free";
  };

  // Format date
  const formatDate = (dateData?: any) => {
    if (!dateData) return "N/A";
    if (dateData.toDate && typeof dateData.toDate === 'function') {
      return dateData.toDate().toLocaleDateString();
    }
    const date = new Date(dateData);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleDateString();
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "courses", courseToDelete));
      toast({
        title: "Course Deleted",
        description: "The course has been successfully deleted.",
      });
      setCourseToDelete(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the course. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    setIsBulkProcessing(true);
    const batch = writeBatch(db);

    try {
      selectedCourses.forEach(id => {
        const docRef = doc(db, "courses", id);
        if (action === "delete") {
          batch.delete(docRef);
        } else {
          const newStatus = action === "publish" ? "Published" : "Draft";
          batch.update(docRef, { 
            status: newStatus,
            modified: serverTimestamp(),
            updated_at: serverTimestamp()
          });
        }
      });

      await batch.commit();

      toast({
        title: `Bulk ${action} successful`,
        description: `Successfully performed ${action} on ${selectedCourses.length} courses.`
      });
      setSelectedCourses([]);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: `Bulk ${action} failed`,
        description: "An error occurred while processing the bulk action.",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const numSelected = selectedCourses.length;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Course Manager</h1>
        <p className="text-muted-foreground">Manage all ELIMIKA courses and content</p>
      </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {numSelected > 0 ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {numSelected} selected
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" disabled={isBulkProcessing}>
                          {isBulkProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleBulkAction('publish')}>Publish Selected</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction('unpublish')}>Unpublish Selected</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleBulkAction('delete')}>Delete Selected</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
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
                <Button onClick={() => navigate("/admin/course/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Course
                </Button>
              </div>
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
                  <TableHead>
                    <Checkbox
                      checked={numSelected > 0 && numSelected === filteredCourses.length}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      aria-label="Select all"
                    />
                  </TableHead>
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
                  <TableRow 
                    key={course.name}
                    data-state={selectedCourses.includes(course.name) && "selected"}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedCourses.includes(course.name)}
                        onCheckedChange={(checked) => handleRowSelect(course.name, !!checked)}
                        aria-label={`Select course ${course.name}`}
                      />
                    </TableCell>
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
                    <TableCell>{formatDate(course.modified || (course as any).published_date || (course as any).created)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/course/${course.name}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/course/${course.name}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setCourseToDelete(course.name);
                            setShowDeleteDialog(true);
                          }}
                        >
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              and all its content (lessons, quizzes, etc.) from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default CourseManager;
