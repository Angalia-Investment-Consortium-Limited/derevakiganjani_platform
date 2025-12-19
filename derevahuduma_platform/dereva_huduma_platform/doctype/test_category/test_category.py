# Copyright (c) 2025, Dereva Kiganjani and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class TestCategory(Document):
	"""Test Category DocType Controller"""
	
	def validate(self):
		"""Validate Test Category before saving"""
		# Validate pass mark is between 0 and 100
		if self.pass_mark < 0 or self.pass_mark > 100:
			frappe.throw("Pass mark must be between 0 and 100")
		
		# Validate duration is positive
		if self.duration_minutes <= 0:
			frappe.throw("Duration must be greater than 0")
		
		# Validate total questions is positive
		if self.total_questions <= 0:
			frappe.throw("Total questions must be greater than 0")
		
		# Validate price is positive
		if self.price < 0:
			frappe.throw("Price cannot be negative")
