import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Users,
  Search,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useEmployerVerificationManagement } from '@/hooks/useEmployerVerification';
import useDebounce from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
import type { EmployerVerification } from '@/types/jobs';
import { useLanguage } from '@/contexts/LanguageContext';

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Verified': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
};

const STATUS_TRANSLATIONS: Record<string, any> = {
    Pending: { en: 'Pending', sw: 'Inasubiri' },
    Verified: { en: 'Verified', sw: 'Imethibitishwa' },
    Rejected: { en: 'Rejected', sw: 'Imekataliwa' },
};

export default function EmployerVerificationManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t } = useLanguage();

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
    currentPage,
    setCurrentPage,
    totalPages,
  } = useEmployerVerificationManagement();

  const [debouncedSearchQuery] = useDebounce(searchTerm, 500);

  useEffect(() => {
    refresh();
  }, [debouncedSearchQuery, statusFilter, currentPage, refresh]);

  const handleStatusUpdate = async (employerId: string, newStatus: 'Verified' | 'Rejected') => {
    try {
      await reviewEmployer(employerId, newStatus);
      toast({ title: t('success'), description: t('employerStatusUpdated').replace('{status}', newStatus) });
      refresh();
    } catch (err: any) {
      toast({ title: t('error'), description: err.message || t('failedToUpdateStatus'), variant: 'destructive' });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    return new Date(date.seconds * 1000).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US');
  };

  const stats = {
    total: total,
    pending: employers.filter(e => e.status === 'Pending').length,
    verified: employers.filter(e => e.status === 'Verified').length,
    rejected: employers.filter(e => e.status === 'Rejected').length,
  };

  if (error && !isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{t('employerVerificationManagement')}</h1>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-destructive">
                <p>{t('failedToLoadEmployers')}: {error}</p>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">{t('employerVerificationManagement')}</h1>
          <Button onClick={() => refresh()}><RefreshCw className="h-4 w-4 mr-2" />{t('refresh')}</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">{t('total')}</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center mb-2"><Clock className="h-6 w-6 text-yellow-500" /></div><p className="text-3xl font-bold text-yellow-600">{stats.pending}</p><p className="text-sm text-muted-foreground">{t('pending')}</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center mb-2"><CheckCircle className="h-6 w-6 text-green-500" /></div><p className="text-3xl font-bold text-green-600">{stats.verified}</p><p className="text-sm text-muted-foreground">{t('verified')}</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><div className="flex items-center justify-center mb-2"><XCircle className="h-6 w-6 text-red-500" /></div><p className="text-3xl font-bold text-red-600">{stats.rejected}</p><p className="text-sm text-muted-foreground">{t('rejected')}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('verificationRequests')}</CardTitle>
              <div className="flex gap-2">
                <Input placeholder={t('searchByCompanyName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64" />
                <Select onValueChange={setStatusFilter} defaultValue="all">
                  <SelectTrigger className="w-48"><SelectValue placeholder={t('status')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allStatuses')}</SelectItem>
                    {Object.keys(STATUS_TRANSLATIONS).map(status => (
                        <SelectItem key={status} value={status}>{STATUS_TRANSLATIONS[status][language]}</SelectItem>
                    ))}
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
                    <TableHead>{t('companyName')}</TableHead>
                    <TableHead>{t('contactPerson')}</TableHead>
                    <TableHead>{t('phone')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('submittedOn')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto my-16" /></TableCell></TableRow>
                  ) : employers.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12"><Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{t('noVerificationRequestsFound')}</p></TableCell></TableRow>
                  ) : (
                    employers.map((employer) => (
                      <TableRow key={employer.id}>
                        <TableCell className="font-medium">{employer.company_name}</TableCell>
                        <TableCell>{employer.employer_name}</TableCell>
                        <TableCell>{(employer as any).phone}</TableCell>
                        <TableCell>{(employer as any).email}</TableCell>
                        <TableCell><Badge className={STATUS_COLORS[employer.status]}>{STATUS_TRANSLATIONS[employer.status][language]}</Badge></TableCell>
                        <TableCell>{formatDate(employer.date_submitted)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/employer-review/${employer.id}`)}><Eye className="h-4 w-4 mr-2" />{t('review')}</Button>
                          {employer.status === 'Pending' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(employer.id, 'Verified')} disabled={reviewing}><CheckCircle className="h-4 w-4 mr-2 text-green-500" />{t('approve')}</Button>
                              <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(employer.id, 'Rejected')} disabled={reviewing}><XCircle className="h-4 w-4 mr-2 text-red-500" />{t('reject')}</Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">{t('showing').replace('{count}', employers.length.toString()).replace('{total}', total.toString())}</p>
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
