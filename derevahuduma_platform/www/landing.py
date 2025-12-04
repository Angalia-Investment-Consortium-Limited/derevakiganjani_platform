import frappe
import json
import os

def get_context(context):
	"""
	Context for the landing page (React SPA)
	"""
	context.no_cache = 1
	
	# Add CSRF token for API calls
	if frappe.session.user != "Guest":
		context.csrf_token = frappe.sessions.get_csrf_token()
	
	# Read the manifest to get hashed asset filenames
	try:
		app_path = frappe.get_app_path("derevahuduma_platform")
		manifest_path = os.path.join(app_path, "public", "landing", ".vite", "manifest.json")
		
		if os.path.exists(manifest_path):
			with open(manifest_path, 'r') as f:
				manifest = json.load(f)
				
			# Extract the main entry point assets
			if 'index.html' in manifest:
				entry = manifest['index.html']
				context.js_file = f"/assets/derevahuduma_platform/landing/{entry.get('file', 'index.js')}"
				css_files = entry.get('css', [])
				context.css_files = [f"/assets/derevahuduma_platform/landing/{css}" for css in css_files]
			else:
				# Fallback to default names
				context.js_file = "/assets/derevahuduma_platform/landing/index.js"
				context.css_files = ["/assets/derevahuduma_platform/landing/index.css"]
		else:
			# Fallback if manifest doesn't exist (development mode)
			context.js_file = "/assets/derevahuduma_platform/landing/index.js"
			context.css_files = ["/assets/derevahuduma_platform/landing/index.css"]
			
	except Exception as e:
		frappe.log_error(f"Error reading manifest: {str(e)}", "Landing Page Manifest Error")
		# Fallback to default names
		context.js_file = "/assets/derevahuduma_platform/landing/index.js"
		context.css_files = ["/assets/derevahuduma_platform/landing/index.css"]
	
	return context
