import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RefreshCw, Trash2, Users, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useJobManagement } from '@/hooks/useJobs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-green-100 text-green-800',
  Expired: 'bg-gray-100 text-gray-800',
};

export default function JobManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const {
    jobs,
    total,
    isLoading,
    error,
    filters,
    setFilters: setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    refresh,
    deleteJob
  } = useJobManagement();

  const statusFilter = filters.find(f => f.field === 'status')?.value || 'all';

  const handleDelete = async () => {
    if (jobToDelete) {
      try {
        await deleteJob(jobToDelete);
        toast({ title: t('success'), description: t('jobDeletedSuccessfully') });
        setJobToDelete(null);
      } catch (err: any) {
        toast({ title: t('error'), description: err.message || t('failedToDeleteJob'), variant: 'destructive' });
      }
    }
  };

  const formatDate = (date: any) => {
    if (!date?.seconds) return '-';
    return new Date(date.seconds * 1000).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('Job Management')}</h1>
          <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/admin/jobs/new')} className="bg-primary hover:bg-primary/90">
                {t('Create New Job')}
              </Button>
              <Button onClick={refresh} disabled={isLoading} variant="outline">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />{t('refresh')}
              </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('All Jobs')}</CardTitle>
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('Filter By Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Statuses')}</SelectItem>
                  <SelectItem value="Open">{t('Active')}</SelectItem>
                  <SelectItem value="Expired">{t('Expired')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Title')}</TableHead>
                    <TableHead>{t('Company')}</TableHead>
                    <TableHead>{t('Status')}</TableHead>
                    <TableHead>{t('Posted On')}</TableHead>
                    <TableHead>{t('Expires On')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center">{t('Loading Jobs')}</TableCell></TableRow>
                  ) : error ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-red-500"><span>{error}</span></TableCell></TableRow>
                  ) : jobs.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center">{t('No Jobs Found')}</TableCell></TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.job_title}</TableCell>
                        <TableCell>{job.company_name || 'N/A'}</TableCell>
                        <TableCell><Badge className={STATUS_COLORS[job.status] || ''}>{t(job.status.toLowerCase())}</Badge></TableCell>
                        <TableCell>{formatDate(job.posted_date)}</TableCell>
                        <TableCell>{formatDate(job.expire_date)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}><Edit className="h-4 w-4 mr-2" />{t('edit')}</Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/job-applicants/${job.id}`)}><Users className="h-4 w-4 mr-2" />{t('viewApplicants')}</Button>
                          <AlertDialog onOpenChange={() => setJobToDelete(job.id)}>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('deleteJobWarning')}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setJobToDelete(null)}>{t('Cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>{t('Delete')}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">{t('Showing Page', { currentPage: currentPage + 1, totalPages, totalJobs: total })}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0 || isLoading}>{t('Previous')}</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages - 1 || isLoading}>{t('Next')}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
