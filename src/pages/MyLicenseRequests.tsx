
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
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
          where('userId', '==', user.uid), 
          orderBy('submittedOn', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedRequests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LicenseRequest));
        setRequests(fetchedRequests);
      } catch (err) {
        console.error(err);
        setError(t('error_fetching_requests'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user, t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
           <p className="mt-4 text-muted-foreground">{t('loading_requests')}</p>
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
          <h3 className="text-xl font-semibold mb-2">{t('no_requests_found')}</h3>
          <p className="text-muted-foreground mb-6">{t('submit_general_request_prompt')}</p>
          <Button onClick={() => navigate('/license-request')}>{t('submit_new_request')}</Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {requests.map((req) => (
          <Card key={req.id} className="hover:shadow-md transition-shadow cursor-pointer">
             <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <div className="md:col-span-2">
                    <p className="font-semibold truncate text-primary">{req.subject}</p>
                    <p className="text-sm text-muted-foreground">
                        {t('submitted')}: {req.submittedOn ? format(req.submittedOn.toDate(), 'PPP') : 'N/A'}
                    </p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('last_update')}</p>
                    <p className="text-sm">{req.lastUpdated ? format(req.lastUpdated.toDate(), 'PPP') : 'N/A'}</p>
                </div>
                <div className="flex items-center justify-end">
                   <Badge className={STATUS_BADGE_COLORS[req.status]}>{t(req.status.replace(/-/g, '_'))}</Badge>
                </div>
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
                <BreadcrumbLink href="/dashboard">{t('dashboard')}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="/license">{t('license_services')}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>{t('my_general_requests')}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="text-2xl">{t('my_general_requests')}</CardTitle>
                    <CardDescription>{t('my_general_requests_desc')}</CardDescription>
                </div>
                <Button onClick={() => navigate('/license-request')} variant="outline">
                    <FilePlus className="mr-2 h-4 w-4" />
                    {t('submit_new_request')}
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
