import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Loader } from '@/components/ui/loader';
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

// Hook & Toast
import { useToast } from '@/hooks/use-toast';
import { useEmployerReview } from '@/hooks/useEmployerVerification';

// Constants
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  verified: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

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

export default function EmployerReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { employer, isLoading, error, updateEmployerStatus } = useEmployerReview(id!);
  
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (status: 'verified' | 'rejected') => {
    if (status === 'rejected' && !remarks.trim()) {
        toast({
            title: 'Remarks Required',
            description: 'Please provide a reason for rejecting the employer.',
            variant: 'destructive',
        });
        return;
    }

    setIsUpdating(true);
    try {
      await updateEmployerStatus(status, remarks);
      toast({ title: 'Success', description: `Employer has been ${status}.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update status.', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Not available';
    const jsDate = date.toDate ? date.toDate() : new Date(date.seconds * 1000);
    return jsDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading && !employer) {
    return <AdminLayout><Loader>Loading employer details...</Loader></AdminLayout>;
  }

  if (error || !employer) {
    return (
      <AdminLayout>
        <Button variant="ghost" onClick={() => navigate('/admin/employer-verification')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back to List</Button>
        <Card className="border-destructive"><CardContent className="pt-6 text-center py-8"><p className="text-destructive">{error || 'Employer not found.'}</p></CardContent></Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Button variant="ghost" onClick={() => navigate('/admin/employer-verification')} className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Back to Verification List</Button>

      <div className="mb-6 flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold">{employer.companyName}</h1>
            <p className="text-muted-foreground">ID: <span className="font-mono">{employer.id}</span></p>
        </div>
        <Badge className={`${STATUS_COLORS[employer.verificationStatus]} hover:${STATUS_COLORS[employer.verificationStatus]} text-base py-2 px-4`}>{employer.verificationStatus}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label='Company Name' value={employer.companyName} icon={<Building className="h-4 w-4" />} />
              <InfoItem label='Contact Person' value={employer.contactPerson} icon={<User className="h-4 w-4" />} />
              <InfoItem label='Email Address' value={employer.email} icon={<Mail className="h-4 w-4" />} />
              <InfoItem label='Phone Number' value={employer.companyPhone} icon={<Phone className="h-4 w-4" />} />
              <InfoItem label='Full Address' value={employer.companyAddress} icon={<MapPin className="h-4 w-4" />} className="md:col-span-2" />
              <InfoItem label='Submitted On' value={formatDate(employer.createdAt)} icon={<Calendar className="h-4 w-4" />} />
            </CardContent>
          </Card>

          {employer.verificationDocuments && employer.verificationDocuments.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Submitted Documents</CardTitle><CardDescription>Click to view documents.</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {employer.verificationDocuments.map((doc, index) => (
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

          {employer.remarks && (
             <Card>
              <CardHeader><CardTitle>Admin Remarks</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{employer.remarks}</p></CardContent>
            </Card>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Take Action</CardTitle><CardDescription>Approve or reject this request.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                {employer.verificationStatus === 'pending' ? (
                  <div className="flex flex-col gap-3">

                    {/* Approve Action */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button disabled={isUpdating}><CheckCircle className="h-4 w-4 mr-2" />Approve</Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will verify the employer. This action can be undone later.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleUpdate('verified')} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Approval"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Reject Action */}
                    <Dialog>
                      <DialogTrigger asChild><Button variant="destructive" disabled={isUpdating}><XCircle className="h-4 w-4 mr-2" />Reject</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Employer</DialogTitle>
                          <DialogDescription>Provide remarks for rejecting this employer. This will be visible to them.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="remarks">Rejection Remarks</Label>
                          <Textarea id="remarks" placeholder='e.g., "Business registration document is not valid."' value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                          <Button variant="destructive" onClick={() => handleUpdate('rejected')} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Rejection"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">This employer has already been {employer.verificationStatus}.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
