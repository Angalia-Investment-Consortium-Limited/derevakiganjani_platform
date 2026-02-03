import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Search, Eye, Plus, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface LicenseRequest {
  id: string;
  refNo: string;
  type: 'New' | 'Renewal';
  category: 'A' | 'B' | 'C' | 'D' | 'E';
  submittedOn: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  adminNotes?: string;
}

const MyLicenseRequests = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<LicenseRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Sample data - replace with API call
  const requests: LicenseRequest[] = [
    {
      id: '1',
      refNo: 'DRV-2025-ABC123',
      type: 'New',
      category: 'B',
      submittedOn: '2025-01-15',
      status: 'Under Review',
    },
    {
      id: '2',
      refNo: 'DRV-2025-DEF456',
      type: 'Renewal',
      category: 'C',
      submittedOn: '2025-01-10',
      status: 'Approved',
      adminNotes: 'All documents verified. License ready for collection.',
    },
    {
      id: '3',
      refNo: 'DRV-2024-GHI789',
      type: 'New',
      category: 'A',
      submittedOn: '2024-12-20',
      status: 'Rejected',
      adminNotes: 'Incomplete documents. Please resubmit with clear ID photo.',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 className="h-4 w-4" />;
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
    return true;
  });

  const getStatusTimeline = (status: string) => {
    const steps = [
      { label: 'Submitted', completed: true },
      { label: 'Under Review', completed: status !== 'Submitted' },
      { label: status === 'Rejected' ? 'Rejected' : 'Approved', completed: status === 'Approved' || status === 'Rejected' },
    ];
    return steps;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/5">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/license-request">License Services</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Requests</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('My License Requests')}</h1>
              <p className="text-muted-foreground">{t('Track your license applications and renewals')}</p>
            </div>
            <Button onClick={() => navigate('/license-request')}>
              <Plus className="mr-2 h-4 w-4" />
              {t('New Request')}
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">{t('Search by Reference')}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="search" placeholder="DRV-2025-..." className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">{t('Filter by Status')}</Label>
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
                  <Label htmlFor="category-filter">{t('Filter by Category')}</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All Categories')}</SelectItem>
                      <SelectItem value="A">A - {t('Motorcycles')}</SelectItem>
                      <SelectItem value="B">B - {t('Light vehicles')}</SelectItem>
                      <SelectItem value="C">C - {t('Heavy vehicles')}</SelectItem>
                      <SelectItem value="D">D - {t('Passenger vehicles')}</SelectItem>
                      <SelectItem value="E">E - {t('Trailer vehicles')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">{t('No License Requests')}</h3>
                <p className="text-muted-foreground mb-6">
                  {t('You haven\'t submitted any license requests yet')}
                </p>
                <Button onClick={() => navigate('/license-request')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('Submit Your First Request')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('Your Requests')}</CardTitle>
                <CardDescription>
                  {filteredRequests.length} {t('request(s) found')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">{t('Reference No.')}</th>
                        <th className="text-left py-3 px-4 font-medium">{t('Type')}</th>
                        <th className="text-left py-3 px-4 font-medium">{t('Category')}</th>
                        <th className="text-left py-3 px-4 font-medium">{t('Submitted On')}</th>
                        <th className="text-left py-3 px-4 font-medium">{t('Status')}</th>
                        <th className="text-left py-3 px-4 font-medium">{t('Action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-sm">{request.refNo}</td>
                          <td className="py-3 px-4">{t(request.type)}</td>
                          <td className="py-3 px-4 font-semibold">{request.category}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {request.submittedOn}
                            </div>
                          </td>
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
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('View')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {t('Request Details')}
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
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label className="text-muted-foreground">{t('Status')}</Label>
                  <p className="font-medium">{t(selectedRequest.status)}</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <Label className="mb-3 block">{t('Progress Timeline')}</Label>
                <div className="relative">
                  {getStatusTimeline(selectedRequest.status).map((step, index) => (
                    <div key={index} className="flex items-center gap-3 mb-4 last:mb-0">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                          step.completed
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background border-border text-muted-foreground'
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        )}
                      </div>
                      <span className={step.completed ? 'font-medium' : 'text-muted-foreground'}>
                        {t(step.label)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <Label className="mb-3 block">{t('Uploaded Documents')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{t('National ID')}</p>
                        <p className="text-xs text-muted-foreground">ID_photo.jpg</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{t('License Photo')}</p>
                        <p className="text-xs text-muted-foreground">license.pdf</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedRequest.adminNotes && (
                <div>
                  <Label className="mb-2 block">{t('Admin Notes')}</Label>
                  <Card className="p-4 bg-muted/50">
                    <p className="text-sm">{selectedRequest.adminNotes}</p>
                  </Card>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MyLicenseRequests;
