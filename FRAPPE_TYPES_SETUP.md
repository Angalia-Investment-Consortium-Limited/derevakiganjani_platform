# Frappe Types Architecture Setup Guide

This document explains the new architecture implemented for the Dereva Huduma Platform React application with Frappe Types integration.

## Architecture Overview

The application now uses the recommended Frappe architecture with:
- **FrappeProvider** with Socket.IO support
- **BrowserRouter** with basename configuration
- **Frappe Types** for TypeScript type generation
- Proper proxy configuration for development
- Production build output to Frappe public directory

## Changes Made

### 1. Environment Configuration

Created `.env.example` with required variables:
```env
VITE_FRAPPE_URL=https://derevakiganjani.mdvfleet.co.tz
VITE_SOCKET_PORT=9000
VITE_BASE_PATH=/landing
VITE_APP_NAME=Dereva Huduma
VITE_APP_VERSION=1.0.0
```

**Action Required**: Update your `.env` file to include `VITE_SOCKET_PORT=9000`

### 2. main.tsx Restructuring

Updated to wrap the app with:
```typescript
<FrappeProvider 
  url={FRAPPE_URL}
  socketPort={import.meta.env.VITE_SOCKET_PORT ?? ''}
>
  <BrowserRouter basename={import.meta.env.VITE_BASE_PATH}>
    <App />
  </BrowserRouter>
</FrappeProvider>
```

This enables:
- Real-time Socket.IO connections
- Proper routing with base path
- Consistent with Frappe best practices

### 3. App.tsx Simplification

Removed `BrowserRouter` wrapper (now in main.tsx) to follow the single-responsibility principle.

### 4. Vite Configuration

Enhanced `vite.config.ts` with:
- Development proxy for Frappe API endpoints
- Base path configuration
- Production build output to `derevahuduma_platform/public/landing`
- Port 8080 for development server

### 5. Frappe Hooks Configuration

Added to `hooks.py`:
- Website route rules for SPA routing
- Context update for landing page
- CSRF token injection

### 6. WWW Directory Structure

Created:
- `www/landing.html` - Entry point for the React app
- `www/landing.py` - Context handler with CSRF token

### 7. Types Directory

Created `src/types/` directory for auto-generated TypeScript types from Frappe DocTypes.

## Setup Instructions

### Step 1: Update Environment Variables

Add to your `.env` file:
```env
VITE_SOCKET_PORT=9000
```

### Step 2: Install Dependencies

```bash
cd apps/derevahuduma_platform/landing
yarn install
```

### Step 3: Configure Frappe Types

1. Access your Frappe site: `https://derevakiganjani.mdvfleet.co.tz`
2. Login as Administrator
3. Search for "Type Generation Settings" in the Awesomebar
4. Click "New"
5. Add configuration:
   - **App Name**: `derevahuduma_platform`
   - **Path**: `apps/derevahuduma_platform/landing/src/types`
6. Save

### Step 4: Build the Application

For development:
```bash
cd apps/derevahuduma_platform/landing
yarn dev
```

For production:
```bash
cd apps/derevahuduma_platform/landing
yarn build
```

### Step 5: Restart Frappe

```bash
bench --site derevakiganjani.mdvfleet.co.tz clear-cache
bench restart
```

## Development Workflow

### Running Development Server

```bash
# From the landing directory
yarn dev
```

Access the app at: `http://derevakiganjani.mdvfleet.co.tz:8080/landing`

### Building for Production

```bash
# Build the React app
yarn build

# The build output goes to: apps/derevahuduma_platform/derevahuduma_platform/public/landing/

# Clear cache and restart
bench --site derevakiganjani.mdvfleet.co.tz clear-cache
bench restart
```

Access the production app at: `https://derevakiganjani.mdvfleet.co.tz/landing`

## Type Generation

### Automatic Generation

Once configured, types are automatically generated when you:
- Create a new DocType
- Update an existing DocType

### Manual Generation

Generate types for a specific DocType:
```bash
bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-doctype \
  --app derevahuduma_platform \
  --doctype "Your DocType Name"
```

Generate types for an entire module:
```bash
bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-module \
  --app derevahuduma_platform \
  --module "Your Module Name"
```

## Using Generated Types

```typescript
// Import generated types
import { User } from '@/types/Core/User';
import { LicenseRequest } from '@/types/DerevaHudumaPlatform/LicenseRequest';

// Use with type safety
const user: User = {
  name: 'user@example.com',
  email: 'user@example.com',
  first_name: 'John',
  // TypeScript will enforce all required fields
};

// Use with Frappe SDK
import { useFrappeGetDoc } from 'frappe-react-sdk';

const { data } = useFrappeGetDoc<LicenseRequest>(
  'License Request',
  'LR-00001'
);
```

## Socket.IO Integration

The Socket.IO connection is now properly configured:

```typescript
// In your components, you can use real-time features
import { useFrappeEventListener } from 'frappe-react-sdk';

function MyComponent() {
  useFrappeEventListener('doctype_update', (data) => {
    console.log('DocType updated:', data);
  });
  
  return <div>Real-time updates enabled!</div>;
}
```

## Routing

All routes now work with the `/landing` base path:
- Home: `/landing/`
- Login: `/landing/login`
- Dashboard: `/landing/dashboard`
- etc.

## Troubleshooting

### Issue: Types not generating

**Solution**: 
1. Check Type Generation Settings in Frappe
2. Ensure the path is correct: `apps/derevahuduma_platform/landing/src/types`
3. Try manual generation with CLI command

### Issue: Socket.IO not connecting

**Solution**:
1. Verify `VITE_SOCKET_PORT=9000` in `.env`
2. Check that port 9000 is open and accessible
3. Verify `socketio_port` in `sites/common_site_config.json`

### Issue: Routes not working in production

**Solution**:
1. Ensure you've run `yarn build`
2. Clear Frappe cache: `bench --site derevakiganjani.mdvfleet.co.tz clear-cache`
3. Restart bench: `bench restart`

### Issue: API calls failing

**Solution**:
1. Check CSRF token is being set in `landing.html`
2. Verify proxy configuration in `vite.config.ts`
3. Check Frappe site is accessible

## Benefits of This Architecture

1. **Type Safety**: Auto-generated types from DocTypes
2. **Real-time Updates**: Socket.IO integration for live data
3. **Better Development**: Hot reload with proper proxy
4. **Production Ready**: Optimized builds served by Frappe
5. **Maintainable**: Follows Frappe best practices
6. **Scalable**: Easy to add new features and routes

## Next Steps

1. Configure Frappe Types in the desk
2. Generate types for your existing DocTypes
3. Update components to use generated types
4. Test Socket.IO real-time features
5. Deploy to production

## Support

For issues or questions:
- Check Frappe documentation: https://frappeframework.com/docs
- Frappe Types: https://github.com/The-Commit-Company/frappe-types
- Frappe React SDK: https://github.com/nikkothari22/frappe-react-sdk
