import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, DollarSign, Calendar, Building2, Award, Users, Clock, BookmarkPlus, MessageCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useJob } from '@/hooks/useJobs';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notificationService';

const JobDetailDriver = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { toast } = useToast();
  const { job, isLoading, error } = useJob(jobId || null);
  const { currentUser } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (currentUser && job) {
        try {
          const q = query(
            collection(db, 'job_applications'), 
            where('jobId', '==', job.id), 
            where('driverId', '==', currentUser.uid)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setHasApplied(true);
          }
        } catch (e) {
          console.error("Error checking application status", e);
        }
      }
    };
    checkApplicationStatus();
  }, [currentUser, job]);

  const handleApply = async () => {
    if (!currentUser) {
      toast({ title: 'Error', description: 'You must be logged in to apply.', variant: 'destructive' });
      return;
    }
    if (!job) return;

    setIsApplying(true);
    try {
      await addDoc(collection(db, 'job_applications'), {
        jobId: job.id,
        driverId: currentUser.uid,
        employerId: job.employerId,
        status: 'Submitted',
        application_date: Timestamp.now(),
      });

      setHasApplied(true);
      
      try {
          const userName = (currentUser as any)?.full_name || currentUser.email || 'A driver';
          await notificationService.sendSystem(currentUser.uid, 'Application Submitted', `You have successfully applied for '${job.job_title}'.`, { jobId: job.id });
          await notificationService.sendSystem(job.employerId, 'New Candidate Applied', `${userName} applied for '${job.job_title}'.`, { jobId: job.id, applicantId: currentUser.uid });
      } catch (e) { console.error("Notifs failed", e); }

      toast({
        title: "Application Submitted",
        description: "Your application has been sent to the employer.",
      });
      // Optionally navigate, but staying on the page with "Applied" is good UX too.
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to apply.', variant: 'destructive' });
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveJob = () => {
    toast({
      title: "Job Saved",
      description: "This job has been added to your saved jobs.",
    });
  };

  const handleContact = () => {
    const whatsappNumber = '255700000000'; // placeholder
    window.open(`https://wa.me/${whatsappNumber}?text=Hello, I'm interested in the ${job?.job_title} position`, '_blank');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !job) return <div className="min-h-screen flex items-center justify-center">Error loading job details.</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <Button variant="outline" onClick={() => navigate('/ajira/jobs')} className="mb-6">
          ← Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{job.job_title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{job.company_name || job.employerName}</span>
                    </div>
                    <CardDescription>Posted {job.posted_date && typeof job.posted_date === 'object' && 'seconds' in job.posted_date ? new Date((job.posted_date as any).seconds * 1000).toLocaleDateString() : typeof job.posted_date === 'string' ? job.posted_date : 'N/A'}</CardDescription>
                  </div>
                  <Badge className="bg-success/10 text-success">{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{job.vehicleType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">License</p>
                      <p className="font-medium">Category {Array.isArray(job.required_license_category) ? job.required_license_category.join(', ') : (job.required_license_category || 'Any')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{job.region}{job.district ? `, ${job.district}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="font-medium">{job.salary && typeof job.salary === 'object' && job.salary.from && job.salary.to ? `TZS ${job.salary.from.toLocaleString()} - ${job.salary.to.toLocaleString()}` : typeof job.salary === 'string' ? job.salary : 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Positions</p>
                      <p className="font-medium">{job.positions || 1}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Job Type</p>
                      <p className="font-medium">{job.job_type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="font-medium">{job.startDate && typeof job.startDate === 'object' && 'seconds' in job.startDate ? new Date((job.startDate as any).seconds * 1000).toLocaleDateString() : typeof job.startDate === 'string' ? job.startDate : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="font-medium">{job.application_deadline && typeof job.application_deadline === 'object' && 'seconds' in job.application_deadline ? new Date((job.application_deadline as any).seconds * 1000).toLocaleDateString() : typeof job.application_deadline === 'string' ? job.application_deadline : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-3">Job Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{job.job_description}</p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-3">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{Array.isArray(job.required_skills) ? job.required_skills.join('\n') : job.required_skills}</p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-lg mb-3">Benefits</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits}</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Location Details</h4>
                    <p className="text-sm text-muted-foreground mb-2">{job.region}{job.district ? `, ${job.district}` : ''}</p>
                    <div className="bg-muted h-48 rounded-md flex items-center justify-center text-muted-foreground">
                      Map Placeholder
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About {job.company_name || job.employerName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{job.company_name || job.employerName}</h4>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  {/* Employer bio could go here if available */}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/employer/1')}>
                    View Company Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    More Jobs from this Company
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Apply for this Job</CardTitle>
                <CardDescription>Submit your application now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg" onClick={handleApply} disabled={isApplying || hasApplied}>
                  {hasApplied ? 'Already Applied' : isApplying ? 'Applying...' : 'Apply Now'}
                </Button>
                <Button className="w-full" variant="outline" onClick={handleSaveJob}>
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save Job
                </Button>
                <Button className="w-full" variant="outline" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Employer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Ensure your profile is complete</li>
                  <li>✓ Upload your latest CV</li>
                  <li>✓ Highlight relevant experience</li>
                  <li>✓ Check license requirements</li>
                  <li>✓ Apply before the deadline</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Applications</span>
                  <span className="font-semibold">{job.applicationCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Posted</span>
                  <span className="font-semibold">{job.posted_date && typeof job.posted_date === 'object' && 'seconds' in job.posted_date ? new Date((job.posted_date as any).seconds * 1000).toLocaleDateString() : typeof job.posted_date === 'string' ? job.posted_date : 'N/A'}</span>
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

export default JobDetailDriver;
