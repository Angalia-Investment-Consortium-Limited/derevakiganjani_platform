import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Users,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployerVerificationManagement } from '@/hooks/useEmployerVerification';
import useDebounce from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';

interface Employer {
  name: string;
  company_name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  verification_status: string;
  creation: string;
  risk_level?: string;
}

const STATUS_TRANSLATIONS: Record<string, string> = {
  'Pending': 'Inasubiri',
  'Payment Pending': 'Malipo Yanakusudiwa',
  'Documents Under Review': 'Nyaraka Zinaangaliwa',
  'Verified': 'Imethibitishwa',
  'Rejected': 'Imekataliwa'
};

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-gray-100 text-gray-800',
  'Payment Pending': 'bg-yellow-100 text-yellow-800',
  'Documents Under Review': 'bg-blue-100 text-blue-800',
  'Verified': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800'
};

export default function EmployerVerificationManagement() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    employers,
    total,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    reviewEmployer,
    refresh,
    reviewing,
  } = useEmployerVerificationManagement();

  // Debounce search query
  const [debouncedSearchQuery] = useDebounce(searchTerm, 500);

  // Refresh data when debounced search changes
  useEffect(() => {
    refresh();
  }, [debouncedSearchQuery, statusFilter, refresh]);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleSearch = () => {
    // Search is handled by debounced query
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}>
        {language === 'sw' ? STATUS_TRANSLATIONS[status] || status : status}
      </Badge>
    );
  };

  const getRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;

    const colors: Record<string, string> = {
      'High Risk': 'bg-red-100 text-red-800',
      'Medium Risk': 'bg-yellow-100 text-yellow-800',
      'Low Risk': 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={colors[riskLevel] || 'bg-gray-100 text-gray-800'}>
        {language === 'sw' ? riskLevel.replace('Risk', 'Hatari') : riskLevel}
      </Badge>
    );
  };

  const exportToCSV = () => {
    if (!employers || employers.length === 0) return;

    const headers = ['Company Name', 'Contact Person', 'Phone', 'Email', 'Status', 'Date', 'Risk Level'];
    const rows = employers.map(emp => [
      emp.company_name,
      emp.contact_person,
      emp.phone_number,
      emp.email,
      emp.verification_status,
      formatDate(emp.creation),
      emp.risk_level || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employer-verifications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const stats = {
    total: employers.length,
    pending: employers.filter(e => e.verification_status === 'Pending').length,
    paymentPending: employers.filter(e => e.verification_status === 'Payment Pending').length,
    underReview: employers.filter(e => e.verification_status === 'Documents Under Review').length,
    verified: employers.filter(e => e.verification_status === 'Verified').length,
    rejected: employers.filter(e => e.verification_status === 'Rejected').length,
    highRisk: employers.filter(e => e.risk_level === 'High Risk').length
  };

  // Show error state
  if (error && !isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Employer Verification Management</h1>
              <p className="text-muted-foreground mt-1">Manage and review employer verification requests</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-4">
                  Failed to load employers: {typeof error === 'string' ? error : error?.message || 'Unknown error'}
                </p>
                <Button onClick={() => refresh()}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Employer Verification Management</h1>
            <p className="text-muted-foreground mt-1">Manage and review employer verification requests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refresh()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'sw' ? 'Jumla' : 'Total'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'sw' ? 'Inasubiri' : 'Pending'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-600">{stats.paymentPending}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'sw' ? 'Malipo' : 'Payment'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <RefreshCw className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.underReview}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'sw' ? 'Inakaguliwa' : 'In Review'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'sw' ? 'Imethibitishwa' : 'Verified'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'sw' ? 'Imekataliwa' : 'Rejected'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.highRisk}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'sw' ? 'Hatari' : 'High Risk'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {language === 'sw' ? 'Chuja na Tafuta' : 'Filter and Search'}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refresh()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {language === 'sw' ? 'Onyesha Upya' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                {language === 'sw' ? 'Pakua CSV' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder={language === 'sw' ? 'Tafuta kwa jina la kampuni, mawasiliano...' : 'Search by company name, contact...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Filter */}
            <Select onValueChange={handleStatusFilter} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder={language === 'sw' ? 'Hali' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'sw' ? 'Hali Zote' : 'All Statuses'}
                </SelectItem>
                <SelectItem value="Pending">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Pending'] : 'Pending'}
                </SelectItem>
                <SelectItem value="Payment Pending">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Payment Pending'] : 'Payment Pending'}
                </SelectItem>
                <SelectItem value="Documents Under Review">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Documents Under Review'] : 'Documents Under Review'}
                </SelectItem>
                <SelectItem value="Verified">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Verified'] : 'Verified'}
                </SelectItem>
                <SelectItem value="Rejected">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Rejected'] : 'Rejected'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'sw' ? 'Waajiri' : 'Employers'} ({total})
          </CardTitle>
          <CardDescription>
            {language === 'sw'
              ? 'Orodha ya waajiri wanaosubiri uthibitishaji'
              : 'List of employers pending verification'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">
                {language === 'sw' ? 'Inapakia...' : 'Loading...'}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              {language === 'sw'
                ? 'Kuna tatizo la kupakia waajiri'
                : 'Error loading employers'}
            </div>
          ) : !employers || employers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'sw' ? 'Hakuna waajiri' : 'No employers found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'sw' ? 'Jina la Kampuni' : 'Company Name'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Mawasiliano' : 'Contact Person'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Simu' : 'Phone'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Barua pepe' : 'Email'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Hali' : 'Status'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Hatari' : 'Risk'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Tarehe' : 'Date'}</TableHead>
                    <TableHead className="text-right">{language === 'sw' ? 'Vitendo' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employers.map((employer) => (
                    <TableRow key={employer.name}>
                      <TableCell className="font-medium">{employer.company_name}</TableCell>
                      <TableCell>{employer.contact_person}</TableCell>
                      <TableCell>{employer.phone_number}</TableCell>
                      <TableCell className="text-sm">{employer.email}</TableCell>
                      <TableCell>{getStatusBadge(employer.verification_status)}</TableCell>
                      <TableCell>{getRiskBadge(employer.risk_level)}</TableCell>
                      <TableCell>{formatDate(employer.creation)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/employer-review/${employer.name}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {language === 'sw' ? 'Angalia' : 'Review'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}
