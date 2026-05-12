import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Download, FileText, Loader2 } from "lucide-react";
import { useElimika } from "@/hooks/useElimika";
import { formatDistanceToNow, isToday } from "date-fns";

const LearnerProgress = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const { useAdminEnrollments } = useElimika();
  const { data: enrollments, isLoading } = useAdminEnrollments();

  const uniqueCourses = useMemo(() => {
    if (!enrollments) return [];
    return Array.from(new Set(enrollments.map(e => e.courseName).filter(Boolean)));
  }, [enrollments]);

  const filteredLearners = useMemo(() => {
    if (!enrollments) return [];
    return enrollments.filter(learner => {
      const matchesSearch = learner.learnerName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === "all" || learner.courseName === courseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [enrollments, searchQuery, courseFilter]);

  const stats = useMemo(() => {
    if (!enrollments || enrollments.length === 0) {
      return { totalLearners: 0, activeToday: 0, completedCourses: 0, averageProgress: 0 };
    }
    
    return {
      totalLearners: enrollments.length,
      activeToday: enrollments.filter(l => {
        if (!l.last_accessed) return false;
        try {
          return isToday(l.last_accessed.toDate());
        } catch {
          return false;
        }
      }).length,
      completedCourses: enrollments.filter(l => l.status === "Completed" || l.progress_percentage === 100).length,
      averageProgress: Math.round(enrollments.reduce((acc, l) => acc + (l.progress_percentage || 0), 0) / enrollments.length)
    };
  }, [enrollments]);

  const formatLastActive = (timestamp: any) => {
    if (!timestamp) return 'Never';
    try {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const handleExportCSV = () => {
    if (!filteredLearners || filteredLearners.length === 0) return;

    const headers = ['Learner Name', 'Course', 'Progress (%)', 'Lessons', 'Status', 'Last Active'];
    
    const csvContent = [
      headers.join(','),
      ...filteredLearners.map(learner => {
        return [
          `"${learner.learnerName || ''}"`,
          `"${learner.courseName || ''}"`,
          learner.progress_percentage || 0,
          `"${learner.completed_lessons || 0}/${learner.totalLessons || 0}"`,
          `"${learner.status === "Completed" ? "Completed" : "In Progress"}"`,
          `"${formatLastActive(learner.last_accessed)}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `learner_progress_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintReport = () => {
    window.print();
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
                <p className="text-3xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalLearners}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-3xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.activeToday}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Completed Courses</p>
                <p className="text-3xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.completedCourses}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg. Progress</p>
                <p className="text-3xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.averageProgress}%`}
                </p>
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
                    {uniqueCourses.map(course => (
                      <SelectItem key={course} value={course as string}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 print:hidden">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={handlePrintReport}>
                  <FileText className="mr-2 h-4 w-4" />
                  Print Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Learner Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Lessons</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLearners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No learners found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLearners.map((learner) => (
                      <TableRow key={learner.name}>
                        <TableCell className="font-medium">{learner.learnerName}</TableCell>
                        <TableCell>{learner.courseName}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={learner.progress_percentage || 0} className="h-2 w-[100px]" />
                            <span className="text-xs text-muted-foreground">{learner.progress_percentage || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {learner.completed_lessons || 0}/{learner.totalLessons || 0}
                        </TableCell>
                        <TableCell>
                          <Badge variant={learner.status === "Completed" ? "default" : "secondary"}>
                            {learner.status === "Completed" ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatLastActive(learner.last_accessed)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default LearnerProgress;
