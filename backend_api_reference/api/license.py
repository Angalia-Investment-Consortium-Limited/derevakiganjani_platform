"""
License Management API

This module handles license applications, document uploads, and status tracking.
"""

import frappe
from frappe import _
from frappe.utils import now_datetime, cint
from typing import Dict, Any, List, Optional
import json
import requests
import base64
import hmac
import hashlib


# Tanzania Regions and Districts Data
REGIONS_DISTRICTS = {
    "Dar es Salaam": ["Ilala", "Kinondoni", "Temeke", "Ubungo", "Kigamboni"],
    "Arusha": ["Arusha City", "Arusha", "Karatu", "Longido", "Monduli", "Ngorongoro"],
    "Dodoma": ["Dodoma City", "Bahi", "Chamwino", "Chemba", "Kondoa", "Kongwa", "Mpwapwa"],
    "Geita": ["Geita", "Bukombe", "Chato", "Mbogwe", "Nyang'hwale"],
    "Iringa": ["Iringa", "Kilolo", "Mafinga", "Mufindi"],
    "Kagera": ["Bukoba", "Biharamulo", "Karagwe", "Kyerwa", "Missenyi", "Muleba", "Ngara"],
    "Katavi": ["Mpanda", "Mlele", "Tanganyika"],
    "Kigoma": ["Kigoma", "Buhigwe", "Kakonko", "Kasulu", "Kibondo", "Uvinza"],
    "Kilimanjaro": ["Moshi", "Hai", "Moshi Rural", "Mwanga", "Rombo", "Same", "Siha"],
    "Lindi": ["Lindi", "Kilwa", "Liwale", "Nachingwea", "Ruangwa"],
    "Manyara": ["Babati", "Hanang", "Kiteto", "Mbulu", "Simanjiro"],
    "Mara": ["Musoma", "Bunda", "Butiama", "Musoma Rural", "Rorya", "Serengeti", "Tarime"],
    "Mbeya": ["Mbeya City", "Chunya", "Kyela", "Mbarali", "Mbeya", "Rungwe"],
    "Morogoro": ["Morogoro", "Gairo", "Kilombero", "Kilosa", "Malinyi", "Morogoro Rural", "Mvomero", "Ulanga"],
    "Mtwara": ["Mtwara", "Masasi", "Mtwara Rural", "Nanyumbu", "Newala", "Tandahimba"],
    "Mwanza": ["Mwanza City", "Ilemela", "Kwimba", "Magu", "Misungwi", "Nyamagana", "Sengerema", "Ukerewe"],
    "Njombe": ["Njombe", "Ludewa", "Makambako", "Makete", "Njombe Rural", "Wanging'ombe"],
    "Pwani": ["Kibaha", "Bagamoyo", "Chalinze", "Kibaha Rural", "Kisarawe", "Mafia", "Mkuranga", "Rufiji"],
    "Rukwa": ["Sumbawanga", "Kalambo", "Nkasi", "Sumbawanga Rural"],
    "Ruvuma": ["Songea", "Mbinga", "Namtumbo", "Nyasa", "Songea Rural", "Tunduru"],
    "Shinyanga": ["Shinyanga", "Kahama", "Kishapu", "Shinyanga Rural"],
    "Simiyu": ["Bariadi", "Busega", "Itilima", "Maswa", "Meatu"],
    "Singida": ["Singida", "Ikungi", "Iramba", "Manyoni", "Mkalama", "Singida Rural"],
    "Songwe": ["Mbozi", "Ileje", "Momba", "Songwe"],
    "Tabora": ["Tabora", "Igunga", "Kaliua", "Nzega", "Sikonge", "Tabora Rural", "Urambo", "Uyui"],
    "Tanga": ["Tanga City", "Handeni", "Kilindi", "Korogwe", "Lushoto", "Muheza", "Mkinga", "Pangani", "Tanga"],
    "Zanzibar North": ["Kaskazini A", "Kaskazini B"],
    "Zanzibar South": ["Kusini", "Kusini Unguja"],
    "Zanzibar Urban/West": ["Mjini", "Magharibi"],
    "Pemba North": ["Wete", "Micheweni"],
    "Pemba South": ["Chake Chake", "Mkoani"]
}


@frappe.whitelist()
def get_regions():
    """
    Get list of all Tanzania regions
    
    Returns:
        List of regions
    """
    try:
        regions = sorted(list(REGIONS_DISTRICTS.keys()))
        return {
            'message': 'Regions retrieved successfully',
            'regions': regions
        }
    except Exception as e:
        frappe.log_error(
            title="Get Regions Error",
            message=str(e)
        )
        frappe.throw(_('Failed to get regions'))


@frappe.whitelist()
def get_districts(region: str):
    """
    Get districts for a specific region
    
    Args:
        region: Region name
        
    Returns:
        List of districts
    """
    try:
        if not region:
            frappe.throw(_('Region is required'))
        
        districts = REGIONS_DISTRICTS.get(region, [])
        
        return {
            'message': 'Districts retrieved successfully',
            'districts': sorted(districts)
        }
    except Exception as e:
        frappe.log_error(
            title="Get Districts Error",
            message=str(e)
        )
        frappe.throw(_('Failed to get districts'))


@frappe.whitelist()
def submit_license_application(
    application_type: str,
    full_name: str,
    phone_number: str,
    region: str,
    district: str,
    license_category: str,
    email: str = None,
    latra_type: str = None,
    current_license_number: str = None,
    documents: str = None
):
    """
    Submit a new license application
    
    Args:
        application_type: Type of application (New License, License Renewal, LATRA Exam)
        full_name: Applicant's full name
        phone_number: Phone number
        region: Region
        district: District
        license_category: License category (A/B/C/D/E)
        email: Email (optional)
        latra_type: LATRA type for exam registration (PSV/HGV)
        current_license_number: Current license number for renewal
        documents: JSON string of documents list
        
    Returns:
        Application details with reference number
    """
    try:
        user = frappe.session.user
        
        if user == 'Guest':
            frappe.throw(_('Please login to submit an application'))
        
        # Validate required fields
        if not all([application_type, full_name, phone_number, region, district, license_category]):
            frappe.throw(_('All required fields must be provided'))
        
        # Create the license application
        doc = frappe.get_doc({
            'doctype': 'License Application',
            'user': user,
            'type': application_type,
            'full_name': full_name,
            'phone_number': phone_number,
            'email': email,
            'region': region,
            'district': district,
            'license_category': license_category,
            'latra_type': latra_type,
            'current_license_number': current_license_number,
            'status': 'Pending Payment',
            'payment_status': 'Unpaid',
            'submission_date': now_datetime()
        })
        
        # Add documents if provided
        if documents:
            try:
                docs_list = json.loads(documents) if isinstance(documents, str) else documents
                for doc_item in docs_list:
                    doc.append('documents', {
                        'document_type': doc_item.get('document_type'),
                        'file_url': doc_item.get('file_url'),
                        'file_name': doc_item.get('file_name')
                    })
            except Exception as e:
                frappe.log_error(f"Error parsing documents: {str(e)}")
        
        doc.insert()
        frappe.db.commit()
        
        return {
            'message': 'Application submitted successfully',
            'application': {
                'name': doc.name,
                'reference_number': doc.name,
                'application_type': doc.application_type,
                'status': doc.status,
                'submission_date': doc.submission_date
            }
        }
        
    except Exception as e:
        frappe.log_error(
            title="Submit License Application Error",
            message=str(e)
        )
        frappe.throw(_('Failed to submit application: {0}').format(str(e)))


@frappe.whitelist()
def get_my_applications(status=None, limit=20, offset=0):
    """Get current user's license applications"""
    try:
        user = frappe.session.user
        
        if user == 'Guest':
            frappe.throw(_('Please login to view applications'))
        
        filters = {'user': user}
        if status:
            filters['status'] = status
        
        applications = frappe.get_all(
            'License Application',
            fields=['name', 'application_type', 'license_category', 'status', 'submission_date', 'region', 'district'],
            filters=filters,
            order_by='creation desc',
            limit_page_length=limit,
            limit_start=offset
        )
        
        total = frappe.db.count('License Application', filters)
        
        return {
            'message': 'Applications retrieved successfully',
            'applications': applications,
            'total': total,
            'limit': limit,
            'offset': offset
        }
        
    except Exception as e:
        frappe.log_error(
            title="Get My Applications Error",
            message=str(e)
        )
        frappe.throw(_('Failed to get applications'))


@frappe.whitelist(allow_guest=True)
def get_application_status(ref_no):
    """Get application status by reference number"""
    try:
        if not ref_no:
            frappe.throw(_('Reference number is required'))

        application = frappe.get_doc('License Application', ref_no)

        return {
            'message': 'Application found',
            'application': {
                'name': application.name,
                'type': application.type,
                'full_name': application.full_name,
                'license_category': application.license_category,
                'status': application.status,
                'payment_status': application.payment_status,
                'ref_no': application.ref_no,
                'submission_date': application.submission_date,
                'review_date': application.review_date,
                'reviewer_notes': application.reviewer_notes,
                'admin_comment': application.admin_comment
            }
        }

    except frappe.DoesNotExistError:
        frappe.throw(_('Application not found'))
    except Exception as e:
        frappe.log_error(
            title="Get Application Status Error",
            message=str(e)
        )
        frappe.throw(_('Failed to get application status'))


@frappe.whitelist()
def get_all_applications(status=None, application_type=None, search=None, limit=20, offset=0):
    """Get all applications (Admin/Staff only)"""
    try:
        user = frappe.session.user

        if user == 'Guest':
            frappe.throw(_('Please login to view applications'))

        # Check permissions
        if not ("System Manager" in frappe.get_roles(user) or
                "Admin" in frappe.get_roles(user) or
                "Staff" in frappe.get_roles(user)):
            frappe.throw(_('Access denied'))

        filters = {}
        if status:
            filters['status'] = status
        if application_type:
            filters['type'] = application_type
        if search:
            filters['name'] = ['like', f'%{search}%']

        applications = frappe.get_all(
            'License Application',
            fields=['name', 'type', 'full_name', 'phone_number', 'email', 'region', 'district',
                   'license_category', 'latra_type', 'status', 'payment_status', 'ref_no',
                   'submission_date', 'review_date', 'reviewer', 'admin_comment'],
            filters=filters,
            order_by='creation desc',
            limit_page_length=limit,
            limit_start=offset
        )

        total = frappe.db.count('License Application', filters)

        return {
            'message': 'Applications retrieved successfully',
            'applications': applications,
            'total': total,
            'limit': limit,
            'offset': offset
        }

    except Exception as e:
        frappe.log_error(
            title="Get All Applications Error",
            message=str(e)
        )
        frappe.throw(_('Failed to get applications'))


@frappe.whitelist()
def update_application_status(name, status, reviewer_notes=None, admin_comment=None):
    """Update application status (Admin/Staff only)"""
    try:
        user = frappe.session.user

        if user == 'Guest':
            frappe.throw(_('Please login to update application'))

        # Check permissions
        if not ("System Manager" in frappe.get_roles(user) or
                "Admin" in frappe.get_roles(user) or
                "Staff" in frappe.get_roles(user)):
            frappe.throw(_('Access denied'))

        application = frappe.get_doc('License Application', name)

        # Validate status transition
        valid_transitions = {
            'Pending Payment': ['Pending'],  # After payment, move to Pending for review
            'Pending': ['Under Review', 'Rejected'],
            'Under Review': ['Approved', 'Rejected'],
            'Approved': ['Completed'],
            'Rejected': [],
            'Completed': []
        }

        if status not in valid_transitions.get(application.status, []):
            frappe.throw(_('Invalid status transition'))

        application.status = status
        if reviewer_notes:
            application.reviewer_notes = reviewer_notes
        if admin_comment:
            application.admin_comment = admin_comment
        application.reviewer = user
        application.review_date = now_datetime()

        application.save()
        frappe.db.commit()

        # Send notification
        application.send_status_notification()

        return {
            'message': 'Application status updated successfully',
            'application': {
                'name': application.name,
                'status': application.status,
                'review_date': application.review_date,
                'reviewer': application.reviewer
            }
        }

    except Exception as e:
        frappe.log_error(
            title="Update Application Status Error",
            message=str(e)
        )
        frappe.throw(_('Failed to update application status'))


@frappe.whitelist()
def get_application_statistics():
    """Get application statistics (Admin/Staff only)"""
    try:
        user = frappe.session.user

        if user == 'Guest':
            frappe.throw(_('Please login to view statistics'))

        # Check permissions
        if not ("System Manager" in frappe.get_roles(user) or
                "Admin" in frappe.get_roles(user) or
                "Staff" in frappe.get_roles(user)):
            frappe.throw(_('Access denied'))

        # Get status counts
        status_counts = frappe.db.sql("""
            SELECT status, COUNT(*) as count
            FROM `tabLicense Application`
            GROUP BY status
        """, as_dict=True)

        # Get type counts
        type_counts = frappe.db.sql("""
            SELECT type, COUNT(*) as count
            FROM `tabLicense Application`
            GROUP BY type
        """, as_dict=True)

        # Calculate statistics
        total = sum([s['count'] for s in status_counts])

        statistics = {
            'total': total,
            'pending': next((s['count'] for s in status_counts if s['status'] == 'Pending'), 0),
            'under_review': next((s['count'] for s in status_counts if s['status'] == 'Under Review'), 0),
            'approved': next((s['count'] for s in status_counts if s['status'] == 'Approved'), 0),
            'rejected': next((s['count'] for s in status_counts if s['status'] == 'Rejected'), 0),
            'completed': next((s['count'] for s in status_counts if s['status'] == 'Completed'), 0),
            'by_type': {
                'new': next((t['count'] for t in type_counts if t['type'] == 'new'), 0),
                'renew': next((t['count'] for t in type_counts if t['type'] == 'renew'), 0),
                'latra': next((t['count'] for t in type_counts if t['type'] == 'latra'), 0)
            }
        }

        return {
            'message': 'Statistics retrieved successfully',
            'statistics': statistics
        }

    except Exception as e:
        frappe.log_error(
            title="Get Application Statistics Error",
            message=str(e)
        )
        frappe.throw(_('Failed to get statistics'))


@frappe.whitelist()
def get_application_details(name):
    """Get detailed application information"""
    try:
        user = frappe.session.user

        if user == 'Guest':
            frappe.throw(_('Please login to view application details'))

        application = frappe.get_doc('License Application', name)

        # Check permissions
        if not ("System Manager" in frappe.get_roles(user) or
                "Admin" in frappe.get_roles(user) or
                "Staff" in frappe.get_roles(user)):
            if application.user != user:
                frappe.throw(_('Access denied'))

        # Get documents
        documents = frappe.get_all(
            'License Application Document',
            filters={'parent': name},
            fields=['document_type', 'file_url', 'file_name', 'upload_date']
        )

        return {
            'message': 'Application details retrieved successfully',
            'application': {
                'name': application.name,
                'user': application.user,
                'type': application.type,
                'full_name': application.full_name,
                'phone_number': application.phone_number,
                'email': application.email,
                'region': application.region,
                'district': application.district,
                'license_category': application.license_category,
                'latra_type': application.latra_type,
                'current_license_number': application.current_license_number,
                'status': application.status,
                'payment_status': application.payment_status,
                'ref_no': application.ref_no,
                'submission_date': application.submission_date,
                'review_date': application.review_date,
                'reviewer': application.reviewer,
                'reviewer_notes': application.reviewer_notes,
                'admin_comment': application.admin_comment,
                'documents': documents
            }
        }

    except frappe.DoesNotExistError:
        frappe.throw(_('Application not found'))
    except Exception as e:
        frappe.log_error(
            title="Get Application Details Error",
            message=str(e)
        )
        frappe.throw(_('Failed to get application details'))


@frappe.whitelist()
def initiate_license_payment(application_name, payment_method, phone_number=None):
    """Initiate payment for license application"""
    try:
        user = frappe.session.user

        if user == 'Guest':
            frappe.throw(_('Please login to make payment'))

        application = frappe.get_doc('License Application', application_name)

        if application.user != user:
            frappe.throw(_('Access denied'))

        if application.payment_status == 'Paid':
            frappe.throw(_('Application is already paid'))

        # Get payment amount based on type and category
        amount = get_license_fee(application.type, application.license_category)

        # Create payment order
        payment_order = frappe.get_doc({
            'doctype': 'DK Payment Order',
            'application': application_name,
            'user': user,
            'amount': amount,
            'currency': 'TZS',
            'payment_method': payment_method,
            'status': 'Pending'
        })

        payment_order.insert()
        frappe.db.commit()

        # Initiate Selcom payment
        payment_result = initiate_selcom_license_payment(
            payment_order.name,
            payment_method,
            phone_number or application.phone_number
        )

        if not payment_result.get('success'):
            payment_order.status = 'Failed'
            payment_order.failure_reason = payment_result.get('message', 'Payment initiation failed')
            payment_order.save()
            frappe.db.commit()
            frappe.throw(payment_result.get('message', 'Payment initiation failed'))

        return {
            'message': 'Payment initiated successfully',
            'payment_order': payment_order.name,
            'selcom_order_id': payment_result.get('order_id'),
            'payment_token': payment_result.get('payment_token')
        }

    except Exception as e:
        frappe.log_error(
            title="Initiate License Payment Error",
            message=str(e)
        )
        frappe.throw(_('Failed to initiate payment'))


def get_license_fee(application_type, license_category):
    """Get license fee based on type and category"""
    # Define fees (in TZS)
    fees = {
        'new': {
            'A': 50000,  # Motorcycle
            'B': 100000, # Light vehicles
            'C': 150000, # Heavy vehicles
            'D': 200000, # PSV
            'E': 250000  # Trailer
        },
        'renew': {
            'A': 25000,
            'B': 50000,
            'C': 75000,
            'D': 100000,
            'E': 125000
        },
        'latra': {
            'PSV': 150000,
            'HGV': 200000
        }
    }

    if application_type == 'latra':
        return fees.get(application_type, {}).get(license_category, 100000)
    else:
        return fees.get(application_type, {}).get(license_category, 50000)


def initiate_selcom_license_payment(payment_order_name, payment_method, phone_number):
    """Initiate payment through Selcom for license"""
    try:
        # Get settings (reuse from existing selcom.py)
        settings = frappe.get_single("JiTesti Settings")

        if not settings.selcom_api_key or not settings.selcom_api_secret or not settings.selcom_vendor_id:
            frappe.throw("Selcom payment gateway not configured properly")

        payment_order = frappe.get_doc('DK Payment Order', payment_order_name)

        # Generate unique order ID
        order_id = f"LIC_{payment_order.name}"

        # Step 1: Create order using /create-order-minimal endpoint
        create_order_payload = {
            "vendor": settings.selcom_vendor_id,
            "order_id": order_id,
            "buyer_email": payment_order.user,
            "buyer_name": payment_order.user,
            "buyer_phone": phone_number,
            "amount": float(payment_order.amount),
            "currency": "TZS",
            "buyer_remarks": f"License Application Payment - {payment_order.application}",
            "merchant_remarks": f"Payment for license application {payment_order.application}",
            "no_of_items": 1
        }

        # Generate authorization header
        auth_header = generate_selcom_auth_header(settings, create_order_payload)

        headers = {
            "Authorization": auth_header,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        # Make API call to create order
        create_order_url = f"{settings.selcom_base_url}/v1/checkout/create-order-minimal"

        create_response = requests.post(
            create_order_url,
            json=create_order_payload,
            headers=headers,
            timeout=30
        )

        if create_response.status_code != 200:
            raise Exception(f"Selcom API error: {create_response.status_code} - {create_response.text}")

        create_data = create_response.json()

        if create_data.get("resultcode") != "000":
            raise Exception(f"Selcom order creation failed: {create_data.get('message', 'Unknown error')}")

        # Extract payment token
        payment_token = create_data.get("data", [{}])[0].get("payment_token")
        if not payment_token:
            raise Exception("No payment token received from Selcom")

        # Step 2: Initiate wallet payment
        wallet_payment_payload = {
            "vendor": settings.selcom_vendor_id,
            "order_id": order_id,
            "payment_token": payment_token,
            "channel": get_selcom_channel(payment_method),
            "msisdn": phone_number
        }

        # Generate authorization header for wallet payment
        wallet_auth_header = generate_selcom_auth_header(settings, wallet_payment_payload)

        wallet_headers = {
            "Authorization": wallet_auth_header,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        # Make API call to initiate wallet payment
        wallet_payment_url = f"{settings.selcom_base_url}/v1/checkout/wallet-payment"

        wallet_response = requests.post(
            wallet_payment_url,
            json=wallet_payment_payload,
            headers=wallet_headers,
            timeout=30
        )

        if wallet_response.status_code != 200:
            raise Exception(f"Selcom wallet payment error: {wallet_response.status_code} - {wallet_response.text}")

        wallet_data = wallet_response.json()

        if wallet_data.get("resultcode") != "000":
            raise Exception(f"Selcom wallet payment failed: {wallet_data.get('message', 'Unknown error')}")

        # Update payment order
        payment_order.transaction_ref = order_id
        payment_order.selcom_order_id = order_id
        payment_order.selcom_token = payment_token
        payment_order.status = "Processing"
        payment_order.save()
        frappe.db.commit()

        return {
            "success": True,
            "order_id": order_id,
            "payment_token": payment_token,
            "message": f"Payment initiated successfully. Please check your {payment_method} for payment prompt."
        }

    except Exception as e:
        frappe.log_error(f"Selcom license payment initiation failed: {str(e)}", "License Payment")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist()
def verify_license_payment(payment_order_name):
    """Verify license payment status"""
    try:
        payment_order = frappe.get_doc('DK Payment Order', payment_order_name)

        if payment_order.status == "Completed":
            return {
                "success": True,
                "status": "completed",
                "message": "Payment already verified"
            }

        # Call Selcom API to verify payment status
        settings = frappe.get_single("JiTesti Settings")

        if not settings.selcom_api_key or not settings.selcom_api_secret or not settings.selcom_vendor_id:
            frappe.throw("Selcom payment gateway not configured properly")

        # Prepare API call to check payment status
        status_payload = {
            "vendor": settings.selcom_vendor_id,
            "order_id": payment_order.selcom_order_id
        }

        # Generate authorization header
        auth_header = generate_selcom_auth_header(settings, status_payload)

        headers = {
            "Authorization": auth_header,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        # Call Selcom payment status API
        status_url = f"{settings.selcom_base_url}/v1/checkout/payment-status"

        status_response = requests.post(
            status_url,
            json=status_payload,
            headers=headers,
            timeout=30
        )

        if status_response.status_code != 200:
            return {
                "success": False,
                "status": "error",
                "message": f"Selcom API error: {status_response.status_code}"
            }

        status_data = status_response.json()

        if status_data.get("resultcode") != "000":
            return {
                "success": False,
                "status": "pending",
                "message": f"Payment verification failed: {status_data.get('message', 'Unknown error')}"
            }

        # Check payment result
        payment_result = status_data.get("data", {}).get("payment_result", "")

        if payment_result == "COMPLETED":
            payment_order.status = "Completed"
            payment_order.paid_at = now_datetime()
            payment_order.save()

            # Update application payment status
            application = frappe.get_doc('License Application', payment_order.application)
            application.payment_status = 'Paid'
            if not application.ref_no:
                application.ref_no = payment_order.transaction_ref
            application.save()

            frappe.db.commit()

            return {
                "success": True,
                "status": "completed",
                "message": "Payment verified successfully"
            }
        elif payment_result == "FAILED":
            payment_order.status = "Failed"
            payment_order.failed_at = now_datetime()
            payment_order.failure_reason = "Payment failed"
            payment_order.save()

            # Update application payment status
            application = frappe.get_doc('License Application', payment_order.application)
            application.payment_status = 'Failed'
            application.save()

            frappe.db.commit()

            return {
                "success": False,
                "status": "failed",
                "message": "Payment failed"
            }
        else:
            return {
                "success": False,
                "status": "pending",
                "message": "Payment verification in progress"
            }

    except Exception as e:
        frappe.log_error(f"License payment verification failed: {str(e)}", "License Payment")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist(allow_guest=True)
def license_payment_webhook():
    """Handle Selcom payment webhook for licenses"""
    try:
        # Get webhook data and signature
        data = frappe.local.form_dict
        signature = frappe.local.request.headers.get('X-Selcom-Signature')

        if not signature:
            frappe.log_error("Missing Selcom webhook signature", "License Payment Webhook")
            return {"result": "ERROR", "message": "Missing signature"}

        # Get settings for signature verification
        settings = frappe.get_single("JiTesti Settings")

        if not settings.selcom_api_secret:
            frappe.log_error("Selcom API secret not configured", "License Payment Webhook")
            return {"result": "ERROR", "message": "Configuration error"}

        # Verify webhook signature
        if not verify_selcom_webhook_signature(data, signature, settings.selcom_api_secret):
            frappe.log_error(f"Invalid webhook signature for order {data.get('order_id')}", "License Payment Webhook")
            return {"result": "ERROR", "message": "Invalid signature"}

        order_id = data.get("order_id")
        trans_id = data.get("trans_id")
        status = data.get("status")

        if not order_id:
            return {"result": "ERROR", "message": "Missing order_id"}

        # Find payment order
        payment_order = frappe.get_doc("DK Payment Order", {"selcom_order_id": order_id})

        if status == "COMPLETED":
            payment_order.status = "Completed"
            payment_order.paid_at = now_datetime()
            payment_order.save()

            # Update application - activate it for review
            application = frappe.get_doc('License Application', payment_order.application)
            application.payment_status = 'Paid'
            if not application.ref_no:
                application.ref_no = payment_order.transaction_ref

            # If application was in "Pending Payment", move to "Pending" for admin review
            if application.status == 'Pending Payment':
                application.status = 'Pending'

            application.save()

            # Send payment confirmation notification
            send_license_payment_notification(application, payment_order)

        elif status == "FAILED":
            payment_order.status = "Failed"
            payment_order.failed_at = now_datetime()
            payment_order.failure_reason = "Payment failed via webhook"
            payment_order.save()

            # Update application
            application = frappe.get_doc('License Application', payment_order.application)
            application.payment_status = 'Failed'
            application.save()

        frappe.db.commit()

        return {"result": "SUCCESS", "message": "License payment webhook processed"}

    except Exception as e:
        frappe.log_error(f"License payment webhook failed: {str(e)}", "License Payment")
        return {"result": "ERROR", "message": str(e)}


def send_license_payment_notification(application, payment_order):
    """Send payment confirmation notification"""
    try:
        # Create notification log
        notification = frappe.get_doc({
            'doctype': 'DK Notification Log',
            'application': application.name,
            'user': application.user,
            'notification_type': 'Payment Confirmation',
            'channel': 'Email',
            'recipient': application.email or application.user,
            'subject': f'License Application Payment Confirmed - {application.name}',
            'message': f'Your payment of TZS {payment_order.amount} for license application {application.name} has been confirmed. Your reference number is {application.ref_no}.'
        })
        notification.insert()
        frappe.db.commit()

        # Send email
        if application.email:
            frappe.sendmail(
                recipients=[application.email],
                subject=f'License Application Payment Confirmed - {application.name}',
                message=f"""
                <h3>Payment Confirmation</h3>
                <p>Dear {application.full_name},</p>
                <p>Your payment has been successfully processed.</p>
                <p><strong>Application:</strong> {application.name}</p>
                <p><strong>Amount:</strong> TZS {payment_order.amount}</p>
                <p><strong>Reference:</strong> {application.ref_no}</p>
                <p>Your application is now active and will be reviewed by our team.</p>
                <p>Thank you for using Dereva Huduma Platform.</p>
                """,
                delayed=False
            )

    except Exception as e:
        frappe.log_error(f"License payment notification failed: {str(e)}", "License Payment")


# Import required functions from existing selcom.py
def generate_selcom_auth_header(settings, payload):
    """Generate Selcom API authorization header"""
    try:
        signature_data = settings.selcom_api_key + json.dumps(payload, separators=(',', ':'))
        signature = base64.b64encode(
            hmac.new(
                settings.selcom_api_secret.encode('utf-8'),
                signature_data.encode('utf-8'),
                hashlib.sha256
            ).digest()
        ).decode('utf-8')
        return f"SELCOM {settings.selcom_api_key}:{signature}"
    except Exception as e:
        frappe.log_error(f"Error generating Selcom auth header: {str(e)}", "License Payment")
        raise


def get_selcom_channel(payment_method):
    """Map payment method to Selcom channel"""
    channel_map = {
        "M-Pesa": "VODACOMTZN",
        "Airtel Money": "AIRTELTZN",
        "Tigo Pesa": "TIGOTZN",
        "Halopesa": "HALOTZN"
    }
    return channel_map.get(payment_method, "VODACOMTZN")


def verify_selcom_webhook_signature(data, signature, secret):
    """Verify Selcom webhook signature"""
    try:
        sorted_data = json.dumps(data, sort_keys=True, separators=(',', ':'))
        expected_signature = base64.b64encode(
            hmac.new(
                secret.encode('utf-8'),
                sorted_data.encode('utf-8'),
                hashlib.sha256
            ).digest()
        ).decode('utf-8')
        return hmac.compare_digest(signature, expected_signature)
    except Exception as e:
        frappe.log_error(f"Webhook signature verification error: {str(e)}", "License Payment")
        return False
