import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, CheckCircle, AlertCircle, FileText, CreditCard, Calendar, ChevronRight } from 'lucide-react';

type NotificationType = 'payment' | 'test' | 'license' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const Notifications = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'all' | NotificationType>('all');

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'test',
      title: t('Test Completed'),
      message: t('You passed the Category B test with 22/25 points. Certificate is ready.'),
      date: '2025-01-15',
      read: false,
    },
    {
      id: '2',
      type: 'payment',
      title: t('Payment Confirmed'),
      message: t('Your payment of TZS 50,000 for test category B has been confirmed.'),
      date: '2025-01-15',
      read: false,
    },
    {
      id: '3',
      type: 'license',
      title: t('License Request Received'),
      message: t('Your license renewal request (Ref: DRV-2025-XY123) is being processed.'),
      date: '2025-01-14',
      read: true,
    },
    {
      id: '4',
      type: 'info',
      title: t('Profile Updated'),
      message: t('Your profile information has been successfully updated.'),
      date: '2025-01-13',
      read: true,
    },
    {
      id: '5',
      type: 'test',
      title: t('Test Available'),
      message: t('You can now start your JiTesti test for Category B.'),
      date: '2025-01-12',
      read: true,
    },
    {
      id: '6',
      type: 'license',
      title: t('License Approved'),
      message: t('Your license renewal has been approved. Visit any SUMATRA office to collect.'),
      date: '2025-01-10',
      read: true,
    },
  ]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      case 'test':
        return <FileText className="h-5 w-5" />;
      case 'license':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'test':
        return <AlertCircle className="h-4 w-4 text-accent" />;
      case 'license':
        return <FileText className="h-4 w-4 text-secondary" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/5">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.read ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.type === 'payment' ? 'bg-success/10 text-success' :
                        notification.type === 'test' ? 'bg-accent/10 text-accent' :
                        notification.type === 'license' ? 'bg-secondary/10 text-secondary' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary"></span>
                            )}
                          </h3>
                          {getStatusIcon(notification.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.date).toLocaleDateString()}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
