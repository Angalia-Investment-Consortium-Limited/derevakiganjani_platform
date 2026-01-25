import { useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, XCircle, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFrappeGetDocList, useFrappeDocTypeEventListener } from 'frappe-react-sdk';
import type { JobPost } from '@/types/management';
import { Alert, AlertDescription } from '@/components/ui/alert';

const JobPostsManagement = () => {
  const navigate = useNavigate();
  
  // Fetch job posts from Frappe
  const { data: jobPosts, isLoading, error, mutate } = useFrappeGetDocList<JobPost>('Job Post', {
    fields: [
      'name',
      'title',
      'employer',
      'vehicle_type',
      'license_category',
      'job_type',
      'region',
      'district',
      'status',
      'total_applications',
      'posted_date'
    ],
    orderBy: {
      field: 'posted_date',
      order: 'desc'
    }
  });

  // Real-time updates
  useFrappeDocTypeEventListener('Job Post', () => {
    mutate();
  });

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

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
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading job posts...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load job posts. Please try again later.
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && !error && (!jobPosts || jobPosts.length === 0) && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No job posts yet.</p>
                <Button onClick={() => navigate('/admin/jobs/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first Job Post
                </Button>
              </div>
            )}

            {!isLoading && !error && jobPosts && jobPosts.length > 0 && (
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
                    <TableRow key={job.name}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.employer}</TableCell>
                      <TableCell>{job.vehicle_type || 'N/A'}</TableCell>
                      <TableCell>
                        {job.license_category && (
                          <Badge variant="outline">{job.license_category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{job.job_type}</TableCell>
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
                      <TableCell>{job.total_applications || 0}</TableCell>
                      <TableCell>{formatDate(job.posted_date)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/admin/jobs/${job.name}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/admin/jobs/${job.name}/edit`)}
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
