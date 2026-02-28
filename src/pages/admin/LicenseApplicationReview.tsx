
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DocumentUpload, LicenseApplication } from '@/types/license';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { CheckCircle, XCircle, FileText, User, Calendar, MessageSquare, ExternalLink } from 'lucide-react';
import { REQUEST_STATUS_COLORS } from '@/components/admin/requests/Columns';
import { DOCUMENT_TYPE_TRANSLATIONS } from '@/types/license';

const LicenseApplicationReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<LicenseApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchApplication = async () => {
      try {
        const docRef = doc(db, "license_applications", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setApplication({ id: docSnap.id, ...docSnap.data() } as LicenseApplication);
          setAdminNotes(docSnap.data().adminNotes || "");
        } else {
          toast({ title: "Error", description: "Application not found.", variant: "destructive" });
          navigate("/admin/license-applications");
        }
      } catch (error) {
        console.error("Error fetching application: ", error);
        toast({ title: "Error", description: "Could not fetch the application details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplication();
  }, [id, toast, navigate]);

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!id) return;
    try {
      const docRef = doc(db, "license_applications", id);
      await updateDoc(docRef, {
        status: status,
        adminNotes: adminNotes,
        lastUpdated: serverTimestamp()
      });
      toast({ title: "Success", description: `Application has been ${status}.` });
      navigate("/admin/license-applications");
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      toast({ title: "Error", description: `Could not update the application status.`, variant: "destructive" });
    }
  };
  
  const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start">
        <Icon className="h-5 w-5 text-muted-foreground mr-3 mt-1" />
        <div className="flex flex-col">
            <span className="text-sm font-semibold text-muted-foreground">{label}</span>
            <span className="text-md">{value}</span>
        </div>
    </div>
  );

  if (isLoading) {
    return <AdminLayout><div className="p-6 space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div></AdminLayout>;
  }

  if (!application) {
    return <AdminLayout><div className="p-6">Application not found.</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="text-2xl">{application.applicationType} Application</CardTitle>
                    <CardDescription>Submitted by {application.fullName}</CardDescription>
                </div>
                <Badge className={REQUEST_STATUS_COLORS[application.status]}>{`${application.status}`.replace(/-/g, ' ')}</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={User} label="Full Name" value={application.fullName} />
                    <DetailItem icon={FileText} label="NIDA Number" value={application.nidaNumber} />
                    <DetailItem icon={Calendar} label="Date of Birth" value={application.dateOfBirth ? format(new Date(application.dateOfBirth), 'PPP') : 'N/A'} />
                    <DetailItem icon={Calendar} label="Submitted On" value={application.submittedOn ? format(application.submittedOn.toDate(), 'PPP') : 'N/A'} />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Uploaded Documents</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(application.documents || []).map((doc: DocumentUpload, index) => (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" key={index} className="block p-4 border rounded-lg hover:bg-muted">
                        <div className="flex items-center gap-4">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                                <p className="font-semibold">{DOCUMENT_TYPE_TRANSLATIONS[doc.name] || doc.name}</p>
                                <p className="text-sm text-muted-foreground">Click to view</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                        </div>
                    </a>
                ))}
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Actions & Notes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="admin-notes" className="font-medium">Admin Notes</label>
                        <Textarea 
                            id="admin-notes"
                            placeholder="Add internal notes here..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={6}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive"><XCircle className="mr-2 h-4 w-4"/>Reject</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to reject?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently mark the application as rejected. The user will be notified.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUpdateStatus('rejected')}>Confirm Rejection</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="default"><CheckCircle className="mr-2 h-4 w-4"/>Approve</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to approve?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This will mark the application as approved. The user will proceed to the next step.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUpdateStatus('approved')}>Confirm Approval</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LicenseApplicationReview;
