"""
License Management API

This module handles license applications, document uploads, and status tracking.
"""

import frappe
from frappe import _
from frappe.utils import now_datetime, cint
from typing import Dict, Any, List, Optional
import json


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
            'application_type': application_type,
            'full_name': full_name,
            'phone_number': phone_number,
            'email': email,
            'region': region,
            'district': district,
            'license_category': license_category,
            'latra_type': latra_type,
            'current_license_number': current_license_number,
            'status': 'Pending',
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
                'application_type': application.application_type,
                'full_name': application.full_name,
                'license_category': application.license_category,
                'status': application.status,
                'submission_date': application.submission_date,
                'review_date': application.review_date,
                'reviewer_notes': application.reviewer_notes
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
