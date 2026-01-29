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
import { useLanguage } from '@/contexts/LanguageContext';

const RolesPermissions = () => {
  const { translations } = useLanguage();

  const roles = [
    {
      name: translations.superAdmin,
      icon: Shield,
      color: 'text-red-500',
      description: translations.superAdminDescription,
      capabilities: [
        translations.manageAllUsersAndRoles,
        translations.systemConfiguration,
        translations.viewAllReports,
        translations.manageIntegrations,
        translations.databaseAccess,
      ],
    },
    {
      name: translations.driver,
      icon: User,
      color: 'text-blue-500',
      description: translations.driverDescription,
      capabilities: [
        translations.takeTestsAndQuizzes,
        translations.accessLearningMaterials,
        translations.applyForLicenses,
        translations.searchAndApplyForJobs,
        translations.viewOwnProfileAndCertificates,
      ],
    },
    {
      name: translations.employer,
      icon: Building2,
      color: 'text-green-500',
      description: translations.employerDescription,
      capabilities: [
        translations.postJobOpenings,
        translations.viewApplicants,
        translations.scheduleInterviews,
        translations.manageShortlist,
        translations.messageCandidates,
      ],
    },
    {
      name: translations.tutor,
      icon: GraduationCap,
      color: 'text-purple-500',
      description: translations.tutorDescription,
      capabilities: [
        translations.createAndManageCourses,
        translations.uploadLearningMaterials,
        translations.trackLearnerProgress,
        translations.gradeAssignments,
        translations.viewCourseAnalytics,
      ],
    },
    {
      name: translations.licenseOfficer,
      icon: FileCheck,
      color: 'text-orange-500',
      description: translations.licenseOfficerDescription,
      capabilities: [
        translations.reviewLicenseApplications,
        translations.approveRejectApplications,
        translations.verifyDocuments,
        translations.issueCertificates,
        translations.viewLicenseReports,
      ],
    },
    {
      name: translations.testOfficer,
      icon: ClipboardCheck,
      color: 'text-cyan-500',
      description: translations.testOfficerDescription,
      capabilities: [
        translations.configureTestSettings,
        translations.manageQuestionBank,
        translations.reviewTestResults,
        translations.issueTestCertificates,
        translations.monitorTestSessions,
      ],
    },
    {
      name: translations.finance,
      icon: Wallet,
      color: 'text-yellow-500',
      description: translations.financeDescription,
      capabilities: [
        translations.viewAllPayments,
        translations.processRefunds,
        translations.generateFinancialReports,
        translations.managePricing,
        translations.exportTransactions,
      ],
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{translations.rolesAndPermissions}</h1>
          <p className="text-muted-foreground mt-1">{translations.rolesAndPermissionsDescription}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{translations.systemRoles}</CardTitle>
            <CardDescription>{translations.systemRolesDescription}</CardDescription>
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
                        <h4 className="font-semibold text-sm mb-2">{translations.keyCapabilities}:</h4>
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
            <CardTitle>{translations.permissionMatrix}</CardTitle>
            <CardDescription>{translations.permissionMatrixDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">{translations.feature}</TableHead>
                    <TableHead className="text-center">{translations.superAdmin}</TableHead>
                    <TableHead className="text-center">{translations.driver}</TableHead>
                    <TableHead className="text-center">{translations.employer}</TableHead>
                    <TableHead className="text-center">{translations.tutor}</TableHead>
                    <TableHead className="text-center">{translations.licenseOfficer}</TableHead>
                    <TableHead className="text-center">{translations.testOfficer}</TableHead>
                    <TableHead className="text-center">{translations.finance}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{translations.userManagement}</TableCell>
                    <TableCell className="text-center"><Badge>{translations.full}</Badge></TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{translations.takeTests}</TableCell>
                    <TableCell className="text-center"><Badge variant="secondary">{translations.view}</Badge></TableCell>
                    <TableCell className="text-center"><Badge>{translations.full}</Badge></TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center"><Badge variant="secondary">{translations.manage}</Badge></TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{translations.jobPosts}</TableCell>
                    <TableCell className="text-center"><Badge>{translations.full}</Badge></TableCell>
                    <TableCell className="text-center"><Badge variant="secondary">{translations.view}</Badge></TableCell>
                    <TableCell className="text-center"><Badge>{translations.manage}</Badge></TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{translations.courses}</TableCell>
                    <TableCell className="text-center"><Badge>{translations.full}</Badge></TableCell>
                    <TableCell className="text-center"><Badge variant="secondary">{translations.enroll}</Badge></TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center"><Badge>{translations.create}</Badge></TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{translations.licenses}</TableCell>
                    <TableCell className="text-center"><Badge>{translations.full}</Badge></TableCell>
                    <TableCell className="text-center"><Badge variant="secondary">{translations.apply}</Badge></TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center"><Badge>{translations.approve}</Badge></TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{translations.payments}</TableCell>
                    <TableCell className="text-center"><Badge>{translations.full}</Badge></TableCell>
                    <TableCell className="text-center"><Badge variant="secondary">{translations.make}</Badge></TableCell>
                    <TableCell className="text-center"><Badge variant="secondary">{translations.make}</Badge></TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center">-</TableCell>
                    <TableCell className="text-center"><Badge>{translations.manage}</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground mt-4"><strong>{translations.note}:</strong> {translations.permissionMatrixNote}</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RolesPermissions;
