# Environment Variables Setup Guide for Local Development

## Issue

Your React app runs on `http://localhost:8080` but needs to connect to your local Frappe backend for authentication.

## Current .env.local Configuration

Your current `.env.local` has:
```env
VITE_FRAPPE_URL='https://derevakiganjani.mdvfleet.co.tz'  # Production URL
VITE_BASE_PATH=''
VITE_SOCKET_PORT=9000
VITE_SITE_NAME='derevakiganjani.mdvfleet.co.tz'
```

## Required Changes

You need to update `VITE_FRAPPE_URL` to point to your **local Frappe backend**.

### Option 1: Local Frappe Backend (Recommended for Development)

If your Frappe backend is running locally (usually on port 8000), update your `.env.local`:

```env
# Local Development - Frappe Backend URL
VITE_FRAPPE_URL='http://localhost:8000'

# Base Path for routing
VITE_BASE_PATH=''

# Socket Port for real-time updates
VITE_SOCKET_PORT=9000

# Site Name (for Frappe v15+)
VITE_SITE_NAME='derevakiganjani.mdvfleet.co.tz'
```

### Option 2: Remote Frappe Backend (If backend is on remote server)

If your Frappe backend is on the same server (45.32.216.48), use:

```env
# Remote Development - Frappe Backend URL
VITE_FRAPPE_URL='http://45.32.216.48:8000'

# OR if using domain
VITE_FRAPPE_URL='https://derevakiganjani.mdvfleet.co.tz'

# Base Path for routing
VITE_BASE_PATH=''

# Socket Port for real-time updates
VITE_SOCKET_PORT=9000

# Site Name (for Frappe v15+)
VITE_SITE_NAME='derevakiganjani.mdvfleet.co.tz'
```

## How to Update

1. **Open the file manually:**
   ```bash
   nano landing/.env.local
   # or
   vim landing/.env.local
   # or use your preferred editor
   ```

2. **Update the VITE_FRAPPE_URL line** to match your Frappe backend location

3. **Save the file**

4. **Restart the development server:**
   ```bash
   # Stop current server (Ctrl+C)
   cd landing && npm run dev
   ```

## How to Find Your Frappe Backend URL

### Check if Frappe is running locally:

```bash
# Check Frappe bench status
cd /home/aicl/frappe-bench
bench start
```

This will show you the ports where Frappe is running. Typically:
- **Frappe Backend:** `http://localhost:8000`
- **SocketIO:** `http://localhost:9000`

### Common Frappe Backend URLs:

- **Local Development:** `http://localhost:8000`
- **Local Network:** `http://45.32.216.48:8000`
- **Production Domain:** `https://derevakiganjani.mdvfleet.co.tz`

## Testing After Update

1. Restart the React dev server
2. Open browser to `http://localhost:8080/auth/driver-login`
3. Try logging in with: `tech.support@aicl.co.tz` / `Yeshua@2025`
4. Check browser console - should see API calls to your configured Frappe URL
5. Should successfully authenticate and redirect to dashboard

## Troubleshooting

### CORS Errors

If you get CORS errors when connecting to local Frappe:

1. **Check Frappe site config:**
   ```bash
   cat /home/aicl/frappe-bench/sites/derevakiganjani.mdvfleet.co.tz/site_config.json
   ```

2. **Add CORS settings if needed:**
   ```json
   {
     "allow_cors": "*",
     "cors_allowed_origins": [
       "http://localhost:8080",
       "http://45.32.216.48:8080"
     ]
   }
   ```

3. **Restart Frappe:**
   ```bash
   bench restart
   ```

### Connection Refused

If you get "Connection Refused":
- Ensure Frappe backend is running: `bench start`
- Check the correct port (usually 8000)
- Verify firewall settings if using remote URL

## Environment-Specific Configurations

### Development (.env.local)
```env
VITE_FRAPPE_URL='http://localhost:8000'
```

### Staging (.env.staging)
```env
VITE_FRAPPE_URL='https://staging.derevakiganjani.mdvfleet.co.tz'
```

### Production (.env.production)
```env
VITE_FRAPPE_URL='https://derevakiganjani.mdvfleet.co.tz'
```

## Summary

**Action Required:**
1. Manually edit `landing/.env.local`
2. Change `VITE_FRAPPE_URL` to your local Frappe backend URL (likely `http://localhost:8000`)
3. Restart the dev server
4. Test authentication

The authentication code is already properly implemented - you just need the correct backend URL configured!
