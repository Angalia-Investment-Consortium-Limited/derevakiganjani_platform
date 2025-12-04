# Quick Push Reference Card

## 🏢 Organization Repository
**GitHub Organization:** Angalia Investment Consortium Limited  
**Repository URL:** https://github.com/Angalia-Investment-Consortium-Limited/derevahuduma_platform

## 🚀 Three Ways to Push to GitHub

### Method 1: Use the Interactive Script (Easiest)
```bash
cd apps/derevahuduma_platform
./PUSH_TO_GITHUB.sh
```
Then follow the prompts!

---

### Method 2: Quick Commands (Manual)

#### Option A: Direct Push to Develop
```bash
cd apps/derevahuduma_platform
git add .
git commit -m "feat: your commit message here"
git push origin develop
```

#### Option B: Create Feature Branch (Recommended)
```bash
cd apps/derevahuduma_platform
git checkout -b blackboxai/your-feature-name
git add .
git commit -m "feat: your commit message here"
git push -u origin blackboxai/your-feature-name
```

#### Option C: With Pull Request (Best Practice)
```bash
cd apps/derevahuduma_platform
git checkout -b blackboxai/your-feature-name
git add .
git commit -m "feat: your commit message here"
git push -u origin blackboxai/your-feature-name
gh pr create --title "Your PR Title" --base develop
```

---

### Method 3: Step-by-Step Manual Process

1. **Check Status**
   ```bash
   cd apps/derevahuduma_platform
   git status
   ```

2. **Review Changes**
   ```bash
   git diff
   ```

3. **Add Files**
   ```bash
   # Add all files
   git add .
   
   # Or add specific files
   git add derevahuduma_platform/api/
   git add landing/
   ```

4. **Commit**
   ```bash
   git commit -m "feat: add authentication and landing page"
   ```

5. **Push**
   ```bash
   # To develop branch
   git push origin develop
   
   # Or to feature branch
   git push origin blackboxai/your-branch-name
   ```

---

## 📋 Current Repository Status

**Branch:** develop  
**Location:** `/home/aicl/frappe-bench/apps/derevahuduma_platform`

**Pending Changes:**
- Modified: `derevahuduma_platform/hooks.py`
- New: `derevahuduma_platform/api/`
- New: `derevahuduma_platform/dereva_huduma_platform/doctype/`
- New: `derevahuduma_platform/www/`
- New: `landing/`
- New: `public/`
- New: `yarn.lock`

---

## 🎯 Quick Commands Cheat Sheet

| Task | Command |
|------|---------|
| Check status | `git status` |
| View changes | `git diff` |
| Add all files | `git add .` |
| Add specific file | `git add path/to/file` |
| Commit | `git commit -m "message"` |
| Push to develop | `git push origin develop` |
| Create branch | `git checkout -b branch-name` |
| Switch branch | `git checkout branch-name` |
| View branches | `git branch -a` |
| View log | `git log --oneline -10` |
| Undo last commit | `git reset --soft HEAD~1` |
| Pull latest | `git pull origin develop` |

---

## 💡 Commit Message Examples

**Good commit messages:**
```bash
git commit -m "feat: add OTP authentication system"
git commit -m "fix: resolve login redirect issue"
git commit -m "docs: update API documentation"
git commit -m "refactor: improve auth context structure"
git commit -m "style: format code with prettier"
```

**Multi-line commit:**
```bash
git commit -m "feat: implement complete authentication system

- Add SMS-based OTP verification
- Create driver, employer, and admin profiles
- Implement password reset flow
- Add role-based routing guards"
```

---

## ⚠️ Before You Push

1. ✅ Review your changes: `git status` and `git diff`
2. ✅ Make sure you're on the right branch: `git branch`
3. ✅ Pull latest changes: `git pull origin develop`
4. ✅ Test your code locally
5. ✅ Write a clear commit message
6. ✅ Don't commit sensitive data (passwords, API keys)

---

## 🔧 Troubleshooting

### Problem: "Permission denied"
```bash
# Check your SSH key
ssh -T git@github.com

# Or switch to HTTPS with organization URL
git remote set-url origin https://github.com/Angalia-Investment-Consortium-Limited/derevahuduma_platform.git
```

### Problem: "Merge conflict"
```bash
git pull origin develop
# Fix conflicts in files
git add .
git commit -m "resolve merge conflicts"
```

### Problem: "Large file error"
```bash
# Remove from tracking
git rm --cached path/to/large/file
echo "path/to/large/file" >> .gitignore
git commit -m "remove large file"
```

### Problem: "Need to undo last commit"
```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

---

## 📚 More Help

- Full guide: See `GITHUB_PUSH_GUIDE.md`
- Interactive script: Run `./PUSH_TO_GITHUB.sh`
- Git documentation: https://git-scm.com/docs

---

## 🎉 Ready to Push?

**Quickest way:**
```bash
cd apps/derevahuduma_platform && ./PUSH_TO_GITHUB.sh
```

**Or manually:**
```bash
cd apps/derevahuduma_platform
git add .
git commit -m "feat: your changes here"
git push origin develop
```

Good luck! 🚀
