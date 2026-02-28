
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApplicationDetails } from '@/hooks/useApplications';
import { ApplicationStatus, STATUS_COLORS, DOCUMENT_TYPE_TRANSLATIONS } from '@/types/license';
import { Loader2, AlertTriangle, FileText, ArrowLeft, Download, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10">
          <div className="text-center py-20">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <p className="mt-4 text-lg font-semibold text-destructive">{t('invalid_application_id')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { application, isLoading, error } = useApplicationDetails(id);

  const renderAdminFeedback = () => {
    if (!application || (!application.adminNotes && !application.applicantAdvice)) return null;

    return (
      <Card className="mt-6 bg-amber-50 border-amber-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <MessageSquare className="h-5 w-5" />
            {t('feedback_from_admin')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {application.applicantAdvice && (
            <div>
              <h4 className="font-semibold">{t('advice_for_you')}</h4>
              <p className="text-sm text-amber-800">{application.applicantAdvice}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-20"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" /></div>;
    }

    if (error) {
      return (
        <div className="text-center py-20 bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
          <p className="mt-4 text-lg font-semibold text-destructive">{t('error_fetching_details')}</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (!application) {
      return (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">{t('application_not_found')}</p>
        </div>
      );
    }
    
    const status = String(application.status) as ApplicationStatus;
    const badgeColor = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

    return (
      <div className="space-y-6">
        {renderAdminFeedback()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('application_details')}</CardTitle>
                <CardDescription>{t('ref_no')}: {application.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('application_type')}</p>
                    <p className="font-semibold">{application.applicationType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('status')}</p>
                    <Badge className={badgeColor}>{t(status.replace(/-/g, '_'))}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('submitted_on')}</p>
                    <p>{application.submittedOn ? format(application.submittedOn.toDate(), 'PPPpp') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('last_updated')}</p>
                    <p>{application.lastUpdated ? format(application.lastUpdated.toDate(), 'PPPpp') : 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('license_categories')}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {application.categories.map(cat => <Badge key={cat} variant="secondary">{cat}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{t('applicant_information')}</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('full_name')}</p>
                  <p>{application.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('email')}</p>
                  <p>{application.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('phone_number')}</p>
                  <p>{application.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('region_district')}</p>
                  <p>{application.region}, {application.district}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{t('submitted_documents')}</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {application.documents.map(doc => (
                    <li key={doc.name} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                      <span className="font-medium text-sm">{DOCUMENT_TYPE_TRANSLATIONS[doc.name] || doc.name}</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          {t('view')}
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {application.status === 'payment-failed' && (
              <Card className="border-destructive">
                <CardHeader><CardTitle className="text-destructive">{t('payment_required')}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{t('payment_failed_prompt')}</p>
                  <Button asChild className="w-full">
                    <Link to={`/license/confirmation/${application.id}`}>{t('retry_payment')}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link to="/license/my-applications" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('back_to_applications')}
              </Link>
            </Button>
          </div>
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
