# Quick Start Guide

## Prerequisites

Your `.env` file should contain:
```env
VITE_BASE_PATH=/landing
```

**Optional:** Add Socket.IO support for real-time features:
```env
VITE_SOCKET_PORT=9000
```

Install dependencies:
```bash
cd apps/derevahuduma_platform/landing
yarn install
```

## Development

Start the development server:
```bash
cd apps/derevahuduma_platform/landing
yarn dev
```

Access at: `http://derevakiganjani.mdvfleet.co.tz:8080/landing`

## Production Build

Build the application:
```bash
cd apps/derevahuduma_platform/landing
yarn build
```

Clear cache and restart:
```bash
bench --site derevakiganjani.mdvfleet.co.tz clear-cache
bench restart
```

Access at: `https://derevakiganjani.mdvfleet.co.tz/landing`

## Configure Frappe Types (One-time Setup)

1. Login to Frappe: `https://derevakiganjani.mdvfleet.co.tz`
2. Search: "Type Generation Settings"
3. Add:
   - App Name: `derevahuduma_platform`
   - Path: `apps/derevahuduma_platform/landing/src/types`
4. Save

## Generate Types Manually

For a specific DocType:
```bash
bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-doctype \
  --app derevahuduma_platform \
  --doctype "Your DocType Name"
```

For an entire module:
```bash
bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-module \
  --app derevahuduma_platform \
  --module "Your Module Name"
```

## Common Issues

### Types not generating?
- Check Type Generation Settings in Frappe Desk
- Verify path: `apps/derevahuduma_platform/landing/src/types`

### Socket.IO not connecting?
- Add `VITE_SOCKET_PORT=9000` to `.env` if you need real-time features
- Check port 9000 is accessible

### Routes not working?
- Clear cache: `bench --site derevakiganjani.mdvfleet.co.tz clear-cache`
- Restart: `bench restart`

## Environment Variables

- **VITE_BASE_PATH** (Required): Base path for routing (e.g., `/landing`)
- **VITE_SOCKET_PORT** (Optional): Socket.IO port for real-time features (e.g., `9000`)

**Note:** `VITE_FRAPPE_URL` is NOT needed. The app automatically uses the current domain.

## Full Documentation

See `FRAPPE_TYPES_SETUP.md` for complete documentation.
