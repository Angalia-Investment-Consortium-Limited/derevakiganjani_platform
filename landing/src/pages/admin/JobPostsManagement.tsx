import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, XCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JobPostsManagement = () => {
  const navigate = useNavigate();
  
  const jobPosts = [
    { id: 1, employer: 'ABC Transport', title: 'Truck Driver', vehicleType: 'Truck', licenseCategory: 'D', jobType: 'Full-time', region: 'Dar es Salaam', district: 'Kinondoni', status: 'Published', applications: 12, postedOn: '2025-01-20' },
    { id: 2, employer: 'TechCorp', title: 'Car Driver', vehicleType: 'Car', licenseCategory: 'B', jobType: 'Contract', region: 'Arusha', district: 'Arusha City', status: 'Published', applications: 8, postedOn: '2025-01-18' },
    { id: 3, employer: 'Safari Adventures', title: 'Bus Driver', vehicleType: 'Bus', licenseCategory: 'D', jobType: 'Full-time', region: 'Mwanza', district: 'Ilemela', status: 'Draft', applications: 0, postedOn: '2025-01-22' },
    { id: 4, employer: 'Logistics Ltd', title: 'Motorcycle Courier', vehicleType: 'Motorcycle', licenseCategory: 'A', jobType: 'Temporary', region: 'Dodoma', district: 'Dodoma Urban', status: 'Closed', applications: 5, postedOn: '2025-01-15' },
  ];

  return (
    <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Job Posts Management</h1>
            <p className="text-muted-foreground">Manage employer job postings and approvals</p>
          </div>
          <Button onClick={() => navigate('/admin/jobs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Job Post
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Job Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {jobPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No job posts yet.</p>
                <Button onClick={() => navigate('/admin/jobs/new')}>
                  Create your first Job Post
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Employer</TableHead>
                    <TableHead>Vehicle Type</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Job Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Posted On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPosts.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.employer}</TableCell>
                      <TableCell>{job.vehicleType}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.licenseCategory}</Badge>
                      </TableCell>
                      <TableCell>{job.jobType}</TableCell>
                      <TableCell>{job.district}, {job.region}</TableCell>
                      <TableCell>
                        <Badge variant={
                          job.status === 'Published' ? 'default' :
                          job.status === 'Draft' ? 'secondary' :
                          'outline'
                        }>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{job.applications}</TableCell>
                      <TableCell>{job.postedOn}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/admin/jobs/${job.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
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
            )}
          </CardContent>
        </Card>
    </AdminLayout>
  );
};

export default JobPostsManagement;
