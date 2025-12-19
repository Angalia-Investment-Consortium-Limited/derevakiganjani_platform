# Copyright (c) 2025, MDV Fleet and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class LessonProgress(Document):
	def validate(self):
		"""Validate lesson progress"""
		# Check for duplicate progress entry
		if self.is_new():
			existing = frappe.db.exists("Lesson Progress", {
				"enrollment": self.enrollment,
				"lesson": self.lesson,
				"name": ["!=", self.name]
			})
			if existing:
				frappe.throw("Progress entry already exists for this lesson and enrollment")
	
	def on_update(self):
		"""Update enrollment progress when lesson is completed"""
		if self.status == "Completed" and self.has_value_changed("status"):
			self.update_enrollment_progress()
	
	def update_enrollment_progress(self):
		"""Update the enrollment progress percentage"""
		enrollment = frappe.get_doc("Course Enrollment", self.enrollment)
		
		# Count completed lessons
		completed_count = frappe.db.count("Lesson Progress", {
			"enrollment": self.enrollment,
			"status": "Completed"
		})
		
		# Update enrollment
		enrollment.completed_lessons = completed_count
		if enrollment.total_lessons > 0:
			enrollment.progress_percentage = (completed_count / enrollment.total_lessons) * 100
		
		enrollment.save(ignore_permissions=True)
