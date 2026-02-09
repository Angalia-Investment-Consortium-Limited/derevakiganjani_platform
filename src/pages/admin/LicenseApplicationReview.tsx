import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

// Hooks
import { useToast } from '@/hooks/use-toast';
import { useLicenseApplicationReview } from '@/hooks/useLicenseApplications';

// Helper Component
const InfoItem = ({ label, value, icon, className }: { label: string; value: string; icon?: React.ReactNode; className?: string }) => (
    <div className={`flex gap-3 ${className}`}>
        {icon && <div className="mt-1 text-muted-foreground">{icon}</div>}
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    </div>
);


export default function LicenseApplicationReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use the hook to fetch application data
  const { application, isLoading, error, updateApplicationStatus } = useLicenseApplicationReview(id!);
  
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (status: 'Approved' | 'Rejected') => {
    if (status === 'Rejected' && !remarks.trim()) {
        toast({
            title: 'Remarks required',
            description: 'Please provide a reason for rejecting the application.',
            variant: 'destructive',
        });
        return;
    }

    setIsUpdating(true);
    try {
      await updateApplicationStatus(status, remarks);
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

  // Main Loading State
  if (isLoading && !application) {
    return (
      <AdminLayout>
        <Loader>Loading application details...</Loader>
      </AdminLayout>
    );
  }

  // Error State
  if (error || !application) {
    return (
      <AdminLayout>
        <Button variant="ghost" onClick={() => navigate('/admin/license-applications')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back to List</Button>
        <Card className="border-destructive"><CardContent className="pt-6 text-center py-8"><p className="text-destructive">{error || 'Application not found.'}</p></CardContent></Card>
      </AdminLayout>
    );
  }

  // Main component render
  return (
    <AdminLayout>
      <Button variant="ghost" onClick={() => navigate('/admin/license-applications')} className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Back to List</Button>

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
                  <InfoItem label='License Category' value={application.licenseCategory} icon={<Building className="h-4 w-4" />} />
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

          {application.remarks && (
             <Card>
              <CardHeader><CardTitle>Reviewer Remarks</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.remarks}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Take Action</CardTitle><CardDescription>Approve or reject this application.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                {application.status === 'Pending' ? (
                  <div className="flex flex-col gap-3">

                    {/* Approve Action */}
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

                    {/* Reject Action */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" disabled={isUpdating}><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Application</DialogTitle>
                          <DialogDescription>
                            Please provide remarks for rejecting this application. This will be visible to the applicant.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="remarks">Rejection Remarks</Label>
                          <Textarea 
                            id="remarks" 
                            placeholder='e.g., "Incomplete documents provided."'
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
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
