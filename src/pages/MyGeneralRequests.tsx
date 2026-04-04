
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, AlertTriangle, FilePlus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface LicenseRequest {
  id: string;
  subject: string;
  status: 'submitted' | 'in-review' | 'resolved' | 'closed';
  submittedOn: Timestamp;
  lastUpdated: Timestamp;
  details?: string;
  adminNotes?: string;
}

const STATUS_BADGE_COLORS: Record<LicenseRequest['status'], string> = {
  submitted: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'in-review': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  resolved: 'bg-green-100 text-green-800 hover:bg-green-200',
  closed: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

export default function MyLicenseRequests() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'license_requests'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedRequests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LicenseRequest));

        // Client-side sort to avoid missing Firestore index errors
        fetchedRequests.sort((a, b) => {
          const timeA = a.submittedOn ? a.submittedOn.toMillis() : 0;
          const timeB = b.submittedOn ? b.submittedOn.toMillis() : 0;
          return timeB - timeA;
        });

        setRequests(fetchedRequests);
      } catch (err) {
        console.error(err);
        setError(t('Error Fetching Requests'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user, t]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">{t('Loading Requests')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 bg-red-50 rounded-lg p-6">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
          <p className="mt-4 font-semibold text-destructive">{error}</p>
        </div>
      );
    }

    if (requests.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <FilePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('No Requests Found')}</h3>
          <p className="text-muted-foreground mb-6">{t('Submit General Request Prompt')}</p>
          <Button onClick={() => navigate('/support/request')}>{t('Submit New Request')}</Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {requests.map((req) => (
          <Card
            key={req.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => toggleExpand(req.id)}
          >
            <CardContent className="p-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 w-full">
                <div className="md:col-span-2">
                  <p className="font-semibold text-primary break-words">{req.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('Submitted')}: {req.submittedOn ? format(req.submittedOn.toDate(), 'PPP') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('Last Update')}</p>
                  <p className="text-sm">{req.lastUpdated ? format(req.lastUpdated.toDate(), 'PPP') : 'N/A'}</p>
                </div>
                <div className="flex items-center justify-end">
                  <Badge className={STATUS_BADGE_COLORS[req.status]}>{t(req.status.replace(/-/g, '_'))}</Badge>
                </div>
              </div>
              {expandedId === req.id && (
                <div className="pt-4 border-t w-full animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">{t('Your Message')}:</h4>
                      <p className="text-sm whitespace-pre-wrap">{req.details || 'No details provided.'}</p>
                    </div>
                    {req.adminNotes && (
                      <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
                        <h4 className="text-sm font-semibold text-amber-900 mb-1">{t('Admin Response')}:</h4>
                        <p className="text-sm text-amber-800 whitespace-pre-wrap">{req.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
              <BreadcrumbPage>{t('Support')}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('My General Requests')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-2xl">{t('My General Requests')}</CardTitle>
                <CardDescription>{t('Track all inquiries and support messages sent to admin')}</CardDescription>
              </div>
              <Button onClick={() => navigate('/support/request')} variant="outline">
                <FilePlus className="mr-2 h-4 w-4" />
                {t('Submit New Request')}
              </Button>
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
