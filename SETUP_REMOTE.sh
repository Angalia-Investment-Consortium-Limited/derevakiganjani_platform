#!/bin/bash

# Setup Remote Repository Script
# This script ensures your Git remote is configured correctly for the organization

set -e

echo "=========================================="
echo "Git Remote Setup for derevahuduma_platform"
echo "=========================================="
echo ""

# Navigate to the repository
cd "$(dirname "$0")"

# Organization details
ORG_NAME="Angalia-Investment-Consortium-Limited"
REPO_NAME="derevahuduma_platform"
SSH_URL="git@github.com:${ORG_NAME}/${REPO_NAME}.git"
HTTPS_URL="https://github.com/${ORG_NAME}/${REPO_NAME}.git"

echo "📍 Organization: Angalia Investment Consortium Limited"
echo "📦 Repository: derevahuduma_platform"
echo ""

# Check current remote
echo "🔍 Checking current remote configuration..."
echo ""

if git remote get-url origin &> /dev/null; then
    CURRENT_URL=$(git remote get-url origin)
    echo "Current remote URL: $CURRENT_URL"
    echo ""
    
    # Check if it's already correct
    if [[ "$CURRENT_URL" == *"$ORG_NAME/$REPO_NAME"* ]]; then
        echo "✅ Remote is already configured correctly!"
        echo ""
        echo "Remote details:"
        git remote -v
        exit 0
    else
        echo "⚠️  Remote URL needs to be updated"
        echo ""
    fi
else
    echo "⚠️  No remote 'origin' found"
    echo ""
fi

# Ask user which protocol to use
echo "Choose remote URL protocol:"
echo "1) SSH (recommended if you have SSH keys set up)"
echo "   URL: $SSH_URL"
echo ""
echo "2) HTTPS (use if SSH is not configured)"
echo "   URL: $HTTPS_URL"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        REMOTE_URL="$SSH_URL"
        echo ""
        echo "📝 Setting remote to SSH..."
        ;;
    2)
        REMOTE_URL="$HTTPS_URL"
        echo ""
        echo "📝 Setting remote to HTTPS..."
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Set or update the remote
if git remote get-url origin &> /dev/null; then
    echo "Updating existing remote..."
    git remote set-url origin "$REMOTE_URL"
else
    echo "Adding new remote..."
    git remote add origin "$REMOTE_URL"
fi

echo ""
echo "✅ Remote configured successfully!"
echo ""
echo "Remote details:"
git remote -v
echo ""

# Test connection
echo "🔌 Testing connection..."
echo ""

if [[ "$choice" == "1" ]]; then
    echo "Testing SSH connection to GitHub..."
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        echo "✅ SSH connection successful!"
    else
        echo "⚠️  SSH connection test completed (this is normal if you see 'successfully authenticated')"
        echo ""
        echo "If you see 'Permission denied', you may need to:"
        echo "1. Set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
        echo "2. Or switch to HTTPS by running this script again and choosing option 2"
    fi
else
    echo "HTTPS configured. You'll be prompted for credentials when pushing."
    echo ""
    echo "💡 Tip: Use a Personal Access Token instead of password"
    echo "   Generate one at: https://github.com/settings/tokens"
fi

echo ""
echo "=========================================="
echo "Setup Complete! 🎉"
echo "=========================================="
echo ""
echo "You can now push to the repository using:"
echo "  ./PUSH_TO_GITHUB.sh"
echo ""
echo "Or manually:"
echo "  git push origin develop"
