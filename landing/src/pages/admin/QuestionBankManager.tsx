import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Image, Video, Loader2, AlertCircle } from "lucide-react";
import { useFrappeGetDocList, useFrappeDocTypeEventListener } from "frappe-react-sdk";
import type { TestQuestion } from "@/types/management";
import { Alert, AlertDescription } from "@/components/ui/alert";

const QuestionBankManager = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Build filters for Frappe query
  const filters = useMemo(() => {
    const f: any[] = [];
    
    if (categoryFilter !== "all") {
      f.push(['category', '=', categoryFilter]);
    }
    
    if (statusFilter !== "all") {
      f.push(['is_active', '=', statusFilter === 'published' ? 1 : 0]);
    }
    
    return f;
  }, [categoryFilter, statusFilter]);

  // Fetch questions from Frappe
  const { data: questions, isLoading, error, mutate } = useFrappeGetDocList<TestQuestion>('Test Question', {
    fields: [
      'name',
      'question_text_en',
      'question_text_sw',
      'category',
      'question_type',
      'image',
      'video_url',
      'is_active',
      'difficulty'
    ],
    filters,
    orderBy: {
      field: 'modified',
      order: 'desc'
    }
  });

  // Real-time updates
  useFrappeDocTypeEventListener('Test Question', () => {
    mutate();
  });

  // Filter questions by search query
  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    
    return questions.filter(question => {
      const matchesSearch = 
        question.question_text_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.question_text_sw.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [questions, searchQuery]);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Question Bank Manager</h1>
        <p className="text-muted-foreground">Manage all JiTesti test questions</p>
      </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="A">Category A</SelectItem>
                    <SelectItem value="B">Category B</SelectItem>
                    <SelectItem value="C">Category C</SelectItem>
                    <SelectItem value="D">Category D</SelectItem>
                    <SelectItem value="E">Category E</SelectItem>
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
              </div>
              <Button onClick={() => navigate("/admin/question/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Question
              </Button>
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
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.name}>
                      <TableCell className="font-medium max-w-md">
                        <div className="truncate">{question.question_text_en}</div>
                        <div className="text-sm text-muted-foreground truncate">{question.question_text_sw}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.category}</Badge>
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
                        {question.difficulty && (
                          <Badge variant={
                            question.difficulty === 'Easy' ? 'default' :
                            question.difficulty === 'Medium' ? 'secondary' :
                            'destructive'
                          }>
                            {question.difficulty}
                          </Badge>
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

export default QuestionBankManager;
