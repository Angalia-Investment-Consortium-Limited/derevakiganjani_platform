# Copyright (c) 2025, MDV Fleet and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class LicenseApplication(Document):
    def before_save(self):
        """Set submission date if not set and enforce payment requirement"""
        if not self.submission_date:
            self.submission_date = now_datetime()

        # Set default payment status if not set
        if not self.payment_status:
            self.payment_status = 'Unpaid'

        # Generate reference number if not set
        if not self.ref_no and self.name:
            self.ref_no = self.name
    
    def on_update(self):
        """Send notification when status changes"""
        if self.has_value_changed('status'):
            self.send_status_notification()
    
    def send_status_notification(self):
        """Send notification to user about status change"""
        try:
            user_doc = frappe.get_doc('User', self.user)

            status_messages = {
                'Pending': 'Maombi yako ya leseni yamepokewa na yanasubiri ukaguzi.',
                'Under Review': 'Maombi yako ya leseni yanakaguliwa.',
                'Approved': 'Hongera! Maombi yako ya leseni yameidhinishwa.',
                'Rejected': 'Samahani, maombi yako ya leseni hayakuidhinishwa.',
                'Completed': 'Maombi yako ya leseni yamekamilika.'
            }

            message = status_messages.get(self.status, 'Hali ya maombi yako imebadilika.')

            # Send email if user has email
            if user_doc.email:
                frappe.sendmail(
                    recipients=[user_doc.email],
                    subject=f'Taarifa ya Maombi ya Leseni - {self.name}',
                    message=f"""
                    <h3>Taarifa ya Maombi ya Leseni</h3>
                    <p>Namba ya Rejea: <strong>{self.ref_no or self.name}</strong></p>
                    <p>Aina ya Ombi: <strong>{self.get_type_display()}</strong></p>
                    <p>Hali: <strong>{self.status}</strong></p>
                    <p>{message}</p>
                    {f'<p>Maelezo: {self.reviewer_notes}</p>' if self.reviewer_notes else ''}
                    {f'<p>Maelezo ya Msimamizi: {self.admin_comment}</p>' if self.admin_comment else ''}
                    <p>Asante kwa kutumia huduma zetu.</p>
                    <p>Dereva Kiganjani Team</p>
                    """,
                    delayed=False
                )

            # Send SMS/WhatsApp notification
            self.send_sms_notification(message)

            # Create notification log
            frappe.get_doc({
                'doctype': 'DK Notification Log',
                'application': self.name,
                'user': self.user,
                'notification_type': 'Status Update',
                'channel': 'Email',
                'recipient': user_doc.email or self.user,
                'subject': f'Taarifa ya Maombi ya Leseni - {self.name}',
                'message': message
            }).insert(ignore_permissions=True)

        except Exception as e:
            frappe.log_error(
                title="License Application Notification Error",
                message=f"Error sending notification for {self.name}: {str(e)}"
            )

    def get_type_display(self):
        """Get display name for application type"""
        type_map = {
            'new': 'Leseni Mpya',
            'renew': 'Kufanya Upya Leseni',
            'latra': 'Mtihani wa LATRA'
        }
        return type_map.get(self.type, self.type)

    def send_sms_notification(self, message):
        """Send SMS/WhatsApp notification"""
        try:
            # Use existing SMS API
            from derevahuduma_platform.api.sms import send_sms

            sms_message = f"Dereva Kiganjani: {message} Rejea: {self.ref_no or self.name}"

            # Send SMS if phone number available
            if self.phone_number:
                send_sms(self.phone_number, sms_message)

        except Exception as e:
            frappe.log_error(
                title="SMS Notification Error",
                message=f"Error sending SMS for {self.name}: {str(e)}"
            )


def get_permission_query_conditions(user):
    """Permission query for License Application"""
    if not user:
        user = frappe.session.user
    
    # System Manager and Admin can see all
    if "System Manager" in frappe.get_roles(user) or "Admin" in frappe.get_roles(user):
        return None
    
    # Staff can see all
    if "Staff" in frappe.get_roles(user):
        return None
    
    # Drivers can only see their own applications
    return f"`tabLicense Application`.user = {frappe.db.escape(user)}"


def has_permission(doc, ptype, user):
    """Check if user has permission for this document"""
    if not user:
        user = frappe.session.user
    
    # System Manager and Admin have full access
    if "System Manager" in frappe.get_roles(user) or "Admin" in frappe.get_roles(user):
        return True
    
    # Staff have full access
    if "Staff" in frappe.get_roles(user):
        return True
    
    # Drivers can only access their own applications
    if "Driver" in frappe.get_roles(user):
        return doc.user == user
    
    return False
