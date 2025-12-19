import frappe
import json
import os
import re  # Added for script tag removal (from the first file)

# Regex patterns for removing script tags (from the first file, for security)
SCRIPT_TAG_PATTERN = re.compile(r"\<script[^<]*\</script\>")
CLOSING_SCRIPT_TAG_PATTERN = re.compile(r"</script\>")

def get_context(context):
    """
    Context for the landing page (React SPA) - Merged from both files.
    This sets up data for the page, including user session info, assets, and security.
    """
    # Set no caching (from both files - prevents browser from storing old versions)
    context.no_cache = 1
    
    # Add CSRF token for API calls (from the second file) - only if user is logged in
    if frappe.session.user != "Guest":
        context.csrf_token = frappe.sessions.get_csrf_token()
    
    # Boot data handling (from the first file) - gets user session info
    if frappe.session.user == "Guest":
        boot = frappe.website.utils.get_boot_data()  # For guests
    else:
        try:
            boot = frappe.sessions.get()  # For logged-in users
        except Exception as e:
            raise frappe.SessionBootFailed from e  # Error if session fails
    
    # Convert boot data to JSON and remove any script tags for security (from the first file)
    boot_json = frappe.as_json(boot, indent=None, separators=(",", ":"))
    boot_json = SCRIPT_TAG_PATTERN.sub("", boot_json)  # Remove opening script tags
    boot_json = CLOSING_SCRIPT_TAG_PATTERN.sub("", boot_json)  # Remove closing script tags
    boot_json = json.dumps(boot_json)  # Wrap in JSON again (for safe embedding)
    
    # Add boot data and build version to context (from the first file)
    context.update({
        "build_version": frappe.utils.get_build_version(),  # App version number
        "boot": boot_json,  # Sanitized session data
    })
    
    # Read the manifest to get hashed asset filenames (from the second file)
    try:
        app_path = frappe.get_app_path("derevahuduma_platform")  # Path to your app
        manifest_path = os.path.join(app_path, "public", "landing", ".vite", "manifest.json")
        
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)  # Load the manifest JSON
            
            # Extract the main entry point assets
            if 'index.html' in manifest:
                entry = manifest['index.html']
                context.js_file = f"/assets/derevahuduma_platform/landing/{entry.get('file', 'index.js')}"
                css_files = entry.get('css', [])
                context.css_files = [f"/assets/derevahuduma_platform/landing/{css}" for css in css_files]
            else:
                # Fallback to default names if no index.html in manifest
                context.js_file = "/assets/derevahuduma_platform/landing/index.js"
                context.css_files = ["/assets/derevahuduma_platform/landing/index.css"]
        else:
            # Fallback if manifest doesn't exist (e.g., in development)
            context.js_file = "/assets/derevahuduma_platform/landing/index.js"
            context.css_files = ["/assets/derevahuduma_platform/landing/index.css"]
            
    except Exception as e:
        frappe.log_error(f"Error reading manifest: {str(e)}", "Landing Page Manifest Error")
        # Fallback to default names if error
        context.js_file = "/assets/derevahuduma_platform/landing/index.js"
        context.css_files = ["/assets/derevahuduma_platform/landing/index.css"]
    
    return context