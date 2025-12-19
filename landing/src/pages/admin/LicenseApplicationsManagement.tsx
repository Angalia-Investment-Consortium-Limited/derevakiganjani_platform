import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
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
import { useAllApplications, useApplicationStatistics } from '@/hooks/useLicense';
import { useLanguage } from '@/contexts/LanguageContext';
import { STATUS_TRANSLATIONS, APPLICATION_TYPES, STATUS_COLORS } from '@/types/license';
import type { ApplicationStatus, ApplicationType, ApplicationFilter } from '@/types/license';

export default function LicenseApplicationsManagement() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ApplicationFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const { applications, total, isLoading, error, refetch } = useAllApplications(filter);
  const { statistics, isLoading: statsLoading } = useApplicationStatistics();

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilter({ ...filter, status: undefined });
    } else {
      setFilter({ ...filter, status: status as ApplicationStatus });
    }
  };

  const handleTypeFilter = (type: string) => {
    if (type === 'all') {
      setFilter({ ...filter, application_type: undefined });
    } else {
      setFilter({ ...filter, application_type: type as ApplicationType });
    }
  };

  const handleSearch = () => {
    setFilter({ ...filter, search: searchTerm });
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

  const getStatusBadge = (status: ApplicationStatus) => {
    return (
      <Badge className={STATUS_COLORS[status]}>
        {language === 'sw' ? STATUS_TRANSLATIONS[status] : status}
      </Badge>
    );
  };

  const exportToCSV = () => {
    if (!applications || applications.length === 0) return;

    const headers = ['Reference', 'Type', 'Name', 'Phone', 'Region', 'Status', 'Date'];
    const rows = applications.map(app => [
      app.name,
      app.application_type,
      app.full_name,
      app.phone_number,
      app.region,
      app.status,
      formatDate(app.submission_date)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `license-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'sw' ? 'Usimamizi wa Maombi ya Leseni' : 'License Applications Management'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'sw'
            ? 'Simamia na kagua maombi yote ya leseni'
            : 'Manage and review all license applications'}
        </p>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && statistics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{statistics.total}</p>
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
                <p className="text-3xl font-bold text-yellow-600">{statistics.pending}</p>
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
                  <RefreshCw className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{statistics.under_review}</p>
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
                <p className="text-3xl font-bold text-green-600">{statistics.approved}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'sw' ? 'Imeidhinishwa' : 'Approved'}
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
                <p className="text-3xl font-bold text-red-600">{statistics.rejected}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'sw' ? 'Imekataliwa' : 'Rejected'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {language === 'sw' ? 'Chuja na Tafuta' : 'Filter and Search'}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder={language === 'sw' ? 'Tafuta kwa rejea, jina, simu...' : 'Search by ref, name, phone...'}
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
                <SelectItem value="Under Review">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Under Review'] : 'Under Review'}
                </SelectItem>
                <SelectItem value="Approved">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Approved'] : 'Approved'}
                </SelectItem>
                <SelectItem value="Rejected">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Rejected'] : 'Rejected'}
                </SelectItem>
                <SelectItem value="Completed">
                  {language === 'sw' ? STATUS_TRANSLATIONS['Completed'] : 'Completed'}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select onValueChange={handleTypeFilter} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder={language === 'sw' ? 'Aina' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'sw' ? 'Aina Zote' : 'All Types'}
                </SelectItem>
                <SelectItem value="New License">
                  {language === 'sw' ? APPLICATION_TYPES['New License'].nameSwahili : 'New License'}
                </SelectItem>
                <SelectItem value="License Renewal">
                  {language === 'sw' ? APPLICATION_TYPES['License Renewal'].nameSwahili : 'License Renewal'}
                </SelectItem>
                <SelectItem value="LATRA Exam">
                  {language === 'sw' ? APPLICATION_TYPES['LATRA Exam'].nameSwahili : 'LATRA Exam'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'sw' ? 'Maombi' : 'Applications'} ({total})
          </CardTitle>
          <CardDescription>
            {language === 'sw'
              ? 'Orodha ya maombi yote ya leseni'
              : 'List of all license applications'}
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
                ? 'Kuna tatizo la kupakia maombi'
                : 'Error loading applications'}
            </div>
          ) : !applications || applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'sw' ? 'Hakuna maombi' : 'No applications found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'sw' ? 'Rejea' : 'Reference'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Aina' : 'Type'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Jina' : 'Name'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Simu' : 'Phone'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Mkoa' : 'Region'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Hali' : 'Status'}</TableHead>
                    <TableHead>{language === 'sw' ? 'Tarehe' : 'Date'}</TableHead>
                    <TableHead className="text-right">{language === 'sw' ? 'Vitendo' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.name}>
                      <TableCell className="font-mono text-sm">{application.name}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {language === 'sw'
                            ? APPLICATION_TYPES[application.application_type as ApplicationType]?.nameSwahili
                            : APPLICATION_TYPES[application.application_type as ApplicationType]?.name}
                        </span>
                      </TableCell>
                      <TableCell>{application.full_name}</TableCell>
                      <TableCell>{application.phone_number}</TableCell>
                      <TableCell>{application.region}</TableCell>
                      <TableCell>{getStatusBadge(application.status as ApplicationStatus)}</TableCell>
                      <TableCell>{formatDate(application.submission_date)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/license-application/${application.name}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {language === 'sw' ? 'Angalia' : 'View'}
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
  );
}
