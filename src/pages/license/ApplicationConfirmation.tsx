import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApplicationDetails } from '@/hooks/useApplications';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function ApplicationConfirmation() {
  const { refNo } = useParams<{ refNo: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!refNo) {
    navigate('/license');
    return null;
  }

  const { 
    application, 
    isLoading: isLoadingApplication, 
    error: applicationError 
  } = useApplicationDetails(refNo);

  const renderStatus = () => {
    if (isLoadingApplication) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold">{t('processing_payment')}</h1>
          <p className="text-muted-foreground">{t('please_wait_payment')}</p>
        </div>
      );
    }

    if (applicationError) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">{t('payment_error_title')}</h1>
                <p className="text-muted-foreground max-w-md">
                    {t('Payment Error Message')}: {applicationError}
                </p>
                <Button onClick={() => window.location.reload()} className="mt-6">{t('Try Again')}</Button>
            </div>
        );
    }

    const finalStatus = application?.status;

    switch (finalStatus) {
      case 'pending-review':
      case 'approved':
        return (
           <div className="text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-green-700">{t('payment_successful')}</h1>
                <p className="text-muted-foreground mb-6">{t('application_under_review')}</p>
                <div className="flex gap-4 justify-center">
                    <Button asChild><Link to="/license/my-applications">{t('view_my_applications')}</Link></Button>
                    <Button asChild variant="outline"><Link to="/dashboard">{t('back_to_dashboard')}</Link></Button>
                </div>
            </div>
        );

      case 'payment-failed':
      case 'rejected':
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">{t('payment_failed_title')}</h1>
                <p className="text-muted-foreground">{t('payment_failed_message')}</p>
                <Button asChild className="mt-6"><Link to="/license/my-applications">{t('Try Again')}</Link></Button>
            </div>
        );

      case 'pending-payment':
        return (
             <div className="flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <h1 className="text-2xl font-bold">{t('redirecting_to_payment')}</h1>
                <p className="text-muted-foreground">{t('A USSD prompt has been sent to your phone. Please enter your PIN to authorize the payment.')}</p>
            </div>
        );

      default:
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
                <h1 className="text-2xl font-bold">{t('unknown_status')}</h1>
                <p className="text-muted-foreground">{t('checking_application_status')}</p>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg">
            <CardContent className="p-4 sm:p-6">
                {renderStatus()}
            </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
