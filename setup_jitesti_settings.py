# JiTesti Settings Configuration Script
# This script configures the JiTesti Settings with proper Selcom API credentials

import frappe

def setup_jitesti_settings():
    """Setup JiTesti Settings with Selcom payment gateway configuration"""
    
    print("Setting up JiTesti Settings...")
    
    try:
        # Create or get JiTesti Settings single doc
        if not frappe.db.exists("JiTesti Settings", "JiTesti Settings"):
            settings = frappe.new_doc("JiTesti Settings")
            settings.name = "JiTesti Settings"
        else:
            settings = frappe.get_single("JiTesti Settings")
        
        # Set Selcom API credentials
        # These should be updated with actual production credentials
        settings.selcom_api_key = "TILL61231447-fcffa665b91a415085cd64b07e4f1a75"
        settings.selcom_api_secret = "4a19e7-221273-452a9c-b0f8fc-0d7d75-49"
        settings.selcom_vendor_id = "TILL61231447"
        settings.selcom_base_url = "https://apigw.selcommobile.com/v1"
        
        # Set payment verification options
        settings.enable_payment_verification = 1
        settings.auto_verify_mobile_payments = 1
        settings.payment_timeout_minutes = 30
        settings.max_retry_attempts = 3
        
        # Set notification options
        settings.email_notifications = 1
        settings.sms_notifications = 1
        settings.notification_sender_email = "noreply@mdvfleet.co.tz"
        
        # Save the settings
        settings.save(ignore_permissions=True)
        frappe.db.commit()
        
        print("✅ JiTesti Settings configured successfully!")
        print(f"   - Selcom Vendor ID: {settings.selcom_vendor_id}")
        print(f"   - Selcom Base URL: {settings.selcom_base_url}")
        print(f"   - Payment Verification: {'Enabled' if settings.enable_payment_verification else 'Disabled'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up JiTesti Settings: {str(e)}")
        frappe.log_error(f"JiTesti Settings setup failed: {str(e)}", "JiTesti Settings")
        return False

def verify_settings():
    """Verify JiTesti Settings are properly configured"""
    print("\nVerifying JiTesti Settings...")
    
    try:
        settings = frappe.get_single("JiTesti Settings")
        
        # Check if credentials are set
        if not settings.selcom_api_key:
            print("❌ Selcom API Key is not set")
            return False
        
        if not settings.selcom_api_secret:
            print("❌ Selcom API Secret is not set")
            return False
        
        if not settings.selcom_vendor_id:
            print("❌ Selcom Vendor ID is not set")
            return False
        
        if not settings.selcom_base_url:
            print("❌ Selcom Base URL is not set")
            return False
        
        print("✅ All Selcom credentials are configured!")
        print(f"   - Vendor ID: {settings.selcom_vendor_id}")
        print(f"   - API Key: {'*' * len(settings.selcom_api_key[:10])}...")
        print(f"   - Base URL: {settings.selcom_base_url}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verifying settings: {str(e)}")
        return False

def test_selcom_connection():
    """Test Selcom API connection"""
    print("\nTesting Selcom API connection...")
    
    try:
        import requests
        import json
        import hashlib
        import hmac
        import base64
        from datetime import datetime
        
        settings = frappe.get_single("JiTesti Settings")
        
        # Prepare test request
        test_payload = {
            "vendor": settings.selcom_vendor_id,
            "order_id": "TEST_CONNECTION",
            "buyer_email": "test@example.com",
            "buyer_name": "Test User",
            "buyer_phone": "255000000000",
            "amount": 100,
            "currency": "TZS",
            "buyer_remarks": "Connection test",
            "merchant_remarks": "Connection test",
            "no_of_items": 1
        }
        
        # Generate auth header
        signature_data = settings.selcom_api_key + json.dumps(test_payload, separators=(',', ':'))
        signature = base64.b64encode(
            hmac.new(
                settings.selcom_api_secret.encode('utf-8'),
                signature_data.encode('utf-8'),
                hashlib.sha256
            ).digest()
        ).decode('utf-8')
        
        auth_header = f"SELCOM {settings.selcom_api_key}:{signature}"
        
        headers = {
            "Authorization": auth_header,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        # Make test API call
        url = f"{settings.selcom_base_url}/v1/checkout/create-order-minimal"
        
        print(f"   Testing URL: {url}")
        
        response = requests.post(url, json=test_payload, headers=headers, timeout=30)
        
        print(f"   Response Status: {response.status_code}")
        
        if response.status_code in [200, 400]:
            # 400 is expected for test data (invalid amount, etc.)
            print("✅ Selcom API is reachable!")
            return True
        else:
            print(f"❌ Selcom API returned status: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to connect to Selcom API: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Error testing Selcom connection: {str(e)}")
        return False

# Main execution
if __name__ == "__main__":
    import sys
    
    # Initialize frappe
    site = sys.argv[1] if len(sys.argv) > 1 else "derevakiganjani.mdvfleet.co.tz"
    frappe.init(site=site)
    frappe.connect()
    
    print("=" * 60)
    print("JiTesti Settings Configuration")
    print("=" * 60)
    
    # Setup settings
    if setup_jitesti_settings():
        # Verify settings
        if verify_settings():
            # Test connection (optional, may fail with test data)
            test_selcom_connection()
    
    print("=" * 60)

