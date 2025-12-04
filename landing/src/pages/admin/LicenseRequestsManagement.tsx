import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FileText,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  ChevronLeft,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface LicenseRequest {
  id: string;
  refNo: string;
  driverName: string;
  driverPhone: string;
  type: 'New' | 'Renewal';
  category: 'A' | 'B' | 'C' | 'D' | 'E';
  nationalId: string;
  currentLicense?: string;
  submittedOn: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  adminNotes?: string;
  documents: { name: string; url: string }[];
}

const LicenseRequestsManagement = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<LicenseRequest | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // Sample data - replace with API call
  const requests: LicenseRequest[] = [
    {
      id: '1',
      refNo: 'DRV-2025-ABC123',
      driverName: 'John Mushi',
      driverPhone: '+255 712 345 678',
      type: 'New',
      category: 'B',
      nationalId: '19850612-45678-12345-67',
      submittedOn: '2025-01-15',
      status: 'Submitted',
      documents: [
        { name: 'National ID', url: '#' },
        { name: 'Passport Photo', url: '#' },
      ],
    },
    {
      id: '2',
      refNo: 'DRV-2025-DEF456',
      driverName: 'Mary Ngowi',
      driverPhone: '+255 754 876 543',
      type: 'Renewal',
      category: 'C',
      nationalId: '19900320-78901-23456-78',
      currentLicense: 'TZ-C-2020-12345',
      submittedOn: '2025-01-14',
      status: 'Under Review',
      documents: [
        { name: 'National ID', url: '#' },
        { name: 'Current License', url: '#' },
        { name: 'Passport Photo', url: '#' },
      ],
    },
    {
      id: '3',
      refNo: 'DRV-2025-GHI789',
      driverName: 'Peter Kondo',
      driverPhone: '+255 765 234 567',
      type: 'New',
      category: 'A',
      nationalId: '19950815-34567-89012-34',
      submittedOn: '2025-01-13',
      status: 'Approved',
      adminNotes: 'All documents verified. License ready for printing.',
      documents: [
        { name: 'National ID', url: '#' },
        { name: 'Passport Photo', url: '#' },
      ],
    },
    {
      id: '4',
      refNo: 'DRV-2025-JKL012',
      driverName: 'Sarah Hassan',
      driverPhone: '+255 713 456 789',
      type: 'Renewal',
      category: 'D',
      nationalId: '19880225-56789-01234-56',
      currentLicense: 'TZ-D-2019-67890',
      submittedOn: '2025-01-12',
      status: 'Rejected',
      adminNotes: 'Incomplete documents. National ID photo is not clear.',
      documents: [
        { name: 'National ID', url: '#' },
        { name: 'Current License', url: '#' },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4" />;
      case 'Under Review':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Approved':
        return 'default';
      case 'Rejected':
        return 'destructive';
      case 'Under Review':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && req.category !== categoryFilter) return false;
    if (typeFilter !== 'all' && req.type !== typeFilter) return false;
    return true;
  });

  const handleStatusChange = (status: 'Under Review' | 'Approved' | 'Rejected') => {
    if (status === 'Approved' || status === 'Rejected') {
      setActionType(status.toLowerCase() as 'approve' | 'reject');
    } else {
      // Update status directly
      toast.success(`Request moved to ${status}`);
      setReviewMode(false);
      setSelectedRequest(null);
    }
  };

  const confirmAction = () => {
    if (!actionType) return;
    toast.success(
      actionType === 'approve'
        ? t('Request approved successfully')
        : t('Request rejected successfully')
    );
    setActionType(null);
    setReviewMode(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'review') => {
    if (selectedRequests.length === 0) {
      toast.error(t('Please select at least one request'));
      return;
    }
    toast.success(
      `${selectedRequests.length} request(s) ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'moved to review'}`
    );
    setSelectedRequests([]);
  };

  const toggleSelectRequest = (id: string) => {
    setSelectedRequests((prev) =>
      prev.includes(id) ? prev.filter((reqId) => reqId !== id) : [...prev, id]
    );
  };

  const stats = [
    { label: 'Total Requests', value: requests.length, color: 'text-primary' },
    { label: 'Pending Review', value: requests.filter((r) => r.status === 'Submitted').length, color: 'text-warning' },
    { label: 'Under Review', value: requests.filter((r) => r.status === 'Under Review').length, color: 'text-secondary' },
    { label: 'Approved', value: requests.filter((r) => r.status === 'Approved').length, color: 'text-success' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{t('License Requests Management')}</h1>
                <p className="text-muted-foreground">{t('Review and process license applications')}</p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('Export')}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t(stat.label)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t('Filters')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">{t('Search')}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="search" placeholder={t('Ref No. or Name')} className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">{t('Status')}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All Status')}</SelectItem>
                      <SelectItem value="Submitted">{t('Submitted')}</SelectItem>
                      <SelectItem value="Under Review">{t('Under Review')}</SelectItem>
                      <SelectItem value="Approved">{t('Approved')}</SelectItem>
                      <SelectItem value="Rejected">{t('Rejected')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type-filter">{t('Type')}</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All Types')}</SelectItem>
                      <SelectItem value="New">{t('New')}</SelectItem>
                      <SelectItem value="Renewal">{t('Renewal')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category-filter">{t('Category')}</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All Categories')}</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedRequests.length > 0 && (
            <Card className="mb-6 bg-primary/5 border-primary">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {selectedRequests.length} {t('request(s) selected')}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleBulkAction('review')}>
                      <Clock className="mr-2 h-4 w-4" />
                      {t('Move to Review')}
                    </Button>
                    <Button size="sm" variant="default" onClick={() => handleBulkAction('approve')}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('Approve')}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleBulkAction('reject')}>
                      <XCircle className="mr-2 h-4 w-4" />
                      {t('Reject')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t('License Requests')}</CardTitle>
              <CardDescription>
                {filteredRequests.length} {t('request(s) found')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-input"
                          checked={
                            selectedRequests.length === filteredRequests.length &&
                            filteredRequests.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRequests(filteredRequests.map((r) => r.id));
                            } else {
                              setSelectedRequests([]);
                            }
                          }}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium">{t('Ref No.')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('Driver Name')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('Type')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('Category')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('Submitted On')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('Status')}</th>
                      <th className="text-left py-3 px-4 font-medium">{t('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="rounded border-input"
                            checked={selectedRequests.includes(request.id)}
                            onChange={() => toggleSelectRequest(request.id)}
                          />
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{request.refNo}</td>
                        <td className="py-3 px-4 font-medium">{request.driverName}</td>
                        <td className="py-3 px-4">{t(request.type)}</td>
                        <td className="py-3 px-4 font-semibold">{request.category}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{request.submittedOn}</td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusVariant(request.status)} className="gap-1">
                            {getStatusIcon(request.status)}
                            {t(request.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewMode(true);
                              setAdminNotes(request.adminNotes || '');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('Review')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Dialog */}
        <Dialog open={reviewMode} onOpenChange={(open) => !open && setReviewMode(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {t('Review License Request')}
              {selectedRequest && (
                <Badge variant={getStatusVariant(selectedRequest.status)}>
                  {getStatusIcon(selectedRequest.status)}
                  {t(selectedRequest.status)}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {t('Reference No.')}: {selectedRequest?.refNo}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Driver Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('Driver Information')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t('Full Name')}</Label>
                    <p className="font-medium">{selectedRequest.driverName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('Phone Number')}</Label>
                    <p className="font-medium">{selectedRequest.driverPhone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('National ID')}</Label>
                    <p className="font-medium font-mono text-sm">{selectedRequest.nationalId}</p>
                  </div>
                  {selectedRequest.currentLicense && (
                    <div>
                      <Label className="text-muted-foreground">{t('Current License')}</Label>
                      <p className="font-medium font-mono text-sm">{selectedRequest.currentLicense}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Request Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('Request Details')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t('Type')}</Label>
                    <p className="font-medium">{t(selectedRequest.type)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('Category')}</Label>
                    <p className="font-medium">{selectedRequest.category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('Submitted On')}</Label>
                    <p className="font-medium">{selectedRequest.submittedOn}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('Documents')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedRequest.documents.map((doc, index) => (
                      <Card
                        key={index}
                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-8 w-8 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{t(doc.name)}</p>
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                              {t('View')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin-notes">{t('Admin Notes')}</Label>
                <Textarea
                  id="admin-notes"
                  placeholder={t('Add notes about this request...')}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => handleStatusChange('Under Review')}
                className="flex-1 sm:flex-none"
              >
                <Clock className="mr-2 h-4 w-4" />
                {t('Move to Review')}
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="destructive"
                onClick={() => handleStatusChange('Rejected')}
                className="flex-1 sm:flex-none"
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t('Reject')}
              </Button>
              <Button
                variant="default"
                onClick={() => handleStatusChange('Approved')}
                className="flex-1 sm:flex-none"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('Approve')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? t('Approve Request?') : t('Reject Request?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? t('This will approve the license request. The driver will be notified.')
                : t('This will reject the license request. The driver will be notified.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {t('Confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default LicenseRequestsManagement;
