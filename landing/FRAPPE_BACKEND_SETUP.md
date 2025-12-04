# Frappe Backend Setup Guide

This guide provides instructions for setting up the required Frappe backend components for the Dereva Huduma authentication system.

## Prerequisites
- Frappe/ERPNext instance running at: https://derevakiganjani.mdvfleet.co.tz
- Bench CLI access
- Administrator privileges

## Step 1: Create Custom App (if not exists)

```bash
cd ~/frappe-bench
bench new-app derevahuduma_platform
bench --site derevakiganjani.mdvfleet.co.tz install-app derevahuduma_platform
```

## Step 2: Create DocTypes

### 2.1 Driver Profile DocType

Create file: `derevahuduma_platform/derevahuduma_platform/doctype/driver_profile/driver_profile.json`

```json
{
  "name": "Driver Profile",
  "module": "Derevahuduma Platform",
  "doctype": "DocType",
  "is_submittable": 0,
  "track_changes": 1,
  "fields": [
    {
      "fieldname": "user",
      "label": "User",
      "fieldtype": "Link",
      "options": "User",
      "reqd": 1,
      "unique": 1
    },
    {
      "fieldname": "full_name",
      "label": "Full Name",
      "fieldtype": "Data",
      "reqd": 1
    },
    {
      "fieldname": "phone_number",
      "label": "Phone Number",
      "fieldtype": "Data",
      "reqd": 1
    },
    {
      "fieldname": "email",
      "label": "Email",
      "fieldtype": "Data"
    },
    {
      "fieldname": "national_id",
      "label": "National ID",
      "fieldtype": "Data"
    },
    {
      "fieldname": "license_number",
      "label": "License Number",
      "fieldtype": "Data"
    },
    {
      "fieldname": "license_category",
      "label": "License Category",
      "fieldtype": "Select",
      "options": "A\nB\nC\nD\nE"
    },
    {
      "fieldname": "profile_photo",
      "label": "Profile Photo",
      "fieldtype": "Attach Image"
    },
    {
      "fieldname": "date_of_birth",
      "label": "Date of Birth",
      "fieldtype": "Date"
    },
    {
      "fieldname": "address",
      "label": "Address",
      "fieldtype": "Small Text"
    },
    {
      "fieldname": "experience_years",
      "label": "Years of Experience",
      "fieldtype": "Int"
    },
    {
      "fieldname": "bio",
      "label": "Bio",
      "fieldtype": "Text"
    }
  ],
  "permissions": [
    {
      "role": "Driver",
      "read": 1,
      "write": 1,
      "create": 1
    },
    {
      "role": "System Manager",
      "read": 1,
      "write": 1,
      "create": 1,
      "delete": 1
    }
  ]
}
```

### 2.2 Employer Profile DocType

Create file: `derevahuduma_platform/derevahuduma_platform/doctype/employer_profile/employer_profile.json`

```json
{
  "name": "Employer Profile",
  "module": "Derevahuduma Platform",
  "doctype": "DocType",
  "is_submittable": 0,
  "track_changes": 1,
  "fields": [
    {
      "fieldname": "user",
      "label": "User",
      "fieldtype": "Link",
      "options": "User",
      "reqd": 1,
      "unique": 1
    },
    {
      "fieldname": "company_name",
      "label": "Company Name",
      "fieldtype": "Data",
      "reqd": 1
    },
    {
      "fieldname": "contact_person",
      "label": "Contact Person",
      "fieldtype": "Data",
      "reqd": 1
    },
    {
      "fieldname": "phone_number",
      "label": "Phone Number",
      "fieldtype": "Data",
      "reqd": 1
    },
    {
      "fieldname": "email",
      "label": "Email",
      "fieldtype": "Data"
    },
    {
      "fieldname": "company_registration",
      "label": "Company Registration Number",
      "fieldtype": "Data"
    },
    {
      "fieldname": "address",
      "label": "Address",
      "fieldtype": "Small Text"
    },
    {
      "fieldname": "website",
      "label": "Website",
      "fieldtype": "Data"
    },
    {
      "fieldname": "company_logo",
      "label": "Company Logo",
      "fieldtype": "Attach Image"
    },
    {
      "fieldname": "verified",
      "label": "Verified",
      "fieldtype": "Check",
      "default": 0
    },
    {
      "fieldname": "verification_status",
      "label": "Verification Status",
      "fieldtype": "Select",
      "options": "Pending\nVerified\nRejected",
      "default": "Pending"
    }
  ],
  "permissions": [
    {
      "role": "Employer",
      "read": 1,
      "write": 1,
      "create": 1
    },
    {
      "role": "System Manager",
      "read": 1,
      "write": 1,
      "create": 1,
      "delete": 1
    }
  ]
}
```

### 2.3 Admin Profile DocType

Create file: `derevahuduma_platform/derevahuduma_platform/doctype/admin_profile/admin_profile.json`

```json
{
  "name": "Admin Profile",
  "module": "Derevahuduma Platform",
  "doctype": "DocType",
  "is_submittable": 0,
  "track_changes": 1,
  "fields": [
    {
      "fieldname": "user",
      "label": "User",
      "fieldtype": "Link",
      "options": "User",
      "reqd": 1,
      "unique": 1
    },
    {
      "fieldname": "full_name",
      "label": "Full Name",
      "fieldtype": "Data",
      "reqd": 1
    },
    {
      "fieldname": "phone_number",
      "label": "Phone Number",
      "fieldtype": "Data",
      "reqd": 1
    },
    {
      "fieldname": "email",
      "label": "Email",
      "fieldtype": "Data"
    },
    {
      "fieldname": "department",
      "label": "Department",
      "fieldtype": "Data"
    },
    {
      "fieldname": "position",
      "label": "Position",
      "fieldtype": "Data"
    }
  ],
  "permissions": [
    {
      "role": "System Manager",
      "read": 1,
      "write": 1,
      "create": 1,
      "delete": 1
    }
  ]
}
```

## Step 3: Create Custom Roles

```bash
bench console
```

```python
# Create Driver Role
if not frappe.db.exists("Role", "Driver"):
    role = frappe.get_doc({
        "doctype": "Role",
        "role_name": "Driver",
        "desk_access": 1
    })
    role.insert()

# Create Employer Role
if not frappe.db.exists("Role", "Employer"):
    role = frappe.get_doc({
        "doctype": "Role",
        "role_name": "Employer",
        "desk_access": 1
    })
    role.insert()

# Create Staff Role
if not frappe.db.exists("Role", "Staff"):
    role = frappe.get_doc({
        "doctype": "Role",
        "role_name": "Staff",
        "desk_access": 1
    })
    role.insert()

frappe.db.commit()
```

## Step 4: Create API Endpoints

Create file: `derevahuduma_platform/derevahuduma_platform/api/auth.py`

```python
import frappe
from frappe import _
from frappe.utils import cint

@frappe.whitelist(allow_guest=True)
def register(mobile_no, password, first_name, last_name=None, email=None, user_type="Driver", company_name=None):
    """
    Register a new user
    """
    try:
        # Validate required fields
        if not mobile_no or not password or not first_name:
            frappe.throw(_("Mobile number, password, and first name are required"))
        
        # Check if user already exists
        if frappe.db.exists("User", mobile_no):
            frappe.throw(_("User with this mobile number already exists"))
        
        if email and frappe.db.exists("User", email):
            frappe.throw(_("User with this email already exists"))
        
        # Create user
        user = frappe.get_doc({
            "doctype": "User",
            "email": email or f"{mobile_no}@temp.dereva.co.tz",
            "first_name": first_name,
            "last_name": last_name or "",
            "mobile_no": mobile_no,
            "enabled": 1,
            "new_password": password,
            "send_welcome_email": 0,
            "user_type": "System User"
        })
        
        # Add role based on user type
        if user_type == "Driver":
            user.append("roles", {"role": "Driver"})
        elif user_type == "Employer":
            user.append("roles", {"role": "Employer"})
        elif user_type == "Admin":
            user.append("roles", {"role": "Admin"})
        elif user_type == "Staff":
            user.append("roles", {"role": "Staff"})
        
        user.insert(ignore_permissions=True)
        
        # Create profile based on user type
        if user_type == "Driver":
            profile = frappe.get_doc({
                "doctype": "Driver Profile",
                "user": user.name,
                "full_name": f"{first_name} {last_name or ''}".strip(),
                "phone_number": mobile_no,
                "email": email
            })
            profile.insert(ignore_permissions=True)
        
        elif user_type == "Employer":
            profile = frappe.get_doc({
                "doctype": "Employer Profile",
                "user": user.name,
                "company_name": company_name or f"{first_name} {last_name or ''}".strip(),
                "contact_person": f"{first_name} {last_name or ''}".strip(),
                "phone_number": mobile_no,
                "email": email,
                "verified": 0,
                "verification_status": "Pending"
            })
            profile.insert(ignore_permissions=True)
        
        elif user_type in ["Admin", "Staff"]:
            profile = frappe.get_doc({
                "doctype": "Admin Profile",
                "user": user.name,
                "full_name": f"{first_name} {last_name or ''}".strip(),
                "phone_number": mobile_no,
                "email": email
            })
            profile.insert(ignore_permissions=True)
        
        frappe.db.commit()
        
        return {
            "success": True,
            "message": _("User registered successfully"),
            "user": user.name
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Registration Error"))
        frappe.throw(_(str(e)))


@frappe.whitelist()
def get_user_profile():
    """
    Get current user's profile
    """
    try:
        user = frappe.session.user
        
        if not user or user == "Guest":
            frappe.throw(_("Not authenticated"))
        
        # Get user details
        user_doc = frappe.get_doc("User", user)
        
        # Determine user type from roles
        user_type = None
        if "Driver" in [r.role for r in user_doc.roles]:
            user_type = "Driver"
        elif "Employer" in [r.role for r in user_doc.roles]:
            user_type = "Employer"
        elif "Admin" in [r.role for r in user_doc.roles]:
            user_type = "Admin"
        elif "Staff" in [r.role for r in user_doc.roles]:
            user_type = "Staff"
        
        # Get profile based on user type
        profile = None
        if user_type == "Driver" and frappe.db.exists("Driver Profile", {"user": user}):
            profile = frappe.get_doc("Driver Profile", {"user": user})
        elif user_type == "Employer" and frappe.db.exists("Employer Profile", {"user": user}):
            profile = frappe.get_doc("Employer Profile", {"user": user})
        elif user_type in ["Admin", "Staff"] and frappe.db.exists("Admin Profile", {"user": user}):
            profile = frappe.get_doc("Admin Profile", {"user": user})
        
        return {
            "user": {
                "name": user_doc.name,
                "email": user_doc.email,
                "full_name": user_doc.full_name,
                "user_image": user_doc.user_image,
                "mobile_no": user_doc.mobile_no,
                "user_type": user_type,
                "roles": [r.role for r in user_doc.roles],
                "enabled": user_doc.enabled
            },
            "profile": profile.as_dict() if profile else None
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Get Profile Error"))
        frappe.throw(_(str(e)))


@frappe.whitelist()
def update_profile(**kwargs):
    """
    Update user profile
    """
    try:
        user = frappe.session.user
        
        if not user or user == "Guest":
            frappe.throw(_("Not authenticated"))
        
        # Get user doc
        user_doc = frappe.get_doc("User", user)
        
        # Determine user type
        user_type = None
        if "Driver" in [r.role for r in user_doc.roles]:
            user_type = "Driver"
        elif "Employer" in [r.role for r in user_doc.roles]:
            user_type = "Employer"
        elif "Admin" in [r.role for r in user_doc.roles] or "Staff" in [r.role for r in user_doc.roles]:
            user_type = "Admin"
        
        # Update profile
        if user_type == "Driver":
            profile = frappe.get_doc("Driver Profile", {"user": user})
        elif user_type == "Employer":
            profile = frappe.get_doc("Employer Profile", {"user": user})
        elif user_type == "Admin":
            profile = frappe.get_doc("Admin Profile", {"user": user})
        else:
            frappe.throw(_("Invalid user type"))
        
        # Update fields
        for key, value in kwargs.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        
        profile.save(ignore_permissions=True)
        frappe.db.commit()
        
        return {
            "success": True,
            "message": _("Profile updated successfully")
        }
    
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Update Profile Error"))
        frappe.throw(_(str(e)))
```

## Step 5: Enable CORS (if needed)

Edit `sites/derevakiganjani.mdvfleet.co.tz/site_config.json`:

```json
{
  "allow_cors": "*",
  "cors_allowed_origins": [
    "http://localhost:5173",
    "https://yourdomain.com"
  ]
}
```

## Step 6: Restart Bench

```bash
bench restart
```

## Step 7: Test API Endpoints

### Test Registration
```bash
curl -X POST https://derevakiganjani.mdvfleet.co.tz/api/method/derevahuduma_platform.api.auth.register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile_no": "+255712345678",
    "password": "test123456",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "user_type": "Driver"
  }'
```

### Test Get Profile (after login)
```bash
curl -X GET https://derevakiganjani.mdvfleet.co.tz/api/method/derevahuduma_platform.api.auth.get_user_profile \
  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET"
```

## Step 8: Email Configuration (for OTP)

1. Go to: Setup > Email > Email Account
2. Configure SMTP settings
3. Create email template for OTP

## Step 9: SMS Configuration (Beem Africa - Future)

Will be configured later for SMS OTP functionality.

## Troubleshooting

### Issue: CORS errors
**Solution**: Check site_config.json and ensure CORS is properly configured

### Issue: Permission denied
**Solution**: Check role permissions in DocType settings

### Issue: User creation fails
**Solution**: Check error logs: `bench --site derevakiganjani.mdvfleet.co.tz logs`

## Security Checklist

- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set strong password policy
- [ ] Enable two-factor authentication
- [ ] Regular security audits
- [ ] Monitor failed login attempts
- [ ] Implement session timeout

## Maintenance

### Regular Tasks
1. Monitor error logs
2. Update Frappe/ERPNext
3. Backup database regularly
4. Review user permissions
5. Clean up inactive users

### Backup Command
```bash
bench --site derevakiganjani.mdvfleet.co.tz backup
```

## Support

For issues or questions:
- Check Frappe documentation: https://frappeframework.com/docs
- Frappe Forum: https://discuss.frappe.io
- GitHub Issues: https://github.com/frappe/frappe
