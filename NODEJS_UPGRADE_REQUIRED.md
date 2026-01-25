# Node.js Upgrade Required - Build Error Fix

## Error You're Seeing

```
SyntaxError: Unexpected token '?'
```

This error occurs because:
- **Your Node.js version**: 12.22.9
- **Required Node.js version**: 18 or higher
- **TypeScript** uses modern JavaScript syntax that Node 12 doesn't understand

## Quick Fix - Upgrade Node.js

### Option 1: Using NVM (Recommended)

```bash
# 1. Install NVM (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Reload shell
source ~/.bashrc

# 3. Install Node.js 18
nvm install 18

# 4. Use Node.js 18
nvm use 18

# 5. Set as default
nvm alias default 18

# 6. Verify
node --version  # Should show v18.x.x

# 7. Now build your project
cd /home/aicl/frappe-bench/apps/derevahuduma_platform/landing
yarn build
```

### Option 2: Using NodeSource Repository

```bash
# 1. Remove old Node.js
sudo apt-get remove nodejs

# 2. Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 3. Install Node.js 18
sudo apt-get install -y nodejs

# 4. Verify
node --version  # Should show v18.x.x
npm --version

# 5. Now build your project
cd /home/aicl/frappe-bench/apps/derevahuduma_platform/landing
yarn build
```

## After Upgrading Node.js

### Build Your React App

```bash
cd /home/aicl/frappe-bench/apps/derevahuduma_platform/landing

# Build the project
yarn build

# Or use the production build script
yarn build:prod
```

### Build Frappe Assets

```bash
cd /home/aicl/frappe-bench

# Build Frappe
bench build --app frappe

# Build all apps
bench build

# Clear cache and restart
bench clear-cache
bench restart
```

## Why This Is Needed

1. **TypeScript 5.x** requires Node.js 18+
2. **Vite** (your build tool) requires Node.js 18+
3. **Frappe v15/v16** requires Node.js 18+
4. Modern JavaScript features (like `??` operator) need newer Node.js

## Verification Steps

After upgrading:

```bash
# 1. Check Node version
node --version
# Expected: v18.x.x or higher

# 2. Check npm version
npm --version
# Expected: 9.x.x or higher

# 3. Try building
cd /home/aicl/frappe-bench/apps/derevahuduma_platform/landing
yarn build
# Should complete without errors

# 4. Check Frappe build
cd /home/aicl/frappe-bench
bench build --app frappe
# Should complete without errors
```

## Common Issues

### Issue: NVM command not found

**Solution:**
```bash
# Manually load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Add to ~/.bashrc permanently
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
```

### Issue: Permission denied during npm install

**Solution:**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Issue: Yarn not found after Node upgrade

**Solution:**
```bash
# Reinstall yarn globally
npm install -g yarn

# Verify
yarn --version
```

## What This Fixes

After upgrading Node.js to version 18+:

✅ **React App Build** - `yarn build` will work
✅ **Frappe Desk Build** - `bench build` will work
✅ **TypeScript Compilation** - No syntax errors
✅ **Vite Build** - Modern bundling works
✅ **Development Server** - `yarn dev` works
✅ **All Modern JavaScript** - ES2022+ features supported

## Summary

**Current Problem:**
- Node.js 12 is too old
- Can't build React app
- Can't build Frappe desk
- TypeScript syntax errors

**Solution:**
- Upgrade to Node.js 18+
- Rebuild everything
- All builds will work

**Time Required:**
- 5-10 minutes to upgrade Node.js
- 2-3 minutes to rebuild apps

## Next Steps

1. ✅ Upgrade Node.js to version 18 (use NVM method above)
2. ✅ Verify Node version: `node --version`
3. ✅ Build React app: `cd landing && yarn build`
4. ✅ Build Frappe: `cd ../.. && bench build`
5. ✅ Test everything works

## Support

If you encounter issues:
1. Check Node version: `node --version`
2. Check build logs for specific errors
3. Try clearing caches: `yarn cache clean && bench clear-cache`
4. Rebuild from scratch: `rm -rf node_modules && yarn install && yarn build`
