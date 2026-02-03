
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
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
import { useLicenseApplications } from '@/hooks/useLicenseApplications';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  'Under Review': 'bg-blue-100 text-blue-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Completed: 'bg-gray-100 text-gray-800',
};

const STATUS_TRANSLATIONS: Record<string, any> = {
    Pending: { en: 'Pending', sw: 'Inasubiri' },
    'Under Review': { en: 'Under Review', sw: 'Inakaguliwa' },
    Approved: { en: 'Approved', sw: 'Imeidhinishwa' },
    Rejected: { en: 'Rejected', sw: 'Imekataliwa' },
    Completed: { en: 'Completed', sw: 'Imekamilika' },
};

export default function LicenseApplicationsManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const {
    applications,
    total,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    refresh,
  } = useLicenseApplications();

  useEffect(() => {
    refresh();
  }, [searchTerm, statusFilter, typeFilter, currentPage, refresh]);

  const formatDate = (date: any) => {
    if (!date) return '-';
    return new Date(date.seconds * 1000).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US');
  };
  
  const stats = {
    total: total,
    pending: applications.filter(e => e.status === 'Pending').length,
    underReview: applications.filter(e => e.status === 'Under Review').length,
    approved: applications.filter(e => e.status === 'Approved').length,
    rejected: applications.filter(e => e.status === 'Rejected').length,
  };

  if (error && !isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{t('licenseApplicationsManagement')}</h1>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-destructive">
                <p>{t('error')}: {error}</p>
                <Button onClick={() => refresh()} className="mt-4">{t('retry')}</Button>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('licenseApplicationsManagement')}</h1>
          <Button onClick={() => refresh()}><RefreshCw className="h-4 w-4 mr-2" />{t('refresh')}</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">{t('total')}</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center mb-2"><Clock className="h-6 w-6 text-yellow-500" /></div><p className="text-3xl font-bold text-yellow-600">{stats.pending}</p><p className="text-sm text-muted-foreground">{t('pending')}</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center mb-2"><RefreshCw className="h-6 w-6 text-blue-500" /></div><p className="text-3xl font-bold text-blue-600">{stats.underReview}</p><p className="text-sm text-muted-foreground">{t('inReview')}</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center mb-2"><CheckCircle className="h-6 w-6 text-green-500" /></div><p className="text-3xl font-bold text-green-600">{stats.approved}</p><p className="text-sm text-muted-foreground">{t('approved')}</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center mb-2"><XCircle className="h-6 w-6 text-red-500" /></div><p className="text-3xl font-bold text-red-600">{stats.rejected}</p><p className="text-sm text-muted-foreground">{t('rejected')}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('applications')}</CardTitle>
              <div className="flex gap-2">
                <Input placeholder={t('searchByName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64" />
                <Select onValueChange={setStatusFilter} defaultValue="all">
                  <SelectTrigger className="w-48"><SelectValue placeholder={t('status')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allStatuses')}</SelectItem>
                    {Object.keys(STATUS_TRANSLATIONS).map(status => (
                        <SelectItem key={status} value={status}>{STATUS_TRANSLATIONS[status][language]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={setTypeFilter} defaultValue="all">
                  <SelectTrigger className="w-48"><SelectValue placeholder={t('type')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allTypes')}</SelectItem>
                    <SelectItem value="New License">{t('newLicense')}</SelectItem>
                    <SelectItem value="License Renewal">{t('licenseRenewal')}</SelectItem>
                    <SelectItem value="LATRA Exam">{t('latraExam')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reference')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('phone')}</TableHead>
                    <TableHead>{t('region')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('submittedOn')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto my-16" /></TableCell></TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-12"><FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{t('noApplicationsFound')}</p></TableCell></TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-mono text-sm">{application.id}</TableCell>
                        <TableCell>{application.application_type}</TableCell>
                        <TableCell>{application.full_name}</TableCell>
                        <TableCell>{application.phone_number}</TableCell>
                        <TableCell>{application.region}</TableCell>
                        <TableCell><Badge className={STATUS_COLORS[application.status]}>{STATUS_TRANSLATIONS[application.status][language]}</Badge></TableCell>
                        <TableCell>{formatDate(application.submission_date)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/license-application/${application.id}`)}><Eye className="h-4 w-4 mr-2" />{t('view')}</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">{t('showing').replace('{count}', applications.length.toString()).replace('{total}', total.toString())}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0 || isLoading}>{t('previous')}</Button>
                  <span className="text-sm flex items-center">{t('page')} {currentPage + 1} {t('of')} {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages - 1 || isLoading}>{t('next')}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
