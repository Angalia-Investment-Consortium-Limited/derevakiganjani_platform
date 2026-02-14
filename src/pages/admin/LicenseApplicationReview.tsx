import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Building,
  MapPin,
  Loader2,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Loader } from '@/components/ui/loader';
import { STATUS_COLORS } from '@/types/license';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Hooks
import { useToast } from '@/hooks/use-toast';
import { useLicenseApplicationReview } from '@/hooks/useLicenseApplications';

// Helper Component
const InfoItem = ({ label, value, icon, className }: { label: string; value: string | string[]; icon?: React.ReactNode; className?: string }) => (
    <div className={`flex gap-3 ${className}`}>
        {icon && <div className="mt-1 text-muted-foreground">{icon}</div>}
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{Array.isArray(value) ? value.join(', ') : (value || '-')}</p>
        </div>
    </div>
);


export default function LicenseApplicationReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { application, isLoading, error, updateApplicationStatus } = useLicenseApplicationReview(id!);
  
  const [applicantAdvice, setApplicantAdvice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (application) {
      setApplicantAdvice(application.applicantAdvice || application.remarks || '');
      setAdminNotes(application.adminNotes || '');
    }
  }, [application]);

  const handleUpdate = async (status: 'Approved' | 'Rejected') => {
    if (status === 'Rejected' && !applicantAdvice.trim()) {
        toast({
            title: 'Advice required',
            description: 'Please provide advice for the applicant before rejecting.',
            variant: 'destructive',
        });
        return;
    }

    setIsUpdating(true);
    try {
      await updateApplicationStatus(status, { applicantAdvice, adminNotes });
      toast({ title: 'Success', description: `Application has been ${status}.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update status.', variant: 'destructive' });
    } finally {
        setIsUpdating(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Not available';
    const jsDate = date.toDate ? date.toDate() : new Date(date.seconds * 1000);
    return jsDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading && !application) {
    return (
      <AdminLayout>
        <Loader>Loading application details...</Loader>
      </AdminLayout>
    );
  }

  if (error || !application) {
    return (
      <AdminLayout>
        <Card className="border-destructive"><CardContent className="pt-6 text-center py-8"><p className="text-destructive">{error || 'Application not found.'}</p></CardContent></Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to='/admin'>Admin</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to='/admin/license-applications'>License Applications</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Review</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold">Review Application</h1>
            <p className="text-muted-foreground">ID: <span className="font-mono">{application.id}</span></p>
        </div>
        <Badge className={`${STATUS_COLORS[application.status]} hover:${STATUS_COLORS[application.status]} text-base py-2 px-4`}>{application.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Applicant Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label='Full Name' value={application.fullName} icon={<User className="h-4 w-4" />} />
                  <InfoItem label='Phone Number' value={application.phoneNumber} icon={<Phone className="h-4 w-4" />} />
                  <InfoItem label='Email Address' value={application.email} icon={<Mail className="h-4 w-4" />} />
                  <InfoItem label='Submitted On' value={formatDate(application.submittedOn)} icon={<Calendar className="h-4 w-4" />} />
                  <InfoItem label='Application Type' value={application.applicationType} icon={<FileText className="h-4 w-4" />} className="md:col-span-2" />
                  <InfoItem label='License Categories' value={application.categories} icon={<Building className="h-4 w-4" />} />
                  <InfoItem label='District' value={application.district} icon={<MapPin className="h-4 w-4" />} />
                </div>
            </CardContent>
          </Card>

          {application.documents && application.documents.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Submitted Documents</CardTitle><CardDescription>Click to view submitted documents.</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {application.documents.map((doc, index) => (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors flex items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold">{doc.documentType}</p>
                        <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                      </div>
                      <Download className="h-5 w-5 ml-auto text-muted-foreground" />
                    </a>
                  ))}
              </CardContent>
            </Card>
          )}

          {(application.applicantAdvice || application.remarks) && (
             <Card>
              <CardHeader><CardTitle>Advice for Applicant</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.applicantAdvice || application.remarks}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Internal Admin Notes</CardTitle><CardDescription>Notes are only visible to other admins.</CardDescription></CardHeader>
            <CardContent>
              <Textarea 
                id="adminNotes" 
                placeholder='e.g., "Verified documents with registry."' 
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                disabled={application.status !== 'Pending'}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Take Action</CardTitle><CardDescription>Approve or reject this application.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                {application.status === 'Pending' ? (
                  <div className="flex flex-col gap-3">

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button disabled={isUpdating}><CheckCircle className="h-4 w-4 mr-2" />Approve</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will approve the license application. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleUpdate('Approved')} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Approval"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" disabled={isUpdating}><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Application</DialogTitle>
                          <DialogDescription>
                            Provide advice for the applicant. This will be visible to them.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="applicantAdvice">Advice for Applicant</Label>
                          <Textarea 
                            id="applicantAdvice" 
                            placeholder='e.g., "Incomplete documents provided."' 
                            value={applicantAdvice}
                            onChange={(e) => setApplicantAdvice(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                          </DialogClose>
                          <Button variant="destructive" onClick={() => handleUpdate('Rejected')} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Rejection"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This application has already been {application.status.toLowerCase()}. No further actions are available.
                  </p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
