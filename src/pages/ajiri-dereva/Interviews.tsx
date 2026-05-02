import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Edit, XCircle, CheckCircle2, Loader2, AlertTriangle, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs, getDoc } from 'firebase/firestore';
import type { ShortlistItem } from '@/types/shortlist';
import type { Job } from '@/types/jobs';
import type { Interview } from '@/types/interviews';
import { notificationService } from '@/services/notificationService';

const Interviews = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [shortlistedCandidates, setShortlistedCandidates] = useState<ShortlistItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newInterview, setNewInterview] = useState({ candidateId: '', jobId: '', date: '', time: '', mode: 'Online', notes: '' });

  useEffect(() => {
    if (shortlistedCandidates.length > 0 && jobs.length > 0) {
      const urlDriverId = searchParams.get('driverId');
      const urlJobId = searchParams.get('jobId');
      if (urlDriverId && urlJobId) {
        const sh = shortlistedCandidates.find(c => c.driverId === urlDriverId && c.jobId === urlJobId);
        if (sh) {
             setNewInterview(prev => ({ ...prev, candidateId: sh.id, jobId: urlJobId }));
             setShowScheduleModal(true);
        } else {
             toast({ title: 'Notice', description: 'Driver must be shortlisted first.', variant: 'default' });
        }
        setSearchParams(new URLSearchParams());
      }
    }
  }, [shortlistedCandidates, jobs]);

  useEffect(() => {
    if (!user) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
    }

    const q = query(collection(db, "interviews"), where("employerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedInterviews: Interview[] = [];
        querySnapshot.forEach((doc) => {
            fetchedInterviews.push({ id: doc.id, ...doc.data() } as Interview);
        });
        setInterviews(fetchedInterviews);
        setLoading(false);
    }, (err) => {
        setError("Failed to fetch interviews.");
        setLoading(false);
    });

    const fetchDropdownData = async () => {
        try {
            const shortlistQuery = query(collection(db, "shortlists"), where("employerId", "==", user.uid));
            const shortlistSnapshot = await getDocs(shortlistQuery);
            const candidates = await Promise.all(shortlistSnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                const driverDoc = await getDoc(doc(db, 'driver_profiles', data.driverId));
                return { id: docSnap.id, ...data, ...(driverDoc.data()) } as ShortlistItem;
            }));
            setShortlistedCandidates(candidates);

            const jobsQuery = query(collection(db, "jobs"), where("employerId", "==", user.uid));
            const jobsSnapshot = await getDocs(jobsQuery);
            setJobs(jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
        } catch (e) {
            toast({ title: "Error", description: "Failed to fetch candidates or jobs.", variant: 'destructive'});
        }
    };

    fetchDropdownData();
    return () => unsubscribe();
  }, [user, toast]);

  const handleSchedule = async () => {
    if(!newInterview.candidateId || !newInterview.jobId || !newInterview.date || !newInterview.time) {
        toast({title: "Error", description: "Please fill all required fields.", variant: "destructive"});
        return;
    }
    try {
        const candidate = shortlistedCandidates.find(c => c.id === newInterview.candidateId);
        const job = jobs.find(j => j.id === newInterview.jobId);
        const candData = candidate as any;
        const candName = candData?.fullName || candData?.full_name || (candData?.first_name ? `${candData.first_name} ${candData.last_name}` : 'Unknown Candidate');

        await addDoc(collection(db, "interviews"), {
            ...newInterview,
            employerId: user?.uid,
            candidateName: candName,
            jobTitle: job?.job_title || 'Unknown Job',
            status: 'Requested'
        });
        
        // Notify driver
        if (candData?.driverId) {
            const employerName = (user as any)?.full_name || (user as any)?.company_name || user?.email || "An employer";
            await notificationService.sendSystem(
                candData.driverId,
                'Interview Scheduled',
                `${employerName} has scheduled an interview with you for the position of ${job?.job_title} on ${newInterview.date} at ${newInterview.time}.`,
                { jobId: newInterview.jobId }
            );
        }

        setShowScheduleModal(false);
        setNewInterview({ candidateId: '', jobId: '', date: '', time: '', mode: 'Online', notes: '' });
        toast({ title: "Success", description: "Interview scheduled successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to schedule interview.", variant: "destructive" });
    }
  };

  const handleAction = async (interviewId: string, status: Interview['status']) => {
    try {
        const interviewRef = doc(db, "interviews", interviewId);
        await updateDoc(interviewRef, { status });
        toast({ title: "Success", description: `Interview status updated to ${status}.` });
    } catch (error) {
        toast({ title: "Error", description: "Failed to update interview status.", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-success/10 text-success';
      case 'Requested': return 'bg-warning/10 text-warning';
      case 'Completed': return 'bg-blue-500/10 text-blue-500';
      case 'Cancelled': return 'bg-destructive/10 text-destructive';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/employer/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Interviews</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-6 flex justify-between items-center">
           <div></div>
          <Button onClick={() => setShowScheduleModal(true)}><Plus className="h-4 w-4 mr-2" />Schedule Interview</Button>
        </div>
        
        {loading && <div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> {error}</div>}

        {!loading && !error && (
            <Card>
            <CardHeader>
              <CardTitle>Scheduled Interviews</CardTitle>
              <CardDescription>Manage all interview appointments</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Candidate</TableHead><TableHead>Job Position</TableHead><TableHead>Date & Time</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {interviews.map((interview) => (
                            <TableRow key={interview.id}>
                                <TableCell className="font-medium">{interview.candidateName}</TableCell>
                                <TableCell>{interview.jobTitle}</TableCell>
                                <TableCell>{interview.date} at {interview.time}</TableCell>
                                <TableCell><Badge variant="outline">{interview.mode}</Badge></TableCell>
                                <TableCell><Badge className={getStatusColor(interview.status)}>{interview.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="ghost" onClick={() => navigate(`/employer/messages?driverId=${interview.candidateId}&driverName=${encodeURIComponent(interview.candidateName)}&jobTitle=${encodeURIComponent(`Interview: ${interview.jobTitle} - ${interview.date}`)}`)} title="Message">
                                        <MessageCircle className="h-4 w-4 text-primary" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleAction(interview.id, 'Cancelled')} title="Cancel">
                                        <XCircle className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Schedule Interview</DialogTitle><DialogDescription>Set up an interview with a candidate</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="candidate">Candidate *</Label>
                <Select value={newInterview.candidateId} onValueChange={(value) => setNewInterview({...newInterview, candidateId: value})}>
                  <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                  <SelectContent>
                    {shortlistedCandidates.map(c => {
                       const cData = c as any;
                       const name = cData.fullName || cData.full_name || (cData.first_name ? `${cData.first_name} ${cData.last_name}` : 'Unknown');
                       return <SelectItem key={c.id} value={c.id}>{name}</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job">Job Position *</Label>
                <Select value={newInterview.jobId} onValueChange={(value) => setNewInterview({...newInterview, jobId: value})}>
                  <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
                  <SelectContent>
                    {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.job_title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Interview Date *</Label>
                <Input id="date" type="date" onChange={(e) => setNewInterview({...newInterview, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Interview Time *</Label>
                <Input id="time" type="time" onChange={(e) => setNewInterview({...newInterview, time: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Interview Mode *</Label>
              <Select onValueChange={(value) => setNewInterview({...newInterview, mode: value as any})}>
                <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Phone">Phone Call</SelectItem>
                  <SelectItem value="Online">Online (Zoom/Meet)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" placeholder="Location, meeting link, special instructions..." rows={3} onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
            <Button onClick={handleSchedule}>Schedule Interview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default Interviews;
