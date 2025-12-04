import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BookOpen, Clock, GraduationCap, Lock, CheckCircle2, Award, Video } from "lucide-react";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const course = {
    id: courseId,
    title: "Road Safety Fundamentals",
    description: "Master essential road safety rules and regulations for confident driving",
    lessons: 12,
    duration: "4 hours",
    level: "Basic",
    progress: 33,
    completedLessons: 4,
    image: "🚦"
  };

  const lessons = [
    { id: 1, title: "Introduction to Road Safety", duration: "15 min", completed: true, locked: false, hasVideo: true },
    { id: 2, title: "Understanding Traffic Laws", duration: "20 min", completed: true, locked: false, hasVideo: false },
    { id: 3, title: "Right of Way Rules", duration: "25 min", completed: true, locked: false, hasVideo: true },
    { id: 4, title: "Speed Limits and Regulations", duration: "20 min", completed: true, locked: false, hasVideo: false },
    { id: 5, title: "Pedestrian Safety", duration: "15 min", completed: false, locked: false, hasVideo: false },
    { id: 6, title: "Weather Conditions Driving", duration: "20 min", completed: false, locked: true, hasVideo: true },
    { id: 7, title: "Night Driving Safety", duration: "20 min", completed: false, locked: true, hasVideo: true },
    { id: 8, title: "Highway Driving", duration: "25 min", completed: false, locked: true, hasVideo: false },
    { id: 9, title: "Urban Driving Challenges", duration: "20 min", completed: false, locked: true, hasVideo: true },
    { id: 10, title: "Parking Techniques", duration: "15 min", completed: false, locked: true, hasVideo: true },
    { id: 11, title: "Accident Prevention", duration: "20 min", completed: false, locked: true, hasVideo: false },
    { id: 12, title: "Final Assessment", duration: "30 min", completed: false, locked: true, hasVideo: false }
  ];

  const isCompleted = course.progress === 100;

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
              <BreadcrumbPage>{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="text-6xl mb-4">{course.image}</div>
                <CardTitle className="text-3xl">{course.title}</CardTitle>
                <CardDescription className="text-base">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Course Progress</span>
                      <span className="text-muted-foreground">{course.progress}% Complete</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {course.completedLessons} of {course.lessons} lessons completed
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <span>{course.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      <Badge>{course.level}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Course Lessons</h3>
                    {lessons.map((lesson) => (
                      <Card key={lesson.id} className={lesson.locked ? "opacity-60" : ""}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            {lesson.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-success" />
                            ) : lesson.locked ? (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{lesson.title}</p>
                                {lesson.hasVideo && (
                                  <Video className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                            </div>
                          </div>
                          <Button
                            variant={lesson.completed ? "outline" : "default"}
                            size="sm"
                            disabled={lesson.locked}
                            onClick={() => navigate(`/elimika/lesson/${lesson.id}`)}
                          >
                            {lesson.completed ? "Review" : "Start"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {!isCompleted ? (
              <Card>
                <CardHeader>
                  <CardTitle>Continue Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate(`/elimika/lesson/5`)}>
                    Resume Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-success">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <Award className="h-16 w-16 text-success" />
                  </div>
                  <CardTitle className="text-center">Course Completed!</CardTitle>
                  <CardDescription className="text-center">
                    Congratulations on finishing this course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate(`/elimika/completion/${courseId}`)}>
                    Get Certificate
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Practice Quiz</CardTitle>
                <CardDescription>Test your knowledge</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/elimika/quiz/${courseId}`)}>
                  Take Practice Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetail;
