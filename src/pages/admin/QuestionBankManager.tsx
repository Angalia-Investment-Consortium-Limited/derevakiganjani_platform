import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
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
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Edit, Trash2, Image, Video, Loader2, AlertCircle, ChevronDown, Upload, Download, ChevronLeft, ChevronRight } from "lucide-react";
import type { TestQuestion } from "@/types/management";
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
import { useToast } from "@/hooks/use-toast";
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
  getDocs,
  Timestamp
} from "firebase/firestore";
import { unparse } from 'papaparse';


// Type for the categories, consistent with firestore_schema.md
type JitestiCategory = {
    id: string;
    name_en: string;
};

const QuestionBankManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [categories, setCategories] = useState<JitestiCategory[]>([]); // State for categories
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  // Effect to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, 'jitesti-categories');
        const snapshot = await getDocs(categoriesCollection);
        const categoriesData = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            name_en: doc.data().name_en 
        } as JitestiCategory));
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        // Optionally, show a toast notification for failing to fetch categories
      }
    };
    fetchCategories();
  }, []);

  // Effect to fetch questions
  useEffect(() => {
    setIsLoading(true);
    let q = query(collection(db, "Test Question"), orderBy("modified", "desc"));

    if (categoryFilter !== "all") {
      q = query(q, where("category", "==", categoryFilter));
    }
    if (statusFilter !== "all") {
      q = query(q, where("is_active", "==", statusFilter === 'published' ? 1 : 0));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionsData = snapshot.docs.map(doc => ({ ...doc.data(), name: doc.id } as TestQuestion));
      setQuestions(questionsData);
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [categoryFilter, statusFilter]);

  // Filter questions by search query
  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const matchesSearch = 
        (question.question_text_en || '').toLowerCase().includes(lowerCaseQuery) ||
        (question.question_text_sw || '').toLowerCase().includes(lowerCaseQuery);
      return matchesSearch;
    });
  }, [questions, searchQuery]);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredQuestions, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredQuestions.length / rowsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(filteredQuestions.map(q => q.name));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleRowSelect = (questionName: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestions(prev => [...prev, questionName]);
    } else {
      setSelectedQuestions(prev => prev.filter(name => name !== questionName));
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "Test Question", questionToDelete));
      toast({
        title: "Question Deleted",
        description: "The question has been successfully deleted.",
      });
      setQuestionToDelete(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the question. Please try again.",
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
      selectedQuestions.forEach(id => {
        const docRef = doc(db, "Test Question", id);
        if (action === "delete") {
          batch.delete(docRef);
        } else {
          const newStatus = action === "publish" ? 1 : 0;
          batch.update(docRef, { is_active: newStatus });
        }
      });

      await batch.commit();

      toast({
        title: `Bulk ${action} successful`,
        description: `Successfully performed ${action} on ${selectedQuestions.length} questions.`,
      });
      setSelectedQuestions([]);

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

  const handleExport = (format: 'csv' | 'json') => {
    if (filteredQuestions.length === 0) {
        toast({ variant: 'destructive', title: 'Export Failed', description: 'No questions to export.' });
        return;
    }

    let data: string;
    let filename: string;

    if (format === 'csv') {
        try {
            const questionsForExport = filteredQuestions.map(q => {
                const { 
                    options,
                    modified,
                    ...rest
                } = q as any;

                let modifiedISO = '';
                if (modified) {
                    if (typeof modified.toDate === 'function') {
                        modifiedISO = modified.toDate().toISOString();
                    } else if (typeof modified.seconds === 'number' && typeof modified.nanoseconds === 'number') {
                        modifiedISO = new Timestamp(modified.seconds, modified.nanoseconds).toDate().toISOString();
                    } else if (typeof modified === 'string') {
                        modifiedISO = new Date(modified).toISOString();
                    }
                }

                return {
                    ...rest,
                    options: JSON.stringify(options),
                    modified: modifiedISO,
                };
            });
            data = unparse(questionsForExport);
            filename = 'questions.csv';
        } catch (error) {
            console.error('Error parsing CSV:', error);
            toast({ variant: 'destructive', title: 'Export Error', description: 'Could not generate CSV file.' });
            return;
        }
    } else {
        data = JSON.stringify(filteredQuestions, null, 2);
        filename = 'questions.json';
    }

    const blob = new Blob([data], { type: `text/${format}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'Export Successful', description: `Exported ${filteredQuestions.length} questions as ${format.toUpperCase()}.` });
};

const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            const content = e.target?.result as string;
            const importedQuestions: TestQuestion[] = JSON.parse(content);

            if (!Array.isArray(importedQuestions) || importedQuestions.some(q => !q.question_text_en || !q.category)) {
                throw new Error('Invalid file format. Ensure it is an array of questions with required fields.');
            }

            const batch = writeBatch(db);
            let count = 0;

            importedQuestions.forEach(question => {
                const docRef = doc(collection(db, "Test Question")); // Creates a new doc with a unique ID
                batch.set(docRef, { 
                    ...question, 
                    modified: new Date(), 
                    is_active: question.is_active ?? 0 // Default to draft
                });
                count++;
            });

            await batch.commit();
            toast({ title: 'Import Successful', description: `Successfully imported ${count} questions.` });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            toast({ variant: 'destructive', title: 'Import Failed', description: errorMessage });
        } finally {
            setIsImporting(false);
            if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        }
    };

    reader.readAsText(file);
};

  const numSelected = selectedQuestions.length;

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-4xl font-bold mb-2">Question Bank Manager</h1>
            <p className="text-muted-foreground">Manage all JiTesti test questions</p>
        </div>
        <div className="flex gap-2">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImport}
                accept=".json"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Import
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleExport('json')}>Export as JSON</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
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
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                 {/* Dynamic Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                            {category.name_en}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => navigate("/admin/question/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Question
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading questions...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load questions. Please try again later.
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && !error && filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No questions found.</p>
                <Button onClick={() => navigate("/admin/question/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first question
                </Button>
              </div>
            )}

            {!isLoading && !error && filteredQuestions.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={numSelected > 0 && numSelected === filteredQuestions.length ? true : numSelected > 0 ? 'indeterminate' : false}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Question Text</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Media</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQuestions.map((question) => (
                    <TableRow 
                      key={question.name} 
                      data-state={selectedQuestions.includes(question.name) && "selected"}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestions.includes(question.name)}
                          onCheckedChange={(checked) => handleRowSelect(question.name, !!checked)}
                          aria-label={`Select question ${question.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-md">
                        <div className="truncate">{question.question_text_en}</div>
                        <div className="text-sm text-muted-foreground truncate">{question.question_text_sw}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{(categories.find(c => c.id === question.category) || {name_en: 'Unknown'}).name_en}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.question_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {question.image && (
                            <Badge variant="secondary" className="gap-1">
                              <Image className="h-3 w-3" />
                              Image
                            </Badge>
                          )}
                          {question.video_url && (
                            <Badge variant="secondary" className="gap-1">
                              <Video className="h-3 w-3" />
                              Video
                            </Badge>
                          )}
                          {!question.image && !question.video_url && (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {question.difficulty ? (
                          <Badge variant={
                            question.difficulty === 'Easy' ? 'default' :
                            question.difficulty === 'Medium' ? 'secondary' :
                            'destructive'
                          }>
                            {question.difficulty}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Unknown</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={question.is_active === 1 ? "default" : "secondary"}>
                          {question.is_active === 1 ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => navigate(`/admin/question/${question.name}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setQuestionToDelete(question.name);
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
          {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                    {selectedQuestions.length} of {filteredQuestions.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${rowsPerPage}`}
                            onValueChange={(value) => {
                                setRowsPerPage(Number(value));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={rowsPerPage} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 50, 100].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardFooter>
          )}
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question
              and its associated data from our servers.
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

export default QuestionBankManager;
