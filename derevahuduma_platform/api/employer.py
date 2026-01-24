import frappe
from frappe import _
from datetime import datetime


def get_current_employer():
    """Get current user's employer profile"""
    if not frappe.session.user or frappe.session.user == "Guest":
        frappe.throw("Authentication required")

    employer_name = frappe.db.get_value("Employer Profile",
        {"user": frappe.session.user}, "name")

    if not employer_name:
        frappe.throw("Employer profile not found")

    return frappe.get_doc("Employer Profile", employer_name)


@frappe.whitelist()
def submit_verification_request():
    """Submit employer verification request with payment"""
    try:
        employer = get_current_employer()

        # Check if employer is already verified
        if employer.verification_status == "Verified":
            frappe.throw("Employer is already verified")

        # Check if employer already has a pending verification request
        if employer.verification_status in ["Payment Pending", "Documents Under Review"]:
            frappe.throw("You already have a pending verification request")

        # Check if documents are uploaded
        documents = frappe.get_all("Employer Document",
            filters={"employer": employer.name, "verification_status": "Pending"})

        if len(documents) < 4:  # Require all 4 document types
            frappe.throw("All required documents must be uploaded: Business Registration, Tax Certificate, Company License, BRELA Certificate")

        # Create verification payment
        payment_result = frappe.call(
            'derevahuduma_platform.api.selcom.create_employer_verification_payment'
        )

        if not payment_result.get("success"):
            frappe.throw(payment_result.get("message", "Payment creation failed"))

        # Update employer status
        employer.verification_status = "Payment Pending"
        employer.save(ignore_permissions=True)
        frappe.db.commit()

        return {
            "success": True,
            "message": "Verification request submitted. Please complete your payment.",
            "payment": payment_result
        }

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Verification request submission failed: {str(e)}", "Employer Verification")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist()
def process_verification_payment_success(order_id):
    """Handle successful verification payment"""
    try:
        employer = get_current_employer()

        # Verify payment with Selcom
        payment_status = frappe.call(
            'derevahuduma_platform.api.selcom.verify_employer_verification_payment',
            args={"payment_id": order_id}
        )

        if payment_status.get("status") == "completed":
            employer.verification_status = "Documents Under Review"
            employer.save(ignore_permissions=True)

            # Notify admin of new verification request
            notify_admin_new_verification_request(employer.name)

            frappe.db.commit()

            return {
                "success": True,
                "message": "Payment verified successfully. Your documents are now under review."
            }
        else:
            return {
                "success": False,
                "message": payment_status.get("message", "Payment verification failed")
            }

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Payment success processing failed: {str(e)}", "Employer Verification")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist()
def get_verification_status():
    """Get current employer's verification status"""
    try:
        employer = get_current_employer()

        # Get documents status
        documents = frappe.get_all("Employer Document",
            filters={"employer": employer.name},
            fields=["document_type", "verification_status", "reviewer_comments"]
        )

        # Get payment status if payment is pending
        payment_status = None
        if employer.verification_status == "Payment Pending":
            payment = frappe.get_all("JiTesti Payment",
                filters={
                    "user": frappe.session.user,
                    "payment_type": "employer_verification",
                    "status": ["!=", "Completed"]
                },
                fields=["status", "amount", "reference_number"],
                order_by="creation desc",
                limit=1
            )
            if payment:
                payment_status = payment[0]

        return {
            "success": True,
            "verification_status": employer.verification_status,
            "documents": documents,
            "payment": payment_status,
            "submitted_at": employer.modified if employer.verification_status != "Pending" else None
        }

    except Exception as e:
        frappe.log_error(f"Get verification status failed: {str(e)}", "Employer Verification")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist()
def get_employer_profile():
    """Get current employer's profile"""
    try:
        employer = get_current_employer()

        return {
            "success": True,
            "profile": employer.as_dict()
        }

    except Exception as e:
        frappe.log_error(f"Get employer profile failed: {str(e)}", "Employer Profile")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist()
def update_employer_profile(**kwargs):
    """Update employer profile"""
    try:
        employer = get_current_employer()

        # Allowed fields for update
        allowed_fields = [
            'company_name', 'contact_person', 'phone_number',
            'email', 'address', 'website', 'tin_number',
            'business_license_number'
        ]

        updated = False
        for field, value in kwargs.items():
            if field in allowed_fields and value != getattr(employer, field, None):
                employer.set(field, value)
                updated = True

        if updated:
            employer.save(ignore_permissions=True)
            frappe.db.commit()

            return {
                "success": True,
                "message": "Profile updated successfully",
                "profile": employer.as_dict()
            }
        else:
            return {
                "success": True,
                "message": "No changes made",
                "profile": employer.as_dict()
            }

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Update employer profile failed: {str(e)}", "Employer Profile")
        return {
            "success": False,
            "message": str(e)
        }


def notify_admin_new_verification_request(employer_name):
    """Notify admin of new verification request"""
    try:
        employer = frappe.get_doc("Employer Profile", employer_name)

        # Get admin users
        admin_users = frappe.get_all("User",
            filters={"role_profile_name": "Admin"},
            fields=["email"])

        if admin_users:
            subject = f"Dereva Kiganjani - New Employer Verification Request: {employer.company_name}"

            message = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Employer Verification Request</h2>

                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Employer Details:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Company Name:</td>
                            <td style="padding: 8px 0;">{employer.company_name}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 8px 0; font-weight: bold;">Contact Person:</td>
                            <td style="padding: 8px 0;">{employer.contact_person}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                            <td style="padding: 8px 0;">{employer.phone_number}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                            <td style="padding: 8px 0;">{employer.email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">TIN:</td>
                            <td style="padding: 8px 0;">{employer.tin_number or 'Not provided'}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 8px 0; font-weight: bold;">Business License:</td>
                            <td style="padding: 8px 0;">{employer.business_license_number or 'Not provided'}</td>
                        </tr>
                    </table>
                </div>

                <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <h3 style="margin-top: 0; color: #92400e;">Action Required</h3>
                    <p style="margin: 5px 0;">Please review the uploaded documents and verify the employer's credentials.</p>
                    <p style="margin: 5px 0;"><strong>Documents to review:</strong> Business Registration, Tax Certificate, Company License, BRELA Certificate</p>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                    <a href="{frappe.utils.get_url()}/app/employer-verification-queue" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Review Employer Documents
                    </a>
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                <p style="color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    <strong>Dereva Kiganjani System</strong><br>
                    MDV Vehicle Fleet Limited
                </p>
            </div>
            """

            # Send to all admin users
            for admin in admin_users:
                if admin.email:
                    frappe.sendmail(
                        recipients=[admin.email],
                        subject=subject,
                        message=message,
                        delayed=False
                    )

    except Exception as e:
        frappe.log_error(f"Admin notification failed: {str(e)}", "Employer Verification")


@frappe.whitelist()
def get_employer_stats():
    """Get employer statistics for dashboard"""
    try:
        employer = get_current_employer()

        # Get document counts
        total_docs = frappe.db.count("Employer Document", {"employer": employer.name})
        approved_docs = frappe.db.count("Employer Document",
            {"employer": employer.name, "verification_status": "Approved"})
        pending_docs = frappe.db.count("Employer Document",
            {"employer": employer.name, "verification_status": "Pending"})
        rejected_docs = frappe.db.count("Employer Document",
            {"employer": employer.name, "verification_status": "Rejected"})

        return {
            "success": True,
            "stats": {
                "verification_status": employer.verification_status,
                "total_documents": total_docs,
                "approved_documents": approved_docs,
                "pending_documents": pending_docs,
                "rejected_documents": rejected_docs,
                "documents_complete": total_docs >= 4 and pending_docs == 0
            }
        }

    except Exception as e:
        frappe.log_error(f"Get employer stats failed: {str(e)}", "Employer Stats")
        return {
            "success": False,
            "message": str(e)
        }
