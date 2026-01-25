"""
JiTesti API - Driver Testing Module

This module handles all JiTesti (driver testing) functionality including:
- Test categories management
- Question bank management
- Payment processing
- Test attempts and scoring
- Certificate generation
"""

import frappe
from frappe import _
from frappe.utils import now_datetime, add_to_date, get_datetime, flt
import random
import json
from typing import Dict, Any, List, Optional


# ============================================================================
# CATEGORY APIs
# ============================================================================

@frappe.whitelist(allow_guest=False)
def get_categories():
    """
    Get all active test categories
    
    Returns:
        List of category dictionaries with all details
    """
    try:
        categories = frappe.get_all(
            'Test Category',
            filters={'is_active': 1},
            fields=[
                'name', 'category_code', 'name_en', 'name_sw',
                'description_en', 'description_sw', 'price',
                'pass_mark', 'duration_minutes', 'total_questions',
                'display_order'
            ],
            order_by='display_order asc'
        )
        
        return {
            'success': True,
            'categories': categories
        }
        
    except Exception as e:
        frappe.log_error(
            title="Get Categories Error",
            message=f"Error fetching categories: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def get_category_details(category_code):
    """
    Get detailed information about a specific category
    
    Args:
        category_code: Category code (MOTO, BASIC, VIP, PSV, HGV, INTERVIEW)
        
    Returns:
        Category details with question count
    """
    try:
        category = frappe.get_doc('Test Category', {'category_code': category_code})
        
        # Get question count for this category
        question_count = frappe.db.count('Test Question', {
            'category': category.name,
            'is_active': 1
        })
        
        return {
            'success': True,
            'category': {
                'name': category.name,
                'category_code': category.category_code,
                'name_en': category.name_en,
                'name_sw': category.name_sw,
                'description_en': category.description_en,
                'description_sw': category.description_sw,
                'price': category.price,
                'pass_mark': category.pass_mark,
                'duration_minutes': category.duration_minutes,
                'total_questions': category.total_questions,
                'available_questions': question_count
            }
        }
        
    except Exception as e:
        frappe.log_error(
            title="Get Category Details Error",
            message=f"Error fetching category {category_code}: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


# ============================================================================
# QUESTION MANAGEMENT APIs (Admin Only)
# ============================================================================

@frappe.whitelist(allow_guest=False)
def create_question(data):
    """
    Create a new test question (Admin only)
    
    Args:
        data: Question data dictionary
        
    Returns:
        Created question details
    """
    try:
        # Check if user is admin
        if not frappe.has_permission('Test Question', 'create'):
            frappe.throw(_('You do not have permission to create questions'))
        
        # Parse data if it's a string
        if isinstance(data, str):
            data = json.loads(data)
        
        # Create question document
        question = frappe.get_doc({
            'doctype': 'Test Question',
            **data
        })
        question.insert()
        frappe.db.commit()
        
        return {
            'success': True,
            'message': _('Question created successfully'),
            'question_id': question.name
        }
        
    except Exception as e:
        frappe.log_error(
            title="Create Question Error",
            message=f"Error creating question: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def update_question(question_id, data):
    """
    Update an existing question (Admin only)
    
    Args:
        question_id: Question document name
        data: Updated question data
        
    Returns:
        Success status
    """
    try:
        # Check permission
        if not frappe.has_permission('Test Question', 'write'):
            frappe.throw(_('You do not have permission to update questions'))
        
        # Parse data if string
        if isinstance(data, str):
            data = json.loads(data)
        
        # Update question
        question = frappe.get_doc('Test Question', question_id)
        question.update(data)
        question.save()
        frappe.db.commit()
        
        return {
            'success': True,
            'message': _('Question updated successfully')
        }
        
    except Exception as e:
        frappe.log_error(
            title="Update Question Error",
            message=f"Error updating question {question_id}: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def delete_question(question_id):
    """
    Delete a question (Admin only)
    
    Args:
        question_id: Question document name
        
    Returns:
        Success status
    """
    try:
        # Check permission
        if not frappe.has_permission('Test Question', 'delete'):
            frappe.throw(_('You do not have permission to delete questions'))
        
        frappe.delete_doc('Test Question', question_id)
        frappe.db.commit()
        
        return {
            'success': True,
            'message': _('Question deleted successfully')
        }
        
    except Exception as e:
        frappe.log_error(
            title="Delete Question Error",
            message=f"Error deleting question {question_id}: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def get_questions(category_code=None, filters=None):
    """
    Get questions with optional filtering (Admin only)
    
    Args:
        category_code: Filter by category
        filters: Additional filters (JSON string)
        
    Returns:
        List of questions
    """
    try:
        # Check permission
        if not frappe.has_permission('Test Question', 'read'):
            frappe.throw(_('You do not have permission to view questions'))
        
        # Build filters
        query_filters = {'is_active': 1}
        
        if category_code:
            category = frappe.get_value('Test Category', {'category_code': category_code}, 'name')
            if category:
                query_filters['category'] = category
        
        if filters and isinstance(filters, str):
            additional_filters = json.loads(filters)
            query_filters.update(additional_filters)
        
        # Get questions
        questions = frappe.get_all(
            'Test Question',
            filters=query_filters,
            fields=[
                'name', 'question_text_en', 'question_text_sw',
                'category', 'question_type', 'image', 'video_url',
                'option_a_en', 'option_a_sw', 'option_b_en', 'option_b_sw',
                'option_c_en', 'option_c_sw', 'option_d_en', 'option_d_sw',
                'correct_answer', 'difficulty', 'creation'
            ],
            order_by='creation desc'
        )
        
        return {
            'success': True,
            'questions': questions
        }
        
    except Exception as e:
        frappe.log_error(
            title="Get Questions Error",
            message=f"Error fetching questions: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


# ============================================================================
# PAYMENT APIs
# ============================================================================

@frappe.whitelist(allow_guest=False)
def create_payment(category_code, payment_method, reference_number, payment_proof=None):
    """
    Create a test payment record
    
    Args:
        category_code: Test category code
        payment_method: Payment method (M-Pesa, Airtel Money, Bank Transfer)
        reference_number: Payment reference number
        payment_proof: Optional payment proof file
        
    Returns:
        Payment record details
    """
    try:
        # Get current user's driver profile
        driver_profile = frappe.get_value('Driver Profile', {'user': frappe.session.user}, 'name')
        if not driver_profile:
            frappe.throw(_('Driver profile not found'))
        
        # Get category
        category = frappe.get_doc('Test Category', {'category_code': category_code})
        
        # Check for duplicate reference number
        existing = frappe.db.exists('JiTesti Payment', {'reference_number': reference_number})
        if existing:
            frappe.throw(_('Payment reference number already exists'))
        
        # Create payment record
        payment = frappe.get_doc({
            'doctype': 'JiTesti Payment',
            'driver': driver_profile,
            'category': category.name,
            'amount': category.price,
            'payment_method': payment_method,
            'reference_number': reference_number,
            'payment_proof': payment_proof,
            'status': 'Pending'
        })
        payment.insert()
        frappe.db.commit()
        
        return {
            'success': True,
            'message': _('Payment record created successfully'),
            'payment_id': payment.name,
            'reference_number': reference_number
        }
        
    except Exception as e:
        frappe.log_error(
            title="Create Payment Error",
            message=f"Error creating payment: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def get_payment_status(payment_id):
    """
    Get payment status
    
    Args:
        payment_id: Payment document name
        
    Returns:
        Payment status details
    """
    try:
        payment = frappe.get_doc('JiTesti Payment', payment_id)
        
        # Check if user owns this payment
        driver_profile = frappe.get_value('Driver Profile', {'user': frappe.session.user}, 'name')
        if payment.driver != driver_profile and not frappe.has_permission('JiTesti Payment', 'read'):
            frappe.throw(_('You do not have permission to view this payment'))
        
        return {
            'success': True,
            'payment': {
                'name': payment.name,
                'status': payment.status,
                'amount': payment.amount,
                'payment_method': payment.payment_method,
                'reference_number': payment.reference_number,
                'verified_on': payment.verified_on,
                'notes': payment.notes
            }
        }
        
    except Exception as e:
        frappe.log_error(
            title="Get Payment Status Error",
            message=f"Error fetching payment status: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def verify_payment(payment_id, status, notes=None):
    """
    Verify or reject a payment (Admin only)
    
    Args:
        payment_id: Payment document name
        status: Completed or Rejected
        notes: Optional verification notes
        
    Returns:
        Success status
    """
    try:
        # Check permission
        if not frappe.has_permission('JiTesti Payment', 'write'):
            frappe.throw(_('You do not have permission to verify payments'))
        
        payment = frappe.get_doc('JiTesti Payment', payment_id)
        payment.status = status
        payment.verified_by = frappe.session.user
        payment.verified_on = now_datetime()
        if notes:
            payment.notes = notes
        payment.save()
        frappe.db.commit()
        
        return {
            'success': True,
            'message': _('Payment {0} successfully').format(status.lower())
        }
        
    except Exception as e:
        frappe.log_error(
            title="Verify Payment Error",
            message=f"Error verifying payment {payment_id}: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def get_pending_payments():
    """
    Get all pending payments (Admin only)
    
    Returns:
        List of pending payments
    """
    try:
        # Check permission
        if not frappe.has_permission('JiTesti Payment', 'read'):
            frappe.throw(_('You do not have permission to view payments'))
        
        payments = frappe.get_all(
            'JiTesti Payment',
            filters={'status': 'Pending'},
            fields=[
                'name', 'driver', 'category', 'amount',
                'payment_method', 'reference_number', 'payment_proof',
                'creation'
            ],
            order_by='creation desc'
        )
        
        return {
            'success': True,
            'payments': payments
        }
        
    except Exception as e:
        frappe.log_error(
            title="Get Pending Payments Error",
            message=f"Error fetching pending payments: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


# ============================================================================
# TEST FLOW APIs
# ============================================================================

@frappe.whitelist(allow_guest=False)
def start_test(category_code, payment_ref):
    """
    Start a new test attempt
    
    Args:
        category_code: Test category code
        payment_ref: Payment reference number
        
    Returns:
        Test attempt details with questions
    """
    try:
        # Get driver profile
        driver_profile = frappe.get_value('Driver Profile', {'user': frappe.session.user}, 'name')
        if not driver_profile:
            frappe.throw(_('Driver profile not found'))
        
        # Verify payment
        payment = frappe.get_doc('JiTesti Payment', {
            'reference_number': payment_ref,
            'driver': driver_profile
        })
        
        if payment.status != 'Completed':
            frappe.throw(_('Payment not verified. Please wait for admin approval.'))
        
        # Get category
        category = frappe.get_doc('Test Category', {'category_code': category_code})
        
        # Get random questions
        all_questions = frappe.get_all(
            'Test Question',
            filters={
                'category': category.name,
                'is_active': 1
            },
            fields=['name'],
            limit_page_length=0
        )
        
        if len(all_questions) < category.total_questions:
            frappe.throw(_('Not enough questions available for this category'))
        
        # Select random questions
        selected_questions = random.sample(all_questions, category.total_questions)
        question_ids = [q['name'] for q in selected_questions]
        
        # Create test attempt
        attempt = frappe.get_doc({
            'doctype': 'Test Attempt',
            'driver': driver_profile,
            'category': category.name,
            'payment': payment.name,
            'start_time': now_datetime(),
            'total_questions': category.total_questions,
            'correct_answers': 0,
            'wrong_answers': 0,
            'unanswered': category.total_questions,
            'status': 'In Progress',
            'answers_json': json.dumps({'questions': question_ids, 'answers': {}})
        })
        attempt.insert()
        frappe.db.commit()
        
        # Get full question details (without correct answers)
        questions = []
        for qid in question_ids:
            q = frappe.get_doc('Test Question', qid)
            questions.append({
                'id': q.name,
                'question_text_en': q.question_text_en,
                'question_text_sw': q.question_text_sw,
                'question_type': q.question_type,
                'image': q.image,
                'video_url': q.video_url,
                'option_a_en': q.option_a_en,
                'option_a_sw': q.option_a_sw,
                'option_b_en': q.option_b_en,
                'option_b_sw': q.option_b_sw,
                'option_c_en': q.option_c_en,
                'option_c_sw': q.option_c_sw,
                'option_d_en': q.option_d_en,
                'option_d_sw': q.option_d_sw
            })
        
        return {
            'success': True,
            'attempt_id': attempt.name,
            'duration_minutes': category.duration_minutes,
            'total_questions': category.total_questions,
            'pass_mark': category.pass_mark,
            'questions': questions
        }
        
    except Exception as e:
        frappe.log_error(
            title="Start Test Error",
            message=f"Error starting test: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def submit_answer(attempt_id, question_id, answer):
    """
    Submit an answer for a question
    
    Args:
        attempt_id: Test attempt ID
        question_id: Question ID
        answer: Selected answer (A, B, C, or D)
        
    Returns:
        Success status
    """
    try:
        attempt = frappe.get_doc('Test Attempt', attempt_id)
        
        # Verify ownership
        driver_profile = frappe.get_value('Driver Profile', {'user': frappe.session.user}, 'name')
        if attempt.driver != driver_profile:
            frappe.throw(_('Unauthorized access'))
        
        if attempt.status != 'In Progress':
            frappe.throw(_('Test is not in progress'))
        
        # Update answers
        answers_data = json.loads(attempt.answers_json)
        answers_data['answers'][question_id] = answer
        attempt.answers_json = json.dumps(answers_data)
        attempt.save()
        frappe.db.commit()
        
        return {
            'success': True,
            'message': _('Answer saved')
        }
        
    except Exception as e:
        frappe.log_error(
            title="Submit Answer Error",
            message=f"Error submitting answer: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def complete_test(attempt_id):
    """
    Complete test and calculate results
    
    Args:
        attempt_id: Test attempt ID
        
    Returns:
        Test results
    """
    try:
        attempt = frappe.get_doc('Test Attempt', attempt_id)
        
        # Verify ownership
        driver_profile = frappe.get_value('Driver Profile', {'user': frappe.session.user}, 'name')
        if attempt.driver != driver_profile:
            frappe.throw(_('Unauthorized access'))
        
        if attempt.status != 'In Progress':
            frappe.throw(_('Test is not in progress'))
        
        # Calculate results
        answers_data = json.loads(attempt.answers_json)
        questions = answers_data['questions']
        user_answers = answers_data['answers']
        
        correct = 0
        wrong = 0
        unanswered = 0
        
        for qid in questions:
            if qid in user_answers:
                question = frappe.get_doc('Test Question', qid)
                if user_answers[qid] == question.correct_answer:
                    correct += 1
                else:
                    wrong += 1
            else:
                unanswered += 1
        
        # Calculate score percentage
        score_percentage = (correct / len(questions)) * 100
        
        # Get category pass mark
        category = frappe.get_doc('Test Category', attempt.category)
        pass_status = 'Passed' if score_percentage >= category.pass_mark else 'Failed'
        
        # Update attempt
        attempt.end_time = now_datetime()
        attempt.duration_seconds = (attempt.end_time - attempt.start_time).total_seconds()
        attempt.correct_answers = correct
        attempt.wrong_answers = wrong
        attempt.unanswered = unanswered
        attempt.score_percentage = score_percentage
        attempt.pass_status = pass_status
        attempt.status = 'Completed'
        attempt.save()
        frappe.db.commit()
        
        # Generate certificate if passed
        certificate_id = None
        if pass_status == 'Passed':
            certificate = generate_certificate_internal(attempt.name)
            certificate_id = certificate.get('certificate_id')
        
        return {
            'success': True,
            'result': {
                'attempt_id': attempt.name,
                'score_percentage': score_percentage,
                'correct_answers': correct,
                'wrong_answers': wrong,
                'unanswered': unanswered,
                'total_questions': len(questions),
                'pass_status': pass_status,
                'pass_mark': category.pass_mark,
                'certificate_id': certificate_id
            }
        }
        
    except Exception as e:
        frappe.log_error(
            title="Complete Test Error",
            message=f"Error completing test: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def get_test_result(attempt_id):
    """
    Get test results
    
    Args:
        attempt_id: Test attempt ID
        
    Returns:
        Detailed test results
    """
    try:
        attempt = frappe.get_doc('Test Attempt', attempt_id)
        
        # Verify ownership or admin
        driver_profile = frappe.get_value('Driver Profile', {'user': frappe.session.user}, 'name')
        if attempt.driver != driver_profile and not frappe.has_permission('Test Attempt', 'read'):
            frappe.throw(_('Unauthorized access'))
        
        # Get category details
        category = frappe.get_doc('Test Category', attempt.category)
        
        # Get certificate if exists
        certificate = frappe.get_value('Test Certificate', {'test_attempt': attempt.name}, 'name')
        
        return {
            'success': True,
            'result': {
                'attempt_id': attempt.name,
                'category_name_en': category.name_en,
                'category_name_sw': category.name_sw,
                'score_percentage': attempt.score_percentage,
                'correct_answers': attempt.correct_answers,
                'wrong_answers': attempt.wrong_answers,
                'unanswered': attempt.unanswered,
                'total_questions': attempt.total_questions,
                'pass_status': attempt.pass_status,
                'pass_mark': category.pass_mark,
                'duration_seconds': attempt.duration_seconds,
                'completed_on': attempt.end_time,
                'certificate_id': certificate
            }
        }
        
    except Exception as e:
        frappe.log_error(
            title="Get Test Result Error",
            message=f"Error fetching test result: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


# ============================================================================
# CERTIFICATE APIs
# ============================================================================

def generate_certificate_internal(attempt_id):
    """
    Internal function to generate certificate
    
    Args:
        attempt_id: Test attempt ID
        
    Returns:
        Certificate details
    """
    try:
        attempt = frappe.get_doc('Test Attempt', attempt_id)
        
        if attempt.pass_status != 'Passed':
            return {
                'success': False,
                'message': _('Certificate can only be generated for passed tests')
            }
        
        # Check if certificate already exists
        existing = frappe.db.exists('Test Certificate', {'test_attempt': attempt.name})
        if existing:
            return {
                'success': True,
                'certificate_id': existing
            }
        
        # Generate certificate number
        cert_number = f"CERT-{attempt.category}-{frappe.utils.now_datetime().strftime('%Y%m%d%H%M%S')}"
        
        # Create certificate
        certificate = frappe.get_doc({
            'doctype': 'Test Certificate',
            'driver': attempt.driver,
            'test_attempt': attempt.name,
            'category': attempt.category,
            'certificate_number': cert_number,
            'issue_date': frappe.utils.today(),
            'score_percentage': attempt.score_percentage,
            'is_valid': 1
        })
        certificate.insert()
        frappe.db.commit()
        
        return {
            'success': True,
            'certificate_id': certificate.name
        }
        
    except Exception as e:
        frappe.log_error(
            title="Generate Certificate Error",
            message=f"Error generating certificate: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def generate_certificate(attempt_id):
    """
    Generate certificate for a passed test
    
    Args:
        attempt_id: Test attempt ID
        
    Returns:
        Certificate details
    """
    return generate_certificate_internal(attempt_id)


@frappe.whitelist(allow_guest=False)
def get_certificate(certificate_id):
    """
    Get certificate details
    
    Args:
        certificate_id: Certificate document name
        
    Returns:
        Certificate details
    """
    try:
        certificate = frappe.get_doc('Test Certificate', certificate_id)
        
        # Verify ownership or admin
        driver_profile = frappe.get_value('Driver Profile', {'user': frappe.session.user}, 'name')
        if certificate.driver != driver_profile and not frappe.has_permission('Test Certificate', 'read'):
            frappe.throw(_('Unauthorized access'))
        
        # Get category and driver details
        category = frappe.get_doc('Test Category', certificate.category)
        driver = frappe.get_doc('Driver Profile', certificate.driver)
        
        return {
            'success': True,
            'certificate': {
                'certificate_number': certificate.certificate_number,
                'driver_name': driver.full_name,
                'category_name_en': category.name_en,
                'category_name_sw': category.name_sw,
                'score_percentage': certificate.score_percentage,
                'issue_date': certificate.issue_date,
                'is_valid': certificate.is_valid
            }
        }
        
    except Exception as e:
        frappe.log_error(
            title="Get Certificate Error",
            message=f"Error fetching certificate: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def download_certificate(certificate_id):
    """
    Download certificate PDF
    
    Args:
        certificate_id: Certificate document name
        
    Returns:
        PDF file
    """
    try:
        certificate = frappe.get_doc('Test Certificate', certificate_id)
        
        # Verify ownership or admin
        driver_profile = frappe.get_value('Driver Profile', {'user': frappe.session.user}, 'name')
        if certificate.driver != driver_profile and not frappe.has_permission('Test Certificate', 'read'):
            frappe.throw(_('Unauthorized access'))
        
        # TODO: Generate PDF using frappe.utils.pdf or external library
        # For now, return certificate details
        
        return {
            'success': True,
            'message': _('Certificate PDF generation not yet implemented'),
            'certificate_id': certificate_id
        }
        
    except Exception as e:
        frappe.log_error(
            title="Download Certificate Error",
            message=f"Error downloading certificate: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }


@frappe.whitelist(allow_guest=False)
def revoke_certificate(certificate_id, reason):
    """
    Revoke a certificate (Admin only)
    
    Args:
        certificate_id: Certificate document name
        reason: Reason for revocation
        
    Returns:
        Success status
    """
    try:
        # Check permission
        if not frappe.has_permission('Test Certificate', 'write'):
            frappe.throw(_('You do not have permission to revoke certificates'))
        
        certificate = frappe.get_doc('Test Certificate', certificate_id)
        certificate.is_valid = 0
        certificate.revoked_on = now_datetime()
        certificate.revoked_by = frappe.session.user
        certificate.revocation_reason = reason
        certificate.save()
        frappe.db.commit()
        
        return {
            'success': True,
            'message': _('Certificate revoked successfully')
        }
        
    except Exception as e:
        frappe.log_error(
            title="Revoke Certificate Error",
            message=f"Error revoking certificate: {str(e)}"
        )
        return {
            'success': False,
            'message': str(e)
        }
