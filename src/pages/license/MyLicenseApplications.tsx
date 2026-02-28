
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMyApplications } from '@/hooks/useApplications';
import { STATUS_COLORS } from '@/types/license';
import { Loader2, AlertTriangle, FilePlus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function MyLicenseApplications() {
  const { t } = useLanguage();
  const { applications, isLoading, error } = useMyApplications();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">{t('loading_applications')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-semibold text-destructive">{t('error_loading_applications')}</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <FilePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('no_applications_found')}</h3>
          <p className="text-muted-foreground mb-6">{t('start_new_application_prompt')}</p>
          <Button asChild>
            <Link to="/license">{t('apply_for_license')}</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <Link to={`/license/application/${app.id}`} className="block">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                    <div className="md:col-span-2">
                        <p className="font-semibold text-primary">{app.applicationType}</p>
                        <p className="text-sm text-muted-foreground">{t('ref_no')}: {app.id}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">{t('submission_date')}</p>
                        <p className="text-sm text-muted-foreground">{app.submittedOn ? format(app.submittedOn.toDate(), 'PPP') : 'N/A'}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <Badge className={`${STATUS_COLORS[app.status] || 'bg-gray-200'}`}>
                           {t(app.status.replace(/-/g, '_'))}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('my_license_applications')}</CardTitle>
              <CardDescription>{t('view_history_and_status')}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
