
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { LicenseApplication } from '@/types/license';
import { STATUS_COLORS } from '@/types/license';
import { Loader2, AlertTriangle, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function TrackStatus() {
  const { t } = useLanguage();
  const [refNo, setRefNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<LicenseApplication | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNo) return;

    setIsLoading(true);
    setError(null);
    setApplication(null);

    try {
      const docRef = doc(db, 'license_applications', refNo);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setApplication({ id: docSnap.id, ...docSnap.data() } as LicenseApplication);
      } else {
        setError(t('application_not_found_with_ref'));
      }
    } catch (err) {
      console.error(err);
      setError(t('error_tracking_application'));
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">{t('Track Application Status')}</CardTitle>
              <CardDescription className="text-center">{t('Enter Ref No Prompt')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                <Input
                  type="text"
                  placeholder={t('Reference Number')}
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="text-center"
                  aria-label={t('Reference Number')}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  {t('track')}
                </Button>
              </form>

              {error && (
                <div className="mt-6 text-center p-4 bg-red-50 text-red-700 rounded-md">
                  <AlertTriangle className="mx-auto h-6 w-6 mb-2" />
                  {error}
                </div>
              )}

              {application && (
                <div className="mt-6 p-4 border rounded-md animate-in fade-in">
                  <h3 className="font-semibold text-lg mb-4 text-center">{t('Application Status')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('Application Type')}</span>
                      <span className="font-semibold">{application.applicationType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('submitted_on')}</span>
                      <span>{application.submittedOn ? format(application.submittedOn.toDate(), 'PPP') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('status')}</span>
                      <Badge className={STATUS_COLORS[application.status]}>{t(application.status.replace(/-/g, '_'))}</Badge>
                    </div>
                    {application.applicantAdvice && (
                      <div className="pt-2 border-t mt-3">
                        <p className="text-sm text-muted-foreground font-medium">{t('Admin Feedback')}:</p>
                        <p className="text-sm text-amber-800 bg-amber-50 p-2 rounded-md">{application.applicantAdvice}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
