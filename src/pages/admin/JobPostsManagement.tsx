import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit, Trash2, Plus, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import useDebounce from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
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
import { useLanguage } from '@/contexts/LanguageContext';

const STATUS_TRANSLATIONS: Record<string, any> = {
    Open: { en: 'Published', sw: 'Imechapishwa' },
    draft: { en: 'Draft', sw: 'Rasimu' },
    Closed: { en: 'Closed', sw: 'Imefungwa' },
};

const JobPostsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<{ id: string; title: string } | null>(null);

  const {
    jobs,
    total,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    deleteJob,
    deleting,
    refresh,
  } = useAdminJobs();

  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  useEffect(() => {
    refresh();
  }, [debouncedSearchQuery, statusFilter, currentPage, refresh]);

  const handleDeleteClick = (jobId: string, jobTitle: string) => {
    setJobToDelete({ id: jobId, title: jobTitle });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      await deleteJob(jobToDelete.id);
      toast({ title: t('success'), description: t('jobPostDeleted').replace('{title}', jobToDelete.title) });
      setDeleteDialogOpen(false);
      setJobToDelete(null);
      refresh();
    } catch (err: any) {
      toast({ title: t('error'), description: err.message || t('failedToDeleteJobPost'), variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('jobPostsManagement')}</h1>
          <p className="text-muted-foreground">{t('manageJobPosts')}</p>
        </div>
        <Button onClick={() => navigate('/admin/jobs/new')}>
          <Plus className="h-4 w-4 mr-2" />
          {t('newJobPost')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('allJobPosts')}</CardTitle>
          <CardDescription>{t('total').replace('{total}', total.toString())} {t('jobPosts').toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('searchByTitle')} className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                {Object.keys(STATUS_TRANSLATIONS).map(status => (
                    <SelectItem key={status} value={status}>{STATUS_TRANSLATIONS[status][language]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('jobTitle')}</TableHead>
                  <TableHead>{t('employer')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('applications')}</TableHead>
                  <TableHead>{t('postedOn')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto my-16" /></TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-destructive">{error}</TableCell></TableRow>
                ) : jobs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center">{t('noJobPostsFound')}</TableCell></TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.employerId}</TableCell>
                      <TableCell>
                        <Badge variant={job.status === 'Open' ? 'default' : 'secondary'}>{STATUS_TRANSLATIONS[job.status] ? STATUS_TRANSLATIONS[job.status][language] : job.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{0}</TableCell>
                      <TableCell>{new Date((job.postedOn as any).seconds * 1000).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/jobs/${job.id}`)}><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(job.id, job.title)} disabled={deleting}>
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">{t('showing').replace('{count}', jobs.length.toString()).replace('{total}', total.toString())} {t('jobPosts').toLowerCase()}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0 || isLoading}>{t('previous')}</Button>
                <span className="text-sm flex items-center">{t('page')} {currentPage + 1} {t('of')} {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages - 1 || isLoading}>{t('next')}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteJobPostConfirmation').replace('{title}', jobToDelete?.title || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting} className="bg-destructive hover:bg-destructive/90">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AdminLayout>
  );
};

export default JobPostsManagement;
