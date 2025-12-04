import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Image, Video } from "lucide-react";

const QuestionBankManager = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const questions = [
    {
      id: 1,
      text: "What is the maximum speed limit in a residential area?",
      category: "B",
      hasImage: true,
      hasVideo: false,
      status: "published",
      answers: 4
    },
    {
      id: 2,
      text: "When must you stop at a railway crossing?",
      category: "B",
      hasImage: false,
      hasVideo: true,
      status: "published",
      answers: 4
    },
    {
      id: 3,
      text: "What does a red traffic light mean?",
      category: "A",
      hasImage: true,
      hasVideo: false,
      status: "published",
      answers: 3
    },
    {
      id: 4,
      text: "How often should you check your motorcycle's chain tension?",
      category: "A",
      hasImage: false,
      hasVideo: false,
      status: "draft",
      answers: 4
    },
    {
      id: 5,
      text: "What is the minimum safe following distance?",
      category: "C",
      hasImage: true,
      hasVideo: true,
      status: "published",
      answers: 4
    }
  ];

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || question.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || question.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question Text</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Answers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium max-w-md truncate">{question.text}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Cat {question.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {question.hasImage && (
                          <Badge variant="secondary" className="gap-1">
                            <Image className="h-3 w-3" />
                            Image
                          </Badge>
                        )}
                        {question.hasVideo && (
                          <Badge variant="secondary" className="gap-1">
                            <Video className="h-3 w-3" />
                            Video
                          </Badge>
                        )}
                        {!question.hasImage && !question.hasVideo && (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{question.answers}</TableCell>
                    <TableCell>
                      <Badge variant={question.status === "published" ? "default" : "secondary"}>
                        {question.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => navigate(`/admin/question/edit/${question.id}`)}
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
          </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default QuestionBankManager;
