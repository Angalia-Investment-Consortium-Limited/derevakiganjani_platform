#!/bin/bash

# GitHub Push Script for derevahuduma_platform
# This script helps you push your changes to GitHub

set -e  # Exit on error

echo "=========================================="
echo "GitHub Push Helper for derevahuduma_platform"
echo "=========================================="
echo ""

# Navigate to the repository
cd "$(dirname "$0")"

# Check Git status
echo "📊 Current Git Status:"
echo "=========================================="
git status
echo ""

# Ask user which method they want to use
echo "Choose your push method:"
echo "1) Direct push to develop branch (quick)"
echo "2) Create feature branch and push (recommended)"
echo "3) Create feature branch and open Pull Request (best practice)"
echo "4) Just show me what would be pushed (dry run)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📝 Direct Push to Develop Branch"
        echo "=========================================="
        
        # Show what will be added
        echo "Files to be added:"
        git status --short
        echo ""
        
        read -p "Enter commit message: " commit_msg
        
        if [ -z "$commit_msg" ]; then
            commit_msg="feat: Update derevahuduma_platform with latest changes"
        fi
        
        echo ""
        echo "Adding all changes..."
        git add .
        
        echo "Committing changes..."
        git commit -m "$commit_msg"
        
        echo "Pushing to develop branch..."
        git push origin develop
        
        echo ""
        echo "✅ Successfully pushed to develop branch!"
        ;;
        
    2)
        echo ""
        echo "🌿 Create Feature Branch and Push"
        echo "=========================================="
        
        read -p "Enter branch name (e.g., feature-auth-system): " branch_name
        
        if [ -z "$branch_name" ]; then
            branch_name="blackboxai/feature-$(date +%Y%m%d-%H%M%S)"
        else
            branch_name="blackboxai/$branch_name"
        fi
        
        read -p "Enter commit message: " commit_msg
        
        if [ -z "$commit_msg" ]; then
            commit_msg="feat: Add new features and improvements"
        fi
        
        echo ""
        echo "Creating branch: $branch_name"
        git checkout -b "$branch_name"
        
        echo "Adding all changes..."
        git add .
        
        echo "Committing changes..."
        git commit -m "$commit_msg"
        
        echo "Pushing to GitHub..."
        git push -u origin "$branch_name"
        
        echo ""
        echo "✅ Successfully pushed to branch: $branch_name"
        echo "📌 You can now create a Pull Request on GitHub"
        echo "   URL: https://github.com/YOUR_USERNAME/derevahuduma_platform/compare/$branch_name"
        ;;
        
    3)
        echo ""
        echo "🔀 Create Feature Branch and Pull Request"
        echo "=========================================="
        
        # Check if gh CLI is installed
        if ! command -v gh &> /dev/null; then
            echo "❌ GitHub CLI (gh) is not installed."
            echo ""
            echo "To install GitHub CLI:"
            echo "  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
            echo "  sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg"
            echo "  echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
            echo "  sudo apt update"
            echo "  sudo apt install gh"
            echo ""
            echo "After installation, run: gh auth login"
            exit 1
        fi
        
        read -p "Enter branch name (e.g., feature-auth-system): " branch_name
        
        if [ -z "$branch_name" ]; then
            branch_name="blackboxai/feature-$(date +%Y%m%d-%H%M%S)"
        else
            branch_name="blackboxai/$branch_name"
        fi
        
        read -p "Enter commit message: " commit_msg
        
        if [ -z "$commit_msg" ]; then
            commit_msg="feat: Add new features and improvements"
        fi
        
        read -p "Enter PR title: " pr_title
        
        if [ -z "$pr_title" ]; then
            pr_title="$commit_msg"
        fi
        
        read -p "Enter PR description (optional): " pr_body
        
        echo ""
        echo "Creating branch: $branch_name"
        git checkout -b "$branch_name"
        
        echo "Adding all changes..."
        git add .
        
        echo "Committing changes..."
        git commit -m "$commit_msg"
        
        echo "Pushing to GitHub..."
        git push -u origin "$branch_name"
        
        echo "Creating Pull Request..."
        if [ -z "$pr_body" ]; then
            gh pr create --title "$pr_title" --base develop
        else
            gh pr create --title "$pr_title" --body "$pr_body" --base develop
        fi
        
        echo ""
        echo "✅ Successfully created Pull Request!"
        ;;
        
    4)
        echo ""
        echo "🔍 Dry Run - Files that would be pushed:"
        echo "=========================================="
        
        echo ""
        echo "Modified files:"
        git diff --name-only
        
        echo ""
        echo "Untracked files:"
        git ls-files --others --exclude-standard
        
        echo ""
        echo "Summary:"
        git status --short
        
        echo ""
        echo "To see detailed changes, run: git diff"
        ;;
        
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Done! 🎉"
echo "=========================================="
