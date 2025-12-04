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
import { BookOpen, Clock, GraduationCap, Search } from "lucide-react";

const CourseCatalog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const courses = [
    {
      id: 1,
      title: "Road Safety Fundamentals",
      titleSw: "Misingi ya Usalama Barabarani",
      description: "Master essential road safety rules and regulations",
      descriptionSw: "Jifunze sheria muhimu za usalama barabarani",
      lessons: 12,
      duration: "4 hours",
      level: "Basic",
      progress: 0,
      image: "🚦"
    },
    {
      id: 2,
      title: "Traffic Signs & Signals",
      titleSw: "Alama za Trafiki",
      description: "Learn to recognize and understand all traffic signs",
      descriptionSw: "Jifunze kutambua na kuelewa alama zote za trafiki",
      lessons: 15,
      duration: "5 hours",
      level: "Basic",
      progress: 0,
      image: "🚸"
    },
    {
      id: 3,
      title: "Defensive Driving",
      titleSw: "Udereva wa Kujilinda",
      description: "Advanced techniques for safe driving",
      descriptionSw: "Mbinu za juu za udereva salama",
      lessons: 18,
      duration: "6 hours",
      level: "Intermediate",
      progress: 0,
      image: "🛡️"
    },
    {
      id: 4,
      title: "Vehicle Maintenance Basics",
      titleSw: "Misingi ya Matengenezo ya Gari",
      description: "Essential vehicle care and maintenance",
      descriptionSw: "Matengenezo muhimu ya gari",
      lessons: 10,
      duration: "3 hours",
      level: "Basic",
      progress: 0,
      image: "🔧"
    },
    {
      id: 5,
      title: "Emergency Response",
      titleSw: "Majibu ya Dharura",
      description: "How to handle road emergencies",
      descriptionSw: "Jinsi ya kushughulikia dharura barabarani",
      lessons: 8,
      duration: "3 hours",
      level: "Intermediate",
      progress: 0,
      image: "🚨"
    },
    {
      id: 6,
      title: "Commercial Driving",
      titleSw: "Udereva wa Biashara",
      description: "Professional driving for commercial vehicles",
      descriptionSw: "Udereva wa kitaaluma wa magari ya biashara",
      lessons: 20,
      duration: "8 hours",
      level: "Advanced",
      progress: 0,
      image: "🚛"
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.titleSw.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

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
          <Select value={levelFilter} onValueChange={setLevelFilter}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-5xl mb-4">{course.image}</div>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <Badge variant={course.level === "Basic" ? "secondary" : course.level === "Intermediate" ? "default" : "destructive"}>
                      {course.level}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/elimika/course/${course.id}`)}
                >
                  Start Course
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseCatalog;
