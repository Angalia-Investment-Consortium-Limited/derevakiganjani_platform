import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, PlayCircle, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useElimika } from "@/hooks/useElimika";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { XCircle } from "lucide-react";
const LessonViewer = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const { useLesson, useCourse, useLessons, useDriverProfileByUser, useEnrollmentStatus, useUpdateLessonProgress, useLessonProgress } = useElimika();
  
  const { data: lesson, isLoading: lessonLoading } = useLesson(lessonId);
  const courseIdToUse = lesson?.course || lesson?.course_id;
  const { data: course, isLoading: courseLoading } = useCourse(courseIdToUse);
  const { data: lessons, isLoading: lessonsLoading } = useLessons(courseIdToUse);
  
  const { data: driverProfileData } = useDriverProfileByUser(currentUser || undefined);
  const driverProfileId = (driverProfileData && driverProfileData.length > 0) ? driverProfileData[0].name : currentUser?.uid;
  
  const { data: enrollment } = useEnrollmentStatus(courseIdToUse, driverProfileId);
  const { data: progressData, mutate: mutateProgress } = useLessonProgress(driverProfileId, enrollment?.name);
  
  const { markAsComplete, loading: markingComplete } = useUpdateLessonProgress();

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const interactiveQuestions = lesson?.interactive_questions || [];
  const hasQuestions = interactiveQuestions.length > 0;
  
  // A lesson can be marked complete manually ONLY IF all interactive questions are successfully answered.
  const allQuestionsAnswered = interactiveQuestions.every(q => selectedAnswers[q.id]);

  const isCompleted = useMemo(() => {
    if (!progressData || !lessonId) return false;
    return progressData.some(p => p.lesson_id === lessonId && p.status === 'completed');
  }, [progressData, lessonId]);

  const sortedLessons = useMemo(() => {
    if (!lessons) return [];
    return [...lessons].sort((a, b) => (a.lesson_order || 0) - (b.lesson_order || 0));
  }, [lessons]);

  const currentIndex = useMemo(() => {
    if (!sortedLessons || !lessonId) return -1;
    return sortedLessons.findIndex(l => l.name === lessonId);
  }, [sortedLessons, lessonId]);

  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const handleMarkComplete = async () => {
    if (!driverProfileId || !enrollment || !lesson || !course || !lessonId) return;
    
    try {
      await markAsComplete(
        driverProfileId,
        enrollment.name,
        course.name,
        lessonId,
        course.total_lessons || sortedLessons.length,
        enrollment.completed_lessons
      );
      
      toast({
        title: language === 'en' ? "Lesson Completed!" : "Somo Limekamilika!",
        description: language === 'en' ? "Your progress has been saved." : "Maendeleo yako yamehifadhiwa.",
      });
      
      await mutateProgress();
    } catch (error) {
        toast({
            title: language === 'en' ? "Error" : "Kosa",
            description: language === 'en' ? "Failed to save progress." : "Imeshindwa kuhifadhi maendeleo.",
            variant: "destructive"
        });
    }
  };

  const isLoading = lessonLoading || courseLoading || lessonsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">{language === 'en' ? 'Lesson not found' : 'Somo halijapatikana'}</h3>
            <Button className="mt-4" onClick={() => navigate('/elimika')}>
              {language === 'en' ? 'Back to Elimika' : 'Rudi Elimika'}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const lessonTitle = language === 'en' ? lesson.lesson_title_en : (lesson.lesson_title_sw || lesson.lesson_title_en);
  const courseTitle = course ? (language === 'en' ? course.course_name_en : course.course_name_sw) : 'Course';
  const lessonContent = language === 'en' ? lesson.content_en : (lesson.content_sw || lesson.content_en);

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
              <BreadcrumbLink href={`/elimika/course/${course?.name}`}>{courseTitle}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lessonTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl">{lessonTitle}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <span>{lesson.duration_minutes || 0} {language === 'en' ? 'min' : 'dak'}</span>
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">
                        {language === 'en' ? 'Completed' : 'Imekamilika'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {lesson.video_url && (
                <div className="aspect-video w-full overflow-hidden rounded-lg border bg-black">
                   {/* Simplified video display, assuming it's a direct URL or YouTube embed handled by iframe */}
                   {lesson.video_url.includes('youtube.com') || lesson.video_url.includes('youtu.be') ? (
                     <iframe
                        src={lesson.video_url.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allowFullScreen
                        title={lessonTitle}
                    />
                   ) : (
                    <video src={lesson.video_url} controls className="w-full h-full" />
                   )}
                </div>
              )}

              {lesson.content_type === 'image' && lesson.image_url && (
                <div className="w-full overflow-hidden rounded-lg border">
                  <img src={lesson.image_url} alt={lessonTitle} className="w-full object-cover" />
                </div>
              )}

              <div className="prose prose-slate max-w-none dark:prose-invert"
                   dangerouslySetInnerHTML={{ __html: lessonContent || '' }}
              />

              {hasQuestions && (
                  <div className="mt-8 space-y-8">
                     <h3 className="text-xl font-bold">{language === 'en' ? 'Knowledge Check' : 'Zoezi'}</h3>
                     {interactiveQuestions.map((question, index) => {
                         const qId = question.id;
                         const isAnswered = !!selectedAnswers[qId];
                         const feedbackShown = !!showFeedback[qId];
                         const isCorrect = selectedAnswers[qId] === question.correct_answer;
                         const explanationText = language === 'en' ? question.explanation_en : (question.explanation_sw || question.explanation_en);

                         return (
                             <Card key={qId} className={`border-2 ${feedbackShown ? (isCorrect ? 'border-success' : 'border-destructive') : 'border-muted'}`}>
                                 <CardHeader className="bg-muted/10 pb-4">
                                     <CardTitle className="text-lg">
                                         {index + 1}. {language === 'en' ? question.question_text_en : (question.question_text_sw || question.question_text_en)}
                                     </CardTitle>
                                 </CardHeader>
                                 <CardContent className="pt-4 space-y-4">
                                     <RadioGroup 
                                        value={selectedAnswers[qId]} 
                                        onValueChange={(val) => {
                                            if (!feedbackShown) {
                                                setSelectedAnswers(prev => ({ ...prev, [qId]: val }));
                                            }
                                        }}
                                        disabled={feedbackShown}
                                     >
                                         <div className="space-y-3">
                                             {question.options.map(option => {
                                                let style = "";
                                                if (feedbackShown) {
                                                    if (option.option_id === question.correct_answer) style = "border-success bg-success/10";
                                                    else if (selectedAnswers[qId] === option.option_id) style = "border-destructive bg-destructive/10";
                                                }
                                                return (
                                                 <div key={option.option_id} className={`flex items-center space-x-2 p-4 rounded-lg border transition-all ${style}`}>
                                                     <RadioGroupItem value={option.option_id} id={`q_${qId}_opt_${option.option_id}`} />
                                                     <Label htmlFor={`q_${qId}_opt_${option.option_id}`} className="flex-1 cursor-pointer">
                                                         {language === 'en' ? option.option_text_en : (option.option_text_sw || option.option_text_en)}
                                                     </Label>
                                                     {feedbackShown && option.option_id === question.correct_answer && <CheckCircle2 className="h-5 w-5 text-success" />}
                                                     {feedbackShown && selectedAnswers[qId] === option.option_id && !isCorrect && <XCircle className="h-5 w-5 text-destructive" />}
                                                 </div>
                                             )})}
                                         </div>
                                     </RadioGroup>

                                     {!feedbackShown && (
                                         <Button 
                                            onClick={() => setShowFeedback(prev => ({ ...prev, [qId]: true }))} 
                                            disabled={!isAnswered}
                                         >
                                             {language === 'en' ? 'Submit Answer' : 'Wasilisha Jibu'}
                                         </Button>
                                     )}

                                     {feedbackShown && (
                                         <div className={`p-4 rounded-lg mt-4 ${isCorrect ? "bg-success/10" : "bg-destructive/10"}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                {isCorrect ? (
                                                    <><CheckCircle2 className="h-5 w-5 text-success" /><span className="font-bold text-success">{language === 'en' ? 'Correct!' : 'Sahihi!'}</span></>
                                                ) : (
                                                    <><XCircle className="h-5 w-5 text-destructive" /><span className="font-bold text-destructive">{language === 'en' ? 'Incorrect' : 'Si Sahihi'}</span></>
                                                )}
                                            </div>
                                            {(explanationText && explanationText.trim() !== '') && (
                                                <div className="mt-2 text-sm">
                                                    <strong>{language === 'en' ? 'Explanation:' : 'Maelezo:'}</strong> {explanationText}
                                                </div>
                                            )}
                                         </div>
                                     )}
                                 </CardContent>
                             </Card>
                         )
                     })}
                  </div>
              )}

              {!isCompleted ? (
                <Button 
                    className="w-full mt-8" 
                    onClick={handleMarkComplete} 
                    disabled={markingComplete || !enrollment || (hasQuestions && !allQuestionsAnswered)}
                >
                  {markingComplete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {hasQuestions && !allQuestionsAnswered 
                    ? (language === 'en' ? 'Answer all questions to complete lesson' : 'Jibu maswali yote ili kumaliza somo')
                    : (language === 'en' ? 'Mark Lesson Complete' : 'Weka Somo Limekamilika')
                  }
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-4 mt-8 bg-success/10 rounded-lg text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">{language === 'en' ? 'Lesson Completed!' : 'Somo Limekamilika!'}</span>
                </div>
              )}

              <div className="flex justify-between gap-4 pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/elimika/lesson/${prevLesson?.name}`)}
                  disabled={!prevLesson}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {language === 'en' ? 'Previous' : 'Iliyopita'}
                </Button>
                <Button
                  onClick={() => navigate(`/elimika/lesson/${nextLesson?.name}`)}
                  disabled={!nextLesson || (!isCompleted && lesson.is_locked)}
                >
                  {language === 'en' ? 'Next' : 'Inayofuata'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {currentIndex === sortedLessons.length - 1 && isCompleted && (
                <Button 
                    className="w-full bg-success hover:bg-success/90" 
                    onClick={() => navigate(`/elimika/quiz/${course?.name}`)}
                >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    {language === 'en' ? 'Take Final Quiz' : 'Fanya Zoezi la Mwisho'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LessonViewer;
