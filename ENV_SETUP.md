# Environment Variables Setup

## Optional Environment Variables

### Socket.IO Support (Real-time Features)

If you need real-time updates via Socket.IO, add:

```env
VITE_SOCKET_PORT=9000
```

**Note:** If `VITE_SOCKET_PORT` is not set, the app will work fine but without real-time features.

## What You DON'T Need

❌ **VITE_FRAPPE_URL** - Not needed! The app automatically uses the current domain.
❌ **VITE_BASE_PATH** - Not needed! The app automatically uses `/` in development and `/landing` in production.

## Example .env File

### Minimal Setup (No Real-time)
```env
# No environment variables required for basic setup!
```

### Full Setup (With Real-time)
```env
VITE_SOCKET_PORT=9000
```

## How It Works

- **Base Path**: Automatically configured based on environment:
  - Development: Uses `/` (access at `localhost:8080/`)
  - Production: Uses `/landing` (access at `yoursite.com/landing`)
- **VITE_SOCKET_PORT**: Used by FrappeProvider to connect to Socket.IO server for real-time updates (optional)
- **Frappe URL**: Automatically detected from the current domain (no configuration needed)

## Architecture

```typescript
// App.tsx
<FrappeProvider socketPort={import.meta.env.VITE_SOCKET_PORT ?? ''}>
  <BrowserRouter basename={import.meta.env.MODE === 'production' ? '/landing' : '/'}>
    {/* Your app routes */}
  </BrowserRouter>
</FrappeProvider>
```

This follows the recommended Frappe React SDK pattern where:
1. FrappeProvider wraps the entire app for Frappe API access
2. BrowserRouter is inside FrappeProvider with basename that automatically adjusts based on environment
3. Socket.IO is optional and only enabled if VITE_SOCKET_PORT is set
4. Base path matches Vite's configuration for seamless routing
