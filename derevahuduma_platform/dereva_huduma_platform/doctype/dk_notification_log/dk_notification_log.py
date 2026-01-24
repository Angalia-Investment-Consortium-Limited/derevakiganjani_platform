# Copyright (c) 2025, MDV Fleet and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class DKNotificationLog(Document):
    def before_save(self):
        """Set timestamps"""
        if not self.created_at:
            self.created_at = now_datetime()

    def on_update(self):
        """Update timestamps based on status"""
        if self.has_value_changed('status'):
            if self.status == 'Sent':
                self.sent_at = now_datetime()
            elif self.status == 'Delivered':
                self.delivered_at = now_datetime()
            elif self.status == 'Failed':
                self.failed_at = now_datetime()


def get_permission_query_conditions(user):
    """Permission query for DK Notification Log"""
    if not user:
        user = frappe.session.user

    # System Manager and Admin can see all
    if "System Manager" in frappe.get_roles(user) or "Admin" in frappe.get_roles(user):
        return None

    # Staff can see all
    if "Staff" in frappe.get_roles(user):
        return None

    # Drivers can only see their own notifications
    return f"`tabDK Notification Log`.user = {frappe.db.escape(user)}"


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

    # Drivers can only access their own notifications
    if "Driver" in frappe.get_roles(user):
        return doc.user == user

    return False
