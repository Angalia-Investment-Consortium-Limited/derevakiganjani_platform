
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Users, Search, Eye, RefreshCw, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEmployerVerificationManagement, useEmployerReview } from '@/hooks/useEmployerVerification';
import useDebounce from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'border-yellow-200 bg-yellow-100 text-yellow-800',
  Verified: 'border-green-200 bg-green-100 text-green-800',
  Rejected: 'border-red-200 bg-red-100 text-red-800',
};

const STATUS_TRANSLATIONS: Record<string, any> = {
    Pending: { en: 'Pending', sw: 'Inasubiri' },
    Verified: { en: 'Verified', sw: 'Imethibitishwa' },
    Rejected: { en: 'Rejected', sw: 'Imekataliwa' },
};

export default function EmployerVerificationManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const {
    employers,
    total,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    refresh,
  } = useEmployerVerificationManagement();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    refresh();
  }, [debouncedSearchTerm, statusFilter, currentPage]); // `refresh` is stable

  const formatDate = (date: any) => {
    if (!date?.seconds) return '-';
    return new Date(date.seconds * 1000).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US');
  };
  
  // This calculation is better done on the backend or inside the hook, 
  // but for now, we'll keep it here for the stats cards.
  const stats = {
    total: total,
    pending: statusFilter === 'Pending' ? total : employers.filter(e => e.status === 'Pending').length, // Example of optimization
    verified: statusFilter === 'Verified' ? total : employers.filter(e => e.status === 'Verified').length,
    rejected: statusFilter === 'Rejected' ? total : employers.filter(e => e.status === 'Rejected').length,
  };

  if (error && !isLoading) {
    return (
      <AdminLayout>
        <h1 className="text-3xl font-bold">{t('employerVerificationManagement')}</h1>
        <Card className="mt-4"><CardContent className="pt-6 text-center text-destructive"><p>{t('failedToLoadEmployers')}: {error}</p><Button onClick={refresh} className="mt-4">{t('retry')}</Button></CardContent></Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">{t('employerVerificationManagement')}</h1>
          <Button onClick={refresh} disabled={isLoading}><RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />{t('refresh')}</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title={t('total')} value={stats.total} icon={<Users />} isLoading={isLoading} />
          <StatCard title={t('pending')} value={stats.pending} icon={<Clock />} color="text-yellow-600" isLoading={isLoading} />
          <StatCard title={t('verified')} value={stats.verified} icon={<CheckCircle />} color="text-green-600" isLoading={isLoading} />
          <StatCard title={t('rejected')} value={stats.rejected} icon={<XCircle />} color="text-red-600" isLoading={isLoading} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <CardTitle>{t('verificationRequests')}</CardTitle>
              <div className="flex gap-2 w-full md:w-auto">
                <Input placeholder={t('searchByCompanyName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow" />
                <Select onValueChange={setStatusFilter} value={statusFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
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
                    <TableHead>{t('phone')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('submittedOn')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={6} className="h-12" /></TableRow>)
                  ) : employers.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12"><Users className="h-12 w-12 mx-auto text-muted-foreground" /><p className="mt-2 text-muted-foreground">{t('noVerificationRequestsFound')}</p></TableCell></TableRow>
                  ) : (
                    employers.map((employer) => (
                      <TableRow key={employer.id}>
                        <TableCell className="font-medium">{employer.company_name}</TableCell>
                        <TableCell>{employer.phone || 'N/A'}</TableCell>
                        <TableCell>{employer.email || 'N/A'}</TableCell>
                        <TableCell><Badge className={STATUS_COLORS[employer.status]}>{STATUS_TRANSLATIONS[employer.status]?.[language] || employer.status}</Badge></TableCell>
                        <TableCell>{formatDate(employer.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/employer-review/${employer.id}`)}><Eye className="h-4 w-4 mr-2" />{t('review')}</Button>
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
                  <span className="flex items-center text-sm">{t('page')} {currentPage + 1} {t('of')} {totalPages}</span>
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

const StatCard = ({ title, value, icon, color, isLoading }: { title: string, value: number, icon: React.ReactNode, color?: string, isLoading: boolean }) => (
    <Card>
        <CardContent className="pt-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{title}</p>
                <div className={color}>{icon}</div>
            </div>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin mt-1" /> : <p className={`text-3xl font-bold ${color}`}>{value}</p>}
        </CardContent>
    </Card>
);
