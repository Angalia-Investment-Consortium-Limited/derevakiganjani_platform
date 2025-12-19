# Copyright (c) 2025, MDV Fleet and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class CourseEnrollment(Document):
	def validate(self):
		"""Validate enrollment"""
		# Check for duplicate enrollment
		if self.is_new():
			existing = frappe.db.exists("Course Enrollment", {
				"driver": self.driver,
				"course": self.course,
				"name": ["!=", self.name]
			})
			if existing:
				frappe.throw("Driver is already enrolled in this course")
		
		# Get total lessons from course
		if self.course and not self.total_lessons:
			course = frappe.get_doc("Course", self.course)
			self.total_lessons = course.total_lessons
	
	def before_save(self):
		"""Update status based on progress"""
		if self.progress_percentage >= 100 and self.status != "Completed":
			self.status = "Completed"
			if not self.completion_date:
				self.completion_date = frappe.utils.today()
		elif self.progress_percentage > 0 and self.status == "Enrolled":
			self.status = "In Progress"
