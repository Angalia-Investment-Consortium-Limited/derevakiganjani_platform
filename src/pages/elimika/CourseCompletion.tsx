import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, BookOpen, Home } from "lucide-react";

const CourseCompletion = () => {
  const navigate = useNavigate();
  const { courseId: _courseId } = useParams();

  const completion = {
    courseName: "Road Safety Fundamentals",
    completionDate: new Date().toLocaleDateString(),
    score: 95,
    totalLessons: 12,
    timeSpent: "4.5 hours"
  };

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
              <CardTitle className="text-4xl mb-2">Course Completed!</CardTitle>
              <p className="text-xl text-muted-foreground">
                Congratulations on completing {completion.courseName}
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-3xl font-bold text-primary">{completion.score}%</p>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-3xl font-bold text-primary">{completion.totalLessons}</p>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-3xl font-bold text-primary">{completion.timeSpent}</p>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <p className="text-3xl font-bold text-primary">A+</p>
                  <p className="text-sm text-muted-foreground">Grade</p>
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
                          This certifies that you have successfully completed all lessons and assessments
                          for the {completion.courseName} course on {completion.completionDate}.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  <Download className="mr-2 h-5 w-5" />
                  Download Certificate
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => navigate("/elimika")}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse More Courses
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    <Home className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Continue your learning journey with our intermediate courses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Take the official driving test when you're ready</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Share your achievement with friends and family</span>
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
