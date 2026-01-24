# Copyright (c) 2025, MDV Fleet and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class DKPaymentOrder(Document):
    def before_save(self):
        """Set timestamps"""
        if not self.created_at:
            self.created_at = now_datetime()
        self.updated_at = now_datetime()

    def on_update(self):
        """Update application payment status when payment status changes"""
        if self.has_value_changed('status'):
            self.update_application_payment_status()

    def update_application_payment_status(self):
        """Update the linked application's payment status"""
        if self.application:
            application = frappe.get_doc('License Application', self.application)

            # Map payment status to application payment status
            status_mapping = {
                'Pending': 'Unpaid',
                'Processing': 'Unpaid',
                'Completed': 'Paid',
                'Failed': 'Failed',
                'Cancelled': 'Failed'
            }

            new_payment_status = status_mapping.get(self.status, 'Unpaid')

            if application.payment_status != new_payment_status:
                application.payment_status = new_payment_status
                if self.status == 'Completed' and not application.ref_no:
                    application.ref_no = self.transaction_ref
                application.save(ignore_permissions=True)
                frappe.db.commit()


def get_permission_query_conditions(user):
    """Permission query for DK Payment Order"""
    if not user:
        user = frappe.session.user

    # System Manager and Admin can see all
    if "System Manager" in frappe.get_roles(user) or "Admin" in frappe.get_roles(user):
        return None

    # Staff can see all
    if "Staff" in frappe.get_roles(user):
        return None

    # Drivers can only see their own payment orders
    return f"`tabDK Payment Order`.user = {frappe.db.escape(user)}"


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

    # Drivers can only access their own payment orders
    if "Driver" in frappe.get_roles(user):
        return doc.user == user

    return False
