# Authentication Fix Guide - Vite Proxy Configuration

## Problem

The authentication is failing with error:
```
POST :8080/api/method/login 404 (NOT FOUND)
Error: "localhost does not exist"
```

## Root Cause

The React app has a **Vite proxy** configured in `vite.config.ts` that forwards `/api` requests to the Frappe backend. However, the `FrappeProvider` in `App.tsx` is trying to use an absolute URL instead of using the proxy.

## How Vite Proxy Works

In `landing/vite.config.ts`, there's a proxy configuration:
```typescript
server: {
  port: 8080,
  proxy: proxyOptions, // Forwards /api, /app, /assets, /files to Frappe backend
}
```

The `proxyOptions.ts` reads the Frappe backend port from `common_site_config.json` and proxies requests automatically.

## The Solution

**In development mode**, the FrappeProvider should **NOT** have a `url` prop set, so it uses relative URLs that get proxied by Vite.

**In production mode**, the FrappeProvider needs the full URL.

## Required Changes to App.tsx

### Current Code (Lines 104-108):
```typescript
const App = () => (

  <FrappeProvider socketPort={import.meta.env.VITE_SOCKET_PORT ?? ''}
                  siteName={getSiteName()}>
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH}>
```

### Should Be Changed To:
```typescript
const App = () => {
  // In development, don't set URL (use Vite proxy)
  // In production, use the full URL from environment variable
  const frappeUrl = import.meta.env.MODE === 'production' 
    ? (import.meta.env.VITE_FRAPPE_URL || 'https://derevakiganjani.mdvfleet.co.tz')
    : undefined; // undefined = use relative URLs (proxied by Vite)

  return (
    <FrappeProvider 
      url={frappeUrl}
      socketPort={import.meta.env.VITE_SOCKET_PORT ?? ''}
      siteName={getSiteName()}>
      <BrowserRouter basename={import.meta.env.VITE_BASE_PATH}>
```

### And at the End (Lines 494-498):
```typescript
    </BrowserRouter>
    </FrappeProvider>
  );
};

export default App;
```

## Complete Fixed App.tsx Structure

```typescript
// ... all imports ...

const queryClient = new QueryClient();

const getSiteName = () => {
  // @ts-ignore
  if (window.frappe?.boot?.versions?.frappe && (window.frappe.boot.versions.frappe.startsWith('15') || window.frappe.boot.versions.frappe.startsWith('16'))) {
    // @ts-ignore
    return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME
  }
  return import.meta.env.VITE_SITE_NAME
}

const App = () => {
  // In development, don't set URL (use Vite proxy)
  // In production, use the full URL from environment variable
  const frappeUrl = import.meta.env.MODE === 'production' 
    ? (import.meta.env.VITE_FRAPPE_URL || 'https://derevakiganjani.mdvfleet.co.tz')
    : undefined; // undefined = use relative URLs (proxied by Vite)

  return (
    <FrappeProvider 
      url={frappeUrl}
      socketPort={import.meta.env.VITE_SOCKET_PORT ?? ''}
      siteName={getSiteName()}>
      <BrowserRouter basename={import.meta.env.VITE_BASE_PATH}>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* ... all routes ... */}
                </Routes>
              </TooltipProvider>
            </AuthProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </FrappeProvider>
  );
};

export default App;
```

## Step-by-Step Manual Fix

1. **Open `landing/src/App.tsx` in your editor**

2. **Find line 104** that starts with:
   ```typescript
   const App = () => (
   ```

3. **Replace it with**:
   ```typescript
   const App = () => {
     // In development, don't set URL (use Vite proxy)
     // In production, use the full URL from environment variable
     const frappeUrl = import.meta.env.MODE === 'production' 
       ? (import.meta.env.VITE_FRAPPE_URL || 'https://derevakiganjani.mdvfleet.co.tz')
       : undefined; // undefined = use relative URLs (proxied by Vite)

     return (
   ```

4. **Find line 106** that has:
   ```typescript
     <FrappeProvider socketPort={import.meta.env.VITE_SOCKET_PORT ?? ''}
                     siteName={getSiteName()}>
   ```

5. **Replace it with**:
   ```typescript
       <FrappeProvider 
         url={frappeUrl}
         socketPort={import.meta.env.VITE_SOCKET_PORT ?? ''}
         siteName={getSiteName()}>
   ```

6. **Find line 107** and make sure the indentation is correct:
   ```typescript
         <BrowserRouter basename={import.meta.env.VITE_BASE_PATH}>
   ```

7. **Find the end of the file (around line 494-498)** and make sure it looks like:
   ```typescript
       </BrowserRouter>
       </FrappeProvider>
     );
   };

   export default App;
   ```

8. **Save the file**

9. **Restart the development server**:
   ```bash
   # Stop current server (Ctrl+C)
   cd landing && npm run dev
   ```

10. **Test authentication**:
    - Navigate to: `http://localhost:8080/auth/driver-login`
    - Login with: `tech.support@aicl.co.tz` / `Yeshua@2025`
    - Should successfully authenticate!

## Why This Works

### Development Mode (`npm run dev`):
- `import.meta.env.MODE === 'development'`
- `frappeUrl` is `undefined`
- FrappeProvider uses relative URLs like `/api/method/login`
- Vite proxy intercepts these and forwards to Frappe backend
- ✅ Authentication works!

### Production Mode (`npm run build`):
- `import.meta.env.MODE === 'production'`
- `frappeUrl` is set to `https://derevakiganjani.mdvfleet.co.tz`
- FrappeProvider uses absolute URLs
- Requests go directly to production server
- ✅ Authentication works!

## Verification

After making the changes, check the browser console:
- ✅ Should see: `POST http://localhost:8080/api/method/login 200 OK`
- ❌ Should NOT see: `POST :8080/api/method/login 404 NOT FOUND`

## Additional Notes

### About .env.local

You don't need to set `VITE_FRAPPE_URL` in `.env.local` for development because the proxy handles it. The `.env.local` file is mainly for production builds or if you want to override the default production URL.

### About the Proxy

The proxy configuration in `proxyOptions.ts`:
- Reads Frappe backend port from `common_site_config.json`
- Forwards requests matching `^/(app|api|assets|files|private)` to Frappe
- Handles WebSocket connections for real-time updates
- Uses the site name from the request host header

## Troubleshooting

### If you still get 404 errors:

1. **Check Frappe is running**:
   ```bash
   cd /home/aicl/frappe-bench
   bench start
   ```

2. **Check common_site_config.json**:
   ```bash
   cat /home/aicl/frappe-bench/sites/common_site_config.json
   ```
   Should have `webserver_port` (usually 8000)

3. **Check proxy is working**:
   - Open browser DevTools → Network tab
   - Try to login
   - Look at the request URL - should be `http://localhost:8080/api/method/login`
   - Check the response - should come from Frappe backend

4. **Restart everything**:
   ```bash
   # Stop React dev server (Ctrl+C)
   # Stop Frappe (Ctrl+C)
   
   # Start Frappe
   cd /home/aicl/frappe-bench
   bench start
   
   # In another terminal, start React
   cd /home/aicl/frappe-bench/apps/derevahuduma_platform/landing
   npm run dev
   ```

## Summary

The key insight is that **Vite's proxy handles API requests in development**, so the FrappeProvider should not have a `url` prop set in development mode. This allows the proxy to work correctly and forward requests to the Frappe backend.
