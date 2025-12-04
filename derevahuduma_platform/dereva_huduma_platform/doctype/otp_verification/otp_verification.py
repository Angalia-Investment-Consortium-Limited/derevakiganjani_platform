# Copyright (c) 2024, Dereva Huduma and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime, get_datetime


class OTPVerification(Document):
	def validate(self):
		"""Validate OTP verification data"""
		# Ensure expires_at is in the future
		if self.expires_at and get_datetime(self.expires_at) < now_datetime():
			frappe.throw("Expiry time must be in the future")
	
	def is_expired(self):
		"""Check if OTP has expired"""
		return get_datetime(self.expires_at) < now_datetime()
	
	def is_max_attempts_reached(self):
		"""Check if maximum attempts have been reached"""
		return self.attempts >= self.max_attempts
