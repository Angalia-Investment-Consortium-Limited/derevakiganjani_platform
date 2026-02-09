import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJiTesti } from '@/hooks/useJiTesti';
import PaymentForm from '@/components/jitesti/PaymentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

export default function PaymentPage() {
  const { categoryCode } = useParams<{ categoryCode: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useCategoriesList } = useJiTesti();

  // Get categories to find the selected one
  const { data: categories, isLoading: categoriesLoading } = useCategoriesList();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentData, setPaymentData] = useState<any>(null);

  // Find the selected category
  const category = categories?.find(cat => cat.category_code === categoryCode);

  useEffect(() => {
    if (!categoriesLoading && !category) {
      toast({
        title: t('error') || 'Error',
        description: t('categoryNotFound') || 'Test category not found',
        variant: 'destructive',
      });
      navigate('/jitesti');
    }
  }, [categories, category, categoriesLoading, navigate, toast, t]);

  const handlePaymentSubmit = async (paymentData: any) => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const initiateSelcomPayment = httpsCallable(functions, 'initiateSelcomPayment');
      const result: any = await initiateSelcomPayment({
        category_code: categoryCode,
        payment_method: paymentData.paymentMethod,
        phone_number: paymentData.phoneNumber,
      });

      if (result.data.success) {
        setPaymentStatus('success');
        setPaymentData(result.data);

        toast({
          title: t('paymentInitiated') || 'Payment Initiated',
          description: t('paymentInstructions') || 'Please complete the payment on your mobile device.',
        });

        // Redirect to test taking after a delay
        setTimeout(() => {
          navigate(`/jitesti/test/${categoryCode}?payment=${result.data.referenceNumber}`);
        }, 3000);
      } else {
        throw new Error(result.data.message);
      }
    } catch (error: any) {
      setPaymentStatus('error');
      toast({
        title: t('paymentFailed') || 'Payment Failed',
        description: error.message || t('tryAgain') || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('error') || 'Error'}</AlertTitle>
            <AlertDescription>
              {t('categoryNotFound') || 'Test category not found'}
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = language === 'sw' ? category.name_sw : category.name_en;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">
              {t('completePayment') || 'Complete Payment'}
            </h1>
            <p className="text-muted-foreground">
              {t('payForTest') || 'Pay for'} {categoryName}
            </p>
          </div>

          {/* Test Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {categoryName}
              </CardTitle>
              <CardDescription>
                {language === 'sw' ? category.description_sw : category.description_en}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t('duration') || 'Duration'}:</span> {category.duration_minutes} {t('minutes') || 'min'}
                </div>
                <div>
                  <span className="font-medium">{t('questions') || 'Questions'}:</span> {category.total_questions}
                </div>
                <div>
                  <span className="font-medium">{t('passMark') || 'Pass Mark'}:</span> {category.pass_mark}%
                </div>
                <div className="text-lg font-bold text-green-600">
                  {t('amount') || 'Amount'}: {category.price.toLocaleString()} TZS
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <PaymentForm
            category={category}
            onSubmit={handlePaymentSubmit}
            isProcessing={isProcessing}
          />

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/jitesti')}
              className="flex-1"
              disabled={isProcessing}
            >
              {t('back') || 'Back'}
            </Button>
          </div>

          {/* Status Messages */}
          {paymentStatus === 'success' && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>{t('paymentSubmitted') || 'Payment Submitted'}</AlertTitle>
              <AlertDescription>
                {t('paymentVerification') || 'Your payment is being verified. You will be redirected to start your test shortly.'}
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('paymentFailed') || 'Payment Failed'}</AlertTitle>
              <AlertDescription>
                {t('tryAgain') || 'Please try again or contact support if the problem persists.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
