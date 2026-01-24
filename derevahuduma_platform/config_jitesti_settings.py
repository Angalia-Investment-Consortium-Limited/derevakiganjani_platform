#!/usr/bin/env python3
"""
Quick script to configure JiTesti Settings for Selcom Payment Gateway.
Run with: bench execute derevahuduma_platform.setup_jitesti_settings_jconsole.configure_settings
"""

import frappe

def configure_settings():
    """Configure JiTesti Settings with Selcom payment gateway credentials"""
    
    print("=" * 60)
    print("Configuring JiTesti Settings for Selcom Payment Gateway")
    print("=" * 60)
    
    try:
        # Initialize frappe if not already done
        if not frappe.db:
            frappe.connect()
        
        # Get or create JiTesti Settings
        if not frappe.db.exists("JiTesti Settings", "JiTesti Settings"):
            settings = frappe.new_doc("JiTesti Settings")
            settings.name = "JiTesti Settings"
            print("Creating new JiTesti Settings...")
        else:
            settings = frappe.get_single("JiTesti Settings")
            print("Updating existing JiTesti Settings...")
        
        # Set Selcom API credentials
        settings.selcom_api_key = "TILL61231447-fcffa665b91a415085cd64b07e4f1a75"
        settings.selcom_api_secret = "4a19e7-221273-452a9c-b0f8fc-0d7d75-49"
        settings.selcom_vendor_id = "TILL61231447"
        settings.selcom_base_url = "https://api.selcom.co.tz/v1 "
        
        # Set payment verification options
        settings.enable_payment_verification = 1
        settings.auto_verify_mobile_payments = 1
        settings.payment_timeout_minutes = 30
        settings.max_retry_attempts = 3
        
        # Set notification options
        settings.email_notifications = 1
        settings.sms_notifications = 1
        settings.notification_sender_email = "noreply@mdvfleet.co.tz"
        
        # Save
        settings.save(ignore_permissions=True)
        frappe.db.commit()
        
        print("\n✅ SUCCESS! JiTesti Settings configured:")
        print(f"   - Selcom Vendor ID: {settings.selcom_vendor_id}")
        print(f"   - Selcom Base URL: {settings.selcom_base_url}")
        print(f"   - Payment Verification: {'Enabled' if settings.enable_payment_verification else 'Disabled'}")
        print("\nThe payment gateway should now work correctly!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        frappe.log_error(f"JiTesti Settings configuration failed: {str(e)}", "JiTesti Settings")
        return False

# For bench execute
if __name__ == "__main__":
    configure_settings()
