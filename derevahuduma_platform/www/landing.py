import json
import os
import re
import frappe
import frappe.sessions  # Added for consistency
from frappe import _  # Added for localization (if needed)
from frappe.utils.telemetry import capture  # Added for telemetry

no_cache = 1  # Moved to module-level for consistency

SCRIPT_TAG_PATTERN = re.compile(r"\<script[^<]*\</script\>")
CLOSING_SCRIPT_TAG_PATTERN = re.compile(r"</script\>")

def get_context(context):
    """
    Context for the landing page (React SPA) - Updated to match raven.py structure.
    This sets up data for the page, including user session info, assets, security, and branding.
    """
    # CSRF token handling (from raven.py) - always generate and commit for security
    csrf_token = frappe.sessions.get_csrf_token()
    frappe.db.commit()  # Ensure token is saved
    
    # Boot data handling (from raven.py)
    if frappe.session.user == "Guest":
        boot = frappe.website.utils.get_boot_data()
    else:
        try:
            boot = frappe.sessions.get()
        except Exception as e:
            raise frappe.SessionBootFailed from e
    
    # Add custom boot keys (from raven.py) - adapt if your app needs them
    boot["push_relay_server_url"] = frappe.conf.get("push_relay_server_url")  # Optional: for push notifications
    if "server_script_enabled" in frappe.conf:
        enabled = frappe.conf.server_script_enabled
    else:
        enabled = True
    boot["server_script_enabled"] = enabled
    
    # Boot JSON processing (unchanged)
    boot_json = frappe.as_json(boot, indent=None, separators=(",", ":"))
    boot_json = SCRIPT_TAG_PATTERN.sub("", boot_json)
    boot_json = CLOSING_SCRIPT_TAG_PATTERN.sub("", boot_json)
    boot_json = json.dumps(boot_json)
    
    # Context updates (merged from raven.py)
    context.update({
        "build_version": frappe.utils.get_build_version(),
        "boot": boot_json,
        "csrf_token": csrf_token,
    })
    
    
    
    # Favicons and icons (from raven.py) - adapt paths to your app
    context["sitename"] = boot.get("sitename")
    
    # Telemetry and preloads (from raven.py) - adapted for logged-in users
    if frappe.session.user != "Guest":
        capture("active_site", "derevahuduma_platform")  # Track usage
        context["preload_links"] = """
            <link rel="preload" href="/api/method/frappe.auth.get_logged_user" as="fetch" crossorigin="use-credentials">
            <link rel="preload" href="/api/method/derevahuduma_platform.api.some_endpoint.get_list" as="fetch" crossorigin="use-credentials">
            <!-- Add your app's key API preloads here, e.g., for user data or pages -->
        """
    else:
        context["preload_links"] = ""
    
    # Your existing manifest logic (unchanged)
    try:
        app_path = frappe.get_app_path("derevahuduma_platform")
        manifest_path = os.path.join(app_path, "public", "landing", ".vite", "manifest.json")
        
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
            
            if 'index.html' in manifest:
                entry = manifest['index.html']
                context.js_file = f"/assets/derevahuduma_platform/landing/{entry.get('file', 'index.js')}"
                css_files = entry.get('css', [])
                context.css_files = [f"/assets/derevahuduma_platform/landing/{css}" for css in css_files]
            else:
                context.js_file = "/assets/derevahuduma_platform/landing/index.js"
                context.css_files = ["/assets/derevahuduma_platform/landing/index.css"]
        else:
            context.js_file = "/assets/derevahuduma_platform/landing/index.js"
            context.css_files = ["/assets/derevahuduma_platform/landing/index.css"]
            
    except Exception as e:
        frappe.log_error(f"Error reading manifest: {str(e)}", "Landing Page Manifest Error")
        context.js_file = "/assets/derevahuduma_platform/landing/index.js"
        context.css_files = ["/assets/derevahuduma_platform/landing/index.css"]
    
    return context

# Added from raven.py: Dev endpoint for debugging
@frappe.whitelist(methods=["POST"], allow_guest=True)
def get_context_for_dev():
    if not frappe.conf.developer_mode:
        frappe.throw(_("This method is only meant for developer mode"))
    return json.loads(get_boot())

# Added from raven.py: Helper for boot data
def get_boot():
    try:
        boot = frappe.sessions.get()
    except Exception as e:
        raise frappe.SessionBootFailed from e
    
    boot["push_relay_server_url"] = frappe.conf.get("push_relay_server_url")
    boot_json = frappe.as_json(boot, indent=None, separators=(",", ":"))
    boot_json = SCRIPT_TAG_PATTERN.sub("", boot_json)
    boot_json = CLOSING_SCRIPT_TAG_PATTERN.sub("", boot_json)
    boot_json = json.dumps(boot_json)
    
    return boot_json