"""
SMS Service Integration - Beem Africa

This module handles SMS sending via Beem Africa API for OTP and notifications.
"""

import frappe
import requests
import json
from frappe import _
from typing import Dict, Any


class BeemSMSService:
    """Beem Africa SMS Service wrapper"""
    
    def __init__(self):
        self.api_key = frappe.conf.get('beem_api_key')
        self.secret_key = frappe.conf.get('beem_secret_key')
        self.sender_name = frappe.conf.get('beem_sender_name', 'DEREVA')
        self.base_url = 'https://apisms.beem.africa/v1'
        
        if not self.api_key or not self.secret_key:
            frappe.log_error(
                title="Beem SMS Configuration Missing",
                message="Please configure beem_api_key and beem_secret_key in site_config.json"
            )
    
    def send_sms(self, mobile_no: str, message: str) -> Dict[str, Any]:
        """
        Send SMS via Beem Africa API
        
        Args:
            mobile_no: Phone number in format +255XXXXXXXXX
            message: SMS message content
            
        Returns:
            Dict with success status and response data
        """
        try:
            # Validate phone number format
            if not mobile_no.startswith('+'):
                mobile_no = f'+{mobile_no}'
            
            # Prepare request
            url = f'{self.base_url}/send'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Basic {self._get_auth_token()}'
            }
            
            payload = {
                'source_addr': self.sender_name,
                'schedule_time': '',
                'encoding': 0,
                'message': message,
                'recipients': [
                    {
                        'recipient_id': '1',
                        'dest_addr': mobile_no
                    }
                ]
            }
            
            # Send request
            response = requests.post(
                url,
                headers=headers,
                data=json.dumps(payload),
                timeout=30
            )
            
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('successful'):
                frappe.logger().info(f"SMS sent successfully to {mobile_no}")
                return {
                    'success': True,
                    'message': 'SMS sent successfully',
                    'data': response_data
                }
            else:
                error_msg = response_data.get('message', 'Unknown error')
                frappe.log_error(
                    title="Beem SMS Send Failed",
                    message=f"Failed to send SMS to {mobile_no}: {error_msg}"
                )
                return {
                    'success': False,
                    'message': error_msg,
                    'data': response_data
                }
                
        except requests.exceptions.Timeout:
            frappe.log_error(
                title="Beem SMS Timeout",
                message=f"SMS request timed out for {mobile_no}"
            )
            return {
                'success': False,
                'message': 'SMS service timeout. Please try again.'
            }
            
        except Exception as e:
            frappe.log_error(
                title="Beem SMS Error",
                message=f"Error sending SMS to {mobile_no}: {str(e)}"
            )
            return {
                'success': False,
                'message': f'Failed to send SMS: {str(e)}'
            }
    
    def _get_auth_token(self) -> str:
        """Generate Basic Auth token from API key and secret"""
        import base64
        credentials = f'{self.api_key}:{self.secret_key}'
        return base64.b64encode(credentials.encode()).decode()
    
    def get_balance(self) -> Dict[str, Any]:
        """Get SMS balance from Beem Africa"""
        try:
            url = f'{self.base_url}/vendors/balance'
            headers = {
                'Authorization': f'Basic {self._get_auth_token()}'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response_data = response.json()
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'balance': response_data.get('data', {}).get('credit_balance', 0)
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to get balance'
                }
                
        except Exception as e:
            frappe.log_error(
                title="Beem Balance Check Error",
                message=str(e)
            )
            return {
                'success': False,
                'message': str(e)
            }


# Singleton instance
_sms_service = None


def get_sms_service() -> BeemSMSService:
    """Get or create SMS service instance"""
    global _sms_service
    if _sms_service is None:
        _sms_service = BeemSMSService()
    return _sms_service


@frappe.whitelist(allow_guest=False)
def send_sms(mobile_no: str, message: str):
    """
    API endpoint to send SMS
    
    Args:
        mobile_no: Phone number
        message: SMS message
        
    Returns:
        Response dict with success status
    """
    try:
        sms_service = get_sms_service()
        result = sms_service.send_sms(mobile_no, message)
        
        if result['success']:
            return {
                'message': 'SMS sent successfully',
                'success': True
            }
        else:
            frappe.throw(_(result['message']))
            
    except Exception as e:
        frappe.log_error(
            title="Send SMS API Error",
            message=str(e)
        )
        frappe.throw(_('Failed to send SMS'))


@frappe.whitelist(allow_guest=False)
def check_sms_balance():
    """
    API endpoint to check SMS balance
    
    Returns:
        Balance information
    """
    try:
        sms_service = get_sms_service()
        result = sms_service.get_balance()
        
        if result['success']:
            return {
                'message': 'Balance retrieved successfully',
                'balance': result['balance']
            }
        else:
            frappe.throw(_(result['message']))
            
    except Exception as e:
        frappe.log_error(
            title="Check SMS Balance Error",
            message=str(e)
        )
        frappe.throw(_('Failed to check SMS balance'))


def send_otp_sms(mobile_no: str, otp: str, purpose: str = 'verification') -> bool:
    """
    Helper function to send OTP via SMS
    
    Args:
        mobile_no: Phone number
        otp: OTP code
        purpose: Purpose of OTP (verification, login, password_reset)
        
    Returns:
        True if sent successfully, False otherwise
    """
    try:
        purpose_text = {
            'registration': 'registration',
            'login': 'login',
            'password_reset': 'password reset'
        }.get(purpose, 'verification')
        
        message = f'Your Dereva Huduma {purpose_text} code is: {otp}. Valid for 5 minutes. Do not share this code.'
        
        sms_service = get_sms_service()
        result = sms_service.send_sms(mobile_no, message)
        
        return result['success']
        
    except Exception as e:
        frappe.log_error(
            title="Send OTP SMS Error",
            message=f"Failed to send OTP to {mobile_no}: {str(e)}"
        )
        return False
