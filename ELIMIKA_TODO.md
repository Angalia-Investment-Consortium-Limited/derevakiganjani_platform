# ELIMIKA MODULE UPDATE - COMPLETE TODO LIST

## 📋 OVERVIEW

This TODO tracks the implementation of the Elimika module update to support:
- **Beginner Track**: Pikipiki/Bajaji, Basic Driving
- **Professional Track**: VIP, PSV, HGV
- Multi-content type lessons (Text, PDF, Image, Video)
- Certificate system with track/category

---

## ✅ PHASE 1: BACKEND FOUNDATION (Week 1)

### 1.1 Create Frappe Doctypes

- [ ] **Course Doctype**
  - [ ] Create doctype: `bench --site derevakiganjani.mdvfleet.co.tz new-doctype Course`
  - [ ] Add fields: course_name_en, course_name_sw
  - [ ] Add fields: description_en, description_sw
  - [ ] Add field: course_track (Select: beginner/professional) ⭐
  - [ ] Add field: course_category (Select: pikipiki/basic/vip/psv/hgv) ⭐
  - [ ] Add field: level (Select: Basic/Intermediate/Advanced)
  - [ ] Add fields: duration_hours, total_lessons, thumbnail, thumbnail_emoji
  - [ ] Add fields: status, is_active, price, is_free
  - [ ] Add fields: created_by, published_date
  - [ ] Set autoname: `format:COURSE-{#####}`
  - [ ] Configure permissions (Admin, Staff, Driver)
  - [ ] Test doctype creation in Frappe desk

- [ ] **Lesson Doctype**
  - [ ] Create doctype: `bench --site derevakiganjani.mdvfleet.co.tz new-doctype Lesson`
  - [ ] Add fields: lesson_title_en, lesson_title_sw
  - [ ] Add field: course (Link to Course)
  - [ ] Add field: lesson_order (Int)
  - [ ] Add field: content_type (Select: text/pdf/image/video) ⭐
  - [ ] Add fields: content_text_en, content_text_sw (Text Editor)
  - [ ] Add field: content_file (Attach) for PDF/Image
  - [ ] Add field: video_url (Data) for YouTube ⭐
  - [ ] Add field: video_type (Select: public/private/unlisted)
  - [ ] Add fields: duration_minutes, is_locked, unlock_after_lesson
  - [ ] Add fields: is_active, summary_en, summary_sw
  - [ ] Set autoname: `format:LESSON-{#####}`
  - [ ] Configure permissions
  - [ ] Test doctype creation

- [ ] **Course Enrollment Doctype**
  - [ ] Create doctype: `bench --site derevakiganjani.mdvfleet.co.tz new-doctype "Course Enrollment"`
  - [ ] Add field: driver (Link to Driver Profile)
  - [ ] Add field: course (Link to Course)
  - [ ] Add field: enrollment_date (Date, default: Today)
  - [ ] Add field: status (Select: Enrolled/In Progress/Completed/Dropped)
  - [ ] Add fields: progress_percentage, completed_lessons, total_lessons
  - [ ] Add fields: completion_date, certificate_issued, last_accessed
  - [ ] Set autoname: `format:ENROLL-{#####}`
  - [ ] Configure permissions (if_owner for Driver)
  - [ ] Test doctype creation

- [ ] **Lesson Progress Doctype**
  - [ ] Create doctype: `bench --site derevakiganjani.mdvfleet.co.tz new-doctype "Lesson Progress"`
  - [ ] Add field: enrollment (Link to Course Enrollment)
  - [ ] Add field: lesson (Link to Lesson)
  - [ ] Add field: driver (Link to Driver Profile)
  - [ ] Add field: status (Select: Not Started/In Progress/Completed)
  - [ ] Add fields: started_at, completed_at, time_spent_minutes
  - [ ] Set autoname: `format:LP-{#####}`
  - [ ] Configure permissions
  - [ ] Test doctype creation

- [ ] **Course Certificate Doctype**
  - [ ] Create doctype: `bench --site derevakiganjani.mdvfleet.co.tz new-doctype "Course Certificate"`
  - [ ] Add field: certificate_number (Data, unique)
  - [ ] Add field: driver (Link to Driver Profile)
  - [ ] Add field: course (Link to Course)
  - [ ] Add field: enrollment (Link to Course Enrollment)
  - [ ] Add field: course_track (Data, read_only) ⭐
  - [ ] Add field: course_category (Data, read_only) ⭐
  - [ ] Add fields: issue_date, completion_score
  - [ ] Add fields: certificate_file, is_active, verification_code
  - [ ] Set autoname: `format:CERT-{#####}`
  - [ ] Configure permissions
  - [ ] Test doctype creation

### 1.2 Create API Endpoints

- [ ] **Create elimika.py API file**
  - [ ] Create file: `derevahuduma_platform/api/elimika.py`
  - [ ] Import required modules (frappe, datetime, etc.)
  - [ ] Add docstring and file header

- [ ] **Public Endpoints**
  - [ ] `get_courses(track, category, search, status)` - List courses with filters
  - [ ] `get_course_detail(course_id)` - Get course with lessons
  - [ ] `enroll_in_course(course_id)` - Enroll user in course
  - [ ] `get_my_enrollments()` - Get user's enrolled courses
  - [ ] `get_lesson_content(lesson_id, enrollment_id)` - Get lesson content
  - [ ] `mark_lesson_complete(lesson_id, enrollment_id, time_spent)` - Mark lesson done
  - [ ] `get_course_progress(enrollment_id)` - Get progress details
  - [ ] `issue_certificate(enrollment_id)` - Issue completion certificate
  - [ ] `get_my_certificates()` - Get user's certificates

- [ ] **Admin Endpoints**
  - [ ] `create_course(course_data)` - Create new course
  - [ ] `update_course(course_id, course_data)` - Update course
  - [ ] `delete_course(course_id)` - Delete course
  - [ ] `create_lesson(lesson_data)` - Create new lesson
  - [ ] `update_lesson(lesson_id, lesson_data)` - Update lesson
  - [ ] `delete_lesson(lesson_id)` - Delete lesson
  - [ ] `get_learner_statistics()` - Get admin statistics
  - [ ] `get_course_enrollments(course_id)` - Get course enrollments
  - [ ] `get_learner_progress(driver_id)` - Get specific learner progress

- [ ] **Test API Endpoints**
  - [ ] Test with Postman/curl
  - [ ] Test authentication
  - [ ] Test permissions
  - [ ] Test error handling

### 1.3 Update admin.py

- [ ] **Update get_dashboard_stats()**
  - [ ] Verify Course doctype references work
  - [ ] Verify Lesson doctype references work
  - [ ] Verify Enrollment doctype references work
  - [ ] Test dashboard stats API

---

## ✅ PHASE 2: DATA MIGRATION (Week 2)

### 2.1 Create Seed Data Script

- [ ] **Create seed_elimika_data.py**
  - [ ] Create file: `derevahuduma_platform/api/seed_elimika_data.py`
  - [ ] Define course mapping (hardcoded → database)
  - [ ] Map tracks and categories:
    - [ ] Road Safety Fundamentals → beginner + basic
    - [ ] Traffic Signs & Signals → beginner + basic
    - [ ] Defensive Driving → professional + vip
    - [ ] Vehicle Maintenance → beginner + basic
    - [ ] Emergency Response → professional + psv
    - [ ] Commercial Driving → professional + hgv

- [ ] **Create Course Records**
  - [ ] Insert 6 initial courses
  - [ ] Set correct track and category for each
  - [ ] Add bilingual names and descriptions
  - [ ] Set status to "Published"
  - [ ] Add thumbnail emojis

- [ ] **Create Lesson Records**
  - [ ] Create 12 lessons for Road Safety (text content)
  - [ ] Create 15 lessons for Traffic Signs (text + images)
  - [ ] Create 18 lessons for Defensive Driving (text + videos)
  - [ ] Create 10 lessons for Vehicle Maintenance (text + PDFs)
  - [ ] Create 8 lessons for Emergency Response (text + videos)
  - [ ] Create 20 lessons for Commercial Driving (mixed content)
  - [ ] Set proper lesson_order for each
  - [ ] Set content_type correctly

- [ ] **Run Migration**
  - [ ] Test script in development
  - [ ] Backup database before migration
  - [ ] Run: `bench --site derevakiganjani.mdvfleet.co.tz execute derevahuduma_platform.api.seed_elimika_data.seed_elimika_courses`
  - [ ] Verify data in Frappe desk
  - [ ] Check course counts by track
  - [ ] Check lesson counts per course

### 2.2 Verify Migration

- [ ] **Data Integrity Checks**
  - [ ] Verify all 6 courses created
  - [ ] Verify all lessons linked to correct courses
  - [ ] Verify track/category assignments
  - [ ] Verify bilingual content
  - [ ] Check for any missing fields

---

## ✅ PHASE 3: FRONTEND UPDATES (Week 3)

### 3.1 Create TypeScript Types

- [ ] **Generate Frappe Types**
  - [ ] Configure Type Generation in Frappe desk
  - [ ] Generate types for Course doctype
  - [ ] Generate types for Lesson doctype
  - [ ] Generate types for Course Enrollment doctype
  - [ ] Generate types for Lesson Progress doctype
  - [ ] Generate types for Course Certificate doctype
  - [ ] Verify types in `landing/src/types/`

- [ ] **Create Custom Types**
  - [ ] Create `landing/src/types/elimika.ts`
  - [ ] Define CourseTrack type: "beginner" | "professional"
  - [ ] Define CourseCategory type: "pikipiki" | "basic" | "vip" | "psv" | "hgv"
  - [ ] Define ContentType type: "text" | "pdf" | "image" | "video"
  - [ ] Export all types

### 3.2 Update CourseCatalog.tsx

- [ ] **Add Track Selection**
  - [ ] Create track selector UI (2 buttons/tabs)
  - [ ] Add state: `const [selectedTrack, setSelectedTrack] = useState<CourseTrack | null>(null)`
  - [ ] Style track selector prominently
  - [ ] Add Swahili translations for tracks

- [ ] **Update Category Filter**
  - [ ] Make category filter dynamic based on track
  - [ ] Show Pikipiki/Basic for beginner track
  - [ ] Show VIP/PSV/HGV for professional track
  - [ ] Add Swahili labels for categories

- [ ] **Add Track/Category Badges**
  - [ ] Add track badge to course cards
  - [ ] Add category badge to course cards
  - [ ] Style badges with distinct colors
  - [ ] Add icons for each category

- [ ] **Replace Hardcoded Data with API**
  - [ ] Import `useFrappeGetCall` from frappe-react-sdk
  - [ ] Call `get_courses` API with filters
  - [ ] Handle loading state
  - [ ] Handle error state
  - [ ] Update course card rendering

- [ ] **Test CourseCatalog**
  - [ ] Test track selection
  - [ ] Test category filtering
  - [ ] Test search functionality
  - [ ] Test with both English and Swahili
  - [ ] Test responsive design

### 3.3 Update CourseDetail.tsx

- [ ] **Fetch Real Course Data**
  - [ ] Use `useFrappeGetCall` to call `get_course_detail`
  - [ ] Handle loading and error states
  - [ ] Display course with lessons

- [ ] **Show Track/Category Info**
  - [ ] Display track badge
  - [ ] Display category badge
  - [ ] Show in course header

- [ ] **Update Lesson List**
  - [ ] Show content type icon for each lesson
  - [ ] Text icon for text lessons
  - [ ] PDF icon for PDF lessons
  - [ ] Image icon for image lessons
  - [ ] Video icon for video lessons
  - [ ] Update lesson card styling

- [ ] **Implement Enrollment**
  - [ ] Add "Enroll" button if not enrolled
  - [ ] Call `enroll_in_course` API
  - [ ] Show enrollment status
  - [ ] Handle already enrolled state

- [ ] **Show Real Progress**
  - [ ] Fetch enrollment progress from API
  - [ ] Display progress bar with real percentage
  - [ ] Show completed/total lessons count
  - [ ] Update progress dynamically

- [ ] **Test CourseDetail**
  - [ ] Test enrollment flow
  - [ ] Test progress display
  - [ ] Test lesson navigation
  - [ ] Test with different content types

### 3.4 Update LessonViewer.tsx

- [ ] **Support Multiple Content Types**
  - [ ] Create content renderer component
  - [ ] Render text content (HTML)
  - [ ] Render PDF viewer
  - [ ] Render image viewer
  - [ ] Render YouTube video embed

- [ ] **Create Content Components**
  - [ ] `TextContent.tsx` - Display HTML content
  - [ ] `PDFViewer.tsx` - Embed PDF viewer
  - [ ] `ImageViewer.tsx` - Display image with zoom
  - [ ] `YouTubeEmbed.tsx` - Embed YouTube video

- [ ] **Fetch Lesson Content**
  - [ ] Call `get_lesson_content` API
  - [ ] Handle locked lessons
  - [ ] Show unlock requirements
  - [ ] Track lesson start time

- [ ] **Mark Lesson Complete**
  - [ ] Add "Mark as Complete" button
  - [ ] Calculate time spent
  - [ ] Call `mark_lesson_complete` API
  - [ ] Update progress in real-time
  - [ ] Navigate to next lesson

- [ ] **Test LessonViewer**
  - [ ] Test all content types
  - [ ] Test lesson completion
  - [ ] Test navigation
  - [ ] Test locked lessons

### 3.5 Update MyLearning.tsx

- [ ] **Fetch Real Enrollments**
  - [ ] Call `get_my_enrollments` API
  - [ ] Display enrolled courses
  - [ ] Show real progress for each

- [ ] **Show Track/Category**
  - [ ] Display track badge for each course
  - [ ] Display category badge for each course
  - [ ] Group by track (optional)

- [ ] **Update Statistics**
  - [ ] Calculate stats from real data
  - [ ] Show total courses
  - [ ] Show in-progress count
  - [ ] Show completed count
  - [ ] Show total learning hours

- [ ] **Test MyLearning**
  - [ ] Test with multiple enrollments
  - [ ] Test progress display
  - [ ] Test navigation to courses

### 3.6 Update CourseCompletion.tsx

- [ ] **Fetch Certificate Data**
  - [ ] Call `issue_certificate` API
  - [ ] Display certificate details
  - [ ] Show certificate number

- [ ] **Update Certificate Template**
  - [ ] Add track to certificate
  - [ ] Add category to certificate
  - [ ] Format certificate properly:
    ```
    Certificate of Completion
    
    This certifies that [Driver Name]
    has successfully completed:
    
    [Course Name]
    Track: [Beginner/Professional]
    Category: [Pikipiki/Basic/VIP/PSV/HGV]
    
    Date: [Completion Date]
    Certificate No: [CERT-XXXXX]
    ```

- [ ] **Add Download Button**
  - [ ] Generate PDF certificate
  - [ ] Add download functionality
  - [ ] Include verification code

- [ ] **Test Certificate**
  - [ ] Test certificate generation
  - [ ] Test download
  - [ ] Verify track/category display

### 3.7 Update Admin CourseManager.tsx

- [ ] **Fetch Real Courses**
  - [ ] Replace hardcoded data with API call
  - [ ] Display all courses from database
  - [ ] Show track and category columns

- [ ] **Add Track/Category Filters**
  - [ ] Add track filter dropdown
  - [ ] Add category filter dropdown
  - [ ] Filter courses in real-time

- [ ] **Update Course Table**
  - [ ] Add track column
  - [ ] Add category column
  - [ ] Update actions (edit, delete)

- [ ] **Test CourseManager**
  - [ ] Test filtering
  - [ ] Test course list display
  - [ ] Test navigation to editor

### 3.8 Update Admin CourseEditor.tsx

- [ ] **Add Track Field**
  - [ ] Add track selector (beginner/professional)
  - [ ] Make it required
  - [ ] Add validation

- [ ] **Add Category Field**
  - [ ] Add category selector
  - [ ] Make options dynamic based on track
  - [ ] Beginner: Pikipiki, Basic
  - [ ] Professional: VIP, PSV, HGV
  - [ ] Make it required

- [ ] **Update Form Submission**
  - [ ] Include track in course data
  - [ ] Include category in course data
  - [ ] Call `create_course` or `update_course` API
  - [ ] Handle success/error

- [ ] **Test CourseEditor**
  - [ ] Test course creation with track/category
  - [ ] Test course update
  - [ ] Test validation

### 3.9 Update Admin LessonBuilder.tsx

- [ ] **Add Content Type Selector**
  - [ ] Add dropdown: Text, PDF, Image, Video
  - [ ] Show/hide fields based on selection
  - [ ] Text: Show text editor
  - [ ] PDF: Show file upload
  - [ ] Image: Show image upload
  - [ ] Video: Show YouTube URL field

- [ ] **Conditional Field Display**
  - [ ] Show text editor for text type
  - [ ] Show file upload for PDF/Image
  - [ ] Show URL input for video
  - [ ] Add video type selector (public/private/unlisted)

- [ ] **Update Form Submission**
  - [ ] Include content_type
  - [ ] Include appropriate content field
  - [ ] Call `create_lesson` or `update_lesson` API
  - [ ] Handle file uploads

- [ ] **Test LessonBuilder**
  - [ ] Test creating text lesson
  - [ ] Test creating PDF lesson
  - [ ] Test creating image lesson
  - [ ] Test creating video lesson
  - [ ] Test file uploads

### 3.10 Create New Components

- [ ] **TrackSelector.tsx**
  - [ ] Create reusable track selector component
  - [ ] Props: value, onChange
  - [ ] Style with tabs or buttons
  - [ ] Add icons

- [ ] **CategoryBadge.tsx**
  - [ ] Create badge component for categories
  - [ ] Props: category, track
  - [ ] Different colors per category
  - [ ] Add icons

- [ ] **ContentTypeIcon.tsx**
  - [ ] Create icon component for content types
  - [ ] Props: contentType
  - [ ] Return appropriate icon
  - [ ] Text, PDF, Image, Video icons

- [ ] **YouTubeEmbed.tsx**
  - [ ] Create YouTube embed component
  - [ ] Props: url, title
  - [ ] Handle private/unlisted videos
  - [ ] Responsive iframe

- [ ] **PDFViewer.tsx**
  - [ ] Create PDF viewer component
  - [ ] Props: url, title
  - [ ] Use react-pdf or iframe
  - [ ] Add download button

---

## ✅ PHASE 4: TESTING & VALIDATION (Week 4)

### 4.1 Backend Testing

- [ ] **API Testing**
  - [ ] Test all public endpoints
  - [ ] Test all admin endpoints
  - [ ] Test authentication
  - [ ] Test permissions
  - [ ] Test error handling
  - [ ] Test edge cases

- [ ] **Data Validation**
  - [ ] Verify course data integrity
  - [ ] Verify lesson relationships
  - [ ] Verify enrollment logic
  - [ ] Verify progress tracking
  - [ ] Verify certificate generation

### 4.2 Frontend Testing

- [ ] **Track Filtering**
  - [ ] Test beginner track shows only beginner courses
  - [ ] Test professional track shows only professional courses
  - [ ] Test track switching
  - [ ] Test with no track selected

- [ ] **Category Filtering**
  - [ ] Test Pikipiki category (beginner)
  - [ ] Test Basic category (beginner)
  - [ ] Test VIP category (professional)
  - [ ] Test PSV category (professional)
  - [ ] Test HGV category (professional)

- [ ] **Course Enrollment**
  - [ ] Test enrolling in course
  - [ ] Test already enrolled state
  - [ ] Test enrollment permissions
  - [ ] Test enrollment for different tracks

- [ ] **Lesson Viewing**
  - [ ] Test text lessons
  - [ ] Test PDF lessons
  - [ ] Test image lessons
  - [ ] Test video lessons (YouTube)
  - [ ] Test locked lessons
  - [ ] Test lesson navigation

- [ ] **Progress Tracking**
  - [ ] Test marking lessons complete
  - [ ] Test progress percentage calculation
  - [ ] Test course completion
  - [ ] Test progress persistence

- [ ] **Certificate Generation**
  - [ ] Test certificate issuance
  - [ ] Test certificate displays track
  - [ ] Test certificate displays category
  - [ ] Test certificate download
  - [ ] Test certificate verification

- [ ] **Admin Functions**
  - [ ] Test course creation with track/category
  - [ ] Test lesson creation with content types
  - [ ] Test course editing
  - [ ] Test lesson editing
  - [ ] Test learner monitoring

### 4.3 Integration Testing

- [ ] **End-to-End Flows**
  - [ ] Complete beginner course flow
  - [ ] Complete professional course flow
  - [ ] Enroll → Learn → Complete → Certificate
  - [ ] Test with multiple users
  - [ ] Test concurrent enrollments

- [ ] **Cross-Browser Testing**
  - [ ] Test on Chrome
  - [ ] Test on Firefox
  - [ ] Test on Safari
  - [ ] Test on Edge
  - [ ] Test on mobile browsers

- [ ] **Responsive Testing**
  - [ ] Test on desktop (1920x1080)
  - [ ] Test on laptop (1366x768)
  - [ ] Test on tablet (768x1024)
  - [ ] Test on mobile (375x667)

### 4.4 User Acceptance Testing

- [ ] **Beginner Track Testing**
  - [ ] Test Pikipiki course flow
  - [ ] Test Basic Driving course flow
  - [ ] Verify content is appropriate
  - [ ] Verify certificate is correct

- [ ] **Professional Track Testing**
  - [ ] Test VIP course flow
  - [ ] Test PSV course flow
  - [ ] Test HGV course flow
  - [ ] Verify content is appropriate
  - [ ] Verify certificate is correct

- [ ] **Bilingual Testing**
  - [ ] Test all features in English
  - [ ] Test all features in Swahili
  - [ ] Verify translations are correct
  - [ ] Test language switching

---

## ✅ PHASE 5: DEPLOYMENT & DOCUMENTATION (Week 5)

### 5.1 Pre-Deployment

- [ ] **Code Review**
  - [ ] Review all backend code
  - [ ] Review all frontend code
  - [ ] Check for security issues
  - [ ] Check for performance issues
  - [ ] Run linters

- [ ] **Database Backup**
  - [ ] Backup production database
  - [ ] Test restore procedure
  - [ ] Document backup location

- [ ] **Build Production**
  - [ ] Run `yarn build` in landing/
  - [ ] Verify build output
  - [ ] Test production build locally

### 5.2 Deployment

- [ ] **Deploy Backend**
  - [ ] Push code to repository
  - [ ] Pull on production server
  - [ ] Run migrations: `bench migrate`
  - [ ] Restart bench: `bench restart`
  - [ ] Clear cache: `bench clear-cache`

- [ ] **Deploy Frontend**
  - [ ] Build is already in public/landing/
  - [ ] Clear browser cache
  - [ ] Test production site

- [ ] **Run Seed Data**
  - [ ] Execute seed script on production
  - [ ] Verify courses created
  - [ ] Verify lessons created

### 5.3 Post-Deployment Testing

- [ ] **Smoke Tests**
  - [ ] Test course catalog loads
  - [ ] Test course detail loads
  - [ ] Test enrollment works
  - [ ] Test lesson viewing works
  - [ ] Test certificate generation works

- [ ] **Monitor Errors**
  - [ ] Check Frappe error logs
  - [ ] Check browser console
  - [ ] Monitor API responses
  - [ ] Check for 404s or 500s

### 5.4 Documentation

- [ ] **User Documentation**
  - [ ] Create user guide for Elimika
  - [ ] Document track selection
  - [ ] Document course enrollment
  - [ ] Document lesson viewing
  - [ ] Document certificate download

- [ ] **Admin Documentation**
  - [ ] Document course creation
  - [ ] Document lesson creation
  - [ ] Document content types
  - [ ] Document learner monitoring

- [ ] **Developer Documentation**
  - [ ] Document API endpoints
  - [ ] Document doctype structure
  - [ ] Document frontend components
  - [ ] Update README.md

### 5.5 Training

- [ ] **Admin Training**
  - [ ] Train on course creation
  - [ ] Train on lesson creation
  - [ ] Train on content management
  - [ ] Train on learner monitoring

- [ ] **User Communication**
  - [ ] Announce new features
  - [ ] Send email to users
  - [ ] Update help center
  - [ ] Create tutorial videos

---

## 📊 SUCCESS METRICS

### Functional Requirements
- [ ] ✅ Beginner users see only beginner courses
- [ ] ✅ Professional users see only professional courses
- [ ] ✅ Courses correctly categorized (Pikipiki, Basic, VIP, PSV, HGV)
- [ ] ✅ Admin can create courses with track/category
- [ ] ✅ Lessons support text, PDF, image, video
- [ ] ✅ Certificates display track and category
- [ ] ✅ No existing functionality broken

### Performance Requirements
- [ ] Course catalog loads in < 2 seconds
- [ ] Lesson content loads in < 3 seconds
- [ ] API responses in < 500ms
- [ ] No memory leaks
- [ ] Smooth animations

### Quality Requirements
- [ ] Zero critical bugs
- [ ] < 5 minor bugs
- [ ] 100% of features tested
- [ ] Code coverage > 80%
- [ ] All documentation complete

---

## 🚨 ROLLBACK PLAN

If issues arise:

1. **Immediate Rollback**
   - [ ] Restore database backup
   - [ ] Revert code changes
   - [ ] Clear cache
   - [ ] Restart services

2. **Partial Rollback**
   - [ ] Keep backend, revert frontend
   - [ ] Or vice versa
   - [ ] Document issues

3. **Communication**
   - [ ] Notify users of issues
   - [ ] Provide timeline for fix
   - [ ] Update status page

---

## 📝 NOTES

- All dates are estimates and may change
- Each phase should be completed before moving to next
- Testing should be continuous throughout
- Document any deviations from plan
- Keep stakeholders informed of progress

---

## 🎯 FINAL CHECKLIST

Before marking as complete:

- [ ] All doctypes created and tested
- [ ] All API endpoints working
- [ ] All frontend components updated
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Training complete
- [ ] Deployed to production
- [ ] Post-deployment testing done
- [ ] Users notified
- [ ] Project retrospective completed

---

**Last Updated**: [Date]
**Status**: Not Started
**Assigned To**: [Team/Person]
**Target Completion**: [Date]
