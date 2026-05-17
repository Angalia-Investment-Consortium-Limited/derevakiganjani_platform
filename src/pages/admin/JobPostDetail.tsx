import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, XCircle, MapPin, Briefcase, Car, Calendar, DollarSign, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';

const JobPostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data - replace with API call
  const jobPost = {
    id: 1,
    title: 'Truck Driver',
    employer: 'ABC Transport',
    status: 'Published',
    jobType: 'Full-time',
    positions: 3,
    vehicleType: 'Truck',
    licenseCategory: 'D',
    minExperience: 3,
    region: 'Dar es Salaam',
    district: 'Kinondoni',
    salaryRange: '600,000 - 900,000 TZS',
    skills: 'Defensive driving, Route planning, Vehicle maintenance knowledge',
    skills_required_html: '<p>Defensive driving</p><ul><li>Route planning</li><li>Vehicle maintenance knowledge</li></ul>',
    required_qualification_and_experience: ['Secondary Education (Form IV)', 'Valid driver’s license with clean records'],
    required_training_and_certification: ['Defensive Driving Certificate', 'LATRA certification'],
    how_to_apply: 'Attach CV to apply',
    deadline: '2025-02-15',
    startDate: '2025-03-01',
    postedOn: '2025-01-20',
    applications: 12
  };

  const suggestedDrivers = [
    { id: 1, name: 'John Mwaniki', license: 'D', experience: 5, location: 'Dar es Salaam', rating: 4.8 },
    { id: 2, name: 'Sarah Kilonzo', license: 'D', experience: 4, location: 'Dar es Salaam', rating: 4.9 },
    { id: 3, name: 'Ahmed Hassan', license: 'D', experience: 6, location: 'Kinondoni', rating: 4.7 },
  ];

  const applications = [
    { id: 1, driver: 'John Mwaniki', status: 'Under Review', lastUpdate: '2025-01-22' },
    { id: 2, driver: 'Sarah Kilonzo', status: 'Shortlisted', lastUpdate: '2025-01-21' },
    { id: 3, driver: 'Ahmed Hassan', status: 'Pending', lastUpdate: '2025-01-23' },
  ];

  const handleCloseJob = () => {
    toast({
      title: "Job Post Closed",
      description: "This job posting has been closed successfully",
    });
    navigate('/admin/job-posts');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/job-posts')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Posts
        </Button>

        <div className="space-y-6">
          {/* Header with Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{jobPost.title}</h1>
                <Badge variant={
                  jobPost.status === 'Published' ? 'default' :
                  jobPost.status === 'Draft' ? 'secondary' :
                  'outline'
                }>
                  {jobPost.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{jobPost.employer}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate(`/admin/jobs/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Close Post
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Close this job post?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will close the job posting and stop accepting new applications. You can reopen it later if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCloseJob}>Close Job</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium">{jobPost.jobType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Positions</p>
                    <p className="font-medium">{jobPost.positions}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Type</p>
                    <p className="font-medium">{jobPost.vehicleType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">{jobPost.licenseCategory}</Badge>
                  <div>
                    <p className="text-sm text-muted-foreground">License Category</p>
                    <p className="font-medium">Class {jobPost.licenseCategory}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{jobPost.district}, {jobPost.region}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salary Range</p>
                    <p className="font-medium">{jobPost.salaryRange}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Application Deadline</p>
                    <p className="font-medium">{jobPost.deadline}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{jobPost.startDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Applications Received</p>
                    <p className="font-medium">{jobPost.applications}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{jobPost.description}</p>
                </div>

                {jobPost.required_qualification_and_experience && (
                  <div>
                    <h3 className="font-semibold mb-2">Required Qualification and Experience</h3>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {jobPost.required_qualification_and_experience.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {jobPost.required_training_and_certification && (
                  <div>
                    <h3 className="font-semibold mb-2">Required Training and Certification</h3>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {jobPost.required_training_and_certification.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Required Skills</h3>
                  {jobPost.skills_required_html ? (
                    <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: jobPost.skills_required_html }} />
                  ) : (
                    <p className="text-muted-foreground">{jobPost.skills}</p>
                  )}
                </div>

                {jobPost.how_to_apply && (
                  <div>
                    <h3 className="font-semibold mb-2">How to Apply</h3>
                    <p className="text-muted-foreground">{jobPost.how_to_apply}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Experience Required</h3>
                  <p className="text-muted-foreground">{jobPost.minExperience} years minimum</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Suggested Drivers</CardTitle>
              <p className="text-sm text-muted-foreground">Drivers matched by license category and location</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedDrivers.map((driver) => (
                  <Card key={driver.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">{driver.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">License: Class {driver.license}</p>
                        <p className="text-muted-foreground">{driver.experience} years experience</p>
                        <p className="text-muted-foreground">{driver.location}</p>
                        <p className="text-muted-foreground">Rating: ⭐ {driver.rating}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={() => navigate(`/driver/${driver.id}`)}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.driver}</TableCell>
                      <TableCell>
                        <Badge variant={
                          app.status === 'Shortlisted' ? 'default' :
                          app.status === 'Under Review' ? 'secondary' :
                          'outline'
                        }>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{app.lastUpdate}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobPostDetail;
