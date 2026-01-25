import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, FileText, BookOpen, TrendingUp, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const quickActions = [
    { icon: GraduationCap, label: t('jiTesti'), description: 'Take a driving test', href: '/jitesti', color: 'text-secondary' },
    { icon: BookOpen, label: t('elimika'), description: 'Continue learning', href: '/elimika', color: 'text-accent' },
    { icon: FileText, label: t('leseni'), description: 'Renew license', href: '/license-request', color: 'text-primary' },
    { icon: TrendingUp, label: 'Ajira ya Udereva', description: 'Find driver jobs', href: '/ajira/jobs', color: 'text-success' },
  ];

  const recentActivity = [
    { date: '2025-01-15', service: 'JiTesti - Category B', status: 'Passed', score: '22/25' },
    { date: '2025-01-10', service: 'License Renewal', status: 'Pending', score: '-' },
    { date: '2025-01-05', service: 'Elimika - Road Signs', status: 'Completed', score: '100%' },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
            <CardDescription>Your latest interactions with our services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{activity.service}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{activity.score}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'Passed' ? 'bg-success/10 text-success' :
                      activity.status === 'Pending' ? 'bg-warning/10 text-warning' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
