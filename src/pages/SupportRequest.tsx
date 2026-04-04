
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notificationService } from '@/services/notificationService';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function LicenseRequest() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !details || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, 'license_requests'), {
        userId: user.uid,
        email: user.email,
        fullName: user.full_name || 'N/A',
        subject,
        details,
        status: 'submitted',
        submittedOn: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
      
      try {
          await notificationService.sendSystem(user.uid, 'Support Ticket Created', `Your request "${subject}" has been submitted successfully to the admin team.`, { requestId: docRef.id });
      } catch (e) {
          console.error("Failed to notify", e);
      }

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError(t('error_submitting_request'));
    } finally {
      setIsLoading(false);
    }
  };

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
              <BreadcrumbLink href="/support/my-requests">{t('Support')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('Submit New Request')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {isSuccess ? (
          <Card className="w-full max-w-lg mx-auto text-center">
            <CardContent className="p-10">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">{t('request_submitted_successfully')}</h2>
              <p className="text-muted-foreground mb-6">{t('request_submitted_desc')}</p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/support/my-requests')} className="w-full">{t('View My Requests')}</Button>
                <div className="flex gap-4">
                  <Button onClick={() => {
                    setSubject('');
                    setDetails('');
                    setIsSuccess(false);
                  }} variant="outline" className="flex-1">{t('Submit New Request')}</Button>
                  <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1">{t('Back to Dashboard')}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t('Submit General Request')}</CardTitle>
                <CardDescription>{t('General Request Desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="subject" className="font-medium">{t('Subject')}</label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder={t('Subject Placeholder')}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="details" className="font-medium">{t('Details')}</label>
                    <Textarea
                      id="details"
                      placeholder={t('Details Placeholder')}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      required
                      rows={8}
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading || !subject || !details}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {t('Submit Request')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
