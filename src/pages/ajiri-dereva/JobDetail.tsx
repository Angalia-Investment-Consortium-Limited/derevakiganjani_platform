import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, MapPin, DollarSign, CheckCircle2, Award, MessageCircle, UserPlus, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useJobApplicants } from '@/hooks/useJobs';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const JobDetail = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { job, applicants, isLoading, error } = useJobApplicants(jobId || null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const { toast } = useToast();

  const handleCloseJob = async () => {
    if (!jobId) return;
    try {
      setClosing(true);
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, { status: 'Closed' });
      toast({ title: 'Success', description: 'Job closed successfully.' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to close job.', variant: 'destructive' });
    } finally {
      setClosing(false);
    }
  };

  const handleShortlist = async (app: any, driverName: string) => {
    setUpdatingId(app.id);
    try {
      const appRef = doc(db, 'job_applications', app.id);
      await updateDoc(appRef, { status: 'Shortlisted' });

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
      toast({ title: 'Success', description: `${driverName} has been shortlisted.` });
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to shortlist.', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleContact = (driverId: string, driverName: string) => {
    navigate(`/employer/messages?driverId=${driverId}&driverName=${encodeURIComponent(driverName)}`);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error || !job) return <div className="min-h-screen flex items-center justify-center">Error loading job details.</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <Button variant="outline" onClick={() => navigate('/employer/jobs')} className="mb-6">
          ← Back to My Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{job.job_title}</CardTitle>
                    <CardDescription className="mt-2">Posted {job.posted_date && typeof job.posted_date === 'object' && 'seconds' in job.posted_date ? new Date((job.posted_date as any).seconds * 1000).toLocaleDateString() : typeof job.posted_date === 'string' ? job.posted_date : 'N/A'}</CardDescription>
                  </div>
                  <Badge className={job.status === 'Open' ? 'bg-success/10 text-success' : 'bg-secondary text-secondary-foreground'}>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{job.vehicleType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">License</p>
                      <p className="font-medium">Category {Array.isArray(job.required_license_category) ? job.required_license_category.join(', ') : (job.required_license_category || 'Any')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{job.region}{job.district ? `, ${job.district}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="font-medium">{job.salary && typeof job.salary === 'object' && job.salary.from && job.salary.to ? `TZS ${job.salary.from.toLocaleString()} - ${job.salary.to.toLocaleString()}` : typeof job.salary === 'string' ? job.salary : 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Job Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{job.job_description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{Array.isArray(job.required_skills) ? job.required_skills.join('\n') : job.required_skills}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium">{job.job_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Positions</p>
                    <p className="font-medium">{job.positions || 1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{job.startDate && typeof job.startDate === 'object' && 'seconds' in job.startDate ? new Date((job.startDate as any).seconds * 1000).toLocaleDateString() : typeof job.startDate === 'string' ? job.startDate : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applications</p>
                    <p className="font-medium">{job.applicationCount || applicants.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Drivers who have applied for this position</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicants.slice(0, 5).map((app: any) => {
                    const driver = app.driver || {};
                    const driverName = driver.fullName || driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unknown Driver';
                    const isShortlisted = app.status === 'Shortlisted';
                    return (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={driver.user_image || driver.photo_url || ''} />
                          <AvatarFallback>{driverName.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{driverName}</h4>
                            {driver.verified && <CheckCircle2 className="h-4 w-4 text-success" />}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Category {driver.license_category?.join(', ') || driver.licenseNumber || 'N/A'} • {driver.region || driver.location || 'N/A'}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={isShortlisted ? 'default' : 'outline'} className={isShortlisted ? 'bg-success/10 text-success text-xs' : 'text-xs'}>{app.status}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/employer/drivers/${driver.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={isShortlisted ? "secondary" : "outline"}
                          disabled={isShortlisted || updatingId === app.id}
                          onClick={() => handleShortlist(app, driverName)}
                        >
                          {updatingId === app.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
                          {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                        </Button>
                        <Button size="sm" onClick={() => handleContact(app.driverId, driverName)}>
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  )})}
                  {applicants.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No applications received yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/employer/shortlist')}>
                  View Shortlist
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate(`/ajiri-dereva/post-job?edit=${jobId}`)}>
                  Edit Job Post
                </Button>
                <Button 
                  className="w-full" 
                  variant={job.status === 'Closed' ? 'secondary' : 'outline'} 
                  disabled={closing || job.status === 'Closed'} 
                  onClick={handleCloseJob}
                >
                  {closing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {job.status === 'Closed' ? 'Closed' : 'Close Job'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Applications</span>
                  <span className="font-semibold">{applicants.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Shortlisted</span>
                  <span className="font-semibold">{applicants.filter((a: any) => a.status === 'Shortlisted').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Interviewed</span>
                  <span className="font-semibold">{applicants.filter((a: any) => a.status === 'Interview').length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetail;
