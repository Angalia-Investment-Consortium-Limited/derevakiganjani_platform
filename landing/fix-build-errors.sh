#!/bin/bash

# Fix unused variables by adding underscore prefix or removing them

# Fix AdminBreadcrumbs.tsx - remove unused index
sed -i 's/{breadcrumbs.map((crumb, index) =>/{breadcrumbs.map((crumb) =>/g' src/components/admin/AdminBreadcrumbs.tsx

# Fix AdminSidebar.tsx - remove unused SidebarTrigger import
sed -i '/SidebarTrigger,/d' src/components/admin/AdminSidebar.tsx

# Fix CommandPalette.tsx - remove unused useState and Command
sed -i 's/useEffect, useState/useEffect/g' src/components/admin/CommandPalette.tsx
sed -i '/^  Command,$/d' src/components/admin/CommandPalette.tsx

# Fix Notifications.tsx - remove unused XCircle and navigate
sed -i 's/, XCircle//g' src/pages/Notifications.tsx
sed -i '/const navigate = useNavigate();/d' src/pages/Notifications.tsx

# Fix various unused CardTitle imports
sed -i 's/, CardTitle//g' src/pages/admin/CourseManager.tsx
sed -i 's/, CardTitle//g' src/pages/admin/LearnerProgress.tsx
sed -i 's/, CardTitle//g' src/pages/admin/QuestionBankManager.tsx

# Fix ReportsCenter.tsx - remove unused imports
sed -i 's/, FileText, BarChart3//g' src/pages/admin/ReportsCenter.tsx
sed -i 's/, Briefcase//g' src/pages/admin/ReportsCenter.tsx

# Fix UsersManagement.tsx - prefix unused userId with underscore
sed -i 's/handleSuspendUser = (userId:/handleSuspendUser = (_userId:/g' src/pages/admin/UsersManagement.tsx

# Fix DriverJobProfile.tsx - remove unused Textarea import
sed -i '/import { Textarea }/d' src/pages/ajira/DriverJobProfile.tsx

# Fix JobDetailDriver.tsx - prefix unused jobId
sed -i 's/const { jobId } = useParams();/const { jobId: _jobId } = useParams();/g' src/pages/ajira/JobDetailDriver.tsx

# Fix MyApplications.tsx - remove unused Calendar
sed -i 's/, Calendar//g' src/pages/ajira/MyApplications.tsx

# Fix Interviews.tsx - prefix unused interviewId
sed -i 's/handleAction = (interviewId:/handleAction = (_interviewId:/g' src/pages/ajiri-dereva/Interviews.tsx

# Fix JobApplicants.tsx - prefix unused variables
sed -i 's/const { jobId } = useParams();/const { jobId: _jobId } = useParams();/g' src/pages/ajiri-dereva/JobApplicants.tsx
sed -i 's/handleAction = (applicantId:/handleAction = (_applicantId:/g' src/pages/ajiri-dereva/JobApplicants.tsx

# Fix JobDetail.tsx - remove unused Calendar and prefix unused variables
sed -i 's/, Calendar//g' src/pages/ajiri-dereva/JobDetail.tsx
sed -i 's/const { jobId } = useParams();/const { jobId: _jobId } = useParams();/g' src/pages/ajiri-dereva/JobDetail.tsx
sed -i 's/handleContact = (driverId:/handleContact = (_driverId:/g' src/pages/ajiri-dereva/JobDetail.tsx

# Fix Shortlist.tsx - remove unused CardDescription and prefix unused variables
sed -i 's/, CardDescription//g' src/pages/ajiri-dereva/Shortlist.tsx
sed -i 's/handleSendRequest = (driverId:/handleSendRequest = (_driverId:/g' src/pages/ajiri-dereva/Shortlist.tsx
sed -i 's/handleScheduleInterview = (driverId:/handleScheduleInterview = (_driverId:/g' src/pages/ajiri-dereva/Shortlist.tsx
sed -i 's/handleMarkHired = (driverId:/handleMarkHired = (_driverId:/g' src/pages/ajiri-dereva/Shortlist.tsx
sed -i 's/handleContact = (driverId:/handleContact = (_driverId:/g' src/pages/ajiri-dereva/Shortlist.tsx

# Fix CourseCatalog.tsx - remove unused t
sed -i '/const { t } = useLanguage();/d' src/pages/elimika/CourseCatalog.tsx

# Fix CourseCompletion.tsx - prefix unused courseId
sed -i 's/const { courseId } = useParams();/const { courseId: _courseId } = useParams();/g' src/pages/elimika/CourseCompletion.tsx

# Fix CourseDetail.tsx - remove unused t
sed -i '/const { t } = useLanguage();/d' src/pages/elimika/CourseDetail.tsx

# Fix LessonViewer.tsx - remove unused Progress import
sed -i '/import { Progress }/d' src/pages/elimika/LessonViewer.tsx

# Fix MyLearning.tsx - remove unused imports
sed -i 's/, CardDescription, CardHeader, CardTitle//g' src/pages/elimika/MyLearning.tsx
sed -i 's/, Download//g' src/pages/elimika/MyLearning.tsx

# Fix DriverPublicProfile.tsx - remove unused CardDescription and prefix driverId
sed -i 's/, CardDescription//g' src/pages/shared/DriverPublicProfile.tsx
sed -i 's/const { driverId } = useParams();/const { driverId: _driverId } = useParams();/g' src/pages/shared/DriverPublicProfile.tsx

# Fix EmployerProfile.tsx - remove unused Users and prefix employerId
sed -i 's/, Users//g' src/pages/shared/EmployerProfile.tsx
sed -i 's/const { employerId } = useParams();/const { employerId: _employerId } = useParams();/g' src/pages/shared/EmployerProfile.tsx

echo "Build errors fixed!"
