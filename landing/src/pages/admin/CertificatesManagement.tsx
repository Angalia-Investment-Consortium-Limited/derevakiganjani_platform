import { useState } from 'react';
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
import { Award, Eye, RefreshCw, XCircle, Search, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Certificate {
  id: string;
  certificateId: string;
  driverName: string;
  service: 'JiTesti' | 'Elimika';
  issuedOn: string;
  status: 'Active' | 'Revoked';
  courseTitle?: string;
  score?: string;
}

const CertificatesManagement = () => {
  const { toast } = useToast();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'reissue' | 'revoke'>('reissue');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<'valid' | 'revoked' | 'not-found' | null>(null);
  const [filters, setFilters] = useState({
    service: 'all',
    status: 'all',
  });

  // Mock data
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      certificateId: 'CERT-JT-2024-0001',
      driverName: 'John Mwangi',
      service: 'JiTesti',
      issuedOn: '2024-01-10',
      status: 'Active',
      courseTitle: 'Road Safety Theory Test',
      score: '85%',
    },
    {
      id: '2',
      certificateId: 'CERT-EL-2024-0023',
      driverName: 'Grace Njeri',
      service: 'Elimika',
      issuedOn: '2024-01-08',
      status: 'Active',
      courseTitle: 'Advanced Driving Techniques',
      score: '92%',
    },
    {
      id: '3',
      certificateId: 'CERT-JT-2024-0002',
      driverName: 'Peter Ochieng',
      service: 'JiTesti',
      issuedOn: '2024-01-05',
      status: 'Revoked',
      courseTitle: 'Road Safety Theory Test',
      score: '78%',
    },
  ]);

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsViewOpen(true);
  };

  const handleActionClick = (type: 'reissue' | 'revoke') => {
    setActionType(type);
    setIsViewOpen(false);
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedCertificate) return;

    if (actionType === 'revoke') {
      setCertificates(certificates.map(c =>
        c.id === selectedCertificate.id ? { ...c, status: 'Revoked' } : c
      ));
      toast({
        title: 'Certificate Revoked',
        description: `Certificate ${selectedCertificate.certificateId} has been revoked.`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Certificate Reissued',
        description: `New certificate issued for ${selectedCertificate.driverName}.`,
      });
    }

    setIsActionModalOpen(false);
    setReason('');
    setSelectedCertificate(null);
  };

  const handleVerifyCertificate = () => {
    if (!verifyId) return;
    
    const found = certificates.find(c => c.certificateId === verifyId);
    if (!found) {
      setVerifyResult('not-found');
    } else if (found.status === 'Revoked') {
      setVerifyResult('revoked');
    } else {
      setVerifyResult('valid');
    }

    toast({
      title: 'Verification Complete',
      description: found 
        ? `Certificate is ${found.status.toLowerCase()}`
        : 'Certificate not found in system',
    });
  };

  const getStatusBadge = (status: Certificate['status']) => {
    return (
      <Badge variant={status === 'Active' ? 'default' : 'destructive'}>
        {status}
      </Badge>
    );
  };

  const filteredCertificates = certificates.filter(cert => {
    if (filters.service !== 'all' && cert.service !== filters.service) return false;
    if (filters.status !== 'all' && cert.status !== filters.status) return false;
    if (searchTerm && !cert.driverName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Certificates Management</h1>
            <p className="text-muted-foreground">Manage issued certificates and verify authenticity</p>
          </div>

          {/* Certificate Verification Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Verify Certificate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter Certificate ID (e.g., CERT-JT-2024-0001)"
                    value={verifyId}
                    onChange={(e) => setVerifyId(e.target.value)}
                  />
                </div>
                <Button onClick={handleVerifyCertificate}>
                  <Search className="mr-2 h-4 w-4" />
                  Verify
                </Button>
              </div>
              {verifyResult && (
                <div className="mt-4 p-4 rounded-lg border">
                  {verifyResult === 'valid' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Award className="h-5 w-5" />
                      <span className="font-medium">Valid Certificate</span>
                    </div>
                  )}
                  {verifyResult === 'revoked' && (
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Certificate Revoked</span>
                    </div>
                  )}
                  {verifyResult === 'not-found' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">Certificate Not Found</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filters & Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search by driver name or certificate ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filters.service} onValueChange={(v) => setFilters({...filters, service: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="JiTesti">JiTesti</SelectItem>
                    <SelectItem value="Elimika">Elimika</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
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
            <CardHeader>
              <CardTitle>Issued Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate ID</TableHead>
                      <TableHead>Driver Name</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Course/Test</TableHead>
                      <TableHead>Issued On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No certificates found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCertificates.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-mono text-sm">{cert.certificateId}</TableCell>
                          <TableCell className="font-medium">{cert.driverName}</TableCell>
                          <TableCell>{cert.service}</TableCell>
                          <TableCell>{cert.courseTitle}</TableCell>
                          <TableCell>{cert.issuedOn}</TableCell>
                          <TableCell>{getStatusBadge(cert.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewCertificate(cert)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
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
          <DialogHeader>
            <DialogTitle>Certificate Details</DialogTitle>
            <DialogDescription>
              View and manage certificate information
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Certificate ID</Label>
                  <p className="text-sm font-mono">{selectedCertificate.certificateId}</p>
                </div>
                <div>
                  <Label>Driver Name</Label>
                  <p className="text-sm font-medium">{selectedCertificate.driverName}</p>
                </div>
                <div>
                  <Label>Service</Label>
                  <p className="text-sm">{selectedCertificate.service}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedCertificate.status)}</div>
                </div>
                <div>
                  <Label>Course/Test</Label>
                  <p className="text-sm">{selectedCertificate.courseTitle}</p>
                </div>
                <div>
                  <Label>Score</Label>
                  <p className="text-sm font-medium">{selectedCertificate.score}</p>
                </div>
                <div>
                  <Label>Issued On</Label>
                  <p className="text-sm">{selectedCertificate.issuedOn}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <Label className="mb-2 block">Certificate Preview</Label>
                <div className="bg-background border-2 border-dashed rounded-lg h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Award className="h-12 w-12 mx-auto" />
                    <p>[Certificate PDF Preview]</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            {selectedCertificate?.status === 'Active' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleActionClick('revoke')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Revoke
                </Button>
                <Button onClick={() => handleActionClick('reissue')}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reissue
                </Button>
              </>
            )}
            {selectedCertificate?.status === 'Revoked' && (
              <Button onClick={() => handleActionClick('reissue')}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reissue Certificate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'reissue' ? 'Reissue Certificate' : 'Revoke Certificate'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'reissue'
                ? 'A new certificate will be generated with a new ID.'
                : 'This action will invalidate the certificate.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason {actionType === 'revoke' && '(Required)'}</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={actionType === 'reissue' ? 'Lost certificate, damaged, etc.' : 'Fraudulent activity, error, etc.'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'revoke' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
            >
              Confirm {actionType === 'reissue' ? 'Reissue' : 'Revocation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
};

export default CertificatesManagement;
