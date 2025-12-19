# Copyright (c) 2025, MDV Fleet and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Course(Document):
	def before_save(self):
		"""Update total lessons count before saving"""
		self.total_lessons = frappe.db.count("Lesson", {"course": self.name, "is_active": 1})
	
	def validate(self):
		"""Validate course data"""
		# Validate track and category combination
		if self.course_track == "beginner":
			if self.course_category not in ["pikipiki", "basic"]:
				frappe.throw("Beginner track only supports Pikipiki or Basic categories")
		elif self.course_track == "professional":
			if self.course_category not in ["vip", "psv", "hgv"]:
				frappe.throw("Professional track only supports VIP, PSV, or HGV categories")
