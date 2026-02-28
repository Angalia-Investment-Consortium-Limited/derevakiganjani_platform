
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePaymentProcessing } from '@/hooks/usePayments';
import { useApplicationDetails } from '@/hooks/useApplications';
import { CheckCircle, AlertTriangle, Loader2, Home, FileText } from 'lucide-react';

// This is the page the user lands on after submitting their application form.
// It immediately triggers the payment process.
export default function ApplicationConfirmation() {
  const { refNo } = useParams<{ refNo: string }>();
  const [searchParams] = useSearchParams();
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

  const { 
    createPaymentOrder, 
    pollPaymentStatus, 
    isLoading: isProcessingPayment, 
    error: paymentError, 
    paymentStatus 
  } = usePaymentProcessing(refNo);

  const selcomOrderId = searchParams.get('order_id');
  const [pollAttempted, setPollAttempted] = useState(false);

  // Effect to handle the payment flow
  useEffect(() => {
    if (application) {
      // If there's a selcom_order_id in the URL, it means the user is returning from Selcom.
      // We should poll the status.
      if (selcomOrderId && !pollAttempted) {
        setPollAttempted(true);
        pollPaymentStatus(selcomOrderId);
      }
      // If the application status is still pending payment and there's no order_id in the URL,
      // it means we need to create the payment order for the first time.
      else if (application.status === 'pending-payment' && !selcomOrderId) {
        createPaymentOrder();
      }
    }
  }, [application, selcomOrderId, pollAttempted, createPaymentOrder, pollPaymentStatus]);

  const renderStatus = () => {
    // Loading states
    if (isLoadingApplication || isProcessingPayment) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold">{t('processing_payment')}</h1>
          <p className="text-muted-foreground">{t('please_wait_payment')}</p>
        </div>
      );
    }

    // Error states
    if (applicationError || paymentError) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">{t('payment_error_title')}</h1>
                <p className="text-muted-foreground max-w-md">
                    {t('payment_error_message')}: {applicationError || paymentError}
                </p>
                <Button onClick={() => createPaymentOrder()} className="mt-6">{t('try_again')}</Button>
            </div>
        );
    }

    // Final status based on polling or application data
    const finalStatus = paymentStatus || application?.status;

    switch (finalStatus) {
      case 'completed':
      case 'pending-review':
        return (
           <div className="text-center p-8">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h1 className="text-2xl font-bold">{t('payment_successful')}</h1>
                <p className="text-muted-foreground mb-6">{t('application_under_review')}</p>
                <div className="flex gap-4 justify-center">
                    <Button asChild><Link to="/license/my-applications">{t('view_my_applications')}</Link></Button>
                    <Button asChild variant="outline"><Link to="/dashboard">{t('back_to_dashboard')}</Link></Button>
                </div>
            </div>
        );

      case 'failed':
      case 'payment-failed':
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">{t('payment_failed_title')}</h1>
                <p className="text-muted-foreground">{t('payment_failed_message')}</p>
                <Button onClick={() => createPaymentOrder()} className="mt-6">{t('try_again_payment')}</Button>
            </div>
        );

      case 'pending':
      case 'pending-payment':
        return (
             <div className="flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <h1 className="text-2xl font-bold">{t('redirecting_to_payment')}</h1>
                <p className="text-muted-foreground">{t('follow_instructions_on_payment_page')}</p>
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
