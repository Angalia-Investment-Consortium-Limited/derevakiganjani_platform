import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users, AlertTriangle, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Job } from '@/types/jobs';

const MyJobs = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [jobs, loading, error] = useCollection(
    currentUser ? query(collection(db, 'jobs'), where('employerId', '==', currentUser.uid)) : null
  );

  const jobsData = jobs?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Job Postings</h1>
            <p className="text-muted-foreground">Tazama na dhibiti kazi ulizochapisha</p>
          </div>
          <Button onClick={() => navigate('/ajiri-dereva/post-job')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Post a New Job
          </Button>
        </div>

        {loading && <p>Loading...</p>}
        {error && (
            <Card className="bg-destructive/10 border-destructive">
                 <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-destructive"/>
                        <div>
                            <CardTitle className="text-destructive">Error Loading Jobs</CardTitle>
                            <p className="text-sm text-destructive/80">Could not load your job postings. Please try again later.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {!loading && jobsData.length === 0 && (
             <Card className="mt-4">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                    <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold text-lg">No Jobs Posted Yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">It looks like you haven't posted any jobs. Get started now!</p>
                    <Button onClick={() => navigate('/ajiri-dereva/post-job')}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Post Your First Job
                    </Button>
                </CardContent>
            </Card>
        )}

        <div className="space-y-4">
          {jobsData.map(job => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>{job.region}, {job.district} | Type: {job.jobType}</CardDescription>
                    </div>
                    <Badge variant={job.status === 'Open' ? 'default' : job.status === 'Closed' ? 'destructive' : 'secondary'}>{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{job.applicationCount || 0} Applicants</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/ajiri-dereva/job/${job.id}/applicants`)}>
                  View Applicants
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyJobs;
