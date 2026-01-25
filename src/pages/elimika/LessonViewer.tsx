import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LessonViewer = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { toast } = useToast();
  const [completed, setCompleted] = useState(false);

  const lesson = {
    id: lessonId,
    title: "Pedestrian Safety",
    courseId: 1,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    imageUrl: "",
    pdfUrl: "",
    content: `
      <h2>Understanding Pedestrian Safety</h2>
      <p>As a driver, ensuring pedestrian safety is one of your most important responsibilities. This lesson covers the essential rules and best practices for sharing the road with pedestrians.</p>
      
      <h3>Key Safety Rules</h3>
      <ul>
        <li><strong>Crosswalks:</strong> Always yield to pedestrians at marked and unmarked crosswalks</li>
        <li><strong>School Zones:</strong> Reduce speed and stay alert in school zones during school hours</li>
        <li><strong>Intersections:</strong> Look for pedestrians before making turns, even on green lights</li>
        <li><strong>Residential Areas:</strong> Watch for children playing and people crossing between parked cars</li>
      </ul>

      <h3>Best Practices</h3>
      <p>When approaching areas with high pedestrian traffic:</p>
      <ul>
        <li>Slow down and be prepared to stop</li>
        <li>Make eye contact with pedestrians to ensure they see you</li>
        <li>Never pass vehicles stopped at crosswalks</li>
        <li>Be extra cautious in poor weather or low visibility conditions</li>
        <li>Avoid distractions like mobile phones</li>
      </ul>

      <h3>Special Considerations</h3>
      <p>Some pedestrians require extra care and attention:</p>
      <ul>
        <li>Children are unpredictable and may dart into the street</li>
        <li>Elderly pedestrians may move more slowly</li>
        <li>Visually impaired pedestrians using white canes or guide dogs</li>
        <li>Pedestrians using mobility devices</li>
      </ul>

      <h3>Legal Requirements</h3>
      <p>Remember that failing to yield to pedestrians can result in:</p>
      <ul>
        <li>Traffic citations and fines</li>
        <li>Points on your driving record</li>
        <li>Increased insurance premiums</li>
        <li>Criminal charges in case of accidents</li>
      </ul>
    `,
    duration: "15 min",
    progress: 0,
    hasNext: true,
    hasPrevious: true
  };

  const handleMarkComplete = () => {
    setCompleted(true);
    toast({
      title: "Lesson Completed!",
      description: "Great job! You can now move to the next lesson.",
    });
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
              <BreadcrumbLink href={`/elimika/course/${lesson.courseId}`}>Course</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{lesson.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{lesson.title}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{lesson.duration}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {lesson.videoUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-lg border">
                  <iframe
                    src={lesson.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              )}

              {lesson.imageUrl && (
                <div className="w-full overflow-hidden rounded-lg border">
                  <img src={lesson.imageUrl} alt={lesson.title} className="w-full" />
                </div>
              )}

              {lesson.pdfUrl && (
                <div className="border rounded-lg p-4">
                  <a 
                    href={lesson.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF Resource
                  </a>
                </div>
              )}

              <div className="prose prose-slate max-w-none dark:prose-invert"
                   dangerouslySetInnerHTML={{ __html: lesson.content }}
              />

              {!completed ? (
                <Button className="w-full" onClick={handleMarkComplete}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Lesson Complete
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-4 bg-success/10 rounded-lg text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Lesson Completed!</span>
                </div>
              )}

              <div className="flex justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/elimika/lesson/${Number(lessonId) - 1}`)}
                  disabled={!lesson.hasPrevious}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Lesson
                </Button>
                <Button
                  onClick={() => navigate(`/elimika/lesson/${Number(lessonId) + 1}`)}
                  disabled={!lesson.hasNext || !completed}
                >
                  Next Lesson
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LessonViewer;
