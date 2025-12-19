# Copyright (c) 2025, MDV Fleet and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class CourseCertificate(Document):
	def before_insert(self):
		"""Set course track and category before inserting"""
		if self.course:
			course = frappe.get_doc("Course", self.course)
			self.course_track = course.course_track
			self.course_category = course.course_category
		
		# Generate verification code if not set
		if not self.verification_code:
			self.verification_code = frappe.generate_hash(length=16).upper()
	
	def validate(self):
		"""Validate certificate"""
		# Check if enrollment is completed
		if self.enrollment:
			enrollment = frappe.get_doc("Course Enrollment", self.enrollment)
			if enrollment.status != "Completed":
				frappe.throw("Cannot issue certificate for incomplete course")
			
			# Check for duplicate certificate
			if self.is_new():
				existing = frappe.db.exists("Course Certificate", {
					"enrollment": self.enrollment,
					"name": ["!=", self.name]
				})
				if existing:
					frappe.throw("Certificate already issued for this enrollment")
	
	def after_insert(self):
		"""Update enrollment after certificate is issued"""
		if self.enrollment:
			enrollment = frappe.get_doc("Course Enrollment", self.enrollment)
			enrollment.certificate_issued = 1
			enrollment.save(ignore_permissions=True)
