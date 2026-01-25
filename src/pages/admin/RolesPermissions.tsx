import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, User, Building2, GraduationCap, FileCheck, ClipboardCheck, Wallet } from 'lucide-react';

const RolesPermissions = () => {
  const roles = [
    {
      name: 'Super Admin',
      icon: Shield,
      color: 'text-red-500',
      description: 'Full system access with all administrative capabilities',
      capabilities: [
        'Manage all users and roles',
        'System configuration',
        'View all reports',
        'Manage integrations',
        'Database access',
      ],
    },
    {
      name: 'Driver',
      icon: User,
      color: 'text-blue-500',
      description: 'End-user account for drivers using the platform',
      capabilities: [
        'Take tests and quizzes',
        'Access learning materials',
        'Apply for licenses',
        'Search and apply for jobs',
        'View own profile and certificates',
      ],
    },
    {
      name: 'Employer',
      icon: Building2,
      color: 'text-green-500',
      description: 'Account for companies hiring drivers',
      capabilities: [
        'Post job openings',
        'View applicants',
        'Schedule interviews',
        'Manage shortlist',
        'Message candidates',
      ],
    },
    {
      name: 'Tutor / Instructor',
      icon: GraduationCap,
      color: 'text-purple-500',
      description: 'Content creators and course instructors',
      capabilities: [
        'Create and manage courses',
        'Upload learning materials',
        'Track learner progress',
        'Grade assignments',
        'View course analytics',
      ],
    },
    {
      name: 'License Officer',
      icon: FileCheck,
      color: 'text-orange-500',
      description: 'Manages license applications and renewals',
      capabilities: [
        'Review license applications',
        'Approve/reject applications',
        'Verify documents',
        'Issue certificates',
        'View license reports',
      ],
    },
    {
      name: 'Test / Exam Officer',
      icon: ClipboardCheck,
      color: 'text-cyan-500',
      description: 'Manages testing and examinations',
      capabilities: [
        'Configure test settings',
        'Manage question bank',
        'Review test results',
        'Issue test certificates',
        'Monitor test sessions',
      ],
    },
    {
      name: 'Finance',
      icon: Wallet,
      color: 'text-yellow-500',
      description: 'Manages payments and financial transactions',
      capabilities: [
        'View all payments',
        'Process refunds',
        'Generate financial reports',
        'Manage pricing',
        'Export transactions',
      ],
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">Overview of system roles and their capabilities</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Roles</CardTitle>
            <CardDescription>
              Roles define what users can do in the system. Detailed permission mapping is handled in the backend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card key={role.name}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-muted ${role.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {role.name}
                          </CardTitle>
                          <CardDescription className="mt-1">{role.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Key Capabilities:</h4>
                        <ul className="space-y-1">
                          {role.capabilities.map((capability, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>High-level view of role capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Feature</TableHead>
                    <TableHead className="text-center">Super Admin</TableHead>
                    <TableHead className="text-center">Driver</TableHead>
                    <TableHead className="text-center">Employer</TableHead>
                    <TableHead className="text-center">Tutor</TableHead>
                    <TableHead className="text-center">License Officer</TableHead>
                    <TableHead className="text-center">Test Officer</TableHead>
                    <TableHead className="text-center">Finance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">User Management</TableCell>
                    <TableCell className="text-center">
                      <Badge>Full</Badge>
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Take Tests</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">View</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge>Full</Badge>
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">Manage</Badge>
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Job Posts</TableCell>
                    <TableCell className="text-center">
                      <Badge>Full</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">View</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge>Manage</Badge>
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Courses</TableCell>
                    <TableCell className="text-center">
                      <Badge>Full</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">Enroll</Badge>
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">
                      <Badge>Create</Badge>
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Licenses</TableCell>
                    <TableCell className="text-center">
                      <Badge>Full</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">Apply</Badge>
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">
                      <Badge>Approve</Badge>
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Payments</TableCell>
                    <TableCell className="text-center">
                      <Badge>Full</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">Make</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">Make</Badge>
                    </TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">
                      <Badge>Manage</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Note:</strong> This is a simplified view. Backend RLS policies and API middleware enforce detailed permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RolesPermissions;
