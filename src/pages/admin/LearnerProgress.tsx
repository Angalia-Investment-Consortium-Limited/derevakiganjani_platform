import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Download, FileText } from "lucide-react";

const LearnerProgress = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const learners = [
    {
      id: 1,
      name: "John Kamau",
      course: "Road Safety Fundamentals",
      progress: 75,
      completedLessons: 9,
      totalLessons: 12,
      status: "in-progress",
      lastActive: "2 hours ago",
      score: 85
    },
    {
      id: 2,
      name: "Mary Wanjiku",
      course: "Traffic Signs & Signals",
      progress: 100,
      completedLessons: 15,
      totalLessons: 15,
      status: "completed",
      lastActive: "1 day ago",
      score: 92
    },
    {
      id: 3,
      name: "Peter Ochieng",
      course: "Defensive Driving",
      progress: 45,
      completedLessons: 8,
      totalLessons: 18,
      status: "in-progress",
      lastActive: "3 hours ago",
      score: 78
    },
    {
      id: 4,
      name: "Grace Akinyi",
      course: "Road Safety Fundamentals",
      progress: 100,
      completedLessons: 12,
      totalLessons: 12,
      status: "completed",
      lastActive: "2 days ago",
      score: 95
    },
    {
      id: 5,
      name: "David Mwangi",
      course: "Vehicle Maintenance Basics",
      progress: 30,
      completedLessons: 3,
      totalLessons: 10,
      status: "in-progress",
      lastActive: "5 hours ago",
      score: 72
    }
  ];

  const filteredLearners = learners.filter(learner => {
    const matchesSearch = learner.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "all" || learner.course === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const stats = {
    totalLearners: learners.length,
    activeToday: learners.filter(l => l.lastActive.includes("hours")).length,
    completedCourses: learners.filter(l => l.status === "completed").length,
    averageProgress: Math.round(learners.reduce((acc, l) => acc + l.progress, 0) / learners.length)
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Learner Progress & Reports</h1>
        <p className="text-muted-foreground">Track and monitor all learner activities</p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Learners</p>
                <p className="text-3xl font-bold">{stats.totalLearners}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-3xl font-bold">{stats.activeToday}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Completed Courses</p>
                <p className="text-3xl font-bold">{stats.completedCourses}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg. Progress</p>
                <p className="text-3xl font-bold">{stats.averageProgress}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search learners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="Road Safety Fundamentals">Road Safety Fundamentals</SelectItem>
                    <SelectItem value="Traffic Signs & Signals">Traffic Signs & Signals</SelectItem>
                    <SelectItem value="Defensive Driving">Defensive Driving</SelectItem>
                    <SelectItem value="Vehicle Maintenance Basics">Vehicle Maintenance Basics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Print Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLearners.map((learner) => (
                  <TableRow key={learner.id}>
                    <TableCell className="font-medium">{learner.name}</TableCell>
                    <TableCell>{learner.course}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={learner.progress} className="h-2 w-[100px]" />
                        <span className="text-xs text-muted-foreground">{learner.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {learner.completedLessons}/{learner.totalLessons}
                    </TableCell>
                    <TableCell>
                      <Badge variant={learner.score >= 85 ? "default" : "secondary"}>
                        {learner.score}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={learner.status === "completed" ? "default" : "secondary"}>
                        {learner.status === "completed" ? "Completed" : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{learner.lastActive}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default LearnerProgress;
