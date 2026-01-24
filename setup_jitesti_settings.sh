#!/bin/bash
# Setup script for JiTesti Selcom Payment Gateway Configuration
# This script configures the JiTesti Settings with proper Selcom API credentials

set -e

echo "=============================================="
echo "JiTesti Settings Configuration"
echo "=============================================="
echo ""

# Set the site name (default to production site)
SITE=${1:-derevakiganjani.mdvfleet.co.tz}

echo "Configuring JiTesti Settings for site: $SITE"
echo ""

# Activate virtual environment
cd /home/aicl/frappe-bench
source env/bin/activate

# Run the setup script
python apps/derevahuduma_platform/setup_jitesti_settings.py $SITE

echo ""
echo "=============================================="
echo "Setup Complete!"
echo "=============================================="
echo ""
echo "To verify the configuration:"
echo "1. Login to Frappe backend as administrator"
echo "2. Go to: JiTesti Settings (search in Awesome Bar)"
echo "3. Verify all Selcom credentials are configured"
echo ""
echo "To test the payment flow:"
echo "1. Go to /jitesti on the frontend"
echo "2. Select a test category"
echo "3. Click 'Pay' and verify no configuration error"
echo ""

