import frappe
from frappe.model.document import Document


class EmployerDocument(Document):
    def validate(self):
        """Validate document before saving"""
        self.validate_employer_access()
        self.validate_document_type_uniqueness()

    def validate_employer_access(self):
        """Ensure employer can only upload documents for themselves"""
        if frappe.session.user != "Administrator":
            # Get current user's employer profile
            employer_profile = frappe.db.get_value("Employer Profile",
                {"user": frappe.session.user}, "name")

            if not employer_profile:
                frappe.throw("Access denied. No employer profile found.")

            if self.employer != employer_profile:
                frappe.throw("Access denied. You can only manage your own documents.")

    def validate_document_type_uniqueness(self):
        """Ensure only one document of each type per employer"""
        if self.document_type:
            existing = frappe.db.exists("Employer Document", {
                "employer": self.employer,
                "document_type": self.document_type,
                "name": ("!=", self.name)  # Exclude current document when updating
            })

            if existing:
                frappe.throw(f"A {self.document_type} document already exists for this employer.")

    def on_update(self):
        """Called when document is updated"""
        # Log activity for compliance
        if self.has_value_changed("verification_status"):
            self.log_compliance_activity()

    def log_compliance_activity(self):
        """Log compliance-related activities"""
        action = "Document Status Changed"
        details = f"Document {self.document_type} status changed to {self.verification_status}"

        if self.reviewer_comments:
            details += f" - Comments: {self.reviewer_comments}"

        frappe.get_doc({
            "doctype": "Compliance Log",
            "entity_type": "Employer",
            "entity_name": self.employer,
            "action": action,
            "action_details": details,
            "performed_by": frappe.session.user
        }).insert(ignore_permissions=True)


@frappe.whitelist()
def upload_employer_document():
    """Upload employer document via API"""
    try:
        if not frappe.session.user or frappe.session.user == "Guest":
            frappe.throw("Authentication required")

        # Get form data
        employer = frappe.form_dict.get("employer")
        document_type = frappe.form_dict.get("document_type")
        file = frappe.form_dict.get("file")

        if not all([employer, document_type, file]):
            frappe.throw("Missing required fields: employer, document_type, file")

        # Validate employer access
        employer_profile = frappe.db.get_value("Employer Profile",
            {"user": frappe.session.user}, "name")

        if employer != employer_profile:
            frappe.throw("Access denied")

        # Create document record
        doc = frappe.get_doc({
            "doctype": "Employer Document",
            "employer": employer,
            "document_type": document_type,
            "document_file": file,
            "verification_status": "Pending"
        })

        doc.insert(ignore_permissions=True)
        frappe.db.commit()

        return {
            "success": True,
            "message": "Document uploaded successfully",
            "document_id": doc.name
        }

    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Document upload failed: {str(e)}", "Employer Document")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist()
def get_employer_documents(employer_name=None):
    """Get documents for employer"""
    try:
        if not employer_name:
            # Get current user's employer profile
            employer_name = frappe.db.get_value("Employer Profile",
                {"user": frappe.session.user}, "name")

        if not employer_name:
            frappe.throw("Employer profile not found")

        documents = frappe.get_all("Employer Document",
            filters={"employer": employer_name},
            fields=["name", "document_type", "document_file",
                   "verification_status", "reviewer_comments",
                   "uploaded_at", "reviewed_at", "reviewed_by"],
            order_by="uploaded_at desc"
        )

        return {
            "success": True,
            "documents": documents
        }

    except Exception as e:
        frappe.log_error(f"Get employer documents failed: {str(e)}", "Employer Document")
        return {
            "success": False,
            "message": str(e)
        }
