# Copyright (c) 2025, MDV Fleet and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class LicenseApplicationDocument(Document):
    def before_save(self):
        """Set file name from file_url"""
        if self.file_url and not self.file_name:
            self.file_name = self.file_url.split('/')[-1]
