
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Award, Eye, RefreshCw, XCircle, Search, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// --- Type Definitions ---
interface Certificate {
  id: string; // Firestore Document ID
  driverId: string;
  testAttemptId: string;
  course_name: string;
  certificate_url: string;
  issue_date: { toDate: () => Date };
  status: 'Active' | 'Revoked';
  // Optional fields that might exist
  driverName?: string; // This would be ideal if populated
}

// --- Data Fetching ---
const fetchCertificates = async (): Promise<Certificate[]> => {
    const certificatesRef = collection(db, 'certificates');
    const q = query(certificatesRef, orderBy('issue_date', 'desc'));
    const querySnapshot = await getDocs(q);

    // In a real app, you'd fetch user names here, but for now we just use the ID.
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            driverId: data.driverId || 'N/A',
            testAttemptId: data.testAttemptId || 'N/A',
            course_name: data.course_name || 'Unknown Test',
            certificate_url: data.certificate_url || '',
            issue_date: data.issue_date,
            status: data.status || 'Active', // Default to active
            driverName: data.driverName || data.driverId, // Fallback to ID
        } as Certificate;
    });
};


const CertificatesManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'reissue' | 'revoke'>('reissue');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ service: 'all', status: 'all' });

  // --- Data Fetching using React Query ---
  const { data: certificates = [], isLoading, error } = useQuery<Certificate[]>({
      queryKey: ['certificates'],
      queryFn: fetchCertificates,
  });

  // --- Mutations ---
  const revokeMutation = useMutation({
    mutationFn: async ({ certId, reason }: { certId: string, reason: string }) => {
      const certRef = doc(db, "certificates", certId);
      await updateDoc(certRef, { 
        status: 'Revoked',
        revocationReason: reason,
      });
    },
    onSuccess: () => {
      toast({ title: "Certificate Revoked", description: "The certificate has been successfully revoked." });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      setIsActionModalOpen(false);
      setIsViewOpen(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: `Failed to revoke certificate: ${(err as Error).message}`, variant: 'destructive' });
    }
  });

  const handleConfirmAction = () => {
    if (!selectedCertificate) return;
    if (actionType === 'revoke') {
      if (!reason) {
        toast({ title: "Reason Required", description: "Please provide a reason for revocation.", variant: 'destructive'});
        return;
      }
      revokeMutation.mutate({ certId: selectedCertificate.id, reason });
    } else {
      // Re-issue logic would go here.
      toast({ title: 'Re-issue Not Implemented', description: 'This functionality is not yet available.' });
    }
  };

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      if (filters.status !== 'all' && cert.status !== filters.status) return false;
      if (searchTerm && !`${cert.driverName} ${cert.id}`.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      // Service filter is removed as the data model does not support it directly yet.
      return true;
    });
  }, [certificates, searchTerm, filters]);

  const getStatusBadge = (status: Certificate['status']) => {
    return <Badge variant={status === 'Active' ? 'default' : 'destructive'}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Certificates Management</h1>
          <p className="text-muted-foreground">Manage and view all issued certificates</p>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input placeholder="Search by driver name or certificate ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Table */}
        <Card>
          <CardHeader><CardTitle>Issued Certificates</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate ID</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Test/Course</TableHead>
                    <TableHead>Issued On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : error ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-destructive">Failed to load certificates.</TableCell></TableRow>
                  ) : filteredCertificates.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No certificates found.</TableCell></TableRow>
                  ) : (
                    filteredCertificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono text-sm">{cert.id}</TableCell>
                        <TableCell className="font-medium">{cert.driverName}</TableCell>
                        <TableCell>{cert.course_name}</TableCell>
                        <TableCell>{cert.issue_date.toDate().toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/jitesti/results/${cert.testAttemptId}`)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Result
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedCertificate(cert); setIsViewOpen(true); }} className="ml-2">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Certificate View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Certificate Details</DialogTitle></DialogHeader>
            {selectedCertificate && (
              <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div><Label>Certificate ID</Label><p className="text-sm font-mono">{selectedCertificate.id}</p></div>
                      <div><Label>Driver</Label><p className="text-sm font-medium">{selectedCertificate.driverName}</p></div>
                      <div><Label>Course/Test</Label><p className="text-sm">{selectedCertificate.course_name}</p></div>
                      <div><Label>Issued On</Label><p className="text-sm">{selectedCertificate.issue_date.toDate().toLocaleString()}</p></div>
                      <div><Label>Status</Label><div>{getStatusBadge(selectedCertificate.status)}</div></div>
                  </div>
                  <Button variant="secondary" className="w-full" onClick={() => window.open(selectedCertificate.certificate_url, '_blank')} >
                     <Award className="mr-2 h-4 w-4" /> View Certificate File
                  </Button>
              </div>
            )}
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
              {selectedCertificate?.status === 'Active' && (
                  <Button variant="destructive" onClick={() => { setActionType('revoke'); setIsActionModalOpen(true); }}>
                      <XCircle className="mr-2 h-4 w-4" /> Revoke
                  </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Modal */}
        <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Revoke Certificate</DialogTitle>
                    <DialogDescription>This action will invalidate the certificate. This cannot be undone.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <Label htmlFor="reason">Reason for Revocation (Required)</Label>
                    <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Issued in error, fraudulent activity..." rows={3}/>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
                    <Button variant='destructive' onClick={handleConfirmAction} disabled={revokeMutation.isPending}>
                        {revokeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}Confirm Revocation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CertificatesManagement;
