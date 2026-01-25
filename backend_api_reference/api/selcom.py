import frappe
import requests
import json
import hashlib
import hmac
import base64
from datetime import datetime
import uuid

@frappe.whitelist()
def create_payment(category_code, payment_method, reference_number, phone_number=None):
    """Create a payment record for JiTesti test"""
    try:
        # Validate user is logged in
        if not frappe.session.user or frappe.session.user == "Guest":
            frappe.throw("Authentication required")

        # Get user details
        user = frappe.get_doc("User", frappe.session.user)

        # Get test category
        category = frappe.get_doc("Test Category", {"category_code": category_code})
        if not category:
            frappe.throw("Test category not found")

        # Check if user already has a pending payment for this category
        existing_payment = frappe.db.exists("JiTesti Payment", {
            "user": frappe.session.user,
            "category_code": category_code,
            "status": ["in", ["Pending", "Processing"]]
        })

        if existing_payment:
            frappe.throw("You already have a pending payment for this test category")

        # Create payment record
        payment = frappe.get_doc({
            "doctype": "JiTesti Payment",
            "user": frappe.session.user,
            "user_email": user.email,
            "category_code": category_code,
            "category_name": category.name_sw if frappe.local.lang == "sw" else category.name_en,
            "amount": category.price,
            "payment_method": payment_method,
            "reference_number": reference_number,
            "phone_number": phone_number,
            "status": "Pending",
            "currency": "TZS"
        })

        payment.insert()
        frappe.db.commit()

        return {
            "success": True,
            "payment_id": payment.name,
            "message": "Payment record created successfully. Please complete your payment."
        }

    except Exception as e:
        frappe.log_error(f"Payment creation failed: {str(e)}", "JiTesti Payment")
        return {
            "success": False,
            "message": str(e)
        }

@frappe.whitelist()
def verify_payment(payment_id):
    """Verify payment status with Selcom"""
    try:
        payment = frappe.get_doc("JiTesti Payment", payment_id)

        if payment.status == "Completed":
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
            "order_id": payment.trans_ref
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
        frappe.logger().info(f"Selcom Payment Status Check URL: {status_url}")
        frappe.logger().info(f"Selcom Payment Status Payload: {json.dumps(status_payload, indent=2)}")

        try:
            status_response = requests.post(
                status_url,
                json=status_payload,
                headers=headers,
                timeout=30
            )

            frappe.logger().info(f"Selcom Payment Status Response Status: {status_response.status_code}")
            frappe.logger().info(f"Selcom Payment Status Response: {status_response.text}")

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
                payment.status = "Completed"
                payment.verified_at = datetime.now()
                payment.save()
                frappe.db.commit()

                return {
                    "success": True,
                    "status": "completed",
                    "message": "Payment verified successfully"
                }
            elif payment_result == "FAILED":
                payment.status = "Failed"
                payment.save()
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

        except requests.exceptions.RequestException as e:
            frappe.log_error(f"Selcom API request failed: {str(e)}", "Payment Verification")
            return {
                "success": False,
                "status": "error",
                "message": f"Payment verification service unavailable: {str(e)}"
            }

    except Exception as e:
        frappe.log_error(f"Payment verification failed: {str(e)}", "JiTesti Payment")
        return {
            "success": False,
            "message": str(e)
        }

@frappe.whitelist()
def get_payment_status(payment_id):
    """Get payment status"""
    try:
        payment = frappe.get_doc("JiTesti Payment", payment_id)
        return {
            "success": True,
            "status": payment.status,
            "payment_method": payment.payment_method,
            "amount": payment.amount,
            "reference_number": payment.reference_number
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@frappe.whitelist()
def initiate_selcom_payment(category_code, payment_method, phone_number=None):
    """Initiate payment through Selcom gateway using Push USSD Direct"""
    try:
        # Get JiTesti settings
        settings = frappe.get_single("JiTesti Settings")

        if not settings.selcom_api_key or not settings.selcom_api_secret or not settings.selcom_vendor_id:
            frappe.throw("Selcom payment gateway not configured properly")

        # Get category details
        category = frappe.get_doc("Test Category", {"category_code": category_code})
        if not category:
            frappe.throw("Test category not found")

        # Generate unique order ID
        order_id = f"JITESTI_{uuid.uuid4().hex[:12].upper()}"

        # Create payment record first
        payment_result = create_payment(category_code, payment_method, order_id, phone_number)

        if not payment_result.get("success"):
            return payment_result

        payment_id = payment_result.get("payment_id")

        # Step 1: Create order using /create-order-minimal endpoint
        create_order_payload = {
            "vendor": settings.selcom_vendor_id,
            "order_id": order_id,
            "buyer_email": frappe.session.user,
            "buyer_name": frappe.session.user,  # Using username as buyer name
            "buyer_phone": phone_number or "",
            "amount": float(category.price),
            "currency": "TZS",
            "buyer_remarks": f"JiTesti {category.name_en} Test Payment",
            "merchant_remarks": f"Payment for {category.name_en} test",
            "no_of_items": 1
        }

        # Generate authorization header for create-order-minimal
        auth_header = generate_selcom_auth_header(settings, create_order_payload)

        headers = {
            "Authorization": auth_header,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        # Make API call to create order
        create_order_url = f"{settings.selcom_base_url}/v1/checkout/create-order-minimal"
        frappe.logger().info(f"Selcom Create Order URL: {create_order_url}")
        frappe.logger().info(f"Selcom Create Order Payload: {json.dumps(create_order_payload, indent=2)}")

        create_response = requests.post(
            create_order_url,
            json=create_order_payload,
            headers=headers,
            timeout=30
        )

        frappe.logger().info(f"Selcom Create Order Response Status: {create_response.status_code}")
        frappe.logger().info(f"Selcom Create Order Response: {create_response.text}")

        if create_response.status_code != 200:
            raise Exception(f"Selcom API error: {create_response.status_code} - {create_response.text}")

        create_data = create_response.json()

        if create_data.get("resultcode") != "000":
            raise Exception(f"Selcom order creation failed: {create_data.get('message', 'Unknown error')}")

        # Extract payment token from create order response
        payment_token = create_data.get("data", [{}])[0].get("payment_token")
        if not payment_token:
            raise Exception("No payment token received from Selcom")

        # Step 2: Initiate wallet payment using /wallet-payment endpoint
        wallet_payment_payload = {
            "vendor": settings.selcom_vendor_id,
            "order_id": order_id,
            "payment_token": payment_token,
            "channel": get_selcom_channel(payment_method),
            "msisdn": phone_number
        }

        # Generate authorization header for wallet-payment
        wallet_auth_header = generate_selcom_auth_header(settings, wallet_payment_payload)

        wallet_headers = {
            "Authorization": wallet_auth_header,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        # Make API call to initiate wallet payment
        wallet_payment_url = f"{settings.selcom_base_url}/v1/checkout/wallet-payment"
        frappe.logger().info(f"Selcom Wallet Payment URL: {wallet_payment_url}")
        frappe.logger().info(f"Selcom Wallet Payment Payload: {json.dumps(wallet_payment_payload, indent=2)}")

        wallet_response = requests.post(
            wallet_payment_url,
            json=wallet_payment_payload,
            headers=wallet_headers,
            timeout=30
        )

        frappe.logger().info(f"Selcom Wallet Payment Response Status: {wallet_response.status_code}")
        frappe.logger().info(f"Selcom Wallet Payment Response: {wallet_response.text}")

        if wallet_response.status_code != 200:
            raise Exception(f"Selcom wallet payment error: {wallet_response.status_code} - {wallet_response.text}")

        wallet_data = wallet_response.json()

        if wallet_data.get("resultcode") != "000":
            raise Exception(f"Selcom wallet payment failed: {wallet_data.get('message', 'Unknown error')}")

        # Update payment record with Selcom details
        payment = frappe.get_doc("JiTesti Payment", payment_id)
        payment.trans_ref = order_id
        payment.selcom_token = payment_token
        payment.status = "Processing"
        payment.save()
        frappe.db.commit()

        return {
            "success": True,
            "payment_id": payment_id,
            "order_id": order_id,
            "payment_token": payment_token,
            "message": f"Payment initiated successfully. Please check your {payment_method} for payment prompt."
        }

    except Exception as e:
        frappe.log_error(f"Selcom payment initiation failed: {str(e)}", "JiTesti Payment")
        return {
            "success": False,
            "message": str(e)
        }


def generate_selcom_auth_header(settings, payload):
    """Generate Selcom API authorization header"""
    try:
        # Create signature string (API Key + JSON payload)
        signature_data = settings.selcom_api_key + json.dumps(payload, separators=(',', ':'))

        # Generate HMAC SHA256 signature
        signature = base64.b64encode(
            hmac.new(
                settings.selcom_api_secret.encode('utf-8'),
                signature_data.encode('utf-8'),
                hashlib.sha256
            ).digest()
        ).decode('utf-8')

        # Return authorization header
        return f"SELCOM {settings.selcom_api_key}:{signature}"

    except Exception as e:
        frappe.log_error(f"Error generating Selcom auth header: {str(e)}", "JiTesti Payment")
        raise


def get_selcom_channel(payment_method):
    """Map payment method to Selcom channel"""
    channel_map = {
        "M-Pesa": "VODACOMTZN",
        "Airtel Money": "AIRTELTZN",
        "Tigo Pesa": "TIGOTZN",
        "Halopesa": "HALOTZN"
    }
    return channel_map.get(payment_method, "VODACOMTZN")  # Default to M-Pesa


def verify_selcom_webhook_signature(data, signature, secret):
    """Verify Selcom webhook signature"""
    try:
        # Sort keys alphabetically and create signature string
        sorted_data = json.dumps(data, sort_keys=True, separators=(',', ':'))

        # Generate expected signature using HMAC SHA256
        expected_signature = base64.b64encode(
            hmac.new(
                secret.encode('utf-8'),
                sorted_data.encode('utf-8'),
                hashlib.sha256
            ).digest()
        ).decode('utf-8')

        # Use constant-time comparison to prevent timing attacks
        return hmac.compare_digest(signature, expected_signature)

    except Exception as e:
        frappe.log_error(f"Webhook signature verification error: {str(e)}", "Payment Webhook Security")
        return False

@frappe.whitelist(allow_guest=True)
def payment_webhook():
    """Handle Selcom payment webhook"""
    try:
        # Get webhook data and signature
        data = frappe.local.form_dict
        signature = frappe.local.request.headers.get('X-Selcom-Signature')

        if not signature:
            frappe.log_error("Missing Selcom webhook signature", "Payment Webhook Security")
            return {"result": "ERROR", "message": "Missing signature"}

        # Get JiTesti settings for signature verification
        settings = frappe.get_single("JiTesti Settings")

        if not settings.selcom_api_secret:
            frappe.log_error("Selcom API secret not configured", "Payment Webhook Security")
            return {"result": "ERROR", "message": "Configuration error"}

        # Verify webhook signature
        if not verify_selcom_webhook_signature(data, signature, settings.selcom_api_secret):
            frappe.log_error(f"Invalid webhook signature for order {data.get('order_id')}", "Payment Webhook Security")
            return {"result": "ERROR", "message": "Invalid signature"}

        order_id = data.get("order_id")
        trans_id = data.get("trans_id")
        status = data.get("status")

        if not order_id:
            return {"result": "ERROR", "message": "Missing order_id"}

        # Find payment record
        payment = frappe.get_doc("JiTesti Payment", {"trans_ref": order_id})

        if status == "COMPLETED":
            payment.status = "Completed"
            payment.selcom_trans_id = trans_id
            payment.verified_at = datetime.now()
            payment.save()

            # Send confirmation email
            send_payment_confirmation(payment)

        elif status == "FAILED":
            payment.status = "Failed"
            payment.save()

        frappe.db.commit()

        return {"result": "SUCCESS", "message": "Webhook processed"}

    except Exception as e:
        frappe.log_error(f"Payment webhook failed: {str(e)}", "JiTesti Payment")
        return {"result": "ERROR", "message": str(e)}

def send_payment_confirmation(payment):
    """Send payment confirmation email"""
    try:
        subject = "JiTesti Payment Confirmation"
        message = f"""
        Dear {payment.user},

        Your payment for {payment.category_name} test has been confirmed.

        Payment Details:
        - Amount: {payment.amount} TZS
        - Reference: {payment.reference_number}
        - Transaction ID: {payment.selcom_trans_id}

        You can now start your test at: {frappe.utils.get_url()}/jitesti/test/{payment.category_code}?payment={payment.reference_number}

        Best regards,
        Dereva Huduma Platform
        """

        frappe.sendmail(
            recipients=[payment.user_email],
            subject=subject,
            message=message
        )

    except Exception as e:
        frappe.log_error(f"Payment confirmation email failed: {str(e)}", "JiTesti Payment")


@frappe.whitelist()
def create_employer_verification_payment():
    """Create employer verification payment (TZS 50,000)"""
    try:
        # Validate user is logged in and is an employer
        if not frappe.session.user or frappe.session.user == "Guest":
            frappe.throw("Authentication required")

        user = frappe.get_doc("User", frappe.session.user)
        if not user.roles or not any(role.role_name == "Employer" for role in user.roles):
            frappe.throw("Access denied. Employer role required.")

        # Get employer profile
        employer_profile = frappe.get_doc("Employer Profile", {"user": frappe.session.user})
        if not employer_profile:
            frappe.throw("Employer profile not found")

        # Check if employer is already verified
        if employer_profile.verification_status == "Verified":
            frappe.throw("Employer is already verified")

        # Check if employer already has a pending verification payment
        existing_payment = frappe.db.exists("JiTesti Payment", {
            "user": frappe.session.user,
            "payment_type": "employer_verification",
            "status": ["in", ["Pending", "Processing"]]
        })

        if existing_payment:
            frappe.throw("You already have a pending verification payment")

        # Generate unique order ID for employer verification
        order_id = f"EMP_VERIFY_{uuid.uuid4().hex[:12].upper()}"

        # Create payment record using existing JiTesti Payment doctype
        payment = frappe.get_doc({
            "doctype": "JiTesti Payment",
            "user": frappe.session.user,
            "user_email": user.email,
            "category_code": "employer_verification",
            "category_name": "Employer Verification Fee",
            "amount": 50000,  # TZS 50,000
            "payment_method": "M-Pesa",  # Default, will be updated
            "reference_number": order_id,
            "phone_number": employer_profile.phone_number,
            "status": "Pending",
            "currency": "TZS",
            "payment_type": "employer_verification"  # Custom field to distinguish
        })

        payment.insert()
        frappe.db.commit()

        return {
            "success": True,
            "payment_id": payment.name,
            "message": "Employer verification payment created. Please complete your payment.",
            "amount": 50000,
            "order_id": order_id
        }

    except Exception as e:
        frappe.log_error(f"Employer verification payment creation failed: {str(e)}", "Employer Verification")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist()
def initiate_employer_verification_payment(payment_id, payment_method, phone_number=None):
    """Initiate employer verification payment through Selcom"""
    try:
        # Get payment record
        payment = frappe.get_doc("JiTesti Payment", payment_id)

        # Validate payment belongs to current user and is for employer verification
        if payment.user != frappe.session.user:
            frappe.throw("Access denied")

        if payment.payment_type != "employer_verification":
            frappe.throw("Invalid payment type")

        if payment.status != "Pending":
            frappe.throw("Payment is not in pending status")

        # Get JiTesti settings
        settings = frappe.get_single("JiTesti Settings")

        if not settings.selcom_api_key or not settings.selcom_api_secret or not settings.selcom_vendor_id:
            frappe.throw("Selcom payment gateway not configured properly")

        # Generate unique order ID
        order_id = payment.reference_number

        # Step 1: Create order using /create-order-minimal endpoint
        create_order_payload = {
            "vendor": settings.selcom_vendor_id,
            "order_id": order_id,
            "buyer_email": payment.user_email,
            "buyer_name": payment.user,
            "buyer_phone": phone_number or payment.phone_number or "",
            "amount": float(payment.amount),
            "currency": "TZS",
            "buyer_remarks": "Employer Verification Fee Payment",
            "merchant_remarks": f"Employer verification payment for {payment.user}",
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
        frappe.logger().info(f"Selcom Employer Verification Create Order URL: {create_order_url}")

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
            "msisdn": phone_number or payment.phone_number
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

        # Update payment record
        payment.trans_ref = order_id
        payment.selcom_token = payment_token
        payment.payment_method = payment_method
        payment.phone_number = phone_number or payment.phone_number
        payment.status = "Processing"
        payment.save()
        frappe.db.commit()

        return {
            "success": True,
            "payment_id": payment_id,
            "order_id": order_id,
            "payment_token": payment_token,
            "message": f"Payment initiated successfully. Please check your {payment_method} for payment prompt."
        }

    except Exception as e:
        frappe.log_error(f"Employer verification payment initiation failed: {str(e)}", "Employer Verification")
        return {
            "success": False,
            "message": str(e)
        }


@frappe.whitelist()
def verify_employer_verification_payment(payment_id):
    """Verify employer verification payment status"""
    try:
        payment = frappe.get_doc("JiTesti Payment", payment_id)

        # Validate payment belongs to current user and is for employer verification
        if payment.user != frappe.session.user:
            frappe.throw("Access denied")

        if payment.payment_type != "employer_verification":
            frappe.throw("Invalid payment type")

        if payment.status == "Completed":
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
            "order_id": payment.trans_ref
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

        try:
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
                payment.status = "Completed"
                payment.verified_at = datetime.now()
                payment.save()

                # Update employer verification status
                employer_profile = frappe.get_doc("Employer Profile", {"user": payment.user})
                if employer_profile:
                    employer_profile.verification_status = "Verified"
                    employer_profile.verification_date = datetime.now()
                    employer_profile.verified = 1
                    employer_profile.save()
                    frappe.db.commit()

                    # Send verification confirmation email
                    send_employer_verification_email(employer_profile, "Verified")

                frappe.db.commit()

                return {
                    "success": True,
                    "status": "completed",
                    "message": "Payment verified successfully. Employer account is now verified."
                }
            elif payment_result == "FAILED":
                payment.status = "Failed"
                payment.save()
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

        except requests.exceptions.RequestException as e:
            frappe.log_error(f"Selcom API request failed: {str(e)}", "Employer Verification")
            return {
                "success": False,
                "status": "error",
                "message": f"Payment verification service unavailable: {str(e)}"
            }

    except Exception as e:
        frappe.log_error(f"Employer verification payment verification failed: {str(e)}", "Employer Verification")
        return {
            "success": False,
            "message": str(e)
        }


def send_employer_verification_email(employer_profile, status):
    """Send employer verification status email"""
    try:
        subject = f"Dereva Kiganjani - Employer Account {status}"

        if status == "Verified":
            message = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Congratulations {employer_profile.company_name}!</h2>

                <p>Your employer account has been successfully verified and approved.</p>

                <p>You can now access all employer features:</p>
                <ul>
                    <li>Post job openings</li>
                    <li>Search our database of qualified drivers</li>
                    <li>Manage applications</li>
                    <li>View driver profiles and qualifications</li>
                </ul>

                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Login Credentials:</h3>
                    <p style="margin: 5px 0;"><strong>Username:</strong> {employer_profile.email or employer_profile.phone_number}</p>
                    <p style="margin: 5px 0;">Use your initial password to login</p>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                    <a href="{frappe.utils.get_url()}/ingia" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Login Now
                    </a>
                </p>

                <p>If you've forgotten your password, you can reset it on the login page.</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                <p style="color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    <strong>Dereva Kiganjani Team</strong><br>
                    MDV Vehicle Fleet Limited
                </p>
            </div>
            """
        else:
            message = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Update on Your Employer Account Verification</h2>

                <p>Dear {employer_profile.company_name},</p>

                <p>Thank you for registering with Dereva Kiganjani.</p>

                <p>Unfortunately, we were unable to verify your account at this time.</p>

                <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
                    <h3 style="margin-top: 0; color: #dc2626;">Reason:</h3>
                    <p style="margin: 5px 0;">{employer_profile.verification_notes or "Please contact us for more details."}</p>
                </div>

                <h3>Next Steps:</h3>
                <ul>
                    <li>Please contact us at support@derevakiganjani.mdvfleet.co.tz</li>
                    <li>Provide additional documentation if requested</li>
                    <li>We're here to help resolve any issues</li>
                </ul>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                <p style="color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    <strong>Dereva Kiganjani Team</strong><br>
                    MDV Vehicle Fleet Limited
                </p>
            </div>
            """

        frappe.sendmail(
            recipients=[employer_profile.email],
            subject=subject,
            message=message
        )

    except Exception as e:
        frappe.log_error(f"Employer verification email failed: {str(e)}", "Employer Verification")
