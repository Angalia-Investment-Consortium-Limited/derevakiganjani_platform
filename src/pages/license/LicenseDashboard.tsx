
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMyApplications } from '@/hooks/useApplications';
import { ApplicationStatus, STATUS_COLORS } from '@/types/license';
import {
  FileText,
  RefreshCw,
  ClipboardCheck,
  ArrowRight,
  History,
  Search,
  MessageSquare,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const services = [
  { id: 'new', titleSw: 'Leseni Mpya', titleEn: 'New License', descSw: 'Omba leseni mpya ya udereva', descEn: 'Apply for a new driving license', icon: FileText, path: '/license/apply/new' },
  { id: 'renewal', titleSw: 'Kufanya Upya Leseni', titleEn: 'License Renewal', descSw: 'Fanya upya leseni yako ya udereva', descEn: 'Renew your existing driving license', icon: RefreshCw, path: '/license/apply/renewal' },
  { id: 'latra', titleSw: 'Jisajili Mtihani wa LATRA', titleEn: 'LATRA Exam Registration', descSw: 'Jisajili kwa mtihani wa udereva wa LATRA (PSV/HGV)', descEn: 'Register for LATRA driving exam (PSV/HGV)', icon: ClipboardCheck, path: '/license/apply/latra' },
];

const quickActions = [
  { id: 'my-apps', titleSw: 'Maombi Yangu', titleEn: 'My Applications', descSw: 'Angalia maombi yako yote', descEn: 'View all your applications', icon: History, path: '/license/my-applications' },
  { id: 'track', titleSw: 'Fuatilia Hali', titleEn: 'Track Status', descSw: 'Fuatilia hali ya ombi lako', descEn: 'Track your application status', icon: Search, path: '/license/track' },
  { id: 'support', titleSw: 'Msaada', titleEn: 'Contact Support', descSw: 'Tuma ujumbe ofisini', descEn: 'Send a message to support', icon: MessageSquare, path: '/license/my-requests' },
];

export default function LicenseDashboard() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Fetch recent applications for the current user
  const { applications, isLoading, error } = useMyApplications();

  const recentApplications = useMemo(() => {
    return applications.slice(0, 3);
  }, [applications]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">{t('Dashboard')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Leseni</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">{t('License Services Dashboard')}</h1>
            <p className="text-lg text-muted-foreground">{t('Manage your license applications')}</p>
          </header>

          {/* Main Service Cards */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <service.icon className="h-8 w-8 text-primary" />
                      <CardTitle>{language === 'sw' ? service.titleSw : service.titleEn}</CardTitle>
                    </div>
                    <CardDescription>{language === 'sw' ? service.descSw : service.descEn}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate(service.path)} className="w-full">
                      {t('Start Now')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Applications Section */}
            <section className="lg:col-span-2">
              <h2 className="text-2xl font-bold tracking-tight mb-4">{t('Recent Applications')}</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {isLoading && (
                      <div className="p-8 text-center"><Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" /></div>
                    )}
                    {error && (
                      <div className="p-8 text-center text-red-600"><AlertTriangle className="h-8 w-8 mx-auto mb-2" /><p>{error}</p></div>
                    )}
                    {!isLoading && !error && recentApplications.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2" />
                        <p>{t('No Recent Applications')}</p>
                      </div>
                    )}
                    {!isLoading && !error && recentApplications.map(app => (
                      <div key={app.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <p className="font-semibold">{app.applicationType}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('Submitted On')}: {app.submittedOn ? format(app.submittedOn.toDate(), 'PPP') : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[app.status] || 'bg-gray-200'}`}>
                            {t(app.status.replace(/-/g, '_'))}
                          </span>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/license/application/${app.id}`}>{t('View Details')}</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                {recentApplications.length > 0 && (
                  <CardHeader className="border-t">
                    <Button variant="secondary" className="w-full" asChild>
                      <Link to="/license/my-applications">{t('View All Applications')}</Link>
                    </Button>
                  </CardHeader>
                )}
              </Card>
            </section>

            {/* Quick Actions Section */}
            <aside>
              <h2 className="text-2xl font-bold tracking-tight mb-4">{t('Quick Actions')}</h2>
              <div className="space-y-4">
                {quickActions.map(action => (
                  <Card key={action.id} className="hover:bg-gray-50 transition-colors">
                    <Link to={action.path} className="block p-4">
                      <div className="flex items-center gap-4">
                        <action.icon className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{language === 'sw' ? action.titleSw : action.titleEn}</p>
                          <p className="text-sm text-muted-foreground">{language === 'sw' ? action.descSw : action.descEn}</p>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
