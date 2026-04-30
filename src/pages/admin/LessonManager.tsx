import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, doc, deleteDoc } from "firebase/firestore";
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

export default function LessonManager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "lessons"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lessonsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setLessons(lessonsData);
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const titleEn = lesson.lesson_title_en || "";
      const titleSw = lesson.lesson_title_sw || "";
      return titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
             titleSw.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [lessons, searchQuery]);

  const handleDelete = async () => {
    if (!lessonToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "lessons", lessonToDelete));
      toast({
        title: "Lesson Deleted",
        description: "The lesson has been successfully deleted.",
      });
      setLessonToDelete(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the lesson. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Lessons Manager</h1>
        <p className="text-muted-foreground">Manage all ELIMIKA lessons across all courses</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading lessons...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load lessons. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && filteredLessons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No lessons found.</p>
            </div>
          )}

          {!isLoading && !error && filteredLessons.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lesson Title</TableHead>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Duration (mins)</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{lesson.lesson_title_en || 'Untitled'}</div>
                        <div className="text-sm text-muted-foreground">{lesson.lesson_title_sw}</div>
                      </div>
                    </TableCell>
                    <TableCell>{lesson.course_id || lesson.course || 'N/A'}</TableCell>
                    <TableCell>{lesson.duration_minutes || 0}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lesson.content_type || lesson.lesson_type || 'Text'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/course/${lesson.course_id || lesson.course}/lesson/${lesson.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setLessonToDelete(lesson.id);
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
              This action cannot be undone. This will permanently delete the lesson
              from our servers.
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
}
