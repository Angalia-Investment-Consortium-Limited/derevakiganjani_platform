
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LicenseRequest } from '@/types/license';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { notificationService } from '@/services/notificationService';

const LicenseRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [request, setRequest] = useState<LicenseRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<LicenseRequest['status']>('submitted');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchRequest = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'license_requests', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as LicenseRequest;
          setRequest(data);
          setStatus(data.status);
          setAdminNotes(data.adminNotes || '');
        } else {
          toast({ title: 'Error', description: 'Request not found.', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch request details.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequest();
  }, [id, toast]);

  const handleUpdate = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      const docRef = doc(db, 'license_requests', id);
      await updateDoc(docRef, {
        status,
        adminNotes,
        lastUpdated: serverTimestamp(),
      });

      try {
          if (request?.userId) {
              await notificationService.sendSystem(request.userId, 'Support Request Updated', `Your support request "${request.subject}" has been updated to ${status}.`, { requestId: id });
              if (request.email) {
                  await notificationService.sendEmail(request.email, 'Support Request Updated', `Hello ${request.fullName}, your support ticket "${request.subject}" has transitioned to "${status}".${adminNotes ? ` \n\nAdmin Note: ${adminNotes}\n\n` : '\n\n'}Log in to Dereva Kiganjani for more details.`, request.userId);
              }
          }
      } catch (e) {
          console.error("Failed sending notif", e);
      }

      toast({ title: 'Success', description: 'Request updated successfully.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update request.', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!request) {
    return (
      <AdminLayout>
        <div className="text-center">
          <p>Request not found.</p>
          <Button asChild variant="link">
            <Link to="/admin/support-requests">Go Back</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-4">
        <Button asChild variant="outline">
          <Link to="/admin/support-requests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{request.subject}</CardTitle>
              <CardDescription>From: {request.fullName} ({request.email})</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{request.details}</p>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Manage Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={(value) => setStatus(value as LicenseRequest['status'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="adminNotes" className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about the request..."
                  rows={6}
                />
              </div>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LicenseRequestDetail;
