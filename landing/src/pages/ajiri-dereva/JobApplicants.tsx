import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, UserCheck, Calendar, XCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const JobApplicants = () => {
  const navigate = useNavigate();
  const { jobId: _jobId } = useParams();
  const { toast } = useToast();

  const jobTitle = "Experienced Truck Driver"; // TODO: Fetch from API

  const applicants = [
    { 
      id: 1, 
      name: 'John Mwamba', 
      category: 'D', 
      experience: '5 yrs', 
      region: 'Dar es Salaam',
      status: 'Submitted', 
      lastUpdate: '2 hours ago',
      jiTestiPassed: true,
      elimikaCert: false
    },
    { 
      id: 2, 
      name: 'Mary Kamara', 
      category: 'D', 
      experience: '3 yrs', 
      region: 'Arusha',
      status: 'Viewed', 
      lastUpdate: '1 day ago',
      jiTestiPassed: true,
      elimikaCert: true
    },
    { 
      id: 3, 
      name: 'David Luka', 
      category: 'D', 
      experience: '7 yrs', 
      region: 'Mwanza',
      status: 'Shortlisted', 
      lastUpdate: '2 days ago',
      jiTestiPassed: true,
      elimikaCert: true
    },
    { 
      id: 4, 
      name: 'Sarah Juma', 
      category: 'D', 
      experience: '4 yrs', 
      region: 'Dar es Salaam',
      status: 'Interview', 
      lastUpdate: '3 days ago',
      jiTestiPassed: true,
      elimikaCert: false
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-500/10 text-blue-500';
      case 'Viewed':
        return 'bg-muted text-muted-foreground';
      case 'Shortlisted':
        return 'bg-success/10 text-success';
      case 'Interview':
        return 'bg-warning/10 text-warning';
      case 'Hired':
        return 'bg-green-600/10 text-green-600';
      case 'Rejected':
        return 'bg-destructive/10 text-destructive';
      default:
        return '';
    }
  };

  const handleAction = (_applicantId: number, action: string, applicantName: string) => {
    toast({
      title: `${action} Successful`,
      description: `${applicantName} has been ${action.toLowerCase()}.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/ajiri-dereva/my-jobs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Jobs
          </Button>
          <h1 className="text-3xl font-bold">{jobTitle}</h1>
          <p className="text-muted-foreground">Applicants • Waombaji</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Job Applicants ({applicants.length})</CardTitle>
                <CardDescription>Review and manage applicants for this position</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search applicants..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="A">Category A</SelectItem>
                  <SelectItem value="B">Category B</SelectItem>
                  <SelectItem value="C">Category C</SelectItem>
                  <SelectItem value="D">Category D</SelectItem>
                  <SelectItem value="E">Category E</SelectItem>
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
                    <TableHead>Driver Name</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Certifications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">{applicant.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Cat {applicant.category}</Badge>
                      </TableCell>
                      <TableCell>{applicant.experience}</TableCell>
                      <TableCell>{applicant.region}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {applicant.jiTestiPassed && (
                            <Badge variant="secondary" className="text-xs">JiTesti</Badge>
                          )}
                          {applicant.elimikaCert && (
                            <Badge variant="secondary" className="text-xs">Elimika</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(applicant.status)}>{applicant.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{applicant.lastUpdate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/employer/drivers/${applicant.id}`)}
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleAction(applicant.id, 'Shortlisted', applicant.name)}
                            title="Add to Shortlist"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/employer/interviews?applicant=${applicant.id}`)}
                            title="Schedule Interview"
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/employer/messages?driver=${applicant.id}`)}
                            title="Send Message"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleAction(applicant.id, 'Not Selected', applicant.name)}
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
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

export default JobApplicants;
