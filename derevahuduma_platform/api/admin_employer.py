import frappe
from frappe import _
from datetime import datetime


@frappe.whitelist()
def get_employer_verification_queue():
    """Get employers pending verification for admin review"""
    try:
        # Check if user is admin
        if not frappe.session.user or frappe.session.user == "Guest":
            frappe.throw("Authentication required")

        user_roles = frappe.get_roles(frappe.session.user)
        if "Admin" not in user_roles and "Staff" not in user_roles:
            frappe.throw("Admin access required")

        # Get employers with pending verification
        employers = frappe.get_all("Employer Profile",
            filters={
                "verification_status": ["in", ["Payment Pending", "Documents Under Review", "Pending"]]
            },
            fields=[
                "name", "company_name", "contact_person", "phone_number",
                "email", "verification_status", "creation", "modified"
            ],
            order_by="creation desc"
        )

        # Add risk level calculation for each employer
        for employer in employers:
            employer.risk_level = calculate_employer_risk_level(employer.name)

        return {
            "success": True,
            "employers": employers
        }

    except Exception as e:
        frappe.log_error(f"Get employer verification queue failed: {str(e)}", "Employer Verification")
        return {
            "success": False,
            "message": str(e)
        }


def calculate_employer_risk_level(employer_name):
    """Calculate risk level for employer"""
    try:
        employer = frappe.get_doc("Employer Profile", employer_name)

        risk_score = 0

        # Factor 1: Company age (< 2 years = high risk)
        if employer.registration_date:
            company_age = (frappe.utils.nowdate() - employer.registration_date).days / 365
            if company_age < 2:
                risk_score += 30

        # Factor 2: Previous verification attempts
        failed_attempts = frappe.db.count("Employer Profile",
            {"company_name": employer.company_name, "verification_status": "Rejected"})
        risk_score += failed_attempts * 20

        # Factor 3: Document completeness
        documents = frappe.get_all("Employer Document",
            filters={"employer": employer_name})
        if len(documents) < 4:
            risk_score += 25

        # Factor 4: Payment history
        payments = frappe.get_all("JiTesti Payment",
            filters={"user": employer.user, "payment_type": "employer_verification", "status": "Failed"})
        risk_score += len(payments) * 15

        # Determine risk level
        if risk_score >= 60:
            return "High Risk"
        elif risk_score >= 30:
            return "Medium Risk"
        else:
            return "Low Risk"

    except Exception as e:
        frappe.log_error(f"Risk calculation failed for {employer_name}: {str(e)}")
        return "Unknown"


@frappe.whitelist()
def review_employer_verification(employer_name, action, comments=None):
    """Admin review of employer verification"""
    try:
        # Check if user is admin
        if not frappe.session.user or frappe.session.user == "Guest":
            frappe.throw("Authentication required")

        user_roles = frappe.get_roles(frappe.session.user)
        if "Admin" not in user_roles and "Staff" not in user_roles:
            frappe.throw("Admin access required")

        employer = frappe.get_doc("Employer Profile", employer_name)

        if action == "approve":
            employer.verification_status = "Verified"
            employer.verified = 1
            employer.save(ignore_permissions=True)

            # Notify employer of approval
            notify_employer_verification_result(employer_name, "approved", comments)

        elif action == "reject":
            employer.verification_status = "Rejected"
            employer.save(ignore_permissions=True)

            # Notify employer of rejection
            notify_employer_verification_result(employer_name, "rejected", comments)

        else:
            frappe.throw("Invalid action. Must be 'approve' or 'reject'")

        # Log the action
        frappe.get_doc({
            "doctype": "Compliance Log",
            "entity_type": "Employer",
            "entity_name": employer_name,
            "action": "Verification Review",
            "action_details": f"Admin {action}ed verification. Comments: {comments or 'None'}",
            "performed_by": frappe.session.user
        }).insert(ignore_permissions=True)

        frappe.db.commit()

        return {
            "success": True,
            "message": f"Employer verification {action}ed successfully"
        }

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Employer verification review failed: {str(e)}", "Employer Verification")
        return {
            "success": False,
            "message": str(e)
        }


def notify_employer_verification_result(employer_name, result, comments=None):
    """Notify employer of verification result"""
    try:
        employer = frappe.get_doc("Employer Profile", employer_name)

        subject = f"Dereva Kiganjani - Employer Verification {'Approved' if result == 'approved' else 'Rejected'}"

        if result == "approved":
            message = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #16a34a;">Employer Verification Approved!</h2>

                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
                    <h3>Congratulations, {employer.company_name}!</h3>
                    <p>Your employer verification has been approved. You now have full access to all employer features including:</p>
                    <ul>
                        <li>Post job opportunities</li>
                        <li>Access to verified driver profiles</li>
                        <li>Advanced hiring tools</li>
                        <li>Priority support</li>
                    </ul>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                    <a href="{frappe.utils.get_url()}/employer/dashboard" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Access Your Dashboard
                    </a>
                </p>

                <p style="color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    <strong>Dereva Kiganjani Verification Team</strong><br>
                    MDV Vehicle Fleet Limited
                </p>
            </div>
            """
        else:
            message = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Employer Verification Update</h2>

                <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                    <h3>Verification Status: Rejected</h3>
                    <p>Unfortunately, your employer verification request for {employer.company_name} could not be approved at this time.</p>
                    {f'<p><strong>Reason:</strong> {comments}</p>' if comments else ''}
                    <p>Please review the requirements and submit updated documentation if you wish to reapply.</p>
                </div>

                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h4>Required Documents:</h4>
                    <ul>
                        <li>Business Registration Certificate</li>
                        <li>Tax Certificate (TRA)</li>
                        <li>Company License</li>
                        <li>BRELA Business License</li>
                    </ul>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                    <a href="{frappe.utils.get_url()}/employer/settings" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Update Documents
                    </a>
                </p>

                <p style="color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    <strong>Dereva Kiganjani Verification Team</strong><br>
                    MDV Vehicle Fleet Limited
                </p>
            </div>
            """

        frappe.sendmail(
            recipients=[employer.email],
            subject=subject,
            message=message,
            delayed=False
        )

    except Exception as e:
        frappe.log_error(f"Employer notification failed: {str(e)}", "Employer Verification")


@frappe.whitelist()
def get_employer_verification_details(employer_name):
    """Get detailed verification information for admin review"""
    try:
        # Check if user is admin
        if not frappe.session.user or frappe.session.user == "Guest":
            frappe.throw("Authentication required")

        user_roles = frappe.get_roles(frappe.session.user)
        if "Admin" not in user_roles and "Staff" not in user_roles:
            frappe.throw("Admin access required")

        employer = frappe.get_doc("Employer Profile", employer_name)

        # Get documents
        documents = frappe.get_all("Employer Document",
            filters={"employer": employer_name},
            fields=["name", "document_type", "document_file", "verification_status", "reviewer_comments", "creation"]
        )

        # Get payment history
        payments = frappe.get_all("JiTesti Payment",
            filters={"user": employer.user, "payment_type": "employer_verification"},
            fields=["status", "amount", "reference_number", "creation"],
            order_by="creation desc"
        )

        # Get risk assessment
        risk_level = calculate_employer_risk_level(employer_name)

        return {
            "success": True,
            "employer": employer.as_dict(),
            "documents": documents,
            "payments": payments,
            "risk_level": risk_level
        }

    except Exception as e:
        frappe.log_error(f"Get employer verification details failed: {str(e)}", "Employer Verification")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist()
def get_dashboard_stats():
    """Get dashboard statistics for admin"""
    try:
        # Check if user is admin
        if not frappe.session.user or frappe.session.user == "Guest":
            frappe.throw("Authentication required")

        user_roles = frappe.get_roles(frappe.session.user)
        if "Admin" not in user_roles and "Staff" not in user_roles:
            frappe.throw("Admin access required")

        # Get employer statistics
        total_employers = frappe.db.count("Employer Profile")
        verified_employers = frappe.db.count("Employer Profile", {"verification_status": "Verified"})
        pending_verifications = frappe.db.count("Employer Profile",
            {"verification_status": ["in", ["Payment Pending", "Documents Under Review"]]})
        total_drivers = frappe.db.count("Driver Profile")
        pending_license_requests = frappe.db.count("License Application",
            {"status": ["in", ["Pending", "Under Review"]]})
        active_courses = frappe.db.count("Course", {"status": "Active"})
        active_job_posts = frappe.db.count("Job Post", {"status": "Active"})

        return {
            "success": True,
            "data": {
                "total_employers": total_employers,
                "verified_employers": verified_employers,
                "pending_verifications": pending_verifications,
                "total_drivers": total_drivers,
                "pending_license_requests": pending_license_requests,
                "active_courses": active_courses,
                "active_job_posts": active_job_posts
            }
        }

    except Exception as e:
        frappe.log_error(f"Get dashboard stats failed: {str(e)}", "Dashboard Stats")
        return {
            "success": False,
            "message": str(e)
        }
