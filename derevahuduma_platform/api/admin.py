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


# ============================================================================
# USER MANAGEMENT ENDPOINTS
# ============================================================================

@frappe.whitelist()
def get_users(search_query="", role_filter="all", status_filter="all", limit=50, offset=0):
    """
    Get list of users with filters
    
    Args:
        search_query: Search by name, email, or phone
        role_filter: Filter by role (all, driver, employer, admin)
        status_filter: Filter by status (all, active, suspended)
        limit: Number of records to return
        offset: Offset for pagination
        
    Returns:
        List of users with profile data
    """
    try:
        # Verify admin permissions
        if not frappe.has_permission("User", "read"):
            frappe.throw(_("Insufficient permissions"), frappe.PermissionError)
        
        # Build query conditions
        conditions = []
        values = {}
        
        # Search filter
        if search_query:
            conditions.append("""(
                u.full_name LIKE %(search)s OR 
                u.email LIKE %(search)s OR 
                u.mobile_no LIKE %(search)s
            )""")
            values["search"] = f"%{search_query}%"
        
        # Status filter
        if status_filter != "all":
            if status_filter == "active":
                conditions.append("u.enabled = 1")
            elif status_filter == "suspended":
                conditions.append("u.enabled = 0")
        
        # Exclude system users
        conditions.append("u.name NOT IN ('Administrator', 'Guest')")
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        # Get users
        query = f"""
            SELECT 
                u.name,
                u.email,
                u.full_name,
                u.mobile_no,
                u.enabled,
                u.creation,
                u.user_image
            FROM `tabUser` u
            WHERE {where_clause}
            ORDER BY u.creation DESC
            LIMIT %(limit)s OFFSET %(offset)s
        """
        
        values["limit"] = int(limit)
        values["offset"] = int(offset)
        
        users = frappe.db.sql(query, values, as_dict=True)
        
        # Enrich with profile data and roles
        enriched_users = []
        for user in users:
            # Get user roles
            roles = frappe.get_all(
                "Has Role",
                filters={"parent": user.name, "parenttype": "User"},
                fields=["role"]
            )
            role_list = [r.role for r in roles]
            
            # Determine primary user type
            user_type = None
            if "Driver" in role_list:
                user_type = "Driver"
            elif "Employer" in role_list:
                user_type = "Employer"
            elif "Admin" in role_list or "Staff" in role_list:
                user_type = "Admin"
            
            # Apply role filter
            if role_filter != "all":
                if role_filter.lower() != (user_type or "").lower():
                    continue
            
            # Get profile data
            profile = None
            if user_type == "Driver":
                profile_data = frappe.db.get_value(
                    "Driver Profile",
                    {"user": user.name},
                    ["name", "license_number", "license_category", "experience_years", "address"],
                    as_dict=True
                )
                if profile_data:
                    profile = profile_data
                    
            elif user_type == "Employer":
                profile_data = frappe.db.get_value(
                    "Employer Profile",
                    {"user": user.name},
                    ["name", "company_name", "address", "verified", "verification_status"],
                    as_dict=True
                )
                if profile_data:
                    profile = profile_data
                    
            elif user_type == "Admin":
                profile_data = frappe.db.get_value(
                    "Admin Profile",
                    {"user": user.name},
                    ["name", "department", "position"],
                    as_dict=True
                )
                if profile_data:
                    profile = profile_data
            
            enriched_users.append({
                "id": user.name,
                "name": user.full_name,
                "email": user.email,
                "phone": user.mobile_no,
                "user_type": user_type,
                "roles": role_list,
                "status": "Active" if user.enabled else "Suspended",
                "enabled": user.enabled,
                "created_on": user.creation,
                "user_image": user.user_image,
                "profile": profile
            })
        
        # Get total count for pagination
        count_query = f"""
            SELECT COUNT(*) as total
            FROM `tabUser` u
            WHERE {where_clause}
        """
        total = frappe.db.sql(count_query, values, as_dict=True)[0].total
        
        return {
            "success": True,
            "data": enriched_users,
            "total": total,
            "limit": int(limit),
            "offset": int(offset)
        }
        
    except frappe.PermissionError:
        frappe.throw(_("You don't have permission to access user management"))
    except Exception as e:
        frappe.log_error(f"Error fetching users: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@frappe.whitelist()
def get_user(user_id):
    """
    Get single user details
    
    Args:
        user_id: User ID
        
    Returns:
        Complete user data with profile
    """
    try:
        # Verify admin permissions
        if not frappe.has_permission("User", "read"):
            frappe.throw(_("Insufficient permissions"), frappe.PermissionError)
        
        # Get user
        user = frappe.get_doc("User", user_id)
        
        # Get roles
        roles = [r.role for r in user.roles]
        
        # Determine user type
        user_type = None
        if "Driver" in roles:
            user_type = "Driver"
        elif "Employer" in roles:
            user_type = "Employer"
        elif "Admin" in roles or "Staff" in roles:
            user_type = "Admin"
        
        # Get profile
        profile = None
        if user_type == "Driver":
            profile_name = frappe.db.get_value("Driver Profile", {"user": user_id})
            if profile_name:
                profile = frappe.get_doc("Driver Profile", profile_name).as_dict()
                
        elif user_type == "Employer":
            profile_name = frappe.db.get_value("Employer Profile", {"user": user_id})
            if profile_name:
                profile = frappe.get_doc("Employer Profile", profile_name).as_dict()
                
        elif user_type == "Admin":
            profile_name = frappe.db.get_value("Admin Profile", {"user": user_id})
            if profile_name:
                profile = frappe.get_doc("Admin Profile", profile_name).as_dict()
        
        return {
            "success": True,
            "data": {
                "id": user.name,
                "email": user.email,
                "full_name": user.full_name,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "mobile_no": user.mobile_no,
                "user_type": user_type,
                "roles": roles,
                "enabled": user.enabled,
                "status": "Active" if user.enabled else "Suspended",
                "created_on": user.creation,
                "user_image": user.user_image,
                "profile": profile
            }
        }
        
    except frappe.PermissionError:
        frappe.throw(_("You don't have permission to access user details"))
    except Exception as e:
        frappe.log_error(f"Error fetching user {user_id}: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


@frappe.whitelist()
def create_user(
    full_name,
    mobile_no,
    user_type,
    email=None,
    password=None,
    language="sw",
    # Driver fields
    license_number=None,
    license_category=None,
    experience_years=None,
    region=None,
    district=None,
    national_id=None,
    # Employer fields
    company_name=None,
    company_type=None,
    company_registration=None,
    address=None,
    website=None,
    verification_status="unverified",
    # Admin fields
    department=None,
    position=None,
    is_tutor=False,
    is_license_officer=False,
    is_test_officer=False,
    is_finance=False,
    is_super_admin=False
):
    """
    Create a new user (Admin function)
    
    Args:
        full_name: Full name (required)
        mobile_no: Phone number (required)
        user_type: User type - Driver, Employer, or Admin (required)
        email: Email address (optional)
        password: Password (optional, auto-generated if not provided)
        language: Preferred language (en/sw, default: sw)
        ... other profile-specific fields
        
    Returns:
        Created user data
    """
    try:
        # Verify admin permissions
        if not frappe.has_permission("User", "create"):
            frappe.throw(_("Insufficient permissions"), frappe.PermissionError)
        
        # Validate required fields
        if not full_name or not mobile_no or not user_type:
            frappe.throw(_("Full name, mobile number, and user type are required"))
        
        if user_type not in ["Driver", "Employer", "Admin"]:
            frappe.throw(_("Invalid user type"))
        
        # Import validation functions from auth module
        from .auth import validate_phone, normalize_phone, validate_email, validate_password, send_welcome_email
        
        # Validate and normalize phone
        if not validate_phone(mobile_no):
            frappe.throw(_("Invalid phone number format"))
        
        mobile_no = normalize_phone(mobile_no)
        
        # Validate email if provided
        if email and not validate_email(email):
            frappe.throw(_("Invalid email format"))
        
        # Check if user exists
        if frappe.db.exists("User", {"mobile_no": mobile_no}):
            frappe.throw(_("A user with this mobile number already exists"))
        
        if email and frappe.db.exists("User", {"email": email}):
            frappe.throw(_("A user with this email already exists"))
        
        # Generate password if not provided
        if not password:
            import secrets
            import string
            alphabet = string.ascii_letters + string.digits
            password = ''.join(secrets.choice(alphabet) for i in range(12))
        else:
            # Validate password
            password_validation = validate_password(password)
            if not password_validation['valid']:
                frappe.throw(_('<br>'.join(password_validation['errors'])))
        
        # Split full name
        name_parts = full_name.split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        # Use mobile number as username if no email
        username = email if email else mobile_no
        
        # Create user
        user = frappe.get_doc({
            "doctype": "User",
            "email": username,
            "first_name": first_name,
            "last_name": last_name,
            "full_name": full_name,
            "mobile_no": mobile_no,
            "enabled": 1,
            "send_welcome_email": 0,
            "user_type": "System User"
        })
        
        user.insert(ignore_permissions=True)
        
        # Set password
        from frappe.utils.password import update_password
        update_password(user.name, password)
        
        # Add role
        user.add_roles(user_type)
        
        # Create profile based on user type
        profile = None
        
        if user_type == "Driver":
            profile = frappe.get_doc({
                "doctype": "Driver Profile",
                "user": user.name,
                "full_name": full_name,
                "phone_number": mobile_no,
                "email": email,
                "national_id": national_id,
                "license_number": license_number,
                "license_category": license_category,
                "experience_years": experience_years,
                "address": address,
                "preferred_language": language,
                "status": "Active"
            })
            profile.insert(ignore_permissions=True)
            
        elif user_type == "Employer":
            profile = frappe.get_doc({
                "doctype": "Employer Profile",
                "user": user.name,
                "company_name": company_name or full_name,
                "contact_person": full_name,
                "phone_number": mobile_no,
                "email": email,
                "company_registration": company_registration,
                "address": address,
                "website": website,
                "verified": 1 if verification_status == "verified" else 0,
                "verification_status": verification_status or "Pending"
            })
            profile.insert(ignore_permissions=True)
            
        elif user_type == "Admin":
            profile = frappe.get_doc({
                "doctype": "Admin Profile",
                "user": user.name,
                "full_name": full_name,
                "phone_number": mobile_no,
                "email": email,
                "department": department,
                "position": position,
                "is_tutor": is_tutor,
                "is_license_officer": is_license_officer,
                "is_test_officer": is_test_officer,
                "is_finance": is_finance,
                "is_super_admin": is_super_admin
            })
            profile.insert(ignore_permissions=True)
            
            # Add additional roles for admin sub-roles
            if is_super_admin:
                user.add_roles("System Manager")
            if is_tutor:
                user.add_roles("Tutor")
            if is_license_officer:
                user.add_roles("License Officer")
            if is_test_officer:
                user.add_roles("Test Officer")
            if is_finance:
                user.add_roles("Finance")
        
        frappe.db.commit()
        
        # Send welcome email
        try:
            send_welcome_email(
                user, 
                user_type, 
                company_name if user_type == "Employer" else None,
                language
            )
        except Exception as email_error:
            # Log but don't fail
            frappe.log_error(
                title="Welcome Email Error",
                message=f"Failed to send welcome email to {user.name}: {str(email_error)}"
            )
        
        return {
            "success": True,
            "message": "User created successfully",
            "data": {
                "id": user.name,
                "email": user.email,
                "full_name": user.full_name,
                "mobile_no": user.mobile_no,
                "user_type": user_type,
                "profile": profile.as_dict() if profile else None
            }
        }
        
    except frappe.PermissionError:
        frappe.db.rollback()
        frappe.throw(_("You don't have permission to create users"))
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error creating user: {str(e)}")
        frappe.throw(_(str(e)))


@frappe.whitelist()
def update_user(
    user_id,
    full_name=None,
    mobile_no=None,
    email=None,
    password=None,
    # Driver fields
    license_number=None,
    license_category=None,
    experience_years=None,
    region=None,
    district=None,
    national_id=None,
    # Employer fields
    company_name=None,
    company_type=None,
    company_registration=None,
    address=None,
    website=None,
    verification_status=None,
    # Admin fields
    department=None,
    position=None,
    is_tutor=None,
    is_license_officer=None,
    is_test_officer=None,
    is_finance=None,
    is_super_admin=None
):
    """
    Update user details
    
    Args:
        user_id: User ID (required)
        ... other fields to update
        
    Returns:
        Updated user data
    """
    try:
        # Verify admin permissions
        if not frappe.has_permission("User", "write"):
            frappe.throw(_("Insufficient permissions"), frappe.PermissionError)
        
        # Get user
        user = frappe.get_doc("User", user_id)
        
        # Update user fields
        if full_name:
            name_parts = full_name.split(" ", 1)
            user.first_name = name_parts[0]
            user.last_name = name_parts[1] if len(name_parts) > 1 else ""
            user.full_name = full_name
        
        if mobile_no:
            from .auth import validate_phone, normalize_phone
            if not validate_phone(mobile_no):
                frappe.throw(_("Invalid phone number format"))
            user.mobile_no = normalize_phone(mobile_no)
        
        if email:
            from .auth import validate_email
            if not validate_email(email):
                frappe.throw(_("Invalid email format"))
            # Check if email is already used by another user
            existing = frappe.db.get_value("User", {"email": email, "name": ["!=", user_id]})
            if existing:
                frappe.throw(_("Email already in use by another user"))
            user.email = email
        
        if password:
            from .auth import validate_password
            password_validation = validate_password(password)
            if not password_validation['valid']:
                frappe.throw(_('<br>'.join(password_validation['errors'])))
            from frappe.utils.password import update_password
            update_password(user.name, password)
        
        user.save(ignore_permissions=True)
        
        # Determine user type
        roles = [r.role for r in user.roles]
        user_type = None
        if "Driver" in roles:
            user_type = "Driver"
        elif "Employer" in roles:
            user_type = "Employer"
        elif "Admin" in roles or "Staff" in roles:
            user_type = "Admin"
        
        # Update profile
        if user_type == "Driver":
            profile_name = frappe.db.get_value("Driver Profile", {"user": user_id})
            if profile_name:
                profile = frappe.get_doc("Driver Profile", profile_name)
                if full_name:
                    profile.full_name = full_name
                if mobile_no:
                    profile.phone_number = user.mobile_no
                if email:
                    profile.email = email
                if license_number is not None:
                    profile.license_number = license_number
                if license_category is not None:
                    profile.license_category = license_category
                if experience_years is not None:
                    profile.experience_years = experience_years
                if address is not None:
                    profile.address = address
                if national_id is not None:
                    profile.national_id = national_id
                profile.save(ignore_permissions=True)
                
        elif user_type == "Employer":
            profile_name = frappe.db.get_value("Employer Profile", {"user": user_id})
            if profile_name:
                profile = frappe.get_doc("Employer Profile", profile_name)
                if company_name is not None:
                    profile.company_name = company_name
                if full_name:
                    profile.contact_person = full_name
                if mobile_no:
                    profile.phone_number = user.mobile_no
                if email:
                    profile.email = email
                if company_registration is not None:
                    profile.company_registration = company_registration
                if address is not None:
                    profile.address = address
                if website is not None:
                    profile.website = website
                if verification_status is not None:
                    profile.verification_status = verification_status
                    profile.verified = 1 if verification_status == "verified" else 0
                profile.save(ignore_permissions=True)
                
        elif user_type == "Admin":
            profile_name = frappe.db.get_value("Admin Profile", {"user": user_id})
            if profile_name:
                profile = frappe.get_doc("Admin Profile", profile_name)
                if full_name:
                    profile.full_name = full_name
                if mobile_no:
                    profile.phone_number = user.mobile_no
                if email:
                    profile.email = email
                if department is not None:
                    profile.department = department
                if position is not None:
                    profile.position = position
                if is_tutor is not None:
                    profile.is_tutor = is_tutor
                if is_license_officer is not None:
                    profile.is_license_officer = is_license_officer
                if is_test_officer is not None:
                    profile.is_test_officer = is_test_officer
                if is_finance is not None:
                    profile.is_finance = is_finance
                if is_super_admin is not None:
                    profile.is_super_admin = is_super_admin
                profile.save(ignore_permissions=True)
        
        frappe.db.commit()
        
        return {
            "success": True,
            "message": "User updated successfully",
            "data": {
                "id": user.name,
                "email": user.email,
                "full_name": user.full_name,
                "mobile_no": user.mobile_no
            }
        }
        
    except frappe.PermissionError:
        frappe.db.rollback()
        frappe.throw(_("You don't have permission to update users"))
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error updating user {user_id}: {str(e)}")
        frappe.throw(_(str(e)))


@frappe.whitelist()
def toggle_user_status(user_id, enabled):
    """
    Suspend or activate a user
    
    Args:
        user_id: User ID
        enabled: 1 for active, 0 for suspended
        
    Returns:
        Success message
    """
    try:
        # Verify admin permissions
        if not frappe.has_permission("User", "write"):
            frappe.throw(_("Insufficient permissions"), frappe.PermissionError)
        
        # Prevent self-suspension
        if user_id == frappe.session.user:
            frappe.throw(_("You cannot suspend your own account"))
        
        # Prevent suspending Administrator
        if user_id == "Administrator":
            frappe.throw(_("Cannot suspend Administrator account"))
        
        # Get user
        user = frappe.get_doc("User", user_id)
        user.enabled = int(enabled)
        user.save(ignore_permissions=True)
        
        frappe.db.commit()
        
        status = "activated" if enabled else "suspended"
        
        return {
            "success": True,
            "message": f"User {status} successfully"
        }
        
    except frappe.PermissionError:
        frappe.throw(_("You don't have permission to change user status"))
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error toggling user status for {user_id}: {str(e)}")
        frappe.throw(_(str(e)))


@frappe.whitelist()
def delete_user(user_id):
    """
    Delete a user and their associated profile
    
    Args:
        user_id: User ID to delete
        
    Returns:
        Success message
    """
    try:
        # Verify admin permissions
        if not frappe.has_permission("User", "delete"):
            frappe.throw(_("Insufficient permissions"), frappe.PermissionError)
        
        # Prevent self-deletion
        if user_id == frappe.session.user:
            frappe.throw(_("You cannot delete your own account"))
        
        # Prevent deleting Administrator
        if user_id == "Administrator":
            frappe.throw(_("Cannot delete Administrator account"))
        
        # Prevent deleting Guest
        if user_id == "Guest":
            frappe.throw(_("Cannot delete Guest account"))
        
        # Get user to determine type
        user = frappe.get_doc("User", user_id)
        roles = [r.role for r in user.roles]
        
        # Determine user type
        user_type = None
        if "Driver" in roles:
            user_type = "Driver"
        elif "Employer" in roles:
            user_type = "Employer"
        elif "Admin" in roles or "Staff" in roles:
            user_type = "Admin"
        
        # Delete associated profile first
        if user_type == "Driver":
            profile_name = frappe.db.get_value("Driver Profile", {"user": user_id})
            if profile_name:
                frappe.delete_doc("Driver Profile", profile_name, ignore_permissions=True)
                
        elif user_type == "Employer":
            profile_name = frappe.db.get_value("Employer Profile", {"user": user_id})
            if profile_name:
                frappe.delete_doc("Employer Profile", profile_name, ignore_permissions=True)
                
        elif user_type == "Admin":
            profile_name = frappe.db.get_value("Admin Profile", {"user": user_id})
            if profile_name:
                frappe.delete_doc("Admin Profile", profile_name, ignore_permissions=True)
        
        # Delete the user
        frappe.delete_doc("User", user_id, ignore_permissions=True)
        
        frappe.db.commit()
        
        return {
            "success": True,
            "message": "User deleted successfully"
        }
        
    except frappe.PermissionError:
        frappe.db.rollback()
        frappe.throw(_("You don't have permission to delete users"))
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error deleting user {user_id}: {str(e)}")
        frappe.throw(_(str(e)))
