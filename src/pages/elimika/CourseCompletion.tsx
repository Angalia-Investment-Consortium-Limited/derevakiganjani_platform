
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, BookOpen, Home, RefreshCw, Loader2 } from "lucide-react";
import { useElimika } from "@/hooks/useElimika";
import { useCertificateGenerator } from "@/hooks/useCertificateGenerator";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/loader";

const CourseCompletion = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const { user } = useAuth(); 
  const { useCourse } = useElimika();
  const { generate, isGenerating } = useCertificateGenerator();

  const { course, isLoading } = useCourse(courseId);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  const { quizScore, totalQuestions, correctAnswers } = location.state || { quizScore: 0, totalQuestions: 0, correctAnswers: 0 };

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const handleGenerateCertificate = async () => {
    if (!user || !course) return;

    const certificateData = {
      name: user.displayName || user.email || 'Anonymous',
      course: course.course_name_en,
      date: new Date().toLocaleDateString(),
    };

    const firestoreData = {
        driverId: user.uid,
        driverName: user.displayName || user.email || 'Anonymous',
        course_name: course.course_name_en,
        testAttemptId: location.state?.testAttemptId || '', // This can be enhanced later
    };

    try {
      const url = await generate({ data: certificateData, userId: user.uid, firestoreData });
      setCertificateUrl(url);
    } catch (e) {
      // Error is handled by the hook's toast messages
    }
  };


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-success">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-6 animate-scale-in">
                <div className="relative">
                  <Award className="h-32 w-32 text-success" />
                  <div className="absolute inset-0 animate-pulse">
                    <Award className="h-32 w-32 text-success/30" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-4xl mb-2">Quiz Completed!</CardTitle>
              <p className="text-xl text-muted-foreground">
                Congratulations on completing the quiz for {course?.course_name_en || 'the course'}
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-3xl font-bold text-primary">{quizScore}%</p>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-3xl font-bold text-primary">{correctAnswers}/{totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-3xl font-bold text-primary">{getGrade(quizScore)}</p>
                  <p className="text-sm text-muted-foreground">Grade</p>
                </div>
                 <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-3xl font-bold text-primary">{totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Achievement</h3>
                <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Award className="h-12 w-12 text-primary flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Certificate of Completion</h4>
                        <p className="text-sm text-muted-foreground">
                          This certifies that you have successfully completed the quiz for the {course?.course_name_en} course.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

               <div className="space-y-3">
                {certificateUrl ? (
                    <Button asChild className="w-full" size="lg">
                        <a href={certificateUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-5 w-5" />
                            View Certificate
                        </a>
                    </Button>
                ) : (
                    <Button className="w-full" size="lg" onClick={handleGenerateCertificate} disabled={isGenerating || quizScore < 80}>
                        {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                        {quizScore < 80 ? "Score 80% or higher to get a certificate" : "Generate Certificate"}
                    </Button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => navigate(`/elimika/quiz/${courseId}`)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retake Quiz
                    </Button>
                  <Button variant="outline" onClick={() => navigate(`/elimika/course/${courseId}`)}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Back to Course
                  </Button>
                </div>
                 <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
                    <Home className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Continue your learning journey with our other courses.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Review the course materials to solidify your knowledge.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Share your achievement with friends and family!</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseCompletion;
