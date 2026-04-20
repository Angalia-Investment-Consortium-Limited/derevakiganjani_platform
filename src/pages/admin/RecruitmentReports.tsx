import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, Users, Calendar, TrendingUp, Download, 
  FileText, BarChart3, PieChart, Loader2 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const RecruitmentReports = () => {
  const { translations } = useLanguage();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const docRef = doc(db, 'system_metrics', 'recruitment_analytics');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          // Provide dummy fallback for testing before the chron job runs on production
          setData({
             funnel: {
                totalJobPosts: 0,
                totalApplications: 0,
                shortlistedCandidates: 0,
                interviewsConducted: 0,
                successfulHires: 0
             },
             topEmployers: [],
             categoryStats: [],
             lastAggregated: null
          });
        }
      } catch (err: any) {
        console.error("Failed to load recruitment analytics:", err);
        toast({ title: 'Error', description: 'Failed to load recruitment analytics.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  const exportReport = (format: string) => {
    console.log(`Exporting report in ${format} format`);
    toast({ title: 'Exporting', description: `Generating ${format.toUpperCase()} report...` });
  };

  if (isLoading) {
    return (
       <AdminLayout>
         <div className="flex justify-center items-center h-64">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       </AdminLayout>
    );
  }

  // Safe Fallbacks
  const funnel = data?.funnel || {};
  const topEmployers = data?.topEmployers || [];
  const categoryStats = data?.categoryStats || [];
  const lastUpdated = data?.lastAggregated?.seconds ? new Date(data.lastAggregated.seconds * 1000).toLocaleString() : 'Never';

  const stats = [
    { title: translations.totalJobsPosted, value: funnel.totalJobPosts || 0, change: '', icon: Briefcase, color: 'text-primary' },
    { title: translations.totalApplications, value: funnel.totalApplications || 0, change: '', icon: Users, color: 'text-blue-500' },
    { title: translations.interviewsScheduled, value: funnel.interviewsConducted || 0, change: '', icon: Calendar, color: 'text-warning' },
    { title: translations.successfulHires, value: funnel.successfulHires || 0, change: '', icon: TrendingUp, color: 'text-success' },
  ];

  const calcPercentage = (part: number, total: number) => {
    if (!total) return '0%';
    return Math.round((part / total) * 100) + '%';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{translations.recruitmentReports}</h1>
            <p className="text-muted-foreground">{translations.recruitmentReportsDescription}</p>
            <p className="text-xs text-muted-foreground mt-1">Last aggregated: {lastUpdated}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport('pdf')}><FileText className="h-4 w-4 mr-2" />{translations.exportPDF}</Button>
            <Button variant="outline" onClick={() => exportReport('csv')}><Download className="h-4 w-4 mr-2" />{translations.exportCSV}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />{translations.topEmployers}</CardTitle>
              <CardDescription>{translations.topEmployersDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{translations.employer}</TableHead>
                      <TableHead className="text-center">{translations.jobs}</TableHead>
                      <TableHead className="text-center">{translations.apps}</TableHead>
                      <TableHead className="text-center">{translations.hires}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topEmployers.length === 0 && (
                       <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-4">No data available yet.</TableCell>
                       </TableRow>
                    )}
                    {topEmployers.map((employer: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{employer.name}</TableCell>
                        <TableCell className="text-center">{employer.jobs}</TableCell>
                        <TableCell className="text-center">{employer.applications}</TableCell>
                        <TableCell className="text-center"><span className="font-semibold text-success">{employer.hires}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />{translations.licenseCategoryBreakdown}</CardTitle>
              <CardDescription>{translations.licenseCategoryBreakdownDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{translations.category}</TableHead>
                      <TableHead className="text-center">{translations.jobs}</TableHead>
                      <TableHead className="text-center">{translations.applications}</TableHead>
                      <TableHead className="text-right">{translations.avgSalary}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {categoryStats.length === 0 && (
                       <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-4">No data available yet.</TableCell>
                       </TableRow>
                    )}
                    {categoryStats.map((cat: any) => (
                      <TableRow key={cat.category}>
                        <TableCell><Badge variant="outline" className="font-semibold">{translations.category} {cat.category}</Badge></TableCell>
                        <TableCell className="text-center">{cat.jobs}</TableCell>
                        <TableCell className="text-center">{cat.applications || 0}</TableCell>
                        <TableCell className="text-right"> {cat.avgSalary > 0 ? cat.avgSalary.toLocaleString() + ' TZS' : 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{translations.recruitmentFunnel}</CardTitle>
            <CardDescription>{translations.recruitmentFunnelDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="font-medium">{translations.jobPosts}</span><span className="text-2xl font-bold">{funnel.totalJobPosts || 0}</span></div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: '100%' }} /></div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="font-medium">{translations.applicationsReceived}</span><span className="text-2xl font-bold">{funnel.totalApplications || 0}</span></div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: calcPercentage(funnel.totalApplications, Math.max(funnel.totalJobPosts * 5, funnel.totalApplications)) }} /></div>
                <p className="text-xs text-muted-foreground">{translations.applicationsPerJobAvg}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="font-medium">{translations.shortlistedCandidates}</span><span className="text-2xl font-bold">{funnel.shortlistedCandidates || 0}</span></div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-warning" style={{ width: calcPercentage(funnel.shortlistedCandidates, funnel.totalApplications) }} /></div>
                <p className="text-xs text-muted-foreground">{translations.shortlistedPercentage}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="font-medium">{translations.interviewsConducted}</span><span className="text-2xl font-bold">{funnel.interviewsConducted || 0}</span></div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-orange-500" style={{ width: calcPercentage(funnel.interviewsConducted, funnel.shortlistedCandidates) }} /></div>
                <p className="text-xs text-muted-foreground">{translations.interviewedPercentage}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="font-medium">{translations.successfulHires}</span><span className="text-2xl font-bold">{funnel.successfulHires || 0}</span></div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-success" style={{ width: calcPercentage(funnel.successfulHires, funnel.interviewsConducted) }} /></div>
                <p className="text-xs text-muted-foreground">{translations.hireConversionRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RecruitmentReports;
