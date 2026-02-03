import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, RotateCcw, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const { score = 18, total = 25 } = location.state || {};
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 70;

  const topicBreakdown = [
    { topic: 'Road Signs', score: 8, total: 10 },
    { topic: 'Traffic Rules', score: 6, total: 8 },
    { topic: 'Vehicle Safety', score: 4, total: 7 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/jitesti">JiTesti</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Result</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Result Card */}
          <Card className={`border-2 ${passed ? 'border-success' : 'border-destructive'}`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`h-24 w-24 rounded-full ${passed ? 'bg-success/10' : 'bg-destructive/10'} flex items-center justify-center`}>
                  <Award className={`h-12 w-12 ${passed ? 'text-success' : 'text-destructive'}`} />
                </div>
              </div>
              <div className={`inline-block px-6 py-2 rounded-full text-2xl font-bold mb-4 ${
                passed ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
              }`}>
                {passed ? t('passed') : t('failed')}
              </div>
              <CardTitle className="text-4xl font-bold">{score}/{total}</CardTitle>
              <CardDescription className="text-lg">{percentage}% Score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {passed && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-center">
                  <p className="font-medium text-success">Congratulations! You have passed the driver test.</p>
                  <p className="text-sm text-muted-foreground mt-1">Your certificate is ready for download</p>
                </div>
              )}

              {!passed && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                  <p className="font-medium text-destructive">You need 70% or higher to pass.</p>
                  <p className="text-sm text-muted-foreground mt-1">Don't worry, you can retake the test</p>
                </div>
              )}

              {/* Topic Breakdown */}
              <div>
                <h3 className="font-semibold mb-4">Performance by Topic</h3>
                <div className="space-y-3">
                  {topicBreakdown.map((topic) => {
                    const topicPercentage = Math.round((topic.score / topic.total) * 100);
                    return (
                      <div key={topic.topic} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{topic.topic}</span>
                          <span className="font-medium">{topic.score}/{topic.total}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${topicPercentage >= 70 ? 'bg-success' : 'bg-warning'}`}
                            style={{ width: `${topicPercentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                {passed && (
                  <Button variant="default" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {t('downloadCertificate')}
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate('/test/category')} className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('retakeTest')}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/learning')} className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Go to {t('elimika')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reference Number */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Test Reference Number</p>
                  <p className="font-mono font-medium">DRV-2025-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                </div>
                <Button variant="ghost" size="sm">Copy</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TestResult;
