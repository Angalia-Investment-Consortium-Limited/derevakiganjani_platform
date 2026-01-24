# Copyright (c) 2024, Dereva Huduma Platform and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document, DF


class JiTestiPayment(Document):
	# begin: auto-generated types
	# This file will be overwritten when saving via the UI.
	# See https://github.com/frappe/frappe#auto-generated-types for more information.

	amount: DF.Float
	category_code: DF.Data
	category_name: DF.Data
	created_at: DF.Datetime
	currency: DF.Data
	payment_method: DF.Select
	phone_number: DF.Data
	reference_number: DF.Data
	selcom_token: DF.Data
	selcom_trans_id: DF.Data
	status: DF.Select
	trans_ref: DF.Data
	user: DF.Link
	user_email: DF.Data
	verified_at: DF.Datetime
	# end: auto-generated types

	def validate(self):
		"""Validate payment record"""
		if self.status == "Completed" and not self.verified_at:
			self.verified_at = frappe.utils.now_datetime()

	def on_update(self):
		"""Handle status changes"""
		if self.has_value_changed("status") and self.status == "Completed":
			self.send_payment_notification()

	def send_payment_notification(self):
		"""Send notification when payment is completed"""
		try:
			# Send email notification
			frappe.sendmail(
				recipients=[self.user_email],
				subject=_("JiTesti Payment Confirmed"),
				template="jitesti_payment_confirmed",
				args={
					"user": self.user,
					"category_name": self.category_name,
					"amount": self.amount,
					"reference_number": self.reference_number,
					"payment_method": self.payment_method
				},
				header=_("Payment Confirmation")
			)
		except Exception as e:
			frappe.log_error(f"Failed to send payment notification: {str(e)}", "JiTesti Payment")

@frappe.whitelist()
def get_user_payments(user=None, status=None):
	"""Get payments for a user"""
	if not user:
		user = frappe.session.user

	if not user or user == "Guest":
		frappe.throw(_("Authentication required"))

	filters = {"user": user}

	if status:
		filters["status"] = status

	payments = frappe.get_all(
		"JiTesti Payment",
		filters=filters,
		fields=[
			"name", "category_name", "amount", "currency", "payment_method",
			"reference_number", "status", "created_at", "verified_at"
		],
		order_by="created_at desc"
	)

	return payments
