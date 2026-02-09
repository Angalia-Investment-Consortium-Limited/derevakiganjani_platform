
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useJobApplicants } from '@/hooks/useJobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Briefcase, Download, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { applicants, job, isLoading, error, refresh } = useJobApplicants(jobId ?? null);

  const formatDate = (date: any) => {
    if (!date?.seconds) return '-';
    return new Date(date.seconds * 1000).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', { dateStyle: 'medium' });
  };

  if (isLoading) {
    return (
        <AdminLayout>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <Button variant="ghost" onClick={() => navigate('/admin/job-management')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />{t('backToJobs')}</Button>
        <Card className="border-destructive"><CardContent className="pt-6 text-center py-8"><p className="text-destructive">{error}</p></CardContent></Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Button variant="ghost" onClick={() => navigate('/admin/job-management')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('backToJobs')}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <Briefcase className="h-6 w-6 text-primary" />
                 <CardTitle className="text-2xl">{job?.title}</CardTitle>
              </div>
              <CardDescription>{t('applicantsForThisJob')}</CardDescription>
            </div>
             <div className="text-right">
                <p className="text-lg font-semibold">{applicants.length}</p>
                <p className="text-sm text-muted-foreground">{t('totalApplicants')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('applicantName')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('appliedOn')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center"><Users className="h-12 w-12 mx-auto text-muted-foreground" /><p className="mt-2">{t('noApplicantsFound')}</p></TableCell></TableRow>
                  ) : (
                    applicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="font-medium">{applicant.full_name}</TableCell>
                        <TableCell>{applicant.email}</TableCell>
                        <TableCell>{formatDate(applicant.applied_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <a href={applicant.cv_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" /> {t('viewCV')}
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
