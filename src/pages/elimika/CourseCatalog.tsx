import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, GraduationCap, Search, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useElimika } from "@/hooks/useElimika";
import useDebounce from "@/hooks/useDebounce";
import type { CourseFilters } from "@/types/elimika";

const CourseCatalog = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { useCourses } = useElimika();
  
  const [searchQuery, setSearchQuery] = useDebounce("");
  const [levelFilter, setLevelFilter] = useState<"all" | "Basic" | "Intermediate" | "Advanced">("all");

  // Build filters
  const filters: CourseFilters = {};
  if (levelFilter !== "all") {
    filters.level = levelFilter;
  }
  if (searchQuery) {
    filters.search = searchQuery;
  }

  // Fetch courses with filters
  const { data: courses, isLoading, error } = useCourses(filters);

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
              <BreadcrumbPage>Elimika</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">ELIMIKA</h1>
          <p className="text-muted-foreground">Driver Learning & Education Portal</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as "all" | "Basic" | "Intermediate" | "Advanced")}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Basic">Basic</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-16 w-16 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load courses. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && courses && courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              {searchQuery || levelFilter !== "all" 
                ? "Try adjusting your filters" 
                : "No courses are available at the moment"}
            </p>
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && !error && courses && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-5xl mb-4">
                    {course.thumbnail_emoji || "📚"}
                  </div>
                  <CardTitle>
                    {language === 'en' ? course.course_name_en : course.course_name_sw}
                  </CardTitle>
                  <CardDescription>
                    {language === 'en' 
                      ? (course.description_en || course.course_name_en)
                      : (course.description_sw || course.course_name_sw)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.total_lessons || 0} lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_hours || 0} hours</span>
                    </div>
                    {course.level && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        <Badge 
                          variant={
                            course.level === "Basic" 
                              ? "secondary" 
                              : course.level === "Intermediate" 
                              ? "default" 
                              : "destructive"
                          }
                        >
                          {course.level}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/elimika/course/${course.name}`)}
                  >
                    {language === 'en' ? 'Start Course' : 'Anza Kozi'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CourseCatalog;
