import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyJobPosts = () => {
  const navigate = useNavigate();

  const jobPosts = [
    {
      id: 1,
      title: 'Experienced Truck Driver',
      vehicleType: 'Truck',
      licenseCategory: 'D',
      status: 'Published',
      applications: 8,
      postedOn: '2025-01-20',
    },
    {
      id: 2,
      title: 'Company Car Driver',
      vehicleType: 'Car',
      licenseCategory: 'B',
      status: 'Published',
      applications: 15,
      postedOn: '2025-01-18',
    },
    {
      id: 3,
      title: 'Bus Driver - Tourist Routes',
      vehicleType: 'Bus',
      licenseCategory: 'C',
      status: 'Draft',
      applications: 0,
      postedOn: '2025-01-22',
    },
    {
      id: 4,
      title: 'Delivery Motorcycle Rider',
      vehicleType: 'Motorcycle',
      licenseCategory: 'A',
      status: 'Closed',
      applications: 23,
      postedOn: '2025-01-10',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-success/10 text-success';
      case 'Draft':
        return 'bg-warning/10 text-warning';
      case 'Closed':
        return 'bg-muted text-muted-foreground';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Job Posts</h1>
            <p className="text-muted-foreground">Orodha ya Kazi Zangu</p>
          </div>
          <Button onClick={() => navigate('/ajiri-dereva/post-job')}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Vacancies</CardTitle>
            <CardDescription>Manage your posted job vacancies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search jobs..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="dar">Dar es Salaam</SelectItem>
                  <SelectItem value="arusha">Arusha</SelectItem>
                  <SelectItem value="mwanza">Mwanza</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Applications</TableHead>
                    <TableHead>Posted On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPosts.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.vehicleType}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Category {job.licenseCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{job.applications}</span>
                      </TableCell>
                      <TableCell>{job.postedOn}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/ajiri-dereva/job/${job.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/ajiri-dereva/post-job?edit=${job.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
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

export default MyJobPosts;
