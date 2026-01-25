import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useFrappeGetDocList, useFrappeDocTypeEventListener, useFrappeUpdateDoc } from 'frappe-react-sdk';
import type { Filter as FrappeFilter } from 'frappe-react-sdk';
import useDebounce from '@/hooks/useDebounce';

interface LicenseRequest {
  name: string;
  user: string;
  application_type: string;
  full_name: string;
  phone_number: string;
  email?: string;
  region: string;
  district: string;
  license_category: string;
  latra_type?: string;
  current_license_number?: string;
  status: string;
  submission_date: string;
  review_date?: string;
  reviewer?: string;
  reviewer_notes?: string;
  documents?: Array<{
    document_type: string;
    file_url: string;
    file_name: string;
  }>;
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
  const [searchQuery, setSearchQuery] = useDebounce('');
  const [pageLimitStart, setPageLimitStart] = useState(0);
  const pageLimit = 20;

  // Build filters for Frappe query
  const filters = useMemo(() => {
    const f: FrappeFilter[] = [];
    
    if (statusFilter !== 'all') {
      f.push(['status', '=', statusFilter]);
    }
    
    if (categoryFilter !== 'all') {
      f.push(['license_category', '=', categoryFilter]);
    }
    
    if (typeFilter !== 'all') {
      f.push(['application_type', '=', typeFilter]);
    }
    
    if (searchQuery) {
      // Search in name (reference number) or full_name
      f.push(['name', 'like', `%${searchQuery}%`]);
    }
    
    return f;
  }, [statusFilter, categoryFilter, typeFilter, searchQuery]);

  // Fetch license applications from Frappe
  const { data: requests, mutate, error, isLoading } = useFrappeGetDocList<LicenseRequest>('License Application', {
    fields: [
      'name',
      'user',
      'application_type',
      'full_name',
      'phone_number',
      'email',
      'region',
      'district',
      'license_category',
      'latra_type',
      'current_license_number',
      'status',
      'submission_date',
      'review_date',
      'reviewer',
      'reviewer_notes',
      'documents'
    ],
    filters: filters,
    limit: pageLimit,
    limit_start: pageLimitStart,
    orderBy: {
      field: 'submission_date',
      order: 'desc'
    }
  });

  // Listen for real-time updates
  useFrappeDocTypeEventListener('License Application', () => {
    mutate();
  });

  // Update document hook
  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();

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

  const handleStatusChange = async (status: 'Under Review' | 'Approved' | 'Rejected') => {
    if (!selectedRequest) return;

    if (status === 'Approved' || status === 'Rejected') {
      setActionType(status.toLowerCase() as 'approve' | 'reject');
    } else {
      // Update status directly
      try {
        await updateDoc('License Application', selectedRequest.name, {
          status: status,
          review_date: new Date().toISOString(),
          reviewer_notes: adminNotes || selectedRequest.reviewer_notes
        });
        toast.success(`Request moved to ${status}`);
        mutate();
        setReviewMode(false);
        setSelectedRequest(null);
      } catch (error) {
        toast.error('Failed to update status');
        console.error(error);
      }
    }
  };

  const confirmAction = async () => {
    if (!actionType || !selectedRequest) return;
    
    const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
    
    try {
      await updateDoc('License Application', selectedRequest.name, {
        status: newStatus,
        review_date: new Date().toISOString(),
        reviewer_notes: adminNotes || selectedRequest.reviewer_notes
      });
      
      toast.success(
        actionType === 'approve'
          ? t('Request approved successfully')
          : t('Request rejected successfully')
      );
      
      mutate();
      setActionType(null);
      setReviewMode(false);
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      toast.error('Failed to update request');
      console.error(error);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'review') => {
    if (selectedRequests.length === 0) {
      toast.error(t('Please select at least one request'));
      return;
    }

    const newStatus = action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Under Review';
    
    try {
      // Update all selected requests
      await Promise.all(
        selectedRequests.map(requestName =>
          updateDoc('License Application', requestName, {
            status: newStatus,
            review_date: new Date().toISOString()
          })
        )
      );
      
      toast.success(
        `${selectedRequests.length} request(s) ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'moved to review'}`
      );
      
      mutate();
      setSelectedRequests([]);
    } catch (error) {
      toast.error('Failed to update requests');
      console.error(error);
    }
  };

  const toggleSelectRequest = (name: string) => {
    setSelectedRequests((prev) =>
      prev.includes(name) ? prev.filter((reqName) => reqName !== name) : [...prev, name]
    );
  };

  const stats = [
    { label: 'Total Requests', value: requests?.length || 0, color: 'text-primary' },
    { label: 'Pending Review', value: requests?.filter((r) => r.status === 'Pending').length || 0, color: 'text-warning' },
    { label: 'Under Review', value: requests?.filter((r) => r.status === 'Under Review').length || 0, color: 'text-secondary' },
    { label: 'Approved', value: requests?.filter((r) => r.status === 'Approved').length || 0, color: 'text-success' },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'Failed to load license requests'}
            </AlertDescription>
          </Alert>
        )}

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
                  <Input 
                    id="search" 
                    placeholder={t('Ref No. or Name')} 
                    className="pl-10"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                    <SelectItem value="Pending">{t('Pending')}</SelectItem>
                    <SelectItem value="Under Review">{t('Under Review')}</SelectItem>
                    <SelectItem value="Approved">{t('Approved')}</SelectItem>
                    <SelectItem value="Rejected">{t('Rejected')}</SelectItem>
                    <SelectItem value="Completed">{t('Completed')}</SelectItem>
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
                    <SelectItem value="New License">{t('New License')}</SelectItem>
                    <SelectItem value="License Renewal">{t('License Renewal')}</SelectItem>
                    <SelectItem value="LATRA Exam">{t('LATRA Exam')}</SelectItem>
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
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('review')} disabled={updateLoading}>
                    <Clock className="mr-2 h-4 w-4" />
                    {t('Move to Review')}
                  </Button>
                  <Button size="sm" variant="default" onClick={() => handleBulkAction('approve')} disabled={updateLoading}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t('Approve')}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkAction('reject')} disabled={updateLoading}>
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
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('Loading...')}
                </span>
              ) : (
                <span>{requests?.length || 0} {t('request(s) found')}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : requests && requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-input"
                          checked={
                            selectedRequests.length === requests.length &&
                            requests.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRequests(requests.map((r) => r.name));
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
                    {requests.map((request) => (
                      <tr key={request.name} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="rounded border-input"
                            checked={selectedRequests.includes(request.name)}
                            onChange={() => toggleSelectRequest(request.name)}
                          />
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{request.name}</td>
                        <td className="py-3 px-4 font-medium">{request.full_name}</td>
                        <td className="py-3 px-4">{t(request.application_type)}</td>
                        <td className="py-3 px-4 font-semibold">{request.license_category}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(request.submission_date)}</td>
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
                              setAdminNotes(request.reviewer_notes || '');
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
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('No license requests found')}</p>
              </div>
            )}
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
              {t('Reference No.')}: {selectedRequest?.name}
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
                    <p className="font-medium">{selectedRequest.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('Phone Number')}</Label>
                    <p className="font-medium">{selectedRequest.phone_number}</p>
                  </div>
                  {selectedRequest.email && (
                    <div>
                      <Label className="text-muted-foreground">{t('Email')}</Label>
                      <p className="font-medium">{selectedRequest.email}</p>
                    </div>
                  )}
                  {selectedRequest.current_license_number && (
                    <div>
                      <Label className="text-muted-foreground">{t('Current License')}</Label>
                      <p className="font-medium font-mono text-sm">{selectedRequest.current_license_number}</p>
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
                    <p className="font-medium">{t(selectedRequest.application_type)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('Category')}</Label>
                    <p className="font-medium">{selectedRequest.license_category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('Submitted On')}</Label>
                    <p className="font-medium">{formatDate(selectedRequest.submission_date)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('Region')}</Label>
                    <p className="font-medium">{selectedRequest.region}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('District')}</Label>
                    <p className="font-medium">{selectedRequest.district}</p>
                  </div>
                  {selectedRequest.latra_type && (
                    <div>
                      <Label className="text-muted-foreground">{t('LATRA Type')}</Label>
                      <p className="font-medium">{selectedRequest.latra_type}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents */}
              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
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
                              <p className="font-medium text-sm truncate">{t(doc.document_type)}</p>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="h-auto p-0 text-xs"
                                onClick={() => window.open(doc.file_url, '_blank')}
                              >
                                {t('View')}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                disabled={updateLoading}
              >
                {updateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                {t('Move to Review')}
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="destructive"
                onClick={() => handleStatusChange('Rejected')}
                className="flex-1 sm:flex-none"
                disabled={updateLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t('Reject')}
              </Button>
              <Button
                variant="default"
                onClick={() => handleStatusChange('Approved')}
                className="flex-1 sm:flex-none"
                disabled={updateLoading}
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
            <AlertDialogCancel disabled={updateLoading}>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={updateLoading}>
              {updateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('Confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default LicenseRequestsManagement;
