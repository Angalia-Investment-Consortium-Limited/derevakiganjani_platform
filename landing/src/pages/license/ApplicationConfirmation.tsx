/**
 * Application Confirmation Page
 * 
 * Shows confirmation after successful application submission
 * with reference number and next steps
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCopyToClipboard } from '@/hooks/useLicense';
import { CheckCircle, Copy, Home, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ApplicationConfirmation() {
  const { refNo } = useParams<{ refNo: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { copy, copied } = useCopyToClipboard();

  const handleCopy = () => {
    if (refNo) {
      copy(refNo);
      toast.success(t('Namba ya kumbukumbu imenakiliwa!'));
    }
  };

  useEffect(() => {
    if (!refNo) {
      navigate('/license');
    }
  }, [refNo, navigate]);

  if (!refNo) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/5">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-4">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {t('Ombi Limewasilishwa Kwa Mafanikio!')}
            </h1>
            <p className="text-muted-foreground">
              {t('Tumepokea maombi yako ya leseni')}
            </p>
          </div>

          {/* Reference Number Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('Namba ya Kumbukumbu')}</CardTitle>
              <CardDescription>
                {t('Tumia namba hii kufuatilia hali ya ombi lako')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('Namba ya Rejea')}
                  </p>
                  <p className="text-2xl font-bold font-mono">{refNo}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('Hatua Zinazofuata')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium mb-1">{t('Ukaguzi wa Nyaraka')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('Timu yetu itakagua nyaraka zako zilizopakiwa na taarifa ulizotoa')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium mb-1">{t('Arifa')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('Utapokea arifa kupitia simu au barua pepe kuhusu hali ya ombi lako')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium mb-1">{t('Uidhinishaji')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('Baada ya kukaguliwa na kuidhinishwa, utapokea maelekezo ya hatua za mwisho')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p>
                    {t('Hifadhi namba ya kumbukumbu yako kwa usalama')}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p>
                    {t('Mchakato wa ukaguzi unaweza kuchukua siku 3-5 za kazi')}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <p>
                    {t('Unaweza kufuatilia hali ya ombi lako wakati wowote kwa kutumia namba ya kumbukumbu')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/license/track')}
              className="w-full"
            >
              <Search className="mr-2 h-4 w-4" />
              {t('Fuatilia Hali')}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/license/my-applications')}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              {t('Maombi Yangu')}
            </Button>

            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              {t('Dashibodi')}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
