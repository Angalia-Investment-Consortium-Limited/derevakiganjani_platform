# Copyright (c) 2024, Dereva Huduma Platform and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document, DF


class JiTestiSettings(Document):
	# begin: auto-generated types
	# This file will be overwritten when saving via the UI.
	# See https://github.com/frappe/frappe#auto-generated-types for more information.

	auto_verify_mobile_payments: DF.Check
	email_notifications: DF.Check
	enable_payment_verification: DF.Check
	max_retry_attempts: DF.Int
	notification_sender_email: DF.Data
	payment_timeout_minutes: DF.Int
	selcom_api_key: DF.Password
	selcom_api_secret: DF.Password
	selcom_base_url: DF.Data
	selcom_vendor_id: DF.Data
	sms_notifications: DF.Check
	# end: auto-generated types

	def validate(self):
		"""Validate settings"""
		if self.selcom_api_key and self.selcom_api_secret:
			# Test Selcom API connection (optional)
			pass

		if self.email_notifications and not self.notification_sender_email:
			frappe.throw(_("Notification sender email is required when email notifications are enabled"))

	def get_api_credentials(self):
		"""Get Selcom API credentials"""
		return {
			"api_key": self.selcom_api_key,
			"api_secret": self.selcom_api_secret,
			"vendor_id": self.selcom_vendor_id,
			"base_url": self.selcom_base_url or "https://api.selcom.co.tz/v1"
		}
