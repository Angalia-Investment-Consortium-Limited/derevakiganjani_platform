import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, GraduationCap, Lock, CheckCircle2, Award, Video, FileText, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useElimika } from "@/hooks/useElimika";
import { useToast } from "@/hooks/use-toast";
import type { Lesson } from "@/types/elimika";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const { useCourse, useLessons, useDriverProfileByUser, useEnrollmentStatus, useLessonProgress, useEnrollInCourse, useCoursePayment } = useElimika();
  
  const { data: driverProfileData, isLoading: profileLoading } = useDriverProfileByUser(currentUser || undefined);
  
  const driverProfileId = useMemo(() => {
    if (driverProfileData && driverProfileData.length > 0) {
      return driverProfileData[0].name;
    }
    return currentUser?.uid;
  }, [driverProfileData, currentUser]);
  
  const { data: course, isLoading: courseLoading, isError: courseError } = useCourse(courseId);
  
  const { data: lessons, isLoading: lessonsLoading, isError: lessonsError } = useLessons(courseId);
  
  const { data: enrollment, isLoading: enrollmentLoading, mutate: mutateEnrollment } = useEnrollmentStatus(courseId, driverProfileId);
  
  const { data: progressData, isLoading: progressLoading } = useLessonProgress(driverProfileId, enrollment?.name);
  
  const { enroll, loading: enrolling } = useEnrollInCourse();
  const { initiatePayment, loading: paying } = useCoursePayment();
  
  const completedLessonIds = useMemo(() => {
    if (!progressData) return new Set();
    return new Set(progressData
      .filter(p => p.status === 'completed')
      .map(p => p.lesson_id));
  }, [progressData]);
  
  const progress = useMemo(() => enrollment?.progress_percentage || 0, [enrollment]);
  
  const completedLessonsCount = useMemo(() => enrollment?.completed_lessons || 0, [enrollment]);
  
  const isLessonLocked = (lesson: Lesson): boolean => {
    if (!lesson.is_locked || !lesson.unlock_after_lesson) return false;
    return !completedLessonIds.has(lesson.unlock_after_lesson);
  };
  
  const isLessonCompleted = (lessonId: string): boolean => {
    return completedLessonIds.has(lessonId);
  };
  
  const getContentTypeIcon = (contentType?: string) => {
    switch (contentType) {
      case 'video': return <Video className="h-4 w-4 text-primary" />;
      case 'pdf': return <FileText className="h-4 w-4 text-primary" />;
      case 'image': return <ImageIcon className="h-4 w-4 text-primary" />;
      default: return null;
    }
  };
  
  const handleEnroll = async () => {
    if (!driverProfileId || !courseId || !course || !currentUser) {
      toast({
        title: language === 'en' ? "Error" : "Kosa",
        description: language === 'en' 
          ? "Cannot enroll at this time. User or course data is missing." 
          : "Haiwezi kusajili kwa sasa. Data ya mtumiaji au kozi haipo.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // 1. If course is NOT free, initiate payment first
      if (course.is_free === 0) {
        const amount = course.price || 0;
        const result = await initiatePayment(
          courseId, 
          driverProfileId, 
          amount, 
          currentUser.email || '', 
          '' // Phone number could be fetched from profile if needed
        );
        
        if (result.checkoutUrl) {
          toast({
            title: language === 'en' ? "Redirecting to Payment..." : "Inakuelekeza kwenye Malipo...",
            description: language === 'en' ? "Please complete your payment on Selcom" : "Tafadhali kamilisha malipo yako Selcom"
          });
          window.location.href = result.checkoutUrl;
          return;
        }
      }

      // 2. If free, or payment initiated (and eventually completed), enroll
      await enroll({
        driver: driverProfileId,
        course: courseId,
      });
      
      toast({
        title: language === 'en' ? "Enrolled Successfully!" : "Umejisajili Kikamilifu!",
        description: language === 'en' 
          ? "You can now start learning" 
          : "Unaweza kuanza kujifunza sasa"
      });
      
      await mutateEnrollment();
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: language === 'en' ? "Enrollment Failed" : "Usajili Umeshindwa",
        description: error?.message || (language === 'en' 
          ? "Failed to enroll. Please try again." 
          : "Imeshindwa kusajili. Tafadhali jaribu tena."),
        variant: "destructive"
      });
    }
  };
  
  const nextLesson = useMemo(() => {
    if (!lessons) return null;
    return lessons.find(lesson => !isLessonCompleted(lesson.name) && !isLessonLocked(lesson));
  }, [lessons, completedLessonIds]);
  
  const isCompleted = progress === 100;
  const isLoading = courseLoading || lessonsLoading || profileLoading || enrollmentLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Skeleton className="h-6 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-16 w-16 rounded-full mb-4" />
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-10 w-full" /></CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (courseError || lessonsError) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{language === 'en' ? 'Error' : 'Kosa'}</AlertTitle>
            <AlertDescription>
              {language === 'en' ? 'Failed to load course details. Please try again later.' : 'Imeshindwa kupakia maelezo ya kozi. Tafadhali jaribu tena baadaye.'}
            </AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate('/elimika')}>
            {language === 'en' ? 'Back to Courses' : 'Rudi kwa Kozi'}
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{language === 'en' ? 'Course not found' : 'Kozi haijapatikana'}</h3>
            <p className="text-muted-foreground mb-4">{language === 'en' ? 'The course you are looking for does not exist.' : 'Kozi unayoitafuta haipo.'}</p>
            <Button onClick={() => navigate('/elimika')}>{language === 'en' ? 'Browse Courses' : 'Tazama Kozi'}</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const courseName = language === 'en' ? course.course_name_en : (course.course_name_sw || course.course_name_en);
  const courseDescription = language === 'en' ? course.description_en : (course.description_sw || course.description_en);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/dashboard">{language === 'en' ? 'Home' : 'Nyumbani'}</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="/elimika">Elimika</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{courseName}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="text-6xl mb-4">{course.thumbnail_emoji || "📚"}</div>
                <CardTitle className="text-3xl">{courseName}</CardTitle>
                <CardDescription className="text-base">{courseDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {enrollment && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{language === 'en' ? 'Course Progress' : 'Maendeleo ya Kozi'}</span>
                        <span className="text-muted-foreground">{progress}% {language === 'en' ? 'Complete' : 'Imekamilika'}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-2">
                        {completedLessonsCount} {language === 'en' ? 'of' : 'kati ya'} {course.total_lessons || lessons?.length || 0} {language === 'en' ? 'lessons completed' : 'masomo yamekamilika'}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-muted-foreground" /><span>{course.total_lessons || lessons?.length || 0} {language === 'en' ? 'lessons' : 'masomo'}</span></div>
                    <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-muted-foreground" /><span>{course.duration_hours || 0} {language === 'en' ? 'hours' : 'masaa'}</span></div>
                    {course.level && <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-muted-foreground" /><Badge>{course.level}</Badge></div>}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">{language === 'en' ? 'Course Lessons' : 'Masomo ya Kozi'}</h3>
                    {lessons && lessons.length > 0 ? (
                      [...lessons].sort((a,b) => (a.lesson_order || 0) - (b.lesson_order || 0)).map((lesson) => {
                        const locked = isLessonLocked(lesson);
                        const completed = isLessonCompleted(lesson.name);
                        const lessonTitle = language === 'en' ? lesson.lesson_title_en : (lesson.lesson_title_sw || lesson.lesson_title_en);
                        
                        return (
                          <Card key={lesson.name} className={locked ? "opacity-60" : ""}>
                            <CardContent className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                {completed ? <CheckCircle2 className="h-5 w-5 text-success" /> : (locked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{lessonTitle}</p>
                                    {getContentTypeIcon(lesson.content_type)}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{lesson.duration_minutes || 0} {language === 'en' ? 'min' : 'dak'}</p>
                                </div>
                              </div>
                              <Button variant={completed ? "outline" : "default"} size="sm" disabled={locked || !enrollment} onClick={() => navigate(`/elimika/lesson/${lesson.name}`)}>
                                {completed ? (language === 'en' ? 'Review' : 'Pitia') : (language === 'en' ? 'Start' : 'Anza')}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground text-center py-4">{language === 'en' ? 'No lessons available' : 'Hakuna masomo yaliyopatikana'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {!enrollment ? (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'en' ? 'Enroll in Course' : 'Jisajili kwenye Kozi'}</CardTitle>
                  <CardDescription>{language === 'en' ? 'Start your learning journey' : 'Anza safari yako ya kujifunza'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={handleEnroll} disabled={enrolling || paying || !currentUser}>
                    {paying ? (language === 'en' ? 'Processing Payment...' : 'Inasindika Malipo...') : (enrolling ? (language === 'en' ? 'Enrolling...' : 'Inasajili...') : (course.is_free === 0 ? (language === 'en' ? `Buy Now (TZS ${course.price})` : `Nunua Sasa (TZS ${course.price})`) : (language === 'en' ? 'Enroll Now' : 'Jisajili Sasa')))}
                  </Button>
                  {!currentUser && <p className="text-sm text-muted-foreground mt-2 text-center">{language === 'en' ? 'Please log in to enroll' : 'Tafadhali ingia ili kujisajili'}</p>}
                </CardContent>
              </Card>
            ) : !isCompleted ? (
              <Card>
                <CardHeader><CardTitle>{language === 'en' ? 'Continue Learning' : 'Endelea Kujifunza'}</CardTitle></CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => nextLesson && navigate(`/elimika/lesson/${nextLesson.name}`)} disabled={!nextLesson}>
                    {language === 'en' ? 'Resume Course' : 'Endelea na Kozi'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-success">
                <CardHeader>
                  <div className="flex justify-center mb-4"><Award className="h-16 w-16 text-success" /></div>
                  <CardTitle className="text-center">{language === 'en' ? 'Course Completed!' : 'Kozi Imekamilika!'}</CardTitle>
                  <CardDescription className="text-center">{language === 'en' ? 'Congratulations on finishing this course' : 'Hongera kwa kukamilisha kozi hii'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate(`/elimika/completion/${courseId}`)}>{language === 'en' ? 'Get Certificate' : 'Pata Cheti'}</Button>
                </CardContent>
              </Card>
            )}

            {enrollment && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'en' ? 'Practice Quiz' : 'Zoezi la Maswali'}</CardTitle>
                  <CardDescription>{language === 'en' ? 'Test your knowledge' : 'Jaribu ujuzi wako'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/elimika/quiz/${courseId}`)}>
                    {language === 'en' ? 'Take Practice Quiz' : 'Fanya Zoezi'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetail;
