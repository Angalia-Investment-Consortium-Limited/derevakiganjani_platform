"""
Elimika (Learning) API endpoints
Handles course management, enrollment, and progress tracking
"""

import frappe
from frappe import _
from frappe.utils import now_datetime, getdate, today

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
        enrollment.progress_percentage = (completed_count / enrollment.total_lessons) * 100 if enrollment.total_lessons > 0 else 0
        
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
def get_course_progress(enrollment_id):
    """Get detailed progress for a course enrollment"""
    try:
        user = frappe.session.user
        
        if not user or user == "Guest":
            frappe.throw(_("Please login"))
        
        enrollment = frappe.get_doc("Course Enrollment", enrollment_id)
        
        # Get all lesson progress
        lesson_progress = frappe.get_all(
            "Lesson Progress",
            filters={"enrollment": enrollment_id},
            fields=["lesson", "status", "started_at", "completed_at", "time_spent_minutes"],
            order_by="modified desc"
        )
        
        return {
            "success": True,
            "data": {
                "enrollment": enrollment.as_dict(),
                "lesson_progress": lesson_progress
            }
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Course Progress Error"))
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
            "certificate": certificate.name,
            "certificate_data": certificate.as_dict()
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Issue Certificate Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_my_certificates():
    """Get current user's certificates"""
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
        
        certificates = frappe.get_all(
            "Course Certificate",
            filters={"driver": driver_profile, "is_active": 1},
            fields=[
                "name", "certificate_number", "course", "course_track",
                "course_category", "issue_date", "completion_score",
                "verification_code", "certificate_file"
            ],
            order_by="issue_date desc"
        )
        
        # Enrich with course details
        for cert in certificates:
            course = frappe.get_doc("Course", cert.course)
            cert.course_name_en = course.course_name_en
            cert.course_name_sw = course.course_name_sw
        
        return {
            "success": True,
            "data": certificates
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Certificates Error"))
        return {"success": False, "error": str(e)}


# ============= ADMIN ENDPOINTS =============

@frappe.whitelist()
def create_course(course_data):
    """Admin: Create a new course"""
    try:
        # Verify admin permissions
        if not frappe.has_permission("Course", "create"):
            frappe.throw(_("Insufficient permissions"))
        
        # Parse course_data if it's a string
        if isinstance(course_data, str):
            import json
            course_data = json.loads(course_data)
        
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
def update_course(course_id, course_data):
    """Admin: Update a course"""
    try:
        if not frappe.has_permission("Course", "write"):
            frappe.throw(_("Insufficient permissions"))
        
        # Parse course_data if it's a string
        if isinstance(course_data, str):
            import json
            course_data = json.loads(course_data)
        
        course = frappe.get_doc("Course", course_id)
        
        for key, value in course_data.items():
            if hasattr(course, key):
                setattr(course, key, value)
        
        course.save()
        frappe.db.commit()
        
        return {
            "success": True,
            "message": _("Course updated successfully")
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Update Course Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def create_lesson(lesson_data):
    """Admin: Create a new lesson"""
    try:
        if not frappe.has_permission("Lesson", "create"):
            frappe.throw(_("Insufficient permissions"))
        
        # Parse lesson_data if it's a string
        if isinstance(lesson_data, str):
            import json
            lesson_data = json.loads(lesson_data)
        
        lesson = frappe.get_doc({
            "doctype": "Lesson",
            **lesson_data
        })
        lesson.insert()
        frappe.db.commit()
        
        return {
            "success": True,
            "message": _("Lesson created successfully"),
            "lesson": lesson.name
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Create Lesson Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def update_lesson(lesson_id, lesson_data):
    """Admin: Update a lesson"""
    try:
        if not frappe.has_permission("Lesson", "write"):
            frappe.throw(_("Insufficient permissions"))
        
        # Parse lesson_data if it's a string
        if isinstance(lesson_data, str):
            import json
            lesson_data = json.loads(lesson_data)
        
        lesson = frappe.get_doc("Lesson", lesson_id)
        
        for key, value in lesson_data.items():
            if hasattr(lesson, key):
                setattr(lesson, key, value)
        
        lesson.save()
        frappe.db.commit()
        
        return {
            "success": True,
            "message": _("Lesson updated successfully")
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Update Lesson Error"))
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
            "total_lessons": frappe.db.count("Lesson", {"is_active": 1}),
            "beginner_courses": frappe.db.count("Course", {"course_track": "beginner", "status": "Published"}),
            "professional_courses": frappe.db.count("Course", {"course_track": "professional", "status": "Published"})
        }
        
        return {
            "success": True,
            "data": stats
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Statistics Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_course_enrollments(course_id):
    """Admin: Get enrollments for a specific course"""
    try:
        if not frappe.has_permission("Course Enrollment", "read"):
            frappe.throw(_("Insufficient permissions"))
        
        enrollments = frappe.get_all(
            "Course Enrollment",
            filters={"course": course_id},
            fields=[
                "name", "driver", "enrollment_date", "status",
                "progress_percentage", "completed_lessons", "total_lessons",
                "completion_date", "certificate_issued"
            ],
            order_by="enrollment_date desc"
        )
        
        # Enrich with driver details
        for enrollment in enrollments:
            driver = frappe.get_doc("Driver Profile", enrollment.driver)
            enrollment.driver_name = driver.full_name
            enrollment.driver_phone = driver.phone_number
        
        return {
            "success": True,
            "data": enrollments
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Course Enrollments Error"))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_learner_progress(driver_id):
    """Admin: Get progress for a specific learner"""
    try:
        if not frappe.has_permission("Course Enrollment", "read"):
            frappe.throw(_("Insufficient permissions"))
        
        enrollments = frappe.get_all(
            "Course Enrollment",
            filters={"driver": driver_id},
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
        
        return {
            "success": True,
            "data": enrollments
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Learner Progress Error"))
        return {"success": False, "error": str(e)}
