# Copyright (c) 2024, Dereva Huduma and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class DriverProfile(Document):
	def validate(self):
		"""Validate driver profile data"""
		# Ensure user exists
		if not frappe.db.exists("User", self.user):
			frappe.throw(f"User {self.user} does not exist")
		
		# Validate phone number format
		if self.phone_number and not self.phone_number.startswith('+'):
			frappe.throw("Phone number must be in international format (e.g., +255...)")
	
	def before_save(self):
		"""Actions before saving"""
		# Set full name from user if not provided
		if not self.full_name and self.user:
			user_doc = frappe.get_doc("User", self.user)
			self.full_name = user_doc.full_name or user_doc.first_name
