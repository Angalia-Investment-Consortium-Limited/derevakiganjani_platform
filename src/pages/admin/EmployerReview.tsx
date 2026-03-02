import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
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
  ShieldAlert,
  MessageSquare
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";


// Hook & Toast
import { useToast } from '@/hooks/use-toast';
import { useEmployerReview } from '@/hooks/useEmployerVerification';

// Constants
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  verified: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  suspended: 'bg-orange-100 text-orange-800 border-orange-200',
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
  
  const { employer, isLoading, error, updateEmployerStatus, deleteEmployer } = useEmployerReview(id!);
  
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (status: 'verified' | 'rejected' | 'suspended') => {
    if ((status === 'rejected' || status === 'suspended') && !remarks.trim()) {
        toast({
            title: 'Remarks Required',
            description: `Please provide a reason for ${status === 'rejected' ? 'rejecting' : 'suspending'} the employer.`,
            variant: 'destructive',
        });
        return;
    }

    setIsUpdating(true);
    try {
      await updateEmployerStatus(status, remarks);
      toast({ title: 'Success', description: `Employer has been ${status}.` });
      if (status === 'rejected') {
          navigate("/admin/employer-verification");
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update status.', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDelete = async () => {
      setIsDeleting(true);
      try {
          await deleteEmployer();
          toast({ title: 'Success', description: 'Employer has been deleted.' });
          navigate("/admin/employer-verification");
      } catch (err: any) {
          toast({ title: 'Error', description: err.message || 'Failed to delete employer.', variant: 'destructive' });
      } finally {
          setIsDeleting(false);
      }
  }

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
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link to="/admin">Admin</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link to="/admin/employer-verification">Employer Verification</Link></BreadcrumbLink>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <Card className="border-destructive"><CardContent className="pt-6 text-center py-8"><p className="text-destructive">{error || 'Employer not found.'}</p></CardContent></Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link to="/admin">Admin</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link to="/admin/employer-verification">Employer Verification</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Review</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold">{employer.company_name}</h1>
            <p className="text-muted-foreground">ID: <span className="font-mono">{employer.id}</span></p>
        </div>
        <Badge className={`${STATUS_COLORS[employer.verificationStatus.toLowerCase()]} hover:${STATUS_COLORS[employer.verificationStatus.toLowerCase()]} text-base py-2 px-4`}>{employer.verificationStatus}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label='Company Name' value={employer.company_name} icon={<Building className="h-4 w-4" />} />
              <InfoItem label='Contact Person' value={employer.contactPerson} icon={<User className="h-4 w-4" />} />
              <InfoItem label='Email Address' value={employer.company_email} icon={<Mail className="h-4 w-4" />} />
              <InfoItem label='Phone Number' value={employer.company_phone} icon={<Phone className="h-4 w-4" />} />
              <InfoItem label='Full Address' value={`${employer.address.street}, ${employer.address.city}, ${employer.address.country}`} icon={<MapPin className="h-4 w-4" />} className="md:col-span-2" />
              <InfoItem label='Submitted On' value={formatDate(employer.account_creation_date)} icon={<Calendar className="h-4 w-4" />} />
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
            <CardHeader><CardTitle>Take Action</CardTitle><CardDescription>Approve, reject, or suspend this request.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">

                  {/* Approve Action */}
                  {employer.verificationStatus.toLowerCase() !== 'verified' && (
                    <Dialog>
                      <DialogTrigger asChild><Button disabled={isUpdating} className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4 mr-2" />Approve</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Employer</DialogTitle>
                          <DialogDescription>Add optional remarks for the approval. This will be visible to the employer.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="remarks-approve">Approval Remarks (Optional)</Label>
                          <Textarea id="remarks-approve" placeholder='e.g., "Welcome aboard! Your documents have been verified."' value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                          <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdate('verified')} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Approval"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Suspend Action */}
                  {employer.verificationStatus.toLowerCase() === 'verified' && (
                    <Dialog>
                        <DialogTrigger asChild><Button variant="outline" disabled={isUpdating}><ShieldAlert className="h-4 w-4 mr-2" />Suspend</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Suspend Employer</DialogTitle>
                                <DialogDescription>Provide remarks for suspending this employer. This will revoke their access temporarily.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label htmlFor="remarks-suspend">Suspension Remarks</Label>
                                <Textarea id="remarks-suspend" placeholder='e.g., "Violation of terms of service."' value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                <Button variant="destructive" onClick={() => handleUpdate('suspended')} disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Suspension"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                  )}

                  {/* Reject Action */}
                  {employer.verificationStatus.toLowerCase() === 'pending' && (
                    <Dialog>
                      <DialogTrigger asChild><Button variant="destructive" disabled={isUpdating}><XCircle className="h-4 w-4 mr-2" />Reject</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Employer</DialogTitle>
                          <DialogDescription>Provide remarks for rejecting this employer. This will be visible to them.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="remarks-reject">Rejection Remarks</Label>
                          <Textarea id="remarks-reject" placeholder='e.g., "Business registration document is not valid."' value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                          <Button variant="destructive" onClick={() => handleUpdate('rejected')} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirm Rejection"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* General Remarks for Verified/Suspended Users */}
                  {(employer.verificationStatus.toLowerCase() === 'verified' || employer.verificationStatus.toLowerCase() === 'suspended') && (
                       <Dialog>
                        <DialogTrigger asChild><Button variant="outline" disabled={isUpdating}><MessageSquare className="h-4 w-4 mr-2" />Update Remarks</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update Admin Remarks</DialogTitle>
                                <DialogDescription>Edit or add remarks for this employer. This will be visible to them.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label htmlFor="remarks-update">Remarks</Label>
                                <Textarea id="remarks-update" placeholder='e.g., "Please upload a clearer copy of your business license."' defaultValue={employer.remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                <Button onClick={() => handleUpdate(employer.verificationStatus as 'verified' | 'suspended')} disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin"/> : "Save Remarks"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                  )}
                </div>
            </CardContent>
          </Card>
          
           <Card>
                <CardHeader>
                    <CardTitle>Delete Employer</CardTitle>
                    <CardDescription>This action is permanent and cannot be undone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <XCircle className="h-4 w-4 mr-2" />} 
                                Delete Employer
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to permanently delete this employer? All associated data, including job posts and applications, will be lost. This action is irreversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                    Yes, Delete Permanently
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
