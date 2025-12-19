# Copyright (c) 2025, MDV Fleet and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Lesson(Document):
	def validate(self):
		"""Validate lesson data"""
		# Validate content based on content_type
		if self.content_type == "text":
			if not self.content_text_en and not self.content_text_sw:
				frappe.throw("Text content is required for text lessons")
		elif self.content_type in ["pdf", "image"]:
			if not self.content_file:
				frappe.throw(f"File is required for {self.content_type} lessons")
		elif self.content_type == "video":
			if not self.video_url:
				frappe.throw("Video URL is required for video lessons")
	
	def after_insert(self):
		"""Update course total lessons count after inserting"""
		self.update_course_lesson_count()
	
	def on_trash(self):
		"""Update course total lessons count after deleting"""
		self.update_course_lesson_count()
	
	def update_course_lesson_count(self):
		"""Update the total lessons count in the course"""
		if self.course:
			course = frappe.get_doc("Course", self.course)
			course.total_lessons = frappe.db.count("Lesson", {"course": self.course, "is_active": 1})
			course.save(ignore_permissions=True)
