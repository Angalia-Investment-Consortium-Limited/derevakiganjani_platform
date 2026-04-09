import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, MessageCircle, Calendar, UserCheck, MapPin, Award, Briefcase, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
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
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import type { DriverProfile } from '@/types/auth';
import type { ShortlistItem } from '@/types/shortlist';
import { notificationService } from '@/services/notificationService';

const Shortlist = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [shortlistedDrivers, setShortlistedDrivers] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("You must be logged in to view this page.");
      return;
    }

    const fixLegacyShortlists = async () => {
      try {
        const qLegacy = query(collection(db, "shortlists"), where("employerId", "==", ""));
        const snap = await getDocs(qLegacy);
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach(docSnap => batch.update(docSnap.ref, { employerId: user.uid }));
          await batch.commit();
          console.log(`Fixed ${snap.size} legacy shortlists with empty employerId`);
        }
      } catch(e) { console.error("Error fixing legacy shortlists", e); }
    };
    fixLegacyShortlists();

    const [searchParams] = window.location.search ? [new URLSearchParams(window.location.search)] : [new URLSearchParams()];
    const jobIdParam = searchParams.get('jobId');

    const employerIds = Array.from(new Set([user.uid, (profile as any)?.userId].filter(Boolean)));
    
    // If jobId is provided, query by jobId (useful for admins viewing a specific job's shortlist)
    // Otherwise query by employerId
    const q = jobIdParam 
      ? query(collection(db, "shortlists"), where("jobId", "==", jobIdParam))
      : query(collection(db, "shortlists"), where("employerId", "in", employerIds));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      try {
        const driversPromises = querySnapshot.docs.map(async (docSnap) => {
          const shortlistData = docSnap.data();
          const driverDocRef = doc(db, 'driver_profiles', shortlistData.driverId);
          const driverDoc = await getDoc(driverDocRef);

          if (driverDoc.exists()) {
            const driverData = driverDoc.data() as DriverProfile;
            return {
              id: docSnap.id,
              ...driverData,
              ...shortlistData,
            } as ShortlistItem;
          } else {
            // Handle case where driver profile is not found by rendering a fallback
            return {
              id: docSnap.id,
              driverId: shortlistData.driverId,
              fullName: 'Unknown Driver',
              ...shortlistData,
            } as any;
          }
        });

        const drivers = (await Promise.all(driversPromises)).filter(Boolean) as ShortlistItem[];
        setShortlistedDrivers(drivers);
      } catch (e) {
        setError("Failed to fetch shortlisted drivers.");
        console.error(e);
      }
      setLoading(false);
    }, (err) => {
      setError("Failed to listen for shortlist updates.");
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateStatus = async (driverId: string, status: ShortlistItem['status']) => {
    try {
      const driverRef = doc(db, "shortlists", driverId);
      await updateDoc(driverRef, { status });
      
      const targetDriver = shortlistedDrivers.find(d => d.id === driverId);
      if (targetDriver) {
          try {
              const employerName = (user as any)?.full_name || (user as any)?.company_name || user?.email || "An employer";
              const pronoun = status === 'contacted' ? "contacted you" : status === 'interviewed' ? "marked you for an interview" : status === 'hired' ? "marked you as hired" : `updated your application status to ${status}`;
              const msg = `${employerName} has ${pronoun}.`;
              
              await notificationService.sendSystem(targetDriver.driverId, `Application ${status}`, msg, { jobId: targetDriver.jobId });
              
              if ((targetDriver as any).email) {
                 await notificationService.sendEmail((targetDriver as any).email, `Application Update: ${status}`, `Hello, your job application status has been updated to "${status}" by the employer. Please check your dashboard for details.`, targetDriver.driverId);
              }
              
              if (status === 'hired' || status === 'interviewed' || status === 'contacted') {
                  const phone = targetDriver.phone_number || (targetDriver as any).mobile_no;
                  if (phone) {
                      await notificationService.sendSMS(phone, msg, targetDriver.driverId);
                  }
              }
          } catch(e) { console.error("Notification fail: ", e) }
      }

      toast({
        title: "Status Updated",
        description: `Driver status updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update driver status",
        variant: "destructive",
      });
    }
  };

  const handleContact = (driver: ShortlistItem) => {
    const whatsappNumber = driver.phone_number || '255700000000'; // placeholder
    window.open(`https://wa.me/${whatsappNumber}?text=Hello, I'm interested in hiring you as a driver for job ID: ${driver.jobId}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'pending':
      case 'shortlisted': return 'bg-primary/10 text-primary';
      case 'contacted': return 'bg-blue-500/10 text-blue-500';
      case 'interviewed': return 'bg-yellow-500/10 text-yellow-500';
      case 'hired': return 'bg-success/10 text-success';
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
            <BreadcrumbItem><BreadcrumbPage>Shortlisted Drivers</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {loading && <div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" /> {error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {shortlistedDrivers.length > 0 ? shortlistedDrivers.map((driver: any) => (
                <Card key={driver.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={driver.user_image} />
                        <AvatarFallback className="text-lg">
                          {(driver.fullName || driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`).trim().split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">{driver.fullName || driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unknown Driver'}</h3>
                            {driver.verified && <CheckCircle2 className="h-5 w-5 text-success" />}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(driver.skills || []).map((skill: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>)}
                            {driver.status && <Badge className={getStatusColor(driver.status)}>{String(driver.status).charAt(0).toUpperCase() + String(driver.status).slice(1)}</Badge>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2"><Award className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">License:</span><span className="font-medium">Category {driver.licenseNumber || (Array.isArray(driver.license_category) ? driver.license_category.join(', ') : driver.license_category) || 'N/A'}</span></div>
                            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Experience:</span><span className="font-medium">{driver.experience || driver.years_of_experience || 0} yrs</span></div>
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Location:</span><span className="font-medium">{driver.location || driver.region || 'N/A'}</span></div>
                            <div className="flex items-center gap-2"><span className="text-muted-foreground">Vehicle:</span><span className="font-medium">{driver.preferredVehicle}</span></div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Languages:</span>
                            <span className="font-medium">{(driver.languages || []).join(', ')}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button size="sm" onClick={() => navigate(`/driver/${driver.uid}`)}>View Full Profile</Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(driver.id, 'contacted')}>Send Request</Button>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/employer/interviews/schedule/${driver.uid}`)}><Calendar className="h-4 w-4 mr-1" />Schedule Interview</Button>
                          <Button size="sm" variant="outline" onClick={() => handleContact(driver)}><MessageCircle className="h-4 w-4 mr-1" />WhatsApp</Button>
                          <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleUpdateStatus(driver.id, 'hired')}><UserCheck className="h-4 w-4 mr-1" />Mark Hired</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : <p>No drivers shortlisted yet.</p>}
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Shortlist Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Total Shortlisted</span><span className="font-semibold">{shortlistedDrivers.length}</span></div>
                        <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Contacted</span><span className="font-semibold">{shortlistedDrivers.filter(d => d.status === 'contacted' || d.status === 'interviewed' || d.status === 'hired').length}</span></div>
                        <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Interviewed</span><span className="font-semibold">{shortlistedDrivers.filter(d => d.status === 'interviewed' || d.status === 'hired').length}</span></div>
                        <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Hired</span><span className="font-semibold">{shortlistedDrivers.filter(d => d.status === 'hired').length}</span></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full" onClick={() => navigate('/employer/jobs')}>Back to My Jobs</Button>
                        <Button className="w-full" variant="outline">Export List</Button>
                    </CardContent>
                </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Shortlist;
