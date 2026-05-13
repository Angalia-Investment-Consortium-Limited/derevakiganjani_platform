
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import { AdminRoleBasedRoute } from "./components/AdminRoleBasedRoute";
import { EmployerVerificationGuard } from "./components/EmployerVerificationGuard";
import AuthRedirect from "./components/AuthRedirect";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminLogin from "./pages/auth/AdminLogin";
import DriverLogin from "./pages/auth/DriverLogin";
import EmployerLogin from "./pages/auth/EmployerLogin";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import TestCategory from "./pages/TestCategory";
import TestQuestions from "./pages/TestQuestions";
import TestResult from "./pages/TestResult";
import Admin from "./pages/Admin";
import SupportRequest from "./pages/SupportRequest";
import MyGeneralRequests from "./pages/MyGeneralRequests";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import CourseCatalog from "./pages/elimika/CourseCatalog";
import CourseDetail from "./pages/elimika/CourseDetail";
import LessonViewer from "./pages/elimika/LessonViewer";
import PracticeQuiz from "./pages/elimika/PracticeQuiz";
import CourseCompletion from "./pages/elimika/CourseCompletion";
import MyLearning from "./pages/elimika/MyLearning";
import CourseManager from "./pages/admin/CourseManager";
import CourseEditor from "./pages/admin/CourseEditor";
import LearnerProgress from "./pages/admin/LearnerProgress";
import LessonBuilder from "./pages/admin/LessonBuilder";
import LessonManager from "./pages/admin/LessonManager";
import QuizBuilder from "./pages/admin/QuizBuilder";
import QuestionBankManager from "./pages/admin/QuestionBankManager";
import QuestionEditor from "./pages/admin/QuestionEditor";
import TestConfiguration from "./pages/admin/TestConfiguration";
import EmployerRegistration from "./pages/ajiri-dereva/EmployerRegistration";
import PostJob from "./pages/ajiri-dereva/PostJob";
import MyJobPosts from "./pages/ajiri-dereva/MyJobPosts";
import JobDetail from "./pages/ajiri-dereva/JobDetail";
import Shortlist from "./pages/ajiri-dereva/Shortlist";
import DriverJobProfile from "./pages/ajira/DriverJobProfile";
import FindJobs from "./pages/ajira/FindJobs";
import JobDetails from "./pages/ajira/JobDetails";
import MyApplications from "./pages/ajira/MyApplications";
import DriverMessages from "./pages/ajira/DriverMessages";
import DriverPublicProfile from "./pages/shared/DriverPublicProfile";
import EmployerProfile from "./pages/shared/EmployerProfile";
import JobPostsManagement from "./pages/admin/JobPostsManagement";
import JobPostForm from "./pages/admin/JobPostForm";
import JobPostDetail from "./pages/admin/JobPostDetail";
import LicenseRequestsManagement from "./pages/admin/LicenseRequestsManagement";
import LicenseRequestDetail from "./pages/admin/LicenseRequestDetail";
import PaymentsManagement from "./pages/admin/PaymentsManagement";
import CertificatesManagement from "./pages/admin/CertificatesManagement";
import ReportsCenter from "./pages/admin/ReportsCenter";
import EmployerDashboard from "./pages/ajiri-dereva/EmployerDashboard";
import CompanyVerification from "./pages/ajiri-dereva/CompanyVerification";
import JobApplicants from "./pages/ajiri-dereva/JobApplicants";
import AdminJobApplicants from "./pages/admin/JobApplicants";
import Interviews from "./pages/ajiri-dereva/Interviews";
import Messages from "./pages/ajiri-dereva/Messages";
import DriverProfile from "./pages/ajiri-dereva/DriverProfile";
import EmployerSettings from "./pages/ajiri-dereva/EmployerSettings";
import OutsourceDriver from "./pages/ajiri-dereva/OutsourceDriver";
import OutsourceRequestsTracking from "./pages/ajiri-dereva/OutsourceRequestsTracking";
import PendingVerification from "./pages/employer/PendingVerification";
import MatchingMonitor from "./pages/admin/MatchingMonitor";
import RecruitmentReports from "./pages/admin/RecruitmentReports";
import UsersManagement from "./pages/admin/UsersManagement";
import UserForm from "./pages/admin/UserForm";
import RolesPermissions from "./pages/admin/RolesPermissions";
import LicenseDashboard from "./pages/license/LicenseDashboard";
import LicenseApplicationWizard from "./pages/license/LicenseApplicationWizard";
import ApplicationConfirmation from "./pages/license/ApplicationConfirmation";
import TrackStatus from "./pages/license/TrackStatus";
import MyLicenseApplications from "./pages/license/MyLicenseApplications";
import ApplicationDetails from "./pages/license/ApplicationDetails";
import LicenseApplicationsManagement from "./pages/admin/LicenseApplicationsManagement";
import LicenseApplicationReview from "./pages/admin/LicenseApplicationReview";
import LicenseStatistics from "./pages/admin/LicenseStatistics";
import EmployerVerificationManagement from "./pages/admin/EmployerVerificationManagement";
import EmployerReview from "./pages/admin/EmployerReview";
import JobManagement from "./pages/admin/JobManagement";
import TestCategories from "./pages/jitesti/TestCategories";
import PaymentPage from "./pages/jitesti/PaymentPage";
import ReceiptPage from "./pages/jitesti/ReceiptPage";
import MyReceipts from "./pages/MyReceipts";
import TestPage from "./pages/jitesti/TestPage";
import TestResultPage from "./pages/jitesti/TestResultPage";
import TestHistoryPage from "./pages/jitesti/TestHistoryPage";
import WhatsAppPrivacyPolicy from "./pages/WhatsAppPrivacyPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import JobDetailDriver from "./pages/ajira/JobDetailDriver";
import JitestiCategoryManager from "./pages/admin/JitestiCategoryManager";
import JitestiTestManager from "./pages/admin/JitestiTestManager";
import JitestiResultsPage from "./pages/admin/JitestiResults";
import JitestiResultDetail from "./pages/admin/JitestiResultDetail";
import DriverManagement from "./pages/admin/DriverManagement";
import EmployerManagement from "./pages/admin/EmployerManagement";
import AdminDriverProfileView from "./pages/admin/AdminDriverProfileView";
import AuditLog from "./pages/admin/AuditLog";
import OutsourceDesk from "./pages/admin/OutsourceDesk";
import EmployerTicketsManagement from "./pages/admin/EmployerTicketsManagement";
import EmployerSupport from "./pages/ajiri-dereva/EmployerSupport";
import CVCreationRequests from "./pages/admin/CVCreationRequests";
import CVBuilder from "./pages/admin/CVBuilder";
import CVView from "./pages/cv/CVView";
import { AdminLayoutRoot } from "./components/admin/AdminLayoutRoot";
import Broadcasts from "./pages/admin/Broadcasts";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/ingia" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/admin-login" element={<AdminLogin />} />
              <Route path="/auth/driver-login" element={<DriverLogin />} />
              <Route path="/auth/employer-login" element={<EmployerLogin />} />
              <Route path="/auth/forgot" element={<ForgotPassword />} />
              <Route path="/auth/reset" element={<ResetPassword />} />
              <Route path="/auth/redirect" element={<AuthRedirect />} />
              <Route path="/profile-setup" element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/test/category" element={
                <ProtectedRoute>
                  <TestCategory />
                </ProtectedRoute>
              } />
              <Route path="/test/questions" element={
                <ProtectedRoute>
                  <TestQuestions />
                </ProtectedRoute>
              } />
              <Route path="/test/result" element={
                <ProtectedRoute>
                  <TestResult />
                </ProtectedRoute>
              } />
              <Route path="/support/request" element={
                <ProtectedRoute>
                  <SupportRequest />
                </ProtectedRoute>
              } />
              <Route path="/support/my-requests" element={
                <ProtectedRoute>
                  <MyGeneralRequests />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              
              
              
              
              <Route path="/elimika" element={
                <ProtectedRoute>
                  <CourseCatalog />
                </ProtectedRoute>
              } />
              <Route path="/elimika/course/:courseId" element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } />
              <Route path="/elimika/lesson/:lessonId" element={
                <ProtectedRoute>
                  <LessonViewer />
                </ProtectedRoute>
              } />
              <Route path="/elimika/quiz/:courseId" element={
                <ProtectedRoute>
                  <PracticeQuiz />
                </ProtectedRoute>
              } />
              <Route path="/elimika/completion/:courseId" element={
                <ProtectedRoute>
                  <CourseCompletion />
                </ProtectedRoute>
              } />
              <Route path="/elimika/my-learning" element={
                <ProtectedRoute>
                  <MyLearning />
                </ProtectedRoute>
              } />
              
              
              
              
              
              
              
              
              
              
              
              
              
              <Route path="/employer/pending-verification" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <PendingVerification />
                </RoleBasedRoute>
              } />
              <Route path="/employer/dashboard" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <EmployerDashboard />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/employer/verification" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <CompanyVerification />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/employer/jobs" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <MyJobPosts />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/employer/jobs/:jobId/applicants" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <JobApplicants />
                </RoleBasedRoute>
              } />
              <Route path="/employer/interviews" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <Interviews />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/employer/messages" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <Messages />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/employer/drivers/:driverId" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <DriverProfile />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/employer/shortlist" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <Shortlist />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/employer/settings" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerSettings />
                </RoleBasedRoute>
              } />
              <Route path="/employer/outsource" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <OutsourceDriver />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/employer/outsource-requests" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <OutsourceRequestsTracking />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/employer/support" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <EmployerSupport />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/ajiri-dereva/register" element={<EmployerRegistration />} />
              <Route path="/ajiri-dereva/post-job" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <PostJob />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />

              <Route path="/ajiri-dereva/job/:jobId" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <JobDetail />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/ajiri-dereva/shortlist" element={
                <RoleBasedRoute allowedRoles={['Employer']}>
                  <EmployerVerificationGuard>
                    <Shortlist />
                  </EmployerVerificationGuard>
                </RoleBasedRoute>
              } />
              <Route path="/ajira/profile" element={
                <ProtectedRoute>
                  <DriverJobProfile />
                </ProtectedRoute>
              } />
              <Route path="/ajira/jobs" element={
                <ProtectedRoute>
                  <FindJobs />
                </ProtectedRoute>
              } />
              <Route path="/ajira/job/:jobId" element={
                <ProtectedRoute>
                  <JobDetailDriver />
                </ProtectedRoute>
              } />
              <Route path="/ajira/applications" element={
                <ProtectedRoute>
                  <MyApplications />
                </ProtectedRoute>
              } />
              <Route path="/cv/view/:id" element={
                <ProtectedRoute>
                  <CVView />
                </ProtectedRoute>
              } />
              <Route path="/ajira/messages" element={
                <ProtectedRoute>
                  <DriverMessages />
                </ProtectedRoute>
              } />
              <Route path="/driver/:driverId" element={<DriverPublicProfile />} />
              <Route path="/employer/:employerId" element={<EmployerProfile />} />
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              
              

              {/* JiTesti Routes */}
              
              
              
              

              <Route path="/jitesti" element={
                <ProtectedRoute>
                  <TestCategories />
                </ProtectedRoute>
              } />
              <Route path="/jitesti/payment/:categoryId" element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />
              <Route path="/jitesti/receipt/:testAttemptId" element={
                <ProtectedRoute>
                  <ReceiptPage />
                </ProtectedRoute>
              } />
              <Route path="/my-receipts" element={
                <ProtectedRoute>
                  <MyReceipts />
                </ProtectedRoute>
              } />
              <Route path="/jitesti/test/:testAttemptId" element={
                <ProtectedRoute>
                  <TestPage />
                </ProtectedRoute>
              } />
              <Route path="/jitesti/results/:testAttemptId" element={
                <ProtectedRoute>
                  <TestResultPage />
                </ProtectedRoute>
              } />
              <Route path="/jitesti/my-history" element={
                <ProtectedRoute>
                  <TestHistoryPage />
                </ProtectedRoute>
              } />

              {/* License Management Routes */}
              <Route path="/license" element={<LicenseDashboard />} />
              <Route path="/license/apply/:type" element={
                <ProtectedRoute>
                  <LicenseApplicationWizard />
                </ProtectedRoute>
              } />
              <Route path="/license/confirmation/:refNo" element={
                <ProtectedRoute>
                  <ApplicationConfirmation />
                </ProtectedRoute>
              } />
              <Route path="/license/track" element={<TrackStatus />} />
              <Route path="/license/my-applications" element={
                <ProtectedRoute>
                  <MyLicenseApplications />
                </ProtectedRoute>
              } />
              <Route path="/license/application/:id" element={
                <ProtectedRoute>
                  <ApplicationDetails />
                </ProtectedRoute>
              } />
              
              
              
              
              
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/whatsapp-privacy-policy" element={<WhatsAppPrivacyPolicy />} />
              <Route path="/admin" element={<AdminLayoutRoot />}>
              <Route index element={
                              <AdminRoleBasedRoute>
                                <Admin />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="drivers" element={
                              <AdminRoleBasedRoute>
                                <DriverManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="driver/:driverId" element={
                              <AdminRoleBasedRoute>
                                <AdminDriverProfileView />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="employers" element={
                              <AdminRoleBasedRoute>
                                <EmployerManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="courses" element={
                              <AdminRoleBasedRoute>
                                <CourseManager />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="course/:courseId" element={
                              <AdminRoleBasedRoute>
                                <CourseEditor />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="course/:courseId/lesson/:lessonId" element={
                              <AdminRoleBasedRoute>
                                <LessonBuilder />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="lesson-builder" element={
                              <AdminRoleBasedRoute>
                                <LessonBuilder />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="lessons" element={
                              <AdminRoleBasedRoute>
                                <LessonManager />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="course/:courseId/quiz" element={
                              <AdminRoleBasedRoute>
                                <QuizBuilder />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="learners" element={
                              <AdminRoleBasedRoute>
                                <LearnerProgress />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="questions" element={
                              <AdminRoleBasedRoute>
                                <QuestionBankManager />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="question/:questionId" element={
                              <AdminRoleBasedRoute>
                                <QuestionEditor />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="test-config" element={
                              <AdminRoleBasedRoute>
                                <TestConfiguration />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="support-requests" element={
                              <AdminRoleBasedRoute>
                                <LicenseRequestsManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="employer-tickets" element={
                              <AdminRoleBasedRoute>
                                <EmployerTicketsManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="broadcasts" element={
                              <AdminRoleBasedRoute>
                                <Broadcasts />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="license-request/:id" element={
                              <AdminRoleBasedRoute>
                                <LicenseRequestDetail />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="job-posts" element={
                              <AdminRoleBasedRoute>
                                <JobPostsManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="job-management" element={
                              <AdminRoleBasedRoute>
                                <JobManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="job-applicants/:jobId" element={
                              <AdminRoleBasedRoute>
                                <AdminJobApplicants />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="jobs/new" element={
                              <AdminRoleBasedRoute>
                                <JobPostForm />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="jobs/:id" element={
                              <AdminRoleBasedRoute>
                                <JobPostDetail />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="jobs/:id/edit" element={
                              <AdminRoleBasedRoute>
                                <JobPostForm />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="payments" element={
                              <AdminRoleBasedRoute>
                                <PaymentsManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="certificates" element={
                              <AdminRoleBasedRoute>
                                <CertificatesManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="reports" element={
                              <AdminRoleBasedRoute>
                                <ReportsCenter />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="matching" element={
                              <AdminRoleBasedRoute>
                                <MatchingMonitor />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="outsource" element={
                              <AdminRoleBasedRoute>
                                <OutsourceDesk />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="recruitment-reports" element={
                              <AdminRoleBasedRoute>
                                <RecruitmentReports />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="cv-requests" element={
                              <AdminRoleBasedRoute>
                                <CVCreationRequests />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="cv-builder/:requestId" element={
                              <AdminRoleBasedRoute>
                                <CVBuilder />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="users" element={
                              <AdminRoleBasedRoute>
                                <UsersManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="users/new" element={
                              <AdminRoleBasedRoute>
                                <UserForm />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="users/:id/edit" element={
                              <AdminRoleBasedRoute>
                                <UserForm />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="settings/roles" element={
                              <AdminRoleBasedRoute>
                                <RolesPermissions />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="audit-log" element={
                              <AdminRoleBasedRoute>
                                <AuditLog />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="jitesti/categories" element={
                              <AdminRoleBasedRoute>
                                <JitestiCategoryManager />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="jitesti/tests" element={
                              <AdminRoleBasedRoute>
                                <JitestiTestManager />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="jitesti/results" element={
                              <AdminRoleBasedRoute>
                                <JitestiResultsPage />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="jitesti/results/:attemptId" element={
                              <AdminRoleBasedRoute>
                                <JitestiResultDetail />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="license-applications" element={
                              <AdminRoleBasedRoute>
                                <LicenseApplicationsManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="license-application/:id" element={
                              <AdminRoleBasedRoute>
                                <LicenseApplicationReview />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="license-statistics" element={
                              <AdminRoleBasedRoute>
                                <LicenseStatistics />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="employer-verification" element={
                              <AdminRoleBasedRoute>
                                <EmployerVerificationManagement />
                              </AdminRoleBasedRoute>
                            } />
              <Route path="employer-review/:id" element={
                              <AdminRoleBasedRoute>
                                <EmployerReview />
                              </AdminRoleBasedRoute>
                            } />
            </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
