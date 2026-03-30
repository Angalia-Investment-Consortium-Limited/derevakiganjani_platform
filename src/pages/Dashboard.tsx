
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, FileText, BookOpen, TrendingUp, Bell, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import RecentActivities from '@/components/dashboard/RecentActivities'; // Import the new component

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const quickActions = [
    { icon: GraduationCap, label: t('jiTesti'), description: 'Take a driving test', href: '/jitesti', color: 'text-secondary' },
    { icon: BookOpen, label: t('elimika'), description: 'Continue learning', href: '/elimika', color: 'text-accent' },
    { icon: FileText, label: t('leseni'), description: 'Renew license', href: '/license', color: 'text-primary' },
    { icon: TrendingUp, label: 'Ajira ya Udereva', description: 'Find driver jobs', href: '/ajira/jobs', color: 'text-success' },
    { icon: MessageSquare, label: 'Support', description: 'Contact us', href: '/support/request', color: 'text-indigo-500' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{t('welcome')}, {user?.full_name || 'Driver'}!</h1>
              <p className="text-muted-foreground mt-1">Here's your driver services overview</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => navigate('/notifications')}>
              <Bell className="h-5 w-5" />
              <span className="sr-only">{t('notifications')}</span>
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.label}
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                onClick={() => navigate(action.href)}
              >
                <CardHeader>
                  <div className={`h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 ${action.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.label}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity - Now dynamic! */}
        <RecentActivities />

      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
