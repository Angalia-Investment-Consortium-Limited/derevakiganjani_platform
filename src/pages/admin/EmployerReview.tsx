
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2, Building, Phone, Mail, MapPin, Link as LinkIcon, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEmployerReview } from '@/hooks/useEmployerVerification';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Verified: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_TRANSLATIONS: Record<string, any> = {
    Pending: { en: 'Pending', sw: 'Inasubiri' },
    Verified: { en: 'Verified', sw: 'Imethibitishwa' },
    Rejected: { en: 'Rejected', sw: 'Imekataliwa' },
};

export default function EmployerReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const { employer, isLoading, error, isUpdating, updateVerificationStatus, refresh } = useEmployerReview(id || null);

  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (employer) {
      setRemarks(employer.verification_remarks || '');
    }
  }, [employer]);

  const handleUpdateStatus = async (newStatus: 'Verified' | 'Rejected') => {
    try {
      await updateVerificationStatus(newStatus, remarks);
      toast({ title: t('success'), description: t('verificationStatusUpdated') });
      refresh();
    } catch (err: any) {
      toast({ title: t('error'), description: err.message || t('failedToUpdateStatus'), variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6"><Skeleton className="h-72 w-full" /></div>
            <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !employer) {
    return (
      <AdminLayout>
        <Button variant="ghost" onClick={() => navigate('/admin/employer-verification')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />{t('backToList')}</Button>
        <Card className="border-destructive"><CardContent className="pt-6 text-center py-8"><p className="text-destructive">{error || t('employerNotFound')}</p></CardContent></Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Button variant="ghost" onClick={() => navigate('/admin/employer-verification')} className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" />{t('backToEmployerVerification')}</Button>

      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{employer.company_name}</h1>
          <p className="text-muted-foreground">{t('reviewEmployerVerification')}</p>
        </div>
        <Badge className={`${STATUS_COLORS[employer.verification_status]} text-base`}>{STATUS_TRANSLATIONS[employer.verification_status]?.[language] || employer.verification_status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('companyInformation')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label={t('companyName')} value={employer.company_name} icon={<Building />} />
              <InfoItem label={t('companyType')} value={employer.company_type} />
              <InfoItem label={t('companyRegistrationNumber')} value={employer.company_registration} />
              <InfoItem label={t('phone')} value={employer.phone} icon={<Phone />} />
              <InfoItem label={t('email')} value={employer.email} icon={<Mail />} />
              <InfoItem label={t('website')} value={employer.website} icon={<LinkIcon />} isLink />
              <InfoItem label={t('address')} value={`${employer.address}, ${employer.district}, ${employer.region}`} icon={<MapPin />} />
            </CardContent>
          </Card>

          {employer.documents && employer.documents.length > 0 && (
            <Card>
              <CardHeader><CardTitle>{t('submittedDocuments')}</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {employer.documents.map((doc: any, i: number) => (
                  <a href={doc.url} key={i} target="_blank" rel="noopener noreferrer" className="border rounded-lg p-4 hover:bg-muted/50 transition-colors flex items-center gap-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                        <p className="font-semibold">{doc.type}</p>
                        <p className="text-sm text-muted-foreground">{t('clickToView')}</p>
                    </div>
                    <Download className="h-5 w-5 ml-auto text-muted-foreground" />
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('verificationActions')}</CardTitle><CardDescription>{t('verificationActionsDesc')}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="remarks">{t('verificationRemarks')}</Label>
                <Textarea id="remarks" placeholder={t('addRemarksPlaceholder')} value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={4} />
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleUpdateStatus('Verified')} disabled={isUpdating || employer.verification_status === 'Verified'} className="w-full">
                  {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />} {t('approveVerification')}
                </Button>
                <Button variant="destructive" onClick={() => handleUpdateStatus('Rejected')} disabled={isUpdating || employer.verification_status === 'Rejected'} className="w-full">
                  {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />} {t('rejectVerification')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

const InfoItem = ({ label, value, icon, isLink = false }: { label: string; value?: string; icon?: React.ReactNode; isLink?: boolean }) => {
  if (!value) return null;
  return (
    <div className="flex gap-3 items-start">
      {icon && <div className="mt-1 text-muted-foreground">{icon}</div>}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        {isLink ? 
          <a href={value} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{value}</a> : 
          <p className="font-medium">{value}</p>
        }
      </div>
    </div>
  );
};
