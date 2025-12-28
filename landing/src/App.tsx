import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FrappeProvider } from "frappe-react-sdk";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import { EmployerVerificationGuard } from "./components/EmployerVerificationGuard";
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
import LicenseRequest from "./pages/LicenseRequest";
import MyLicenseRequests from "./pages/MyLicenseRequests";
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
import JobDetailDriver from "./pages/ajira/JobDetailDriver";
import MyApplications from "./pages/ajira/MyApplications";
import DriverPublicProfile from "./pages/shared/DriverPublicProfile";
import EmployerProfile from "./pages/shared/EmployerProfile";
import JobPostsManagement from "./pages/admin/JobPostsManagement";
import JobPostForm from "./pages/admin/JobPostForm";
import JobPostDetail from "./pages/admin/JobPostDetail";
import LicenseRequestsManagement from "./pages/admin/LicenseRequestsManagement";
import PaymentsManagement from "./pages/admin/PaymentsManagement";
import CertificatesManagement from "./pages/admin/CertificatesManagement";
import ReportsCenter from "./pages/admin/ReportsCenter";
import EmployerDashboard from "./pages/ajiri-dereva/EmployerDashboard";
import CompanyVerification from "./pages/ajiri-dereva/CompanyVerification";
import JobApplicants from "./pages/ajiri-dereva/JobApplicants";
import Interviews from "./pages/ajiri-dereva/Interviews";
import Messages from "./pages/ajiri-dereva/Messages";
import DriverProfile from "./pages/ajiri-dereva/DriverProfile";
import EmployerSettings from "./pages/ajiri-dereva/EmployerSettings";
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
import MyLicenseApplications from "./pages/license/MyApplications";
import ApplicationDetails from "./pages/license/ApplicationDetails";
import LicenseApplicationsManagement from "./pages/admin/LicenseApplicationsManagement";
import LicenseApplicationReview from "./pages/admin/LicenseApplicationReview";
import LicenseStatistics from "./pages/admin/LicenseStatistics";
import TestCategories from "./pages/jitesti/TestCategories";
import WhatsAppPrivacyPolicy from "./pages/WhatsAppPrivacyPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();
  // We need to pass sitename only if the Frappe version is v15 or above.

	const getSiteName = () => {
		// @ts-ignore
		if (window.frappe?.boot?.versions?.frappe && (window.frappe.boot.versions.frappe.startsWith('15') || window.frappe.boot.versions.frappe.startsWith('16'))) {
			// @ts-ignore
			return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME
		}
		return import.meta.env.VITE_SITE_NAME

	}

const App = () => (

  <FrappeProvider socketPort={import.meta.env.VITE_SOCKET_PORT ?? ''}
                  siteName={getSiteName()}>
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH}>
    {/* <BrowserRouter basename={import.meta.env.MODE === 'production' ? '/landing' : '/'}> */}
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
            <Route path="/license-request" element={
              <ProtectedRoute>
                <LicenseRequest />
              </ProtectedRoute>
            } />
            <Route path="/license/my-requests" element={
              <ProtectedRoute>
                <MyLicenseRequests />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <Admin />
              </RoleBasedRoute>
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
            <Route path="/admin/courses" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <CourseManager />
              </RoleBasedRoute>
            } />
            <Route path="/admin/course/:courseId" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <CourseEditor />
              </RoleBasedRoute>
            } />
            <Route path="/admin/course/:courseId/lesson/:lessonId" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <LessonBuilder />
              </RoleBasedRoute>
            } />
            <Route path="/admin/course/:courseId/quiz" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <QuizBuilder />
              </RoleBasedRoute>
            } />
            <Route path="/admin/learners" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <LearnerProgress />
              </RoleBasedRoute>
            } />
            <Route path="/admin/questions" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <QuestionBankManager />
              </RoleBasedRoute>
            } />
            <Route path="/admin/question/:questionId" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <QuestionEditor />
              </RoleBasedRoute>
            } />
            <Route path="/admin/test-config" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <TestConfiguration />
              </RoleBasedRoute>
            } />
            <Route path="/admin/license-requests" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <LicenseRequestsManagement />
              </RoleBasedRoute>
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
                <EmployerVerificationGuard>
                  <JobApplicants />
                </EmployerVerificationGuard>
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
            <Route path="/ajiri-dereva/register" element={<EmployerRegistration />} />
            <Route path="/ajiri-dereva/post-job" element={
              <RoleBasedRoute allowedRoles={['Employer']}>
                <EmployerVerificationGuard>
                  <PostJob />
                </EmployerVerificationGuard>
              </RoleBasedRoute>
            } />
            <Route path="/ajiri-dereva/my-jobs" element={
              <RoleBasedRoute allowedRoles={['Employer']}>
                <EmployerVerificationGuard>
                  <MyJobPosts />
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
            <Route path="/driver/:driverId" element={<DriverPublicProfile />} />
            <Route path="/employer/:employerId" element={<EmployerProfile />} />
            <Route path="/admin/job-posts" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <JobPostsManagement />
              </RoleBasedRoute>
            } />
            <Route path="/admin/jobs/new" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <JobPostForm />
              </RoleBasedRoute>
            } />
            <Route path="/admin/jobs/:id" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <JobPostDetail />
              </RoleBasedRoute>
            } />
            <Route path="/admin/jobs/:id/edit" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <JobPostForm />
              </RoleBasedRoute>
            } />
            <Route path="/admin/payments" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <PaymentsManagement />
              </RoleBasedRoute>
            } />
            <Route path="/admin/certificates" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <CertificatesManagement />
              </RoleBasedRoute>
            } />
            <Route path="/admin/reports" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <ReportsCenter />
              </RoleBasedRoute>
            } />
            <Route path="/admin/matching" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <MatchingMonitor />
              </RoleBasedRoute>
            } />
            <Route path="/admin/recruitment-reports" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <RecruitmentReports />
              </RoleBasedRoute>
            } />
            <Route path="/admin/users" element={
              <RoleBasedRoute allowedRoles={['Admin']}>
                <UsersManagement />
              </RoleBasedRoute>
            } />
            <Route path="/admin/users/new" element={
              <RoleBasedRoute allowedRoles={['Admin']}>
                <UserForm />
              </RoleBasedRoute>
            } />
            <Route path="/admin/users/:id/edit" element={
              <RoleBasedRoute allowedRoles={['Admin']}>
                <UserForm />
              </RoleBasedRoute>
            } />
            <Route path="/admin/settings/roles" element={
              <RoleBasedRoute allowedRoles={['Admin']}>
                <RolesPermissions />
              </RoleBasedRoute>
            } />
            
            {/* JiTesti Routes */}
            <Route path="/jitesti" element={
              <ProtectedRoute>
                <TestCategories />
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
            <Route path="/admin/license-applications" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <LicenseApplicationsManagement />
              </RoleBasedRoute>
            } />
            <Route path="/admin/license-application/:id" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <LicenseApplicationReview />
              </RoleBasedRoute>
            } />
            <Route path="/admin/license-statistics" element={
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <LicenseStatistics />
              </RoleBasedRoute>
            } />
            
            {/* Privacy Policy Routes */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy/whatsapp" element={<WhatsAppPrivacyPolicy />} />

            
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </BrowserRouter>
    </FrappeProvider>
  );

  export default App;