"""
Beem Africa OTP Service Integration

This module handles OTP operations using Beem Africa's OTP API.
Beem generates, sends, and verifies the OTP on their end.
"""

import frappe
import requests
import base64
from frappe import _
from typing import Dict, Any


class BeemOTPService:
    """Beem Africa OTP Service wrapper"""
    
    def __init__(self):
        self.api_key = frappe.conf.get('beem_api_key')
        self.secret_key = frappe.conf.get('beem_secret_key')
        self.app_id = frappe.conf.get('beem_app_id', 1)  # Default app ID
        self.base_url = 'https://apiotp.beem.africa/v1'
        
        if not self.api_key or not self.secret_key:
            frappe.log_error(
                title="Beem OTP Configuration Missing",
                message="Please configure beem_api_key and beem_secret_key in site_config.json"
            )
    
    def _get_auth_header(self) -> str:
        """Generate Basic Auth header"""
        credentials = f'{self.api_key}:{self.secret_key}'
        encoded = base64.b64encode(credentials.encode()).decode()
        return f'Basic {encoded}'
    
    def request_otp(self, mobile_no: str) -> Dict[str, Any]:
        """
        Request OTP from Beem Africa
        
        Args:
            mobile_no: Phone number in format 255XXXXXXXXX (no + sign)
            
        Returns:
            Dict with pinId and status
        """
        try:
            # Remove + sign if present
            if mobile_no.startswith('+'):
                mobile_no = mobile_no[1:]
            
            # Ensure it starts with country code
            if not mobile_no.startswith('255'):
                if mobile_no.startswith('0'):
                    mobile_no = '255' + mobile_no[1:]
                else:
                    mobile_no = '255' + mobile_no
            
            url = f'{self.base_url}/request'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': self._get_auth_header()
            }
            
            payload = {
                'appId': self.app_id,
                'msisdn': mobile_no
            }
            
            frappe.logger().info(f"Requesting OTP for {mobile_no}")
            frappe.logger().info(f"URL: {url}")
            frappe.logger().info(f"Payload: {payload}")
            frappe.logger().info(f"App ID: {self.app_id}")
            
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=30,
                verify=False  # As per Beem documentation
            )
            
            frappe.logger().info(f"Response Status: {response.status_code}")
            frappe.logger().info(f"Response Text: {response.text}")
            
            response_data = response.json()
            
            if response.status_code == 200:
                pin_id = response_data.get('data', {}).get('pinId')
                message = response_data.get('data', {}).get('message', {})
                
                frappe.logger().info(f"OTP requested successfully. PinId: {pin_id}")
                
                return {
                    'success': True,
                    'pin_id': pin_id,
                    'message': message.get('message', 'OTP sent successfully'),
                    'code': message.get('code')
                }
            else:
                error_msg = response_data.get('message', response_data.get('error', 'Unknown error'))
                error_details = f"Status: {response.status_code}, Response: {response_data}"
                frappe.log_error(
                    title="Beem OTP Request Failed",
                    message=f"Failed to request OTP for {mobile_no}: {error_msg}\n{error_details}"
                )
                return {
                    'success': False,
                    'message': f"{error_msg} (Status: {response.status_code})",
                    'data': response_data
                }
                
        except requests.exceptions.Timeout:
            frappe.log_error(
                title="Beem OTP Timeout",
                message=f"OTP request timed out for {mobile_no}"
            )
            return {
                'success': False,
                'message': 'OTP service timeout. Please try again.'
            }
            
        except Exception as e:
            frappe.log_error(
                title="Beem OTP Request Error",
                message=f"Error requesting OTP for {mobile_no}: {str(e)}"
            )
            return {
                'success': False,
                'message': f'Failed to request OTP: {str(e)}'
            }
    
    def verify_otp(self, pin_id: str, pin: str) -> Dict[str, Any]:
        """
        Verify OTP with Beem Africa
        
        Args:
            pin_id: Pin ID received from request_otp
            pin: OTP code entered by user
            
        Returns:
            Dict with verification status
        """
        try:
            url = f'{self.base_url}/verify'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': self._get_auth_header()
            }
            
            payload = {
                'pinId': pin_id,
                'pin': pin
            }
            
            frappe.logger().info(f"Verifying OTP for pinId: {pin_id}")
            
            response = requests.post(
                url,
                headers=headers,
                json=payload,
                timeout=30,
                verify=False  # As per Beem documentation
            )
            
            response_data = response.json()
            
            if response.status_code == 200:
                message = response_data.get('data', {}).get('message', {})
                code = message.get('code')
                msg = message.get('message', '')
                
                # Code 117 = Valid Pin
                if code == 117:
                    frappe.logger().info(f"OTP verified successfully for pinId: {pin_id}")
                    return {
                        'success': True,
                        'verified': True,
                        'message': msg,
                        'code': code
                    }
                else:
                    # Other codes: 114 (Incorrect), 115 (Timeout), 116 (Attempts Exceeded), 118 (Duplicate)
                    frappe.logger().info(f"OTP verification failed for pinId: {pin_id}. Code: {code}, Message: {msg}")
                    return {
                        'success': False,
                        'verified': False,
                        'message': msg,
                        'code': code
                    }
            else:
                error_msg = response_data.get('message', 'Verification failed')
                frappe.log_error(
                    title="Beem OTP Verification Failed",
                    message=f"Failed to verify OTP for pinId {pin_id}: {error_msg}\nResponse: {response_data}"
                )
                return {
                    'success': False,
                    'verified': False,
                    'message': error_msg,
                    'data': response_data
                }
                
        except requests.exceptions.Timeout:
            frappe.log_error(
                title="Beem OTP Verification Timeout",
                message=f"OTP verification timed out for pinId {pin_id}"
            )
            return {
                'success': False,
                'verified': False,
                'message': 'Verification timeout. Please try again.'
            }
            
        except Exception as e:
            frappe.log_error(
                title="Beem OTP Verification Error",
                message=f"Error verifying OTP for pinId {pin_id}: {str(e)}"
            )
            return {
                'success': False,
                'verified': False,
                'message': f'Failed to verify OTP: {str(e)}'
            }


# Singleton instance
_beem_otp_service = None


def get_beem_otp_service() -> BeemOTPService:
    """Get or create Beem OTP service instance"""
    global _beem_otp_service
    if _beem_otp_service is None:
        _beem_otp_service = BeemOTPService()
    return _beem_otp_service


@frappe.whitelist(allow_guest=True)
def request_otp(mobile_no: str, purpose: str):
    """
    API endpoint to request OTP from Beem
    
    Args:
        mobile_no: Phone number
        purpose: Purpose (registration, login, password_reset)
        
    Returns:
        Response with pin_id
    """
    try:
        # Validate inputs
        if not mobile_no or not purpose:
            frappe.throw(_('Mobile number and purpose are required'))
        
        if purpose not in ['registration', 'login', 'password_reset']:
            frappe.throw(_('Invalid OTP purpose'))
        
        # Normalize phone number
        mobile_no = mobile_no.strip()
        
        # Normalize phone number for database lookup (with + prefix)
        check_no = mobile_no
        if not check_no.startswith('+'):
            if check_no.startswith('0'):
                check_no = '+255' + check_no[1:]
            elif check_no.startswith('255'):
                check_no = '+' + check_no
            else:
                check_no = '+255' + check_no
        
        # For registration, check if user already exists
        if purpose == 'registration':
            # Check both with and without + prefix
            existing_user = frappe.db.exists('User', {'mobile_no': check_no}) or \
                           frappe.db.exists('User', {'mobile_no': check_no[1:]})
            if existing_user:
                frappe.throw(_('A user with this mobile number already exists'))
        
        # For login and password reset, check if user exists
        if purpose in ['login', 'password_reset']:
            # Check both with and without + prefix
            user_exists = frappe.db.exists('User', {'mobile_no': check_no}) or \
                         frappe.db.exists('User', {'mobile_no': check_no[1:]})
            if not user_exists:
                frappe.throw(_('No user found with this mobile number'))
        
        # Request OTP from Beem
        beem_service = get_beem_otp_service()
        result = beem_service.request_otp(mobile_no)
        
        if not result['success']:
            frappe.throw(_(result['message']))
        
        # Store pin_id in database for later verification (always use + prefix for storage)
        storage_mobile = check_no  # Already normalized with + prefix
        
        # Calculate expiry time (default 5 minutes from now)
        from frappe.utils import now_datetime, add_to_date
        expires_at = add_to_date(now_datetime(), minutes=5)
        
        otp_doc = frappe.get_doc({
            'doctype': 'OTP Verification',
            'mobile_no': storage_mobile,
            'otp_code': result['pin_id'],  # Store pin_id instead of actual OTP
            'purpose': purpose,
            'verified': 0,
            'expires_at': expires_at,
            'attempts': 0,
            'max_attempts': 3
        })
        otp_doc.insert(ignore_permissions=True)
        frappe.db.commit()
        
        return {
            'message': result['message'],
            'pin_id': result['pin_id'],
            'mobile_no': storage_mobile
        }
        
    except Exception as e:
        frappe.log_error(
            title="Request OTP API Error",
            message=f"Error requesting OTP for {mobile_no}: {str(e)}"
        )
        frappe.throw(_(str(e)))


@frappe.whitelist(allow_guest=True)
def verify_otp(mobile_no: str, otp_code: str, purpose: str):
    """
    API endpoint to verify OTP with Beem
    
    Args:
        mobile_no: Phone number
        otp_code: OTP code entered by user
        purpose: Purpose of OTP
        
    Returns:
        Verification result
    """
    try:
        # Validate inputs
        if not mobile_no or not otp_code or not purpose:
            frappe.throw(_('Mobile number, OTP code, and purpose are required'))
        
        # Normalize phone number
        mobile_no = mobile_no.strip()
        if not mobile_no.startswith('+'):
            if mobile_no.startswith('0'):
                mobile_no = '+255' + mobile_no[1:]
            elif mobile_no.startswith('255'):
                mobile_no = '+' + mobile_no
            else:
                mobile_no = '+255' + mobile_no
        
        # Get the latest OTP record to retrieve pin_id
        otp_doc = frappe.db.get_value(
            'OTP Verification',
            {
                'mobile_no': mobile_no,
                'purpose': purpose,
                'verified': 0
            },
            ['name', 'otp_code', 'attempts', 'max_attempts'],
            as_dict=True,
            order_by='creation desc'
        )
        
        if not otp_doc:
            frappe.throw(_('No OTP request found. Please request a new OTP.'))
        
        # Check max attempts
        if otp_doc.attempts >= otp_doc.max_attempts:
            frappe.throw(_('Maximum verification attempts exceeded. Please request a new OTP.'))
        
        # Increment attempts
        frappe.db.set_value('OTP Verification', otp_doc.name, 'attempts', otp_doc.attempts + 1)
        frappe.db.commit()
        
        # Verify with Beem
        pin_id = otp_doc.otp_code  # pin_id was stored in otp_code field
        beem_service = get_beem_otp_service()
        result = beem_service.verify_otp(pin_id, otp_code.strip())
        
        if result.get('verified'):
            # Mark as verified
            frappe.db.set_value('OTP Verification', otp_doc.name, 'verified', 1)
            frappe.db.commit()
            
            # For login purpose, create a session for the user
            if purpose == 'login':
                # Find user by mobile number (check both formats)
                user = frappe.db.get_value('User', {'mobile_no': mobile_no}, 'name')
                if not user:
                    # Try without + prefix
                    user = frappe.db.get_value('User', {'mobile_no': mobile_no[1:]}, 'name')
                
                if user:
                    # Create Frappe session
                    frappe.local.login_manager.login_as(user)
                    frappe.local.login_manager.post_login()
                    frappe.db.commit()
                    
                    frappe.logger().info(f"User {user} logged in successfully via OTP")
                else:
                    frappe.throw(_('User not found'))
            
            return {
                'message': result['message'],
                'verified': True
            }
        else:
            remaining_attempts = otp_doc.max_attempts - (otp_doc.attempts)
            error_msg = result.get('message', 'Invalid OTP')
            
            if remaining_attempts > 0:
                error_msg += f'. {remaining_attempts} attempts remaining.'
            
            frappe.throw(_(error_msg))
            
    except Exception as e:
        frappe.log_error(
            title="Verify OTP API Error",
            message=f"Error verifying OTP for {mobile_no}: {str(e)}"
        )
        frappe.throw(_(str(e)))


@frappe.whitelist(allow_guest=True)
def resend_otp(mobile_no: str, purpose: str):
    """
    API endpoint to resend OTP
    
    Args:
        mobile_no: Phone number
        purpose: Purpose of OTP
        
    Returns:
        Response with new pin_id
    """
    try:
        # Invalidate previous OTPs
        mobile_no = mobile_no.strip()
        if not mobile_no.startswith('+'):
            if mobile_no.startswith('0'):
                mobile_no = '+255' + mobile_no[1:]
            elif mobile_no.startswith('255'):
                mobile_no = '+' + mobile_no
            else:
                mobile_no = '+255' + mobile_no
        
        previous_otps = frappe.get_all(
            'OTP Verification',
            filters={
                'mobile_no': mobile_no,
                'purpose': purpose,
                'verified': 0
            },
            pluck='name'
        )
        
        for otp_name in previous_otps:
            frappe.db.set_value('OTP Verification', otp_name, 'verified', 1)
        
        frappe.db.commit()
        
        # Request new OTP
        return request_otp(mobile_no, purpose)
        
    except Exception as e:
        frappe.log_error(
            title="Resend OTP API Error",
            message=f"Error resending OTP to {mobile_no}: {str(e)}"
        )
        frappe.throw(_(str(e)))
