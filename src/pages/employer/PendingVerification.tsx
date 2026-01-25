import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, Mail, Phone, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EmployerProfile } from '@/types/auth';

const PendingVerification = () => {
  const { profile, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const employerProfile = profile as EmployerProfile;

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
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-warning/10 p-4">
                  <Clock className="h-12 w-12 text-warning" />
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">
                {t('accountPendingVerification')}
              </CardTitle>
              <CardDescription className="text-base">
                {t('accountPendingVerificationDesc')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Company Info */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t('companyName')}:</strong> {employerProfile?.company_name}
                </AlertDescription>
              </Alert>

              {/* Status Information */}
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

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{t('emailNotification')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('emailNotificationDesc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* What We're Reviewing */}
              <div>
                <h3 className="font-semibold mb-3">{t('whatWeReReviewing')}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('companyRegistrationDetails')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('contactInformation')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('businessLegitimacy')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('complianceRequirements')}
                  </li>
                </ul>
              </div>

              {/* Contact Information */}
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

              {/* Actions */}
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

              {/* Additional Info */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {t('verificationInfoNote')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Company Branding */}
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
