import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Award, Play, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useElimika } from "@/hooks/useElimika";
import { useMemo } from "react";
import type { CourseEnrollment } from "@/types/elimika";

const EnrollmentCard = ({ enrollment }: { enrollment: CourseEnrollment }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { useCourse } = useElimika();
  const { data: course, isLoading } = useCourse(enrollment.course);

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!course) return null;

  const title = language === 'en' ? course.course_name_en : (course.course_name_sw || course.course_name_en);
  const statusLabel = enrollment.status === 'Completed' 
    ? (language === 'en' ? 'Completed' : 'Imekamilika')
    : (language === 'en' ? 'In Progress' : 'Inaendelea');

  return (
    <Card key={enrollment.name}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="text-6xl flex-shrink-0">{course.thumbnail_emoji || "📚"}</div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>{enrollment.completed_lessons} {language === 'en' ? 'of' : 'kati ya'} {course.total_lessons || 0} {language === 'en' ? 'lessons' : 'masomo'}</span>
                </div>
              </div>
              <Badge variant={enrollment.status === "Completed" ? "default" : "secondary"}>
                {statusLabel}
              </Badge>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{language === 'en' ? 'Progress' : 'Maendeleo'}</span>
                <span className="text-muted-foreground">{enrollment.progress_percentage}%</span>
              </div>
              <Progress value={enrollment.progress_percentage} className="h-2" />
            </div>

            <div className="flex gap-3">
              {enrollment.status === "Completed" ? (
                <>
                  <Button onClick={() => navigate(`/elimika/completion/${enrollment.course}`)}>
                    <Award className="mr-2 h-4 w-4" />
                    {language === 'en' ? 'View Certificate' : 'Tazama Cheti'}
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/elimika/course/${enrollment.course}`)}>
                    {language === 'en' ? 'Review Course' : 'Pitia Kozi'}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate(`/elimika/course/${enrollment.course}`)}>
                    {language === 'en' ? 'Resume Learning' : 'Endelea Kujifunza'}
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`/elimika/quiz/${enrollment.course}`)}>
                    {language === 'en' ? 'Practice Quiz' : 'Zoezi la Maswali'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MyLearning = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const { useDriverProfileByUser, useDriverEnrollments } = useElimika();
  
  const { data: profiles, isLoading: profileLoading } = useDriverProfileByUser(currentUser);
  const driverProfileId = profiles && profiles.length > 0 ? profiles[0].name : currentUser?.uid;
  
  const { data: enrollments, isLoading: enrollmentsLoading, isError } = useDriverEnrollments(driverProfileId);

  const stats = useMemo(() => {
    if (!enrollments) return { total: 0, inProgress: 0, completed: 0 };
    return {
      total: enrollments.length,
      inProgress: enrollments.filter(e => e.status !== 'Completed').length,
      completed: enrollments.filter(e => e.status === 'Completed').length,
    };
  }, [enrollments]);

  const isLoading = profileLoading || enrollmentsLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">{language === 'en' ? 'Home' : 'Nyumbani'}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/elimika">Elimika</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{language === 'en' ? 'My Learning' : 'Mafunzo Yangu'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{language === 'en' ? 'My Learning Dashboard' : 'Dashibodi yangu ya Mafunzo'}</h1>
          <p className="text-muted-foreground">{language === 'en' ? 'Track your progress and continue learning' : 'Fuatilia maendeleo yako na uendelee kujifunza'}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
             {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'Total Courses' : 'Jumla ya Kozi'}</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                  </div>
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'In Progress' : 'Zinaendelea'}</p>
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
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'Completed' : 'Zimekamilika'}</p>
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
                    <p className="text-sm text-muted-foreground">{language === 'en' ? 'Certificates' : 'Vyeti'}</p>
                    <p className="text-3xl font-bold">{stats.completed}</p>
                  </div>
                  <Award className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{language === 'en' ? 'My Courses' : 'Kozi Zangu'}</h2>
            <Button onClick={() => navigate("/elimika")}>{language === 'en' ? 'Browse More Courses' : 'Tazama Kozi Zaidi'}</Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
               {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
               <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
               <p className="text-muted-foreground">{language === 'en' ? 'Failed to load your learning history.' : 'Imeshindwa kupakia historia yako ya mafunzo.'}</p>
            </div>
          ) : enrollments && enrollments.length > 0 ? (
            enrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment.name} enrollment={enrollment} />
            ))
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">{language === 'en' ? "You haven't enrolled in any courses yet." : "Bado haujajisajili kwenye kozi yoyote."}</p>
              <Button className="mt-4" onClick={() => navigate("/elimika")}>
                {language === 'en' ? 'Start Learning Today' : 'Anza Kujifunza Leo'}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyLearning;
