import { AdminLayout } from '@/components/admin/AdminLayout';
import { ServiceCard } from '@/components/ServiceCard';
import { Users, FileText, GraduationCap, BarChart3, BookOpen, Briefcase, ClipboardList, Wallet, Award, Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { useEffect, useState } from 'react';

const Admin = () => {
  const [stats, setStats] = useState<any>(null);
  
  // Fetch dashboard statistics
  const { data, error, isLoading } = useFrappeGetCall<any>(
    'derevahuduma_platform.api.admin.get_dashboard_stats',
    undefined,
    undefined,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (data?.message?.data) {
      setStats(data.message.data);
    }
  }, [data]);

  const modules = [
    {
      icon: Users,
      title: 'Users & Drivers',
      description: 'Manage registered drivers and user accounts',
      href: '/admin/learners',
      iconColor: 'text-blue-500'
    },
    {
      icon: FileText,
      title: 'Leseni Requests',
      description: 'Review and approve license requests',
      href: '/admin/license-requests',
      iconColor: 'text-green-500'
    },
    {
      icon: GraduationCap,
      title: 'JiTesti Question Bank',
      description: 'Create and edit test questions',
      href: '/admin/questions',
      iconColor: 'text-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Test Results & Attempts',
      description: 'View reports and pass rate analytics',
      href: '/admin/test-config',
      iconColor: 'text-orange-500'
    },
    {
      icon: BookOpen,
      title: 'Elimika Course Manager',
      description: 'Add courses, lessons, and quizzes',
      href: '/admin/courses',
      iconColor: 'text-indigo-500'
    },
    {
      icon: Briefcase,
      title: 'Job Posts (Ajiri Dereva)',
      description: 'Approve employer posts and manage hiring',
      href: '/admin/job-posts',
      iconColor: 'text-cyan-500'
    },
    {
      icon: ClipboardList,
      title: 'Driver Applications',
      description: 'Track driver job applications and matches',
      href: '/admin/job-posts',
      iconColor: 'text-teal-500'
    },
    {
      icon: Wallet,
      title: 'Payments & Finance',
      description: 'Confirm payments and view revenue',
      href: '/admin/payments',
      iconColor: 'text-yellow-500'
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Manage issued and revoked certificates',
      href: '/admin/certificates',
      iconColor: 'text-pink-500'
    },
    {
      icon: Download,
      title: 'Reports & Export',
      description: 'Download CSV/PDF statistics and reports',
      href: '/admin/reports',
      iconColor: 'text-red-500'
    }
  ];

  // Dynamic KPIs based on fetched data
  const kpis = stats ? [
    { label: 'Total Drivers', value: stats.total_drivers?.toString() || '0' },
    { label: 'Total Employers', value: stats.total_employers?.toString() || '0' },
    { label: 'Pending Licenses', value: stats.pending_license_requests?.toString() || '0' },
    { label: 'Active Courses', value: stats.active_courses?.toString() || '0' },
    { label: 'Active Job Posts', value: stats.active_job_posts?.toString() || '0' },
  ] : [
    { label: 'Total Drivers', value: '-' },
    { label: 'Total Employers', value: '-' },
    { label: 'Pending Licenses', value: '-' },
    { label: 'Active Courses', value: '-' },
    { label: 'Active Job Posts', value: '-' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the entire Dereva Huduma platform</p>
        </div>

        {/* Quick KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading ? (
            <Card className="col-span-full">
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading dashboard statistics...</span>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="col-span-full">
              <CardContent className="py-8">
                <p className="text-center text-destructive">
                  Failed to load dashboard statistics. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : (
            kpis.map((kpi) => (
              <Card key={kpi.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Module Cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Platform Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <ServiceCard
                key={module.title}
                icon={module.icon}
                title={module.title}
                description={module.description}
                href={module.href}
                iconColor={module.iconColor}
              />
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
