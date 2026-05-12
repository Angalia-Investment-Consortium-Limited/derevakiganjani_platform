import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useAuth } from '@/hooks/useAuth';

// Type Definition for the component
type JitestiCategory = {
  id: string;
  title: string;
  description: string;
  price: number;
  durationInMinutes: number;
  passMark: number;
};

type ActiveTestAttempt = {
  id: string;
  categoryTitle: string;
  status: 'not_started' | 'started';
  startTime?: { toDate: () => Date };
  durationInMinutes?: number;
  accumulatedSeconds?: number;
};

// Fetch function for active categories, with correct Firestore field mapping
const fetchActiveCategories = async (): Promise<JitestiCategory[]> => {
  console.log("Fetching active Jitesti categories from Firestore...");
  const categoriesCollection = collection(db, 'jitesti-categories');
  const q = query(categoriesCollection, where("status", "==", "active"));
  const snapshot = await getDocs(q);
  
  const categories = snapshot.docs.map(doc => {
      const data = doc.data();
      const category = {
        id: doc.id,
        title: data.name_en || 'No Title',
        description: data.description_en || '',
        price: data.price || 0,
        durationInMinutes: data.duration_minutes || 0,
        passMark: data.pass_mark || 0, // Corrected from passMark to pass_mark
      };
      console.log("Fetched category:", category);
      return category;
  });
  return categories;
};

const fetchActiveUserTests = async (userId: string): Promise<ActiveTestAttempt[]> => {
    const attemptsCollection = collection(db, 'test_attempts');
    const q = query(attemptsCollection, where("userId", "==", userId), where("status", "in", ["not_started", "started"]));
    const snapshot = await getDocs(q);
    
    return snapshot.docs
        .map(doc => ({
            id: doc.id,
            categoryTitle: doc.data().categoryTitle,
            status: doc.data().status,
            startTime: doc.data().startTime,
            durationInMinutes: doc.data().durationInMinutes,
            accumulatedSeconds: doc.data().accumulatedSeconds
        }))
        // Filter out essentially expired tests so the list doesn't get long
        .filter(test => {
            if (test.status === 'not_started') return true;
            if (!test.startTime) return true;
            
            const duration = test.durationInMinutes || 120; // fallback cleanly
            const accumulatedSecs = test.accumulatedSeconds || 0;
            const endTime = test.startTime.toDate().getTime() + (duration * 60 * 1000) - (accumulatedSecs * 1000);
            
            return Date.now() < endTime;
        });
};

const TestCategories: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: activeTests = [] } = useQuery<ActiveTestAttempt[]>({
    queryKey: ['active-tests', user?.uid],
    queryFn: () => fetchActiveUserTests(user!.uid),
    enabled: !!user
  });

  const { data: categories = [], isLoading, error } = useQuery<JitestiCategory[]>({ 
    queryKey: ['active-jitesti-categories'], 
    queryFn: fetchActiveCategories 
  });

  const handleStartTest = (category: JitestiCategory) => {
    // Pass the entire category object in the navigation state
    console.log("Navigating to payment page with category:", category);
    navigate(`/jitesti/payment/${category.id}`, { state: { category } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
        <Header/>
        <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Jitesti-Test Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
    <div className="flex-grow container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to JiTesti Online</h1>
        <p className="text-lg text-muted-foreground mt-2">Select a category below to test your knowledge.</p>
      </div>

      {activeTests.length > 0 && (
          <div className="mb-10 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  You have tests waiting!
              </h2>
              <div className="space-y-3">
                  {activeTests.map(test => (
                      <div key={test.id} className="flex items-center justify-between bg-white p-4 rounded shadow-sm border border-blue-100">
                          <div>
                              <p className="font-semibold text-lg">{test.categoryTitle}</p>
                              <p className="text-sm text-muted-foreground">
                                  {test.status === 'started' ? 'In Progress - Resume now to beat the timer!' : 'Purchased - Ready to start'}
                              </p>
                          </div>
                          <Button onClick={() => navigate(`/jitesti/test/${test.id}`)} className="bg-blue-600 hover:bg-blue-700">
                              {test.status === 'started' ? 'Resume Test' : 'Start Test'}
                          </Button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {isLoading && <p className="text-center py-12">Loading available tests...</p>}
      {error && <p className="text-center text-red-500 py-12">Error loading tests. Please try again later.</p>}

      {!isLoading && !error && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold">TZS {category.price.toLocaleString()}</p>
                    <Badge variant="secondary">{category.durationInMinutes} minutes</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleStartTest(category)} // Pass the whole category object
                >
                  {'Pay and Start Test'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

       {!isLoading && categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No test categories are available at the moment. Please check back later.</p>
          </div>
      )}
    </div>
    </main>
    <Footer/>
    </div>
  );
};

export default TestCategories;