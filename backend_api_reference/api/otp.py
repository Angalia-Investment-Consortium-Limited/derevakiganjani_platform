"""
OTP (One-Time Password) Management

This module handles OTP generation, validation, and verification.
"""

import frappe
from frappe import _
from frappe.utils import now_datetime, add_to_date, get_datetime
import random
import string
from typing import Dict, Any, Optional
from .sms import send_otp_sms


class OTPManager:
    """Manages OTP generation and verification"""
    
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 5
    MAX_ATTEMPTS = 3
    RATE_LIMIT_MINUTES = 1  # Minimum time between OTP requests
    
    @staticmethod
    def generate_otp() -> str:
        """Generate a random 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=OTPManager.OTP_LENGTH))
    
    @staticmethod
    def create_otp_record(mobile_no: str, purpose: str) -> Dict[str, Any]:
        """
        Create OTP record in database
        
        Args:
            mobile_no: Phone number
            purpose: Purpose (registration, login, password_reset)
            
        Returns:
            Dict with OTP details
        """
        try:
            # Check rate limiting
            last_otp = frappe.db.get_value(
                'OTP Verification',
                {
                    'mobile_no': mobile_no,
                    'purpose': purpose,
                    'creation': ['>', add_to_date(now_datetime(), minutes=-OTPManager.RATE_LIMIT_MINUTES)]
                },
                ['name', 'creation'],
                as_dict=True
            )
            
            if last_otp:
                frappe.throw(_('Please wait before requesting another OTP'))
            
            # Generate OTP
            otp_code = OTPManager.generate_otp()
            expires_at = add_to_date(now_datetime(), minutes=OTPManager.OTP_EXPIRY_MINUTES)
            
            # Create OTP record
            otp_doc = frappe.get_doc({
                'doctype': 'OTP Verification',
                'mobile_no': mobile_no,
                'otp_code': otp_code,
                'purpose': purpose,
                'verified': 0,
                'expires_at': expires_at,
                'attempts': 0,
                'max_attempts': OTPManager.MAX_ATTEMPTS
            })
            otp_doc.insert(ignore_permissions=True)
            frappe.db.commit()
            
            return {
                'success': True,
                'otp_id': otp_doc.name,
                'expires_at': expires_at,
                'otp_code': otp_code  # Only for internal use, don't return to client
            }
            
        except Exception as e:
            frappe.log_error(
                title="OTP Creation Error",
                message=f"Failed to create OTP for {mobile_no}: {str(e)}"
            )
            raise
    
    @staticmethod
    def verify_otp(mobile_no: str, otp_code: str, purpose: str) -> Dict[str, Any]:
        """
        Verify OTP code
        
        Args:
            mobile_no: Phone number
            otp_code: OTP code to verify
            purpose: Purpose of OTP
            
        Returns:
            Dict with verification result
        """
        try:
            # Find the latest unverified OTP for this mobile number and purpose
            otp_doc = frappe.db.get_value(
                'OTP Verification',
                {
                    'mobile_no': mobile_no,
                    'purpose': purpose,
                    'verified': 0
                },
                ['name', 'otp_code', 'expires_at', 'attempts', 'max_attempts'],
                as_dict=True,
                order_by='creation desc'
            )
            
            if not otp_doc:
                return {
                    'success': False,
                    'message': 'No OTP found. Please request a new one.'
                }
            
            # Check if OTP has expired
            if get_datetime(otp_doc.expires_at) < now_datetime():
                return {
                    'success': False,
                    'message': 'OTP has expired. Please request a new one.'
                }
            
            # Check max attempts
            if otp_doc.attempts >= otp_doc.max_attempts:
                return {
                    'success': False,
                    'message': 'Maximum verification attempts exceeded. Please request a new OTP.'
                }
            
            # Increment attempts
            frappe.db.set_value('OTP Verification', otp_doc.name, 'attempts', otp_doc.attempts + 1)
            frappe.db.commit()
            
            # Verify OTP code
            if otp_doc.otp_code == otp_code:
                # Mark as verified
                frappe.db.set_value('OTP Verification', otp_doc.name, 'verified', 1)
                frappe.db.commit()
                
                return {
                    'success': True,
                    'message': 'OTP verified successfully',
                    'otp_id': otp_doc.name
                }
            else:
                remaining_attempts = otp_doc.max_attempts - (otp_doc.attempts)
                return {
                    'success': False,
                    'message': f'Invalid OTP. {remaining_attempts} attempts remaining.'
                }
                
        except Exception as e:
            frappe.log_error(
                title="OTP Verification Error",
                message=f"Failed to verify OTP for {mobile_no}: {str(e)}"
            )
            raise
    
    @staticmethod
    def cleanup_expired_otps():
        """Cleanup expired OTP records (called by scheduled job)"""
        try:
            expired_otps = frappe.get_all(
                'OTP Verification',
                filters={
                    'expires_at': ['<', now_datetime()],
                    'verified': 0
                },
                pluck='name'
            )
            
            for otp_name in expired_otps:
                frappe.delete_doc('OTP Verification', otp_name, ignore_permissions=True)
            
            frappe.db.commit()
            frappe.logger().info(f"Cleaned up {len(expired_otps)} expired OTP records")
            
        except Exception as e:
            frappe.log_error(
                title="OTP Cleanup Error",
                message=str(e)
            )


@frappe.whitelist(allow_guest=True)
def send_otp(mobile_no: str, purpose: str):
    """
    API endpoint to send OTP
    
    Args:
        mobile_no: Phone number
        purpose: Purpose (registration, login, password_reset)
        
    Returns:
        Response with OTP sent status
    """
    try:
        # Validate inputs
        if not mobile_no or not purpose:
            frappe.throw(_('Mobile number and purpose are required'))
        
        if purpose not in ['registration', 'login', 'password_reset']:
            frappe.throw(_('Invalid OTP purpose'))
        
        # Normalize phone number
        mobile_no = mobile_no.strip()
        if not mobile_no.startswith('+'):
            if mobile_no.startswith('0'):
                mobile_no = '+255' + mobile_no[1:]
            elif mobile_no.startswith('255'):
                mobile_no = '+' + mobile_no
            else:
                mobile_no = '+255' + mobile_no
        
        # For registration, check if user already exists
        if purpose == 'registration':
            existing_user = frappe.db.exists('User', {'mobile_no': mobile_no})
            if existing_user:
                frappe.throw(_('A user with this mobile number already exists'))
        
        # For login and password reset, check if user exists
        if purpose in ['login', 'password_reset']:
            user_exists = frappe.db.exists('User', {'mobile_no': mobile_no})
            if not user_exists:
                frappe.throw(_('No user found with this mobile number'))
        
        # Create OTP record
        otp_result = OTPManager.create_otp_record(mobile_no, purpose)
        
        # Send OTP via SMS
        sms_sent = send_otp_sms(mobile_no, otp_result['otp_code'], purpose)
        
        if not sms_sent:
            frappe.throw(_('Failed to send OTP. Please try again.'))
        
        return {
            'message': 'OTP sent successfully',
            'expires_at': otp_result['expires_at'],
            'mobile_no': mobile_no
        }
        
    except Exception as e:
        frappe.log_error(
            title="Send OTP API Error",
            message=f"Error sending OTP to {mobile_no}: {str(e)}"
        )
        frappe.throw(_(str(e)))


@frappe.whitelist(allow_guest=True)
def verify_otp(mobile_no: str, otp_code: str, purpose: str):
    """
    API endpoint to verify OTP
    
    Args:
        mobile_no: Phone number
        otp_code: OTP code to verify
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
        
        # Verify OTP
        result = OTPManager.verify_otp(mobile_no, otp_code.strip(), purpose)
        
        if result['success']:
            return {
                'message': result['message'],
                'verified': True
            }
        else:
            frappe.throw(_(result['message']))
            
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
        Response with new OTP sent status
    """
    try:
        # Invalidate previous OTPs
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
        
        # Send new OTP
        return send_otp(mobile_no, purpose)
        
    except Exception as e:
        frappe.log_error(
            title="Resend OTP API Error",
            message=f"Error resending OTP to {mobile_no}: {str(e)}"
        )
        frappe.throw(_(str(e)))
