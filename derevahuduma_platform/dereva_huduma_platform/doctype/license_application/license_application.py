# Copyright (c) 2025, MDV Fleet and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class LicenseApplication(Document):
    def before_save(self):
        """Set submission date if not set"""
        if not self.submission_date:
            self.submission_date = now_datetime()
    
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
                    <p>Namba ya Rejea: <strong>{self.name}</strong></p>
                    <p>Aina ya Ombi: <strong>{self.application_type}</strong></p>
                    <p>Hali: <strong>{self.status}</strong></p>
                    <p>{message}</p>
                    {f'<p>Maelezo: {self.reviewer_notes}</p>' if self.reviewer_notes else ''}
                    <p>Asante kwa kutumia huduma zetu.</p>
                    <p>Dereva Kiganjani Team</p>
                    """,
                    delayed=False
                )
            
            # Create notification
            frappe.get_doc({
                'doctype': 'Notification Log',
                'for_user': self.user,
                'type': 'Alert',
                'document_type': 'License Application',
                'document_name': self.name,
                'subject': f'Taarifa ya Maombi ya Leseni - {self.name}',
                'email_content': message
            }).insert(ignore_permissions=True)
            
        except Exception as e:
            frappe.log_error(
                title="License Application Notification Error",
                message=f"Error sending notification for {self.name}: {str(e)}"
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
