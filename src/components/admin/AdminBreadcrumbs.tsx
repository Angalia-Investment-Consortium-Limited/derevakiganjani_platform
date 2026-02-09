import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const routeLabels: Record<string, string> = {
  admin: 'Admin',
  learners: 'Drivers',
  'license-requests': 'License Requests',
  questions: 'Question Bank',
  'test-config': 'Test Configuration',
  courses: 'Courses',
  'job-posts': 'Job Posts',
  jobs: 'Jobs',
  new: 'New',
  edit: 'Edit',
  payments: 'Payments',
  certificates: 'Certificates',
  reports: 'Reports',
  settings: 'Settings',
  roles: 'Roles & Permissions',
  system: 'System Settings',
  users: 'Users',
  employers: 'Employers',
  auth: 'Authentication',
  register: 'Register',
  login: 'Login',
  forgot: 'Forgot Password',
  reset: 'Reset Password',
};

export function AdminBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Build breadcrumb items
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isLast = index === pathSegments.length - 1;

    return {
      path,
      label,
      isLast,
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbItem key={crumb.path}>
            {!crumb.isLast ? (
              <>
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.label}</Link>
                </BreadcrumbLink>
                {index < breadcrumbs.length - 1 && (
                  <span className="flex items-center">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </>
            ) : (
              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
