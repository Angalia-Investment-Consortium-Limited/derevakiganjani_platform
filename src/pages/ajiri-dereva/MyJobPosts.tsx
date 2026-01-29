import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmployerJobs } from '@/hooks/useEmployerJobs';
import { useState } from 'react';
import { useRegions } from '@/hooks/useLicense';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const MyJobPosts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({ searchTerm: '', status: '', vehicleType: '', region: '' });
  const { jobs, loading } = useEmployerJobs(filters);
  const { regions } = useRegions();
  const [closingJobId, setClosingJobId] = useState<string | null>(null);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleCloseJob = async (jobId: string) => {
    setClosingJobId(jobId);
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, { status: 'Closed' });
      toast({ title: "Success", description: "Job post has been closed." });
      // Refetch jobs by updating a filter
      setFilters(prev => ({...prev}));
    } catch (error) {
      toast({ title: "Error", description: "Failed to close job post.", variant: "destructive" });
    } finally {
      setClosingJobId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-success/10 text-success';
      case 'Draft': return 'bg-warning/10 text-warning';
      case 'Closed': return 'bg-muted text-muted-foreground';
      default: return '';
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
                <Input placeholder="Search jobs..." className="pl-10" onChange={(e) => handleFilterChange('searchTerm', e.target.value)} />
              </div>
              <Select onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleFilterChange('vehicleType', value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Vehicles</SelectItem>
                  <SelectItem value="Car">Car</SelectItem>
                  <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Truck">Truck</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleFilterChange('region', value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
                  ))}
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto my-16" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.vehicleType}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Category {job.licenseRequired}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">{job.applicationCount || 0}</span>
                        </TableCell>
                        <TableCell>{new Date(job.postedOn.seconds * 1000).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)}
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
                            <Button size="sm" variant="ghost" onClick={() => handleCloseJob(job.id)} disabled={closingJobId === job.id}>
                              {closingJobId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )))
                  }
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
