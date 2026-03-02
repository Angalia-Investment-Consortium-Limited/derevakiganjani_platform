import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, Mail, Phone, CheckCircle2, AlertCircle, LogOut, MessageSquare, XCircle, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EmployerProfile } from '@/types/auth';

const PendingVerification = () => {
  const { profile, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const employerProfile = profile as EmployerProfile;

  const status = employerProfile?.verificationStatus?.toLowerCase() || 'pending';

  const statusConfig = {
    pending: {
      icon: <Clock className="h-12 w-12 text-warning" />,
      title: t('Account Pending Verification'),
      description: t('We are currently reviewing your company details.'),
      cardClass: 'border-warning',
      alertClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      alertIcon: <Clock className="h-4 w-4 !text-yellow-600" />,
      alertTitle: 'Awaiting Approval'
    },
    rejected: {
      icon: <XCircle className="h-12 w-12 text-destructive" />,
      title: t('Account Verification Rejected'),
      description: t('Your account could not be verified at this time.'),
      cardClass: 'border-destructive',
      alertClass: 'bg-red-50 border-red-200 text-red-800',
      alertIcon: <XCircle className="h-4 w-4 !text-red-600" />,
      alertTitle: 'Reason for Rejection'
    },
    suspended: {
      icon: <ShieldAlert className="h-12 w-12 text-orange-500" />,
      title: t('Account Suspended'),
      description: t('Your account has been temporarily suspended.'),
      cardClass: 'border-orange-500',
      alertClass: 'bg-orange-50 border-orange-200 text-orange-800',
      alertIcon: <ShieldAlert className="h-4 w-4 !text-orange-600" />,
      alertTitle: 'Reason for Suspension'
    },
  };

  const currentStatusConfig = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/ingia');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <Card className={`border-2 ${currentStatusConfig.cardClass}`}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`rounded-full bg-opacity-10 p-4 bg-${status === 'rejected' ? 'destructive' : status === 'suspended' ? 'orange-500' : 'warning'}`}>
                  {currentStatusConfig.icon}
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">
                {currentStatusConfig.title}
              </CardTitle>
              <CardDescription className="text-base">
                {currentStatusConfig.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {employerProfile?.remarks && (
                <Alert variant="default" className={currentStatusConfig.alertClass}>
                  {currentStatusConfig.alertIcon}
                  <AlertTitle>{currentStatusConfig.alertTitle}</AlertTitle>
                  <AlertDescription>
                    <p className="whitespace-pre-wrap">{employerProfile.remarks}</p>
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t('companyName')}:</strong> {employerProfile?.company_name}
                </AlertDescription>
              </Alert>

              {status === 'pending' && (
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">{t('whatHappensNext')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('verificationProcessDesc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">{t('expectedTimeline')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('verificationTimelineDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">{t('needUrgentHelp')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('urgentHelpDesc')}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('emailLabel')}</p>
                      <p className="text-sm font-medium">support@derevakiganjani.mdvfleet.co.tz</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('phoneLabel')}</p>
                      <p className="text-sm font-medium">+255 748 467 348</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/employer/settings')}
                >
                  {t('viewProfile')}
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>{t('poweredBy')}</p>
            <p className="font-semibold text-foreground">Dereva Kiganjani - MDV Vehicle Fleet Limited</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PendingVerification;
