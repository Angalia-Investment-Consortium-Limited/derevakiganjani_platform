# Copyright (c) 2024, Dereva Huduma and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class EmployerProfile(Document):
	def validate(self):
		"""Validate employer profile data"""
		# Ensure user exists
		if not frappe.db.exists("User", self.user):
			frappe.throw(f"User {self.user} does not exist")
		
		# Validate phone number format
		if self.phone_number and not self.phone_number.startswith('+'):
			frappe.throw("Phone number must be in international format (e.g., +255...)")
	
	def before_save(self):
		"""Actions before saving"""
		# Set verification date when status changes to Verified
		if self.verification_status == "Verified" and not self.verification_date:
			self.verification_date = now_datetime()
			self.verified = 1
		
		# Unset verified flag if status is not Verified
		if self.verification_status != "Verified":
			self.verified = 0
	
	def on_update(self):
		"""Actions after document is updated"""
		# Check if verification status has changed
		if self.has_value_changed("verification_status"):
			old_status = self.get_doc_before_save().verification_status if self.get_doc_before_save() else None
			new_status = self.verification_status
			
			# Send email notification if status changed from Pending
			if old_status == "Pending" and new_status in ["Verified", "Rejected"]:
				self.send_verification_email(new_status)
	
	def send_verification_email(self, status):
		"""Send email notification based on verification status"""
		try:
			# Get user email
			user_email = self.email or frappe.db.get_value("User", self.user, "email")
			
			if not user_email:
				frappe.log_error(
					f"No email found for employer profile {self.name}",
					"Employer Verification Email Failed"
				)
				return
			
			# Prepare email content based on status
			if status == "Verified":
				subject = "Your Dereva Kiganjani Account Has Been Verified!"
				message = self.get_verified_email_template()
			elif status == "Rejected":
				subject = "Update on Your Dereva Kiganjani Account Verification"
				message = self.get_rejected_email_template()
			else:
				return
			
			# Send email
			frappe.sendmail(
				recipients=[user_email],
				subject=subject,
				message=message,
				delayed=False,
				reference_doctype=self.doctype,
				reference_name=self.name
			)
			
			# Log successful email send
			frappe.logger().info(f"Verification email sent to {user_email} for {self.name} - Status: {status}")
			
		except Exception as e:
			frappe.log_error(
				f"Failed to send verification email for {self.name}: {str(e)}",
				"Employer Verification Email Error"
			)
	
	def get_verified_email_template(self):
		"""Get email template for verified status"""
		site_url = frappe.utils.get_url()
		login_url = f"{site_url}/login"
		
		return f"""
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #2563eb;">Dear {self.company_name},</h2>
			
			<p>Great news! Your employer account has been verified and approved.</p>
			
			<p>You can now access all features of the Dereva Kiganjani platform:</p>
			<ul>
				<li>Post job openings</li>
				<li>Search our database of qualified drivers</li>
				<li>Manage applications</li>
				<li>View driver profiles and qualifications</li>
			</ul>
			
			<div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
				<h3 style="margin-top: 0;">Login Credentials:</h3>
				<p style="margin: 5px 0;"><strong>Username:</strong> {self.email or self.phone_number}</p>
				<p style="margin: 5px 0;">Use your initial password to login</p>
			</div>
			
			<p style="text-align: center; margin: 30px 0;">
				<a href="{login_url}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
					Login Now
				</a>
			</p>
			
			<p>If you've forgotten your password, you can reset it on the login page.</p>
			
			<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
			
			<p style="color: #6b7280; font-size: 14px;">
				Best regards,<br>
				<strong>Dereva Kiganjani Team</strong><br>
				MDV Vehicle Fleet Limited
			</p>
		</div>
		"""
	
	def get_rejected_email_template(self):
		"""Get email template for rejected status"""
		site_url = frappe.utils.get_url()
		contact_email = frappe.db.get_single_value("System Settings", "email_footer_address") or "support@derevakiganjani.mdvfleet.co.tz"
		
		rejection_reason = self.verification_notes or "Please contact us for more details."
		
		return f"""
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #dc2626;">Dear {self.company_name},</h2>
			
			<p>Thank you for registering with Dereva Kiganjani.</p>
			
			<p>Unfortunately, we were unable to verify your account at this time.</p>
			
			<div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
				<h3 style="margin-top: 0; color: #dc2626;">Reason:</h3>
				<p style="margin: 5px 0;">{rejection_reason}</p>
			</div>
			
			<h3>Next Steps:</h3>
			<ul>
				<li>Please contact us at the information below</li>
				<li>Provide additional documentation if requested</li>
				<li>We're here to help resolve any issues</li>
			</ul>
			
			<div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
				<h3 style="margin-top: 0;">Contact Information:</h3>
				<p style="margin: 5px 0;"><strong>Email:</strong> {contact_email}</p>
				<p style="margin: 5px 0;"><strong>Phone:</strong> {self.phone_number or '+255 XXX XXX XXX'}</p>
			</div>
			
			<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
			
			<p style="color: #6b7280; font-size: 14px;">
				Best regards,<br>
				<strong>Dereva Kiganjani Team</strong><br>
				MDV Vehicle Fleet Limited
			</p>
		</div>
		"""
