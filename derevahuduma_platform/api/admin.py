"""
Admin API endpoints for Dereva Huduma Platform
Provides dashboard statistics and admin-specific operations
"""

import frappe
from frappe import _


@frappe.whitelist()
def get_dashboard_stats():
    """
    Get admin dashboard statistics
    Returns real-time counts for various platform metrics
    """
    try:
        # Verify user has admin/staff role
        if not frappe.has_permission("User", "read"):
            frappe.throw(_("Insufficient permissions"), frappe.PermissionError)
        
        # Get counts from database
        stats = {
            # User Statistics
            "total_drivers": frappe.db.count("Driver Profile"),
            "total_employers": frappe.db.count("Employer Profile"),
            "total_admins": frappe.db.count("Admin Profile"),
            
            # License Statistics
            "total_license_applications": frappe.db.count("License Application"),
            "pending_license_requests": frappe.db.count("License Application", {"status": "Pending"}),
            "approved_licenses": frappe.db.count("License Application", {"status": "Approved"}),
            "rejected_licenses": frappe.db.count("License Application", {"status": "Rejected"}),
            
            # Test Statistics (JiTesti)
            # Note: These DocTypes may not exist yet, so we use try-except
            "total_test_questions": get_count_safe("Test Question"),
            "total_test_attempts": get_count_safe("Test Attempt"),
            "passed_tests": get_count_safe("Test Attempt", {"status": "Passed"}),
            "failed_tests": get_count_safe("Test Attempt", {"status": "Failed"}),
            
            # Course Statistics (Elimika)
            "total_courses": get_count_safe("Course"),
            "active_courses": get_count_safe("Course", {"status": "Active"}),
            "total_lessons": get_count_safe("Lesson"),
            "total_enrollments": get_count_safe("Enrollment"),
            "completed_courses": get_count_safe("Enrollment", {"status": "Completed"}),
            
            # Job Statistics (Ajiri Dereva)
            "total_job_posts": get_count_safe("Job Post"),
            "active_job_posts": get_count_safe("Job Post", {"status": "Active"}),
            "total_applications": get_count_safe("Job Application"),
            "pending_applications": get_count_safe("Job Application", {"status": "Pending"}),
            
            # Payment Statistics
            "total_payments": get_count_safe("Payment Entry"),
            "pending_payments": get_count_safe("Payment Entry", {"status": "Pending"}),
            "completed_payments": get_count_safe("Payment Entry", {"status": "Completed"}),
            
            # Certificate Statistics
            "total_certificates": get_count_safe("Certificate"),
            "active_certificates": get_count_safe("Certificate", {"status": "Active"}),
        }
        
        return {
            "success": True,
            "data": stats
        }
        
    except frappe.PermissionError:
        frappe.throw(_("You don't have permission to access admin dashboard"))
    except Exception as e:
        frappe.log_error(f"Error fetching dashboard stats: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


def get_count_safe(doctype, filters=None):
    """
    Safely get count of a doctype, returns 0 if doctype doesn't exist
    """
    try:
        if frappe.db.exists("DocType", doctype):
            return frappe.db.count(doctype, filters or {})
        return 0
    except Exception:
        return 0


@frappe.whitelist()
def get_recent_activities(limit=10):
    """
    Get recent activities across the platform
    """
    try:
        activities = []
        
        # Recent license applications
        recent_licenses = frappe.get_all(
            "License Application",
            fields=["name", "full_name", "status", "creation"],
            order_by="creation desc",
            limit=limit
        )
        
        for license in recent_licenses:
            activities.append({
                "type": "license",
                "title": f"License application by {license.full_name}",
                "status": license.status,
                "timestamp": license.creation,
                "id": license.name
            })
        
        # Sort by timestamp
        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "success": True,
            "data": activities[:limit]
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching recent activities: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@frappe.whitelist()
def get_user_statistics():
    """
    Get detailed user statistics
    """
    try:
        # Get user counts by type
        user_stats = {
            "drivers": {
                "total": frappe.db.count("Driver Profile"),
                "active": frappe.db.count("Driver Profile", {"enabled": 1}),
                "inactive": frappe.db.count("Driver Profile", {"enabled": 0}),
            },
            "employers": {
                "total": frappe.db.count("Employer Profile"),
                "verified": frappe.db.count("Employer Profile", {"verified": 1}),
                "pending": frappe.db.count("Employer Profile", {"verified": 0}),
            },
            "admins": {
                "total": frappe.db.count("Admin Profile"),
            }
        }
        
        return {
            "success": True,
            "data": user_stats
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching user statistics: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@frappe.whitelist()
def get_revenue_statistics():
    """
    Get revenue and payment statistics
    """
    try:
        # This is a placeholder - adjust based on your actual payment structure
        revenue_stats = {
            "total_revenue": 0,
            "monthly_revenue": 0,
            "pending_payments": get_count_safe("Payment Entry", {"status": "Pending"}),
            "completed_payments": get_count_safe("Payment Entry", {"status": "Completed"}),
        }
        
        # Try to calculate actual revenue if Payment Entry exists
        if frappe.db.exists("DocType", "Payment Entry"):
            try:
                total = frappe.db.sql("""
                    SELECT SUM(paid_amount) as total
                    FROM `tabPayment Entry`
                    WHERE docstatus = 1
                """, as_dict=True)
                
                if total and total[0].get("total"):
                    revenue_stats["total_revenue"] = total[0]["total"]
                    
            except Exception:
                pass
        
        return {
            "success": True,
            "data": revenue_stats
        }
        
    except Exception as e:
        frappe.log_error(f"Error fetching revenue statistics: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
