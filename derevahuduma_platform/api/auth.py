"""
Authentication API

This module handles user registration, login, profile management, and password reset.
"""

import frappe
from frappe import _
from frappe.utils import cint, now_datetime
from frappe.utils.password import update_password
from typing import Dict, Any, Optional
import re


def send_welcome_email(user, user_type, company_name=None):
    """
    Send welcome email to newly registered user
    
    Args:
        user: User document
        user_type: Type of user (Driver/Employer)
        company_name: Company name for employers
    """
    try:
        # Prepare email content based on user type
        if user_type == 'Driver':
            subject = "Welcome to Dereva Kiganjani - Driver Platform"
            message = f"""
            <h2>Welcome to Dereva Kiganjani, {user.full_name}!</h2>
            
            <p>Thank you for registering as a Driver on our platform.</p>
            
            <h3>Available Services:</h3>
            <ul>
                <li><strong>Leseni</strong> - License Services: Manage your driving license</li>
                <li><strong>JiTesti</strong> - Driver Test: Take driving tests online</li>
                <li><strong>Elimika</strong> - Driver Learning: Access learning materials</li>
                <li><strong>Ajira ya Udereva</strong> - Driver Jobs: Find employment opportunities</li>
            </ul>
            
            <p>You can now log in to your account and start exploring our services.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            Dereva Kiganjani Team<br>
            MDV Vehicle Fleet Limited</p>
            """
        else:  # Employer
            subject = "Welcome to Dereva Kiganjani - Employer Platform"
            message = f"""
            <h2>Welcome to Dereva Kiganjani, {company_name or user.full_name}!</h2>
            
            <p>Thank you for registering as an Employer on our platform.</p>
            
            <h3>Available Services:</h3>
            <ul>
                <li><strong>Ajiri Dereva</strong> - Hire a Driver: Post job openings and find qualified drivers</li>
                <li><strong>Driver Database</strong> - Access our database of verified drivers</li>
                <li><strong>Job Management</strong> - Manage your job postings and applications</li>
            </ul>
            
            <p>You can now log in to your account and start posting job opportunities.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            Dereva Kiganjani Team<br>
            MDV Vehicle Fleet Limited</p>
            """
        
        # Send email using Frappe's email queue
        frappe.sendmail(
            recipients=[user.email] if user.email else [user.name],
            subject=subject,
            message=message,
            delayed=False,
            retry=3
        )
        
    except Exception as e:
        # Re-raise to be caught by caller
        raise e


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(mobile_no: str) -> bool:
    """Validate Tanzania phone number format"""
    # Remove spaces and dashes
    mobile_no = mobile_no.replace(' ', '').replace('-', '')
    
    # Check if it matches Tanzania format
    patterns = [
        r'^\+255[67]\d{8}$',  # +255 6XX XXX XXX or +255 7XX XXX XXX
        r'^255[67]\d{8}$',     # 255 6XX XXX XXX or 255 7XX XXX XXX
        r'^0[67]\d{8}$',       # 06XX XXX XXX or 07XX XXX XXX
        r'^[67]\d{8}$'         # 6XX XXX XXX or 7XX XXX XXX
    ]
    
    return any(re.match(pattern, mobile_no) for pattern in patterns)


def normalize_phone(mobile_no: str) -> str:
    """Normalize phone number to +255 format"""
    mobile_no = mobile_no.replace(' ', '').replace('-', '')
    
    if mobile_no.startswith('+255'):
        return mobile_no
    elif mobile_no.startswith('255'):
        return '+' + mobile_no
    elif mobile_no.startswith('0'):
        return '+255' + mobile_no[1:]
    else:
        return '+255' + mobile_no


def validate_password(password: str) -> Dict[str, Any]:
    """
    Validate password strength
    
    Requirements:
    - At least 8 characters (relaxed for production)
    """
    errors = []
    
    if len(password) < 8:
        errors.append('Password must be at least 8 characters long')
    
    # Optional: Warn about weak passwords but don't block
    # if not re.search(r'[A-Z]', password):
    #     errors.append('Password must contain at least one uppercase letter')
    # 
    # if not re.search(r'[a-z]', password):
    #     errors.append('Password must contain at least one lowercase letter')
    # 
    # if not re.search(r'\d', password):
    #     errors.append('Password must contain at least one number')
    
    return {
        'valid': len(errors) == 0,
        'errors': errors
    }


@frappe.whitelist(allow_guest=True)
def register(
    mobile_no: str,
    password: str,
    first_name: str,
    user_type: str,
    last_name: str = None,
    email: str = None,
    company_name: str = None,
    national_id: str = None,
    contact_person: str = None,
    company_registration: str = None,
    address: str = None,
    website: str = None
):
    """
    Register a new user
    
    Args:
        mobile_no: Phone number (required)
        password: Password (required)
        first_name: First name (required)
        user_type: User type - Driver or Employer (required)
        last_name: Last name (optional)
        email: Email address (optional)
        company_name: Company name (required for Employer)
        national_id: National ID (optional for Driver)
        contact_person: Contact person name (for Employer)
        company_registration: Company registration number (optional for Employer)
        address: Company address (optional for Employer)
        website: Company website (optional for Employer)
        
    Returns:
        User and profile information
    """
    try:
        # Validate inputs
        if not mobile_no or not password or not first_name or not user_type:
            frappe.throw(_('Mobile number, password, first name, and user type are required'))
        
        if user_type not in ['Driver', 'Employer']:
            frappe.throw(_('Invalid user type. Must be Driver or Employer'))
        
        if user_type == 'Employer' and not company_name:
            frappe.throw(_('Company name is required for Employer registration'))
        
        # Validate phone number
        if not validate_phone(mobile_no):
            frappe.throw(_('Invalid phone number format'))
        
        mobile_no = normalize_phone(mobile_no)
        
        # Validate email if provided
        if email and not validate_email(email):
            frappe.throw(_('Invalid email format'))
        
        # Validate password
        password_validation = validate_password(password)
        if not password_validation['valid']:
            frappe.throw(_('<br>'.join(password_validation['errors'])))
        
        # Check if user already exists
        if frappe.db.exists('User', {'mobile_no': mobile_no}):
            frappe.throw(_('A user with this mobile number already exists'))
        
        if email and frappe.db.exists('User', {'email': email}):
            frappe.throw(_('A user with this email already exists'))
        
        # Create user
        full_name = f"{first_name} {last_name}" if last_name else first_name
        
        # Use mobile number as username if no email
        username = email if email else mobile_no
        
        user = frappe.get_doc({
            'doctype': 'User',
            'email': username,
            'first_name': first_name,
            'last_name': last_name,
            'full_name': full_name,
            'mobile_no': mobile_no,
            'enabled': 1,
            'send_welcome_email': 0,
            'user_type': 'System User'
        })
        
        user.insert(ignore_permissions=True)
        
        # Set password
        update_password(user.name, password)
        
        # Add role
        user.add_roles(user_type)
        
        # Send welcome email
        try:
            send_welcome_email(user, user_type, company_name if user_type == 'Employer' else None)
        except Exception as email_error:
            # Log email error but don't fail registration
            frappe.log_error(
                title="Welcome Email Error",
                message=f"Failed to send welcome email to {user.name}: {str(email_error)}"
            )
        
        # Create profile based on user type
        profile = None
        
        if user_type == 'Driver':
            profile = frappe.get_doc({
                'doctype': 'Driver Profile',
                'user': user.name,
                'full_name': full_name,
                'phone_number': mobile_no,
                'email': email,
                'national_id': national_id,
                'status': 'Active'
            })
            profile.insert(ignore_permissions=True)
            
        elif user_type == 'Employer':
            profile = frappe.get_doc({
                'doctype': 'Employer Profile',
                'user': user.name,
                'company_name': company_name,
                'contact_person': contact_person or full_name,
                'phone_number': mobile_no,
                'email': email,
                'company_registration': company_registration,
                'address': address,
                'website': website,
                'verified': 0,
                'verification_status': 'Pending'
            })
            profile.insert(ignore_permissions=True)
        
        frappe.db.commit()
        
        return {
            'message': 'User registered successfully',
            'user': {
                'name': user.name,
                'email': user.email,
                'full_name': user.full_name,
                'mobile_no': user.mobile_no,
                'user_type': user_type
            },
            'profile': profile.as_dict() if profile else None
        }
        
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(
            title="User Registration Error",
            message=f"Error registering user {mobile_no}: {str(e)}"
        )
        frappe.throw(_(str(e)))


@frappe.whitelist()
def get_user_profile():
    """
    Get current user's profile
    
    Returns:
        User profile information
    """
    try:
        user = frappe.session.user
        
        if user == 'Guest':
            frappe.throw(_('Not authenticated'))
        
        # Get user details
        user_doc = frappe.get_doc('User', user)
        
        # Determine user type from roles
        user_type = None
        if 'Driver' in [r.role for r in user_doc.roles]:
            user_type = 'Driver'
        elif 'Employer' in [r.role for r in user_doc.roles]:
            user_type = 'Employer'
        elif 'Admin' in [r.role for r in user_doc.roles]:
            user_type = 'Admin'
        elif 'Staff' in [r.role for r in user_doc.roles]:
            user_type = 'Staff'
        
        # Get profile based on user type
        profile = None
        
        if user_type == 'Driver':
            profile_name = frappe.db.get_value('Driver Profile', {'user': user})
            if profile_name:
                profile = frappe.get_doc('Driver Profile', profile_name)
                
        elif user_type == 'Employer':
            profile_name = frappe.db.get_value('Employer Profile', {'user': user})
            if profile_name:
                profile = frappe.get_doc('Employer Profile', profile_name)
                
        elif user_type in ['Admin', 'Staff']:
            profile_name = frappe.db.get_value('Admin Profile', {'user': user})
            if profile_name:
                profile = frappe.get_doc('Admin Profile', profile_name)
        
        return {
            'message': {
                'name': user_doc.name,
                'email': user_doc.email,
                'full_name': user_doc.full_name,
                'mobile_no': user_doc.mobile_no,
                'user_image': user_doc.user_image,
                'user_type': user_type,
                'roles': [r.role for r in user_doc.roles],
                'enabled': user_doc.enabled,
                'profile': profile.as_dict() if profile else None
            }
        }
        
    except Exception as e:
        frappe.log_error(
            title="Get User Profile Error",
            message=str(e)
        )
        frappe.throw(_('Failed to get user profile'))


@frappe.whitelist()
def update_profile(**kwargs):
    """
    Update user profile
    
    Args:
        **kwargs: Profile fields to update
        
    Returns:
        Updated profile
    """
    try:
        user = frappe.session.user
        
        if user == 'Guest':
            frappe.throw(_('Not authenticated'))
        
        # Get user doc
        user_doc = frappe.get_doc('User', user)
        
        # Determine user type
        user_type = None
        if 'Driver' in [r.role for r in user_doc.roles]:
            user_type = 'Driver'
        elif 'Employer' in [r.role for r in user_doc.roles]:
            user_type = 'Employer'
        elif 'Admin' in [r.role for r in user_doc.roles] or 'Staff' in [r.role for r in user_doc.roles]:
            user_type = 'Admin'
        
        if not user_type:
            frappe.throw(_('User type not found'))
        
        # Get profile
        profile_doctype = f'{user_type} Profile'
        profile_name = frappe.db.get_value(profile_doctype, {'user': user})
        
        if not profile_name:
            frappe.throw(_('Profile not found'))
        
        profile = frappe.get_doc(profile_doctype, profile_name)
        
        # Update allowed fields
        allowed_fields = {
            'Driver': ['full_name', 'phone_number', 'email', 'address', 'bio', 'experience_years'],
            'Employer': ['company_name', 'contact_person', 'phone_number', 'email', 'address', 'website'],
            'Admin': ['full_name', 'phone_number', 'email', 'department', 'position']
        }
        
        for field, value in kwargs.items():
            if field in allowed_fields.get(user_type, []):
                profile.set(field, value)
        
        profile.save(ignore_permissions=True)
        frappe.db.commit()
        
        return {
            'message': 'Profile updated successfully',
            'profile': profile.as_dict()
        }
        
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(
            title="Update Profile Error",
            message=str(e)
        )
        frappe.throw(_('Failed to update profile'))


@frappe.whitelist(allow_guest=True)
def request_password_reset(user: str):
    """
    Request password reset via OTP
    
    Args:
        user: Email or mobile number
        
    Returns:
        Success message
    """
    try:
        # Find user by email or mobile
        user_doc = None
        
        if validate_email(user):
            user_doc = frappe.db.get_value('User', {'email': user}, ['name', 'mobile_no'], as_dict=True)
        elif validate_phone(user):
            mobile_no = normalize_phone(user)
            user_doc = frappe.db.get_value('User', {'mobile_no': mobile_no}, ['name', 'mobile_no'], as_dict=True)
        
        if not user_doc:
            frappe.throw(_('User not found'))
        
        if not user_doc.mobile_no:
            frappe.throw(_('No mobile number associated with this account'))
        
        # Send OTP via the OTP module
        from .otp import send_otp
        result = send_otp(user_doc.mobile_no, 'password_reset')
        
        return {
            'message': 'Password reset OTP sent successfully',
            'mobile_no': user_doc.mobile_no
        }
        
    except Exception as e:
        frappe.log_error(
            title="Password Reset Request Error",
            message=str(e)
        )
        frappe.throw(_(str(e)))


@frappe.whitelist(allow_guest=True)
def reset_password(mobile_no: str, otp: str, new_password: str):
    """
    Reset password using OTP
    
    Args:
        mobile_no: Mobile number
        otp: OTP code
        new_password: New password
        
    Returns:
        Success message
    """
    try:
        # Normalize phone number
        mobile_no = normalize_phone(mobile_no)
        
        # Verify OTP
        from .otp import verify_otp
        verify_result = verify_otp(mobile_no, otp, 'password_reset')
        
        if not verify_result.get('verified'):
            frappe.throw(_('Invalid or expired OTP'))
        
        # Validate new password
        password_validation = validate_password(new_password)
        if not password_validation['valid']:
            frappe.throw(_('<br>'.join(password_validation['errors'])))
        
        # Find user
        user_name = frappe.db.get_value('User', {'mobile_no': mobile_no})
        
        if not user_name:
            frappe.throw(_('User not found'))
        
        # Update password
        update_password(user_name, new_password)
        frappe.db.commit()
        
        return {
            'message': 'Password reset successfully'
        }
        
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(
            title="Password Reset Error",
            message=str(e)
        )
        frappe.throw(_(str(e)))


@frappe.whitelist(allow_guest=True)
def check_availability(field: str, value: str):
    """
    Check if email or mobile number is available
    
    Args:
        field: 'email' or 'mobile_no'
        value: Value to check
        
    Returns:
        Availability status
    """
    try:
        if field not in ['email', 'mobile_no']:
            frappe.throw(_('Invalid field'))
        
        if field == 'mobile_no':
            value = normalize_phone(value)
        
        exists = frappe.db.exists('User', {field: value})
        
        return {
            'available': not exists,
            'message': 'Available' if not exists else f'{field.replace("_", " ").title()} already in use'
        }
        
    except Exception as e:
        frappe.log_error(
            title="Check Availability Error",
            message=str(e)
        )
        frappe.throw(_('Failed to check availability'))


@frappe.whitelist(allow_guest=True)
def login_with_otp(mobile_no: str, otp: str):
    """
    Login using OTP
    
    Args:
        mobile_no: Mobile number
        otp: OTP code
        
    Returns:
        Login success and user info
    """
    try:
        # Normalize phone number
        mobile_no = normalize_phone(mobile_no)
        
        # Verify OTP
        from .otp import verify_otp
        verify_result = verify_otp(mobile_no, otp, 'login')
        
        if not verify_result.get('verified'):
            frappe.throw(_('Invalid or expired OTP'))
        
        # Find user
        user_name = frappe.db.get_value('User', {'mobile_no': mobile_no})
        
        if not user_name:
            frappe.throw(_('User not found'))
        
        # Login user
        frappe.local.login_manager.login_as(user_name)
        frappe.db.commit()
        
        return {
            'message': 'Login successful',
            'user': user_name
        }
        
    except Exception as e:
        frappe.log_error(
            title="OTP Login Error",
            message=str(e)
        )
        frappe.throw(_(str(e)))
