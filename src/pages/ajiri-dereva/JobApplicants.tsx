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
import { useJobApplicants } from '@/hooks/useJobs';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const JobApplicants = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { toast } = useToast();
  const { applicants, job, isLoading, error, refresh } = useJobApplicants(jobId || null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const jobTitle = job?.job_title || "Loading...";

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

  const handleAction = async (app: any, actionStatus: string, applicantName: string) => {
    setUpdatingId(app.id);
    try {
      const appRef = doc(db, 'job_applications', app.id);
      await updateDoc(appRef, { status: actionStatus });

      if (actionStatus === 'Shortlisted') {
        // Check if already shortlisted to prevent duplicates
        const shortlistQ = query(
          collection(db, "shortlists"),
          where("employerId", "==", job?.employerId || ''),
          where("driverId", "==", app.driverId),
          where("jobId", "==", app.jobId)
        );
        const shortlistSnap = await getDocs(shortlistQ);
        if (shortlistSnap.empty) {
          await addDoc(collection(db, 'shortlists'), {
            employerId: job?.employerId || '',
            driverId: app.driverId,
            jobId: app.jobId,
            status: 'Pending',
            createdAt: serverTimestamp()
          });
        }
      }

      toast({
        title: `${actionStatus} Successful`,
        description: `${applicantName} has been marked as ${actionStatus}.`,
      });
      refresh();
    } catch (e: any) {
      toast({ title: 'Error', description: 'Failed to update application status.', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/employer/jobs')}
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : applicants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    applicants.map((app: any) => {
                      const driver = app.driver || {};
                      const driverName = driver.fullName || driver.full_name || (driver.first_name ? `${driver.first_name} ${driver.last_name}` : 'Unknown Driver');
                      return (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{driverName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Cat {driver.license_category?.join(', ')}</Badge>
                        </TableCell>
                        <TableCell>{driver.years_of_experience ? `${driver.years_of_experience} yrs` : 'N/A'}</TableCell>
                        <TableCell>{driver.region}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {driver.verification_status === 'verified' && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {app.application_date ? new Date(app.application_date.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {updatingId === app.id ? (
                              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                            ) : (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigate(`/employer/drivers/${app.driverId}`)}
                                  title="View Profile"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleAction(app, 'Shortlisted', driverName)}
                                  title="Add to Shortlist"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigate(`/employer/interviews?driverId=${app.driverId}&jobId=${app.jobId}`)}
                                  title="Schedule Interview"
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => navigate(`/employer/messages?driverId=${app.driverId}&driverName=${encodeURIComponent(driverName)}`)}
                                  title="Send Message"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleAction(app, 'Rejected', driverName)}
                                  title="Reject"
                                >
                                  <XCircle className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )})
                  )}
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
