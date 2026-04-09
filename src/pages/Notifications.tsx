import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, writeBatch, orderBy, where } from 'firebase/firestore';
import { Bell, CheckCircle, AlertCircle, FileText, CreditCard, Calendar, ChevronRight, Home } from 'lucide-react';

// Matches the filter categories dynamically based on userType
type NotificationCategory = 'payment' | 'test' | 'license' | 'jobs' | 'candidates' | 'info';

// Matches the structure in Firestore
interface Notification {
  id: string;
  type: string; // e.g., 'WELCOME', 'JOB_APPLICATION_STATUS'
  title_en: string;
  message_en: string;
  title_sw: string;
  message_sw: string;
  createdAt: any; // Firestore Timestamp
  isRead: boolean;
}

const Notifications = () => {
  const { t, language } = useLanguage();
  const { user, userType } = useAuth();
  const [filter, setFilter] = useState<'all' | NotificationCategory>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Notification, 'id'>),
      }));
      setNotifications(fetchedNotifications);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [user]);

  // Maps Firestore titles to the filter categories (since type is transport medium)
  const getCategory = (notification: Notification): NotificationCategory => {
    const searchString = `${notification.type} ${notification.title_en}`.toUpperCase();
    if (searchString.includes('PAYMENT') || searchString.includes('RECEIPT')) return 'payment';
    if (searchString.includes('TEST')) return 'test';
    if (searchString.includes('LICENSE')) return 'license';
    if (searchString.includes('JOB')) return 'jobs';
    if (searchString.includes('CANDIDATE') || searchString.includes('APPLICATION')) return 'candidates';
    return 'info';
  };

  const getIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'payment': return <CreditCard className="h-5 w-5" />;
      case 'test': return <FileText className="h-5 w-5" />;
      case 'license': return <Calendar className="h-5 w-5" />;
      case 'jobs': return <FileText className="h-5 w-5" />;
      case 'candidates': return <CheckCircle className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'payment': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'test': return <AlertCircle className="h-4 w-4 text-accent" />;
      case 'license': return <FileText className="h-4 w-4 text-secondary" />;
      case 'jobs': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'candidates': return <CheckCircle className="h-4 w-4 text-primary" />;
      default: return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => getCategory(n) === filter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    if (!user) return;
    const notifRef = doc(db, 'notifications', id);
    await updateDoc(notifRef, { isRead: true });
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    const batch = writeBatch(db);
    const notificationsToUpdate = notifications.filter(n => !n.isRead);
    
    notificationsToUpdate.forEach(n => {
      const notifRef = doc(db, 'notifications', n.id);
      batch.update(notifRef, { isRead: true });
    });

    await batch.commit();
  };

  const getTitle = (notification: Notification) => {
    return language === 'sw' ? notification.title_sw : notification.title_en;
  };

  const getMessage = (notification: Notification) => {
    return language === 'sw' ? notification.message_sw : notification.message_en;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/5">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/"><Home className="h-4 w-4" /></Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('Notifications')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Bell className="h-8 w-8 text-primary" />
                {t('Notifications')}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                )}
              </h1>
              <p className="text-muted-foreground">{t('Stay updated with your activities')}</p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                {t('Mark All as Read')}
              </Button>
            )}
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-2 flex-wrap">
                 <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  {t('All')}
                </Button>

                {userType === 'Employer' ? (
                  <>
                    <Button
                      variant={filter === 'jobs' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('jobs')}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Jobs
                    </Button>
                    <Button
                      variant={filter === 'candidates' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('candidates')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Candidates
                    </Button>
                    <Button
                      variant={filter === 'payment' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('payment')}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Payments
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant={filter === 'payment' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('payment')}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      {t('Payments')}
                    </Button>
                    <Button
                      variant={filter === 'test' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('test')}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {t('Tests')}
                    </Button>
                    <Button
                      variant={filter === 'license' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('license')}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      {t('License')}
                    </Button>
                  </>
                )}

                <Button
                  variant={filter === 'info' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('info')}
                >
                  <Bell className="h-4 w-4 mr-1" />
                  {t('Info')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('No notifications found')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const category = getCategory(notification);
                return (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.isRead ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          category === 'payment' ? 'bg-success/10 text-success' :
                          category === 'test' ? 'bg-accent/10 text-accent' :
                          category === 'license' ? 'bg-secondary/10 text-secondary' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {getIcon(category)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold flex items-center gap-2">
                              {getTitle(notification)}
                              {!notification.isRead && (
                                <span className="h-2 w-2 rounded-full bg-primary"></span>
                              )}
                            </h3>
                            {getStatusIcon(category)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {getMessage(notification)}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {notification.createdAt?.toDate().toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
