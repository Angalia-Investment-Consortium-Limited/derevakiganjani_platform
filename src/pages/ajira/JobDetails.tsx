import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Building2, DollarSign, Calendar, Award, User, Clock } from 'lucide-react';
import type { Job } from '@/types/jobs';
import { Loader2 } from 'lucide-react';

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [employer, setEmployer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const fetchJobAndEmployer = async () => {
      setLoading(true);
      try {
        const jobDocRef = doc(db, 'jobs', jobId);
        const jobDocSnap = await getDoc(jobDocRef);

        if (jobDocSnap.exists()) {
          const jobData = { id: jobDocSnap.id, ...jobDocSnap.data() } as Job;
          setJob(jobData);

          if (jobData.employerId) {
            const employerDocRef = doc(db, 'users', jobData.employerId);
            const employerDocSnap = await getDoc(employerDocRef);
            if (employerDocSnap.exists()) {
              setEmployer(employerDocSnap.data());
            }
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndEmployer();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">Job Not Found</h2>
        <p className="text-muted-foreground">The job you are looking for does not exist.</p>
        <Button onClick={() => window.history.back()} className="mt-6">Go Back</Button>
      </div>
    );
  }

  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) {
      return `TSh ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
    }
    if (job.salaryMin) {
      return `From TSh ${job.salaryMin.toLocaleString()}`;
    }
    return 'Not Disclosed';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    {employer && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        <span>{employer.companyName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{job.region}, {job.district}</span>
                    </div>
                  </div>
                </div>
                {job.licenseCategory.length > 0 && 
                  <Badge variant="outline" className="text-lg">{job.licenseCategory.join(', ')}</Badge>
                }
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center my-6 p-4 bg-muted rounded-lg">
                <div>
                  <DollarSign className="h-7 w-7 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Salary</p>
                  <p className="text-sm text-muted-foreground">{formatSalary()}</p>
                </div>
                <div>
                  <Briefcase className="h-7 w-7 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Job Type</p>
                  <p className="text-sm text-muted-foreground">{job.jobType}</p>
                </div>
                <div>
                  <Award className="h-7 w-7 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Experience</p>
                  <p className="text-sm text-muted-foreground">{job.minExperience}+ Years</p>
                </div>
                <div>
                  <Clock className="h-7 w-7 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Posted</p>
                  <p className="text-sm text-muted-foreground">{new Date((job.postedOn as any).seconds * 1000).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Job Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => <Badge key={index} variant="secondary">{skill}</Badge>)}
                  </div>
                </div>

                {job.benefits && job.benefits.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Benefits</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.benefits.map((benefit, index) => <Badge key={index} variant="default">{benefit}</Badge>)}
                        </div>
                    </div>
                )}

                {employer && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">About the Employer</h3>
                    <div className="flex items-center gap-4">
                      <User className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{employer.companyName}</p>
                        <p className="text-sm text-muted-foreground">{employer.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 text-center">
                <Button size="lg">Apply Now</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetails;
