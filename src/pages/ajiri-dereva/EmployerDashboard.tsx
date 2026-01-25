import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, UserCheck, Calendar, TrendingUp, Bell, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployerDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Job Posts', value: '12', icon: Briefcase, color: 'text-primary' },
    { title: 'Total Applicants', value: '156', icon: Users, color: 'text-blue-500' },
    { title: 'Shortlisted', value: '28', icon: UserCheck, color: 'text-success' },
    { title: 'Interviews', value: '8', icon: Calendar, color: 'text-warning' },
    { title: 'Hired', value: '5', icon: TrendingUp, color: 'text-green-600' },
    { title: 'Notifications', value: '3', icon: Bell, color: 'text-destructive' },
  ];

  const recentApplicants = [
    { id: 1, name: 'John Mwamba', job: 'Truck Driver', category: 'D', experience: '5 yrs', applied: '2 hours ago', status: 'New' },
    { id: 2, name: 'Mary Kamara', job: 'Company Car Driver', category: 'B', experience: '3 yrs', applied: '5 hours ago', status: 'Viewed' },
    { id: 3, name: 'David Luka', job: 'Bus Driver', category: 'C', experience: '7 yrs', applied: '1 day ago', status: 'Shortlisted' },
  ];

  const recentJobPosts = [
    { id: 1, title: 'Experienced Truck Driver', applications: 8, status: 'Published', postedOn: '2025-01-20' },
    { id: 2, title: 'Company Car Driver', applications: 15, status: 'Published', postedOn: '2025-01-18' },
    { id: 3, title: 'Bus Driver - Tourist Routes', applications: 0, status: 'Draft', postedOn: '2025-01-22' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/10 text-blue-500';
      case 'Viewed':
        return 'bg-muted text-muted-foreground';
      case 'Shortlisted':
        return 'bg-success/10 text-success';
      case 'Published':
        return 'bg-success/10 text-success';
      case 'Draft':
        return 'bg-warning/10 text-warning';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-muted-foreground">Dashibodi ya Mwajiri</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Applicants</CardTitle>
                  <CardDescription>Latest applications to your job posts</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/employer/jobs')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentApplicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="font-medium">{applicant.name}</TableCell>
                        <TableCell>{applicant.job}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Cat {applicant.category}</Badge>
                        </TableCell>
                        <TableCell>{applicant.experience}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{applicant.applied}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(applicant.status)}>{applicant.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/employer/drivers/${applicant.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate('/ajiri-dereva/post-job')}>
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/employer/jobs')}>
                View All Applicants
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/employer/shortlist')}>
                View Shortlist
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/employer/interviews')}>
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/employer/messages')}>
                Messages
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Job Posts</CardTitle>
                <CardDescription>Your latest job vacancies</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/ajiri-dereva/my-jobs')}>
                Manage Jobs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead className="text-center">Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobPosts.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{job.applications}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </TableCell>
                      <TableCell>{job.postedOn}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)}
                        >
                          View Applicants
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default EmployerDashboard;
