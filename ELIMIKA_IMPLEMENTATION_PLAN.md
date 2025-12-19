# ELIMIKA MODULE - IMPLEMENTATION PLAN & BEST PRACTICES

## 📊 EXECUTIVE SUMMARY

Based on analysis of the existing codebase, here's my **professional advice** on the best approach:

---

## 🎯 RECOMMENDED APPROACH: **Phased Backend-First Implementation**

### Why This Approach is Best:

1. **Data Integrity First** ✅
   - Create proper database schema before migrating data
   - Ensures data consistency and relationships
   - Prevents data loss during migration

2. **Type Safety** ✅
   - Generate TypeScript types from Frappe doctypes
   - Catch errors at compile time
   - Better IDE support and autocomplete

3. **Minimal Disruption** ✅
   - Frontend continues working with hardcoded data during backend development
   - Gradual migration reduces risk
   - Easy rollback if issues arise

4. **Testing at Each Stage** ✅
   - Test backend independently before frontend integration
   - Validate data migration before going live
   - Incremental testing reduces bugs

5. **Follows Frappe Best Practices** ✅
   - Matches existing patterns (Test Question, License Application)
   - Uses established Frappe conventions
   - Easier maintenance and scaling

---

## 🚀 IMPLEMENTATION PHASES

### **PHASE 1: Backend Foundation** (Week 1)
**Goal**: Create all Frappe doctypes and API endpoints

#### 1.1 Create Doctypes (Priority Order)

**A. Course Doctype** (HIGHEST PRIORITY)
```bash
# Create using Frappe CLI
bench --site derevakiganjani.mdvfleet.co.tz new-doctype Course
```

**Fields Structure:**
```json
{
  "name": "Course",
  "module": "Dereva Huduma Platform",
  "autoname": "format:COURSE-{#####}",
  "fields": [
    // Basic Info
    {"fieldname": "course_name_en", "fieldtype": "Data", "label": "Course Name (English)", "reqd": 1},
    {"fieldname": "course_name_sw", "fieldtype": "Data", "label": "Course Name (Swahili)", "reqd": 1},
    {"fieldname": "description_en", "fieldtype": "Text Editor", "label": "Description (English)"},
    {"fieldname": "description_sw", "fieldtype": "Text Editor", "label": "Description (Swahili)"},
    
    // NEW: Track & Category System
    {"fieldname": "course_track", "fieldtype": "Select", 
     "options": "beginner\nprofessional", 
     "label": "Course Track", "reqd": 1},
    
    {"fieldname": "course_category", "fieldtype": "Select",
     "options": "pikipiki\nbasic\nvip\npsv\nhgv",
     "label": "Course Category", "reqd": 1},
    
    // Legacy (keep for compatibility)
    {"fieldname": "level", "fieldtype": "Select",
     "options": "Basic\nIntermediate\nAdvanced",
     "label": "Difficulty Level"},
    
    // Course Details
    {"fieldname": "duration_hours", "fieldtype": "Float", "label": "Duration (Hours)"},
    {"fieldname": "total_lessons", "fieldtype": "Int", "label": "Total Lessons", "read_only": 1},
    {"fieldname": "thumbnail", "fieldtype": "Attach Image", "label": "Course Thumbnail"},
    {"fieldname": "thumbnail_emoji", "fieldtype": "Data", "label": "Emoji Icon"},
    
    // Status & Pricing
    {"fieldname": "status", "fieldtype": "Select",
     "options": "Draft\nPublished\nArchived",
     "default": "Draft", "label": "Status"},
    {"fieldname": "is_active", "fieldtype": "Check", "default": 1, "label": "Is Active"},
    {"fieldname": "price", "fieldtype": "Currency", "default": 0, "label": "Price"},
    {"fieldname": "is_free", "fieldtype": "Check", "default": 1, "label": "Free Course"},
    
    // Metadata
    {"fieldname": "created_by", "fieldtype": "Link", "options": "User", "label": "Created By"},
    {"fieldname": "published_date", "fieldtype": "Date", "label": "Published Date"}
  ],
  "permissions": [
    {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
    {"role": "Admin", "read": 1, "write": 1, "create": 1, "delete": 1},
    {"role": "Staff", "read": 1, "write": 1, "create": 1},
    {"role": "Driver", "read": 1}
  ]
}
```

**B. Lesson Doctype**
```json
{
  "name": "Lesson",
  "module": "Dereva Huduma Platform",
  "autoname": "format:LESSON-{#####}",
  "fields": [
    // Basic Info
    {"fieldname": "lesson_title_en", "fieldtype": "Data", "label": "Lesson Title (English)", "reqd": 1},
    {"fieldname": "lesson_title_sw", "fieldtype": "Data", "label": "Lesson Title (Swahili)", "reqd": 1},
    {"fieldname": "course", "fieldtype": "Link", "options": "Course", "label": "Course", "reqd": 1},
    {"fieldname": "lesson_order", "fieldtype": "Int", "label": "Lesson Order", "reqd": 1},
    
    // NEW: Content Type System
    {"fieldname": "content_type", "fieldtype": "Select",
     "options": "text\npdf\nimage\nvideo",
     "label": "Content Type", "reqd": 1, "default": "text"},
    
    // Content Fields (conditional based on type)
    {"fieldname": "content_text_en", "fieldtype": "Text Editor", "label": "Content (English)"},
    {"fieldname": "content_text_sw", "fieldtype": "Text Editor", "label": "Content (Swahili)"},
    {"fieldname": "content_file", "fieldtype": "Attach", "label": "File (PDF/Image)"},
    {"fieldname": "video_url", "fieldtype": "Data", "label": "YouTube Video URL"},
    {"fieldname": "video_type", "fieldtype": "Select", 
     "options": "public\nprivate\nunlisted",
     "label": "Video Type", "default": "unlisted"},
    
    // Lesson Details
    {"fieldname": "duration_minutes", "fieldtype": "Int", "label": "Duration (Minutes)"},
    {"fieldname": "is_locked", "fieldtype": "Check", "default": 0, "label": "Is Locked"},
    {"fieldname": "unlock_after_lesson", "fieldtype": "Link", "options": "Lesson", "label": "Unlock After"},
    {"fieldname": "is_active", "fieldtype": "Check", "default": 1, "label": "Is Active"},
    
    // Summary
    {"fieldname": "summary_en", "fieldtype": "Small Text", "label": "Summary (English)"},
    {"fieldname": "summary_sw", "fieldtype": "Small Text", "label": "Summary (Swahili)"}
  ],
  "permissions": [
    {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
    {"role": "Admin", "read": 1, "write": 1, "create": 1, "delete": 1},
    {"role": "Staff", "read": 1, "write": 1, "create": 1},
    {"role": "Driver", "read": 1}
  ]
}
```

**C. Course Enrollment Doctype**
```json
{
  "name": "Course Enrollment",
  "module": "Dereva Huduma Platform",
  "autoname": "format:ENROLL-{#####}",
  "fields": [
    {"fieldname": "driver", "fieldtype": "Link", "options": "Driver Profile", "label": "Driver", "reqd": 1},
    {"fieldname": "course", "fieldtype": "Link", "options": "Course", "label": "Course", "reqd": 1},
    {"fieldname": "enrollment_date", "fieldtype": "Date", "default": "Today", "label": "Enrollment Date"},
    {"fieldname": "status", "fieldtype": "Select",
     "options": "Enrolled\nIn Progress\nCompleted\nDropped",
     "default": "Enrolled", "label": "Status"},
    {"fieldname": "progress_percentage", "fieldtype": "Percent", "default": 0, "label": "Progress"},
    {"fieldname": "completed_lessons", "fieldtype": "Int", "default": 0, "label": "Completed Lessons"},
    {"fieldname": "total_lessons", "fieldtype": "Int", "label": "Total Lessons"},
    {"fieldname": "completion_date", "fieldtype": "Date", "label": "Completion Date"},
    {"fieldname": "certificate_issued", "fieldtype": "Check", "default": 0, "label": "Certificate Issued"},
    {"fieldname": "last_accessed", "fieldtype": "Datetime", "label": "Last Accessed"}
  ],
  "permissions": [
    {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
    {"role": "Admin", "read": 1, "write": 1},
    {"role": "Staff", "read": 1, "write": 1},
    {"role": "Driver", "read": 1, "write": 1, "create": 1, "if_owner": 1}
  ]
}
```

**D. Lesson Progress Doctype**
```json
{
  "name": "Lesson Progress",
  "module": "Dereva Huduma Platform",
  "autoname": "format:LP-{#####}",
  "fields": [
    {"fieldname": "enrollment", "fieldtype": "Link", "options": "Course Enrollment", "label": "Enrollment", "reqd": 1},
    {"fieldname": "lesson", "fieldtype": "Link", "options": "Lesson", "label": "Lesson", "reqd": 1},
    {"fieldname": "driver", "fieldtype": "Link", "options": "Driver Profile", "label": "Driver", "reqd": 1},
    {"fieldname": "status", "fieldtype": "Select",
     "options": "Not Started\nIn Progress\nCompleted",
     "default": "Not Started", "label": "Status"},
    {"fieldname": "started_at", "fieldtype": "Datetime", "label": "Started At"},
    {"fieldname": "completed_at", "fieldtype": "Datetime", "label": "Completed At"},
    {"fieldname": "time_spent_minutes", "fieldtype": "Int", "default": 0, "label": "Time Spent (Minutes)"}
  ],
  "permissions": [
    {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
    {"role": "Admin", "read": 1, "write": 1},
    {"role": "Staff", "read": 1, "write": 1},
    {"role": "Driver", "read": 1, "write": 1, "create": 1, "if_owner": 1}
  ]
}
```

**E. Course Certificate Doctype**
```json
{
  "name": "Course Certificate",
  "module": "Dereva Huduma Platform",
  "autoname": "format:CERT-{#####}",
  "fields": [
    {"fieldname": "certificate_number", "fieldtype": "Data", "label": "Certificate Number", "unique": 1, "reqd": 1},
    {"fieldname": "driver", "fieldtype": "Link", "options": "Driver Profile", "label": "Driver", "reqd": 1},
    {"fieldname": "course", "fieldtype": "Link", "options": "Course", "label": "Course", "reqd": 1},
    {"fieldname": "enrollment", "fieldtype": "Link", "options": "Course Enrollment", "label": "Enrollment", "reqd": 1},
    
    // NEW: Track & Category for Certificate
    {"fieldname": "course_track", "fieldtype": "Data", "label": "Course Track", "read_only": 1},
    {"fieldname": "course_category", "fieldtype": "Data", "label": "Course Category", "read_only": 1},
    
    {"fieldname": "issue_date", "fieldtype": "Date", "default": "Today", "label": "Issue Date"},
    {"fieldname": "completion_score", "fieldtype": "Percent", "label": "Completion Score"},
    {"fieldname": "certificate_file", "fieldtype": "Attach", "label": "Certificate PDF"},
    {"fieldname": "is_active", "fieldtype": "Check", "default": 1, "label": "Is Active"},
    {"fieldname": "verification_code", "fieldtype": "Data", "label": "Verification Code", "unique": 1}
  ],
  "permissions": [
    {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
    {"role": "Admin", "read": 1, "write": 1, "create": 1},
    {"role": "Staff", "read": 1, "write": 1, "create": 1},
    {"role": "Driver", "read": 1}
  ]
}
```

#### 1.2 Create API Endpoints

**File**: `derevahuduma_platform/api/elimika.py`

```python
"""
Elimika (Learning) API endpoints
Handles course management, enrollment, and progress tracking
"""

import frappe
from frappe import _
from frappe.utils import now_datetime, getdate

# ============= PUBLIC ENDPOINTS =============

@frappe.whitelist()
def get_courses(track=None, category=None, search=None, status="Published"):
    """
    Get list of courses with optional filters
    
    Args:
        track: beginner | professional
        category: pikipiki | basic | vip | psv | hgv
        search: Search term for course name
        status: Course status (default: Published)
    """
    try:
        filters = {"status": status, "is_active": 1}
        
        if track:
            filters["course_track"] = track
        
        if category:
            filters["course_category"] = category
        
        courses = frappe.get_all(
            "Course",
            filters=filters,
            fields=[
                "name", "course_name_en", "course_name_sw",
                "description_en", "description_sw",
                "course_track", "course_category", "level",
                "duration_hours", "total_lessons", "thumbnail",
                "thumbnail_emoji", "price", "is_free"
            ],
            order_by="course_name_en asc"
        )
        
        # Apply search filter if provided
        if search:
            search_lower = search.lower()
            courses = [
                c for c in courses 
                if search_lower in c.course_name_en.lower() 
                or search_lower in c.course_name_sw.lower()
            ]
        
        return {
            "success": True,
            "data": courses
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Courses Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_course_detail(course_id):
    """Get detailed course information including lessons"""
    try:
        course = frappe.get_doc("Course", course_id)
        
        # Get lessons for this course
        lessons = frappe.get_all(
            "Lesson",
            filters={"course": course_id, "is_active": 1},
            fields=[
                "name", "lesson_title_en", "lesson_title_sw",
                "lesson_order", "content_type", "duration_minutes",
                "is_locked", "summary_en", "summary_sw"
            ],
            order_by="lesson_order asc"
        )
        
        # Check if user is enrolled
        user = frappe.session.user
        enrollment = None
        progress = 0
        
        if user and user != "Guest":
            driver_profile = frappe.db.get_value(
                "Driver Profile", 
                {"user": user}, 
                "name"
            )
            
            if driver_profile:
                enrollment = frappe.db.get_value(
                    "Course Enrollment",
                    {"driver": driver_profile, "course": course_id},
                    ["name", "status", "progress_percentage", "completed_lessons"],
                    as_dict=True
                )
                
                if enrollment:
                    progress = enrollment.progress_percentage
        
        return {
            "success": True,
            "data": {
                "course": course.as_dict(),
                "lessons": lessons,
                "enrollment": enrollment,
                "progress": progress
            }
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Course Detail Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def enroll_in_course(course_id):
    """Enroll current user in a course"""
    try:
        user = frappe.session.user
        
        if not user or user == "Guest":
            frappe.throw(_("Please login to enroll"))
        
        # Get driver profile
        driver_profile = frappe.db.get_value(
            "Driver Profile",
            {"user": user},
            "name"
        )
        
        if not driver_profile:
            frappe.throw(_("Driver profile not found"))
        
        # Check if already enrolled
        existing = frappe.db.exists(
            "Course Enrollment",
            {"driver": driver_profile, "course": course_id}
        )
        
        if existing:
            return {
                "success": True,
                "message": _("Already enrolled in this course"),
                "enrollment": existing
            }
        
        # Get course details
        course = frappe.get_doc("Course", course_id)
        
        # Create enrollment
        enrollment = frappe.get_doc({
            "doctype": "Course Enrollment",
            "driver": driver_profile,
            "course": course_id,
            "enrollment_date": getdate(),
            "status": "Enrolled",
            "total_lessons": course.total_lessons,
            "progress_percentage": 0,
            "completed_lessons": 0
        })
        enrollment.insert(ignore_permissions=True)
        
        frappe.db.commit()
        
        return {
            "success": True,
            "message": _("Successfully enrolled in course"),
            "enrollment": enrollment.name
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Enroll Course Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_my_enrollments():
    """Get current user's course enrollments"""
    try:
        user = frappe.session.user
        
        if not user or user == "Guest":
            frappe.throw(_("Please login"))
        
        driver_profile = frappe.db.get_value(
            "Driver Profile",
            {"user": user},
            "name"
        )
        
        if not driver_profile:
            return {"success": True, "data": []}
        
        enrollments = frappe.get_all(
            "Course Enrollment",
            filters={"driver": driver_profile},
            fields=[
                "name", "course", "enrollment_date", "status",
                "progress_percentage", "completed_lessons", "total_lessons",
                "completion_date", "certificate_issued", "last_accessed"
            ],
            order_by="enrollment_date desc"
        )
        
        # Enrich with course details
        for enrollment in enrollments:
            course = frappe.get_doc("Course", enrollment.course)
            enrollment.course_name_en = course.course_name_en
            enrollment.course_name_sw = course.course_name_sw
            enrollment.course_track = course.course_track
            enrollment.course_category = course.course_category
            enrollment.thumbnail_emoji = course.thumbnail_emoji
        
        return {
            "success": True,
            "data": enrollments
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Enrollments Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_lesson_content(lesson_id, enrollment_id):
    """Get lesson content for enrolled user"""
    try:
        user = frappe.session.user
        
        if not user or user == "Guest":
            frappe.throw(_("Please login"))
        
        # Verify enrollment
        enrollment = frappe.get_doc("Course Enrollment", enrollment_id)
        lesson = frappe.get_doc("Lesson", lesson_id)
        
        # Check if lesson belongs to enrolled course
        if lesson.course != enrollment.course:
            frappe.throw(_("Lesson does not belong to enrolled course"))
        
        # Check if lesson is locked
        if lesson.is_locked:
            # Check if previous lesson is completed
            if lesson.unlock_after_lesson:
                prev_progress = frappe.db.get_value(
                    "Lesson Progress",
                    {
                        "enrollment": enrollment_id,
                        "lesson": lesson.unlock_after_lesson
                    },
                    "status"
                )
                
                if prev_progress != "Completed":
                    frappe.throw(_("Complete previous lesson to unlock this one"))
        
        # Create or update lesson progress
        progress = frappe.db.get_value(
            "Lesson Progress",
            {"enrollment": enrollment_id, "lesson": lesson_id},
            "name"
        )
        
        if not progress:
            progress_doc = frappe.get_doc({
                "doctype": "Lesson Progress",
                "enrollment": enrollment_id,
                "lesson": lesson_id,
                "driver": enrollment.driver,
                "status": "In Progress",
                "started_at": now_datetime()
            })
            progress_doc.insert(ignore_permissions=True)
        else:
            progress_doc = frappe.get_doc("Lesson Progress", progress)
            if progress_doc.status == "Not Started":
                progress_doc.status = "In Progress"
                progress_doc.started_at = now_datetime()
                progress_doc.save(ignore_permissions=True)
        
        # Update enrollment last accessed
        enrollment.last_accessed = now_datetime()
        enrollment.save(ignore_permissions=True)
        
        frappe.db.commit()
        
        return {
            "success": True,
            "data": lesson.as_dict()
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Lesson Content Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def mark_lesson_complete(lesson_id, enrollment_id, time_spent=0):
    """Mark a lesson as completed"""
    try:
        user = frappe.session.user
        
        if not user or user == "Guest":
            frappe.throw(_("Please login"))
        
        # Get lesson progress
        progress = frappe.db.get_value(
            "Lesson Progress",
            {"enrollment": enrollment_id, "lesson": lesson_id},
            "name"
        )
        
        if not progress:
            frappe.throw(_("Lesson progress not found"))
        
        progress_doc = frappe.get_doc("Lesson Progress", progress)
        progress_doc.status = "Completed"
        progress_doc.completed_at = now_datetime()
        progress_doc.time_spent_minutes = int(time_spent)
        progress_doc.save(ignore_permissions=True)
        
        # Update enrollment progress
        enrollment = frappe.get_doc("Course Enrollment", enrollment_id)
        completed_count = frappe.db.count(
            "Lesson Progress",
            {"enrollment": enrollment_id, "status": "Completed"}
        )
        
        enrollment.completed_lessons = completed_count
        enrollment.progress_percentage = (completed_count / enrollment.total_lessons) * 100
        
        if enrollment.progress_percentage >= 100:
            enrollment.status = "Completed"
            enrollment.completion_date = getdate()
        elif enrollment.status == "Enrolled":
            enrollment.status = "In Progress"
        
        enrollment.save(ignore_permissions=True)
        frappe.db.commit()
        
        return {
            "success": True,
            "message": _("Lesson marked as complete"),
            "progress": enrollment.progress_percentage
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Mark Lesson Complete Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def issue_certificate(enrollment_id):
    """Issue certificate for completed course"""
    try:
        user = frappe.session.user
        
        if not user or user == "Guest":
            frappe.throw(_("Please login"))
        
        enrollment = frappe.get_doc("Course Enrollment", enrollment_id)
        
        # Check if course is completed
        if enrollment.status != "Completed":
            frappe.throw(_("Course not yet completed"))
        
        # Check if certificate already issued
        if enrollment.certificate_issued:
            existing_cert = frappe.db.get_value(
                "Course Certificate",
                {"enrollment": enrollment_id},
                "name"
            )
            return {
                "success": True,
                "message": _("Certificate already issued"),
                "certificate": existing_cert
            }
        
        # Get course details
        course = frappe.get_doc("Course", enrollment.course)
        
        # Generate certificate number
        cert_number = frappe.generate_hash(length=10).upper()
        
        # Create certificate
        certificate = frappe.get_doc({
            "doctype": "Course Certificate",
            "certificate_number": cert_number,
            "driver": enrollment.driver,
            "course": enrollment.course,
            "enrollment": enrollment_id,
            "course_track": course.course_track,
            "course_category": course.course_category,
            "issue_date": getdate(),
            "completion_score": enrollment.progress_percentage,
            "verification_code": frappe.generate_hash(length=16).upper()
        })
        certificate.insert(ignore_permissions=True)
        
        # Update enrollment
        enrollment.certificate_issued = 1
        enrollment.save(ignore_permissions=True)
        
        frappe.db.commit()
        
        return {
            "success": True,
            "message": _("Certificate issued successfully"),
            "certificate": certificate.name
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Issue Certificate Error"))
        return {"success": False, "error": str(e)}


# ============= ADMIN ENDPOINTS =============

@frappe.whitelist()
def create_course(course_data):
    """Admin: Create a new course"""
    try:
        # Verify admin permissions
        if not frappe.has_permission("Course", "create"):
            frappe.throw(_("Insufficient permissions"))
        
        course = frappe.get_doc({
            "doctype": "Course",
            **course_data
        })
        course.insert()
        frappe.db.commit()
        
        return {
            "success": True,
            "message": _("Course created successfully"),
            "course": course.name
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Create Course Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_learner_statistics():
    """Admin: Get learner statistics"""
    try:
        if not frappe.has_permission("Course Enrollment", "read"):
            frappe.throw(_("Insufficient permissions"))
        
        stats = {
            "total_enrollments": frappe.db.count("Course Enrollment"),
            "active_learners": frappe.db.count("Course Enrollment", {"status": ["in", ["Enrolled", "In Progress"]]}),
            "completed_courses": frappe.db.count("Course Enrollment", {"status": "Completed"}),
            "certificates_issued": frappe.db.count("Course Certificate"),
            "total_courses": frappe.db.count("Course", {"status": "Published"}),
            "total_lessons": frappe.db.count("Lesson", {"is_active": 1})
        }
        
        return {
            "success": True,
            "data": stats
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Statistics Error"))
        return {"success": False, "error": str(e)}
```

---

### **PHASE 2: Data Migration** (Week 2)
**Goal**: Migrate hardcoded course data to Frappe database

#### 2.1 Create Migration Script

**File**: `derevahuduma_platform/api/seed_elimika_data.py`

```python
"""
Seed script to migrate hardcoded Elimika courses to Frappe database
"""

import frappe

def seed_elimika_courses():
    """Migrate existing hardcoded courses to database"""
    
    courses_data = [
        {
            "course_name_en": "Road Safety Fundamentals",
            "course_name_sw": "Misingi ya Usalama Barabarani",
            "description_en": "Master essential road safety rules and regulations",
            "description_sw": "Jifunze sheria muhimu za usalama barabarani",
            "course_track": "beginner",
            "course_category": "basic",
            "level": "Basic",
            "duration_hours": 4,
            "thumbnail_emoji": "🚦",
            "status": "Published",
            "is_free": 1,
            "lessons": [
                {
                    "lesson_title_en": "Introduction to Road Safety",
                    "lesson_title_sw": "Utangulizi wa Usalama Barabarani",
                    "content_type": "text",
                    "duration_minutes": 15,
                    "lesson_order": 1
                },
                # Add more lessons...
            ]
        },
        {
            "course_name_en": "Traffic Signs & Signals",
            "course_name_sw": "Alama za Trafiki",
            "description_en": "Learn to recognize and understand all traffic signs",
            "description_sw": "Jifunze kutambua na kuelewa alama zote za trafiki",
            "course_track": "beginner",
            "course_category": "basic",
            "level": "Basic",
            "duration_hours": 5,
            "thumbnail_emoji": "🚸",
            "status": "Published",
            "is_free": 1
        },
        {
            "course_name_en": "Defensive Driving",
            "course_name_sw": "Udereva wa Kujilinda",
            "description_en": "Advanced techniques for safe driving",
            "description_sw": "Mbinu za juu za udereva salama",
            "course_track": "professional",
            "course_category": "vip",
            "level": "Intermediate",
            "duration_hours
