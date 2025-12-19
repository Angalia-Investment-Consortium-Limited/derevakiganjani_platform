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
