import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, Users, Calendar, TrendingUp, Download, 
  FileText, BarChart3, PieChart 
} from 'lucide-react';

const RecruitmentReports = () => {
  const stats = [
    { title: 'Total Jobs Posted', value: '156', change: '+12%', icon: Briefcase, color: 'text-primary' },
    { title: 'Total Applications', value: '2,340', change: '+18%', icon: Users, color: 'text-blue-500' },
    { title: 'Interviews Scheduled', value: '342', change: '+8%', icon: Calendar, color: 'text-warning' },
    { title: 'Successful Hires', value: '89', change: '+15%', icon: TrendingUp, color: 'text-success' },
  ];

  const topEmployers = [
    { name: 'ABC Transport Ltd', jobs: 28, applications: 456, hires: 12 },
    { name: 'TechCorp Tanzania', jobs: 22, applications: 389, hires: 10 },
    { name: 'Safari Adventures', jobs: 18, applications: 298, hires: 8 },
    { name: 'QuickDeliver', jobs: 15, applications: 267, hires: 7 },
    { name: 'City Logistics', jobs: 12, applications: 198, hires: 5 },
  ];

  const categoryStats = [
    { category: 'A', jobs: 45, applications: 678, avgSalary: '350,000' },
    { category: 'B', jobs: 52, applications: 823, avgSalary: '450,000' },
    { category: 'C', jobs: 28, applications: 412, avgSalary: '650,000' },
    { category: 'D', jobs: 22, applications: 356, avgSalary: '700,000' },
    { category: 'E', jobs: 9, applications: 71, avgSalary: '800,000' },
  ];

  const exportReport = (format: string) => {
    // TODO: Implement export functionality
    console.log(`Exporting report in ${format} format`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Recruitment Reports</h1>
            <p className="text-muted-foreground">Comprehensive analytics and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <Badge className="bg-success/10 text-success">{stat.change}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Employers
              </CardTitle>
              <CardDescription>Most active employers by job posts and hires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employer</TableHead>
                      <TableHead className="text-center">Jobs</TableHead>
                      <TableHead className="text-center">Apps</TableHead>
                      <TableHead className="text-center">Hires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topEmployers.map((employer, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{employer.name}</TableCell>
                        <TableCell className="text-center">{employer.jobs}</TableCell>
                        <TableCell className="text-center">{employer.applications}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-success">{employer.hires}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                License Category Breakdown
              </CardTitle>
              <CardDescription>Job distribution by license category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Jobs</TableHead>
                      <TableHead className="text-center">Applications</TableHead>
                      <TableHead className="text-right">Avg Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryStats.map((cat) => (
                      <TableRow key={cat.category}>
                        <TableCell>
                          <Badge variant="outline" className="font-semibold">
                            Category {cat.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{cat.jobs}</TableCell>
                        <TableCell className="text-center">{cat.applications}</TableCell>
                        <TableCell className="text-right">{cat.avgSalary} TZS</TableCell>
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
            <CardTitle>Recruitment Funnel</CardTitle>
            <CardDescription>Conversion rates at each stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Job Posts</span>
                  <span className="text-2xl font-bold">156</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Applications Received</span>
                  <span className="text-2xl font-bold">2,340</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '75%' }} />
                </div>
                <p className="text-xs text-muted-foreground">15 applications per job avg</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Shortlisted Candidates</span>
                  <span className="text-2xl font-bold">468</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-warning" style={{ width: '50%' }} />
                </div>
                <p className="text-xs text-muted-foreground">20% of applications shortlisted</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Interviews Conducted</span>
                  <span className="text-2xl font-bold">342</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: '35%' }} />
                </div>
                <p className="text-xs text-muted-foreground">73% of shortlisted interviewed</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Successful Hires</span>
                  <span className="text-2xl font-bold">89</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: '20%' }} />
                </div>
                <p className="text-xs text-muted-foreground">26% interview-to-hire conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RecruitmentReports;
