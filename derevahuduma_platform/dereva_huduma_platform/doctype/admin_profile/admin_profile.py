# Copyright (c) 2024, Dereva Huduma and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class AdminProfile(Document):
	def validate(self):
		"""Validate admin profile data"""
		# Ensure user exists
		if not frappe.db.exists("User", self.user):
			frappe.throw(f"User {self.user} does not exist")
		
		# Validate phone number format
		if self.phone_number and not self.phone_number.startswith('+'):
			frappe.throw("Phone number must be in international format (e.g., +255...)")
