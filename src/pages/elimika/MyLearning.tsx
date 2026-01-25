import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BookOpen, Clock, Award, Play } from "lucide-react";

const MyLearning = () => {
  const navigate = useNavigate();

  const enrolledCourses = [
    {
      id: 1,
      title: "Road Safety Fundamentals",
      progress: 33,
      completedLessons: 4,
      totalLessons: 12,
      lastAccessed: "2 hours ago",
      status: "in-progress",
      image: "🚦"
    },
    {
      id: 2,
      title: "Traffic Signs & Signals",
      progress: 60,
      completedLessons: 9,
      totalLessons: 15,
      lastAccessed: "1 day ago",
      status: "in-progress",
      image: "🚸"
    },
    {
      id: 4,
      title: "Vehicle Maintenance Basics",
      progress: 100,
      completedLessons: 10,
      totalLessons: 10,
      completedDate: "3 days ago",
      status: "completed",
      score: 92,
      image: "🔧"
    }
  ];

  const stats = {
    totalCourses: enrolledCourses.length,
    inProgress: enrolledCourses.filter(c => c.status === "in-progress").length,
    completed: enrolledCourses.filter(c => c.status === "completed").length,
    totalHours: 15.5
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/elimika">Elimika</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Learning</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Learning Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and continue learning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                </div>
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold">{stats.inProgress}</p>
                </div>
                <Play className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </div>
                <Award className="h-10 w-10 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Learning Hours</p>
                  <p className="text-3xl font-bold">{stats.totalHours}</p>
                </div>
                <Clock className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Courses</h2>
            <Button onClick={() => navigate("/elimika")}>Browse More Courses</Button>
          </div>

          {enrolledCourses.map((course) => (
            <Card key={course.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="text-6xl flex-shrink-0">{course.image}</div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                          <span>•</span>
                          <span>Last accessed {course.lastAccessed}</span>
                        </div>
                      </div>
                      <Badge variant={course.status === "completed" ? "default" : "secondary"}>
                        {course.status === "completed" ? "Completed" : "In Progress"}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="text-muted-foreground">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <div className="flex gap-3">
                      {course.status === "completed" ? (
                        <>
                          <Button onClick={() => navigate(`/elimika/completion/${course.id}`)}>
                            <Award className="mr-2 h-4 w-4" />
                            View Certificate
                          </Button>
                          <Button variant="outline" onClick={() => navigate(`/elimika/course/${course.id}`)}>
                            Review Course
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => navigate(`/elimika/course/${course.id}`)}>
                            Resume Learning
                          </Button>
                          <Button variant="outline" onClick={() => navigate(`/elimika/quiz/${course.id}`)}>
                            Practice Quiz
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyLearning;
