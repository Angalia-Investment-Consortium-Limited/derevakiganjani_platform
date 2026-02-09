import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle,
  User,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLicenseApplicationReview } from '@/hooks/useLicenseApplications';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function LicenseApplicationReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { application, isLoading, error, updateStatus, refresh } = useLicenseApplicationReview(id || null);
  
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (application) {
      setRemarks(application.remarks || '');
    }
  }, [application]);

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected' | 'pending') => {
    setIsUpdating(true);
    try {
      await updateStatus(newStatus, remarks);
      toast({ title: 'Success', description: 'Application status updated successfully.' });
      refresh();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update status.', variant: 'destructive' });
    } finally {
        setIsUpdating(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString('en-US', { dateStyle: 'medium' });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !application) {
    return (
      <AdminLayout>
        <Button variant="ghost" onClick={() => navigate('/admin/license-applications')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back to List</Button>
        <Card className="border-destructive"><CardContent className="pt-6 text-center py-8"><p className="text-destructive">{error || 'Application not found'}</p></CardContent></Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Button variant="ghost" onClick={() => navigate('/admin/license-applications')} className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Back to List</Button>

      <div className="mb-6 flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold">Review Application</h1>
            <p className="text-muted-foreground">Reference: <span className="font-mono">{application.id}</span></p>
        </div>
        <Badge className={`${STATUS_COLORS[application.status]} text-base`}>{application.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Application Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label='Full Name' value={application.fullName} icon={<User />} />
                  <InfoItem label='Phone Number' value={application.phoneNumber} icon={<Phone />} />
                  <InfoItem label='Email' value={application.email || '-'} />
                  <InfoItem label='Application Type' value={application.applicationType} />
                  <InfoItem label='Submitted On' value={formatDate(application.submittedOn)} icon={<Calendar />} />
                </div>
            </CardContent>
          </Card>

          {application.documents && application.documents.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Submitted Documents</CardTitle><CardDescription>Click to view submitted documents.</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.documents.map((doc: any, index: number) => (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors flex items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold">{doc.documentType}</p>
                        <p className="text-sm text-muted-foreground">Click to view</p>
                      </div>
                      <Download className="h-5 w-5 ml-auto text-muted-foreground" />
                    </a>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Update Status</CardTitle><CardDescription>Approve or reject this application.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <div><Label htmlFor="notes">Reviewer Notes</Label><Textarea id="notes" placeholder='Add any relevant notes here...' value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={5} /></div>
                <div className="flex flex-col gap-2">
                    <Button onClick={() => handleUpdateStatus('approved')} disabled={isUpdating || application.status === 'approved'}><CheckCircle className="h-4 w-4 mr-2" />{isUpdating ? 'Updating...' : 'Approve'}</Button>
                    <Button variant="destructive" onClick={() => handleUpdateStatus('rejected')} disabled={isUpdating || application.status === 'rejected'}><XCircle className="h-4 w-4 mr-2" />{isUpdating ? 'Updating...' : 'Reject'}</Button>
                </div>
                {application.status !== 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('pending')} disabled={isUpdating}>Re-open for Review</Button>
                )}
            </CardContent>
          </Card>

          {application.processedOn && (
              <Card><CardHeader><CardTitle>History</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
                  <p><span className="font-semibold">Last Update:</span> {formatDate(application.processedOn)}</p>
              </CardContent></Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

const InfoItem = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div className="flex gap-3">
        {icon && <div className="mt-1 text-muted-foreground">{icon}</div>}
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </div>
);
