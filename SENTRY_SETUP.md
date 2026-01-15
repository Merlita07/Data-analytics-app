# Sentry Integration Setup Guide

This project now includes **Sentry** for comprehensive error monitoring and performance tracking.

## What is Sentry?

Sentry is an error tracking and performance monitoring platform that helps you identify, triage, and resolve issues in real-time. It captures:
- **Errors & Exceptions**: Automatic capture of frontend and backend errors
- **Performance Metrics**: Track response times, slow transactions
- **Session Replay**: Watch user sessions to understand what led to an error
- **Release Tracking**: Monitor errors across different app versions

## Setup Instructions

### 1. Create a Sentry Account
- Go to [sentry.io](https://sentry.io)
- Sign up for a free account
- Create a new organization and project

### 2. Get Your Sentry DSN
- In Sentry dashboard: **Settings** → **Projects** → Select your project
- Copy your **Client DSN** (starts with `https://`)

### 3. Configure Environment Variables

Update `.env.local` with your Sentry DSN:

```env
# Client-side DSN (used in browser)
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-sentry-domain.ingest.sentry.io/your-project-id

# Server-side DSN (used in Node.js)
SENTRY_DSN=https://your-key@your-sentry-domain.ingest.sentry.io/your-project-id
```

### 4. Optional: Source Maps Upload (for Production)

To upload source maps for better error tracking:

1. Generate a Sentry auth token:
   - Sentry dashboard → **Settings** → **Auth Tokens**
   - Create new token with `project:releases` and `org:read` scopes

2. Update `.env.local`:
```env
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

3. Build your app:
```bash
npm run build
```

Sentry will automatically upload source maps during the build.

## Files Created/Modified

### New Files
- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration
- `sentry.edge.config.ts` - Edge runtime Sentry configuration
- `app/global-error.tsx` - Global error boundary with Sentry reporting

### Modified Files
- `next.config.js` - Wrapped with Sentry configuration
- `.env.local` - Added Sentry DSN variables
- `app/api/data/route.ts` - Added error tracking to API routes
- `components/Dashboard.tsx` - Added error tracking to client components

## Features Implemented

### 1. **Automatic Error Capture**
- All uncaught exceptions are automatically reported to Sentry
- Both frontend and backend errors are tracked

### 2. **Error Boundaries**
- Global error boundary catches React component errors
- Provides user-friendly error message with retry option

### 3. **API Error Tracking**
- All API routes (GET, POST, PUT, DELETE) now report errors to Sentry
- Errors tagged with endpoint and HTTP method

### 4. **Client-Side Error Tracking**
- Dashboard component reports fetch errors
- Tagged with component name and action

### 5. **Performance Monitoring**
- Automatic tracking of HTTP requests
- Session replay (10% of sessions on error)
- Real User Monitoring (RUM)

## Testing Sentry Integration

### Test on Development
1. Visit your app at `http://localhost:3000`
2. Trigger a test error (you can modify code temporarily)
3. Check your Sentry dashboard - error should appear within seconds

### Manual Error Capture
```typescript
import * as Sentry from "@sentry/nextjs"

// Capture an error
try {
  // your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'your-section',
      action: 'your-action'
    }
  })
}
```

## Deployment

### For Vercel Deployment
1. Add environment variables in Vercel project:
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_DSN`
   - `SENTRY_ORG` (optional, for source maps)
   - `SENTRY_PROJECT` (optional, for source maps)
   - `SENTRY_AUTH_TOKEN` (optional, for source maps)

2. Deploy normally:
```bash
git push
```

## Monitoring Your App

1. **Go to Sentry Dashboard** → Your Project
2. **Issues Tab**: View all errors and issues
3. **Performance Tab**: Monitor response times
4. **Releases Tab**: Track errors by app version
5. **Alerts**: Set up notifications for new errors

## Key Metrics Tracked

- **Total Errors**: Number of error events
- **Unique Users Affected**: How many users experienced errors
- **Error Rate**: Percentage of requests that error
- **Response Time**: API latency
- **Slow Transactions**: Requests taking longer than threshold
- **Session Data**: User actions before errors

## Security & Privacy

- Sentry respects your privacy settings
- Personal data is masked by default
- Session replay doesn't record sensitive data
- Review privacy settings in Sentry project settings

## Troubleshooting

**Q: Errors not appearing in Sentry?**
- Verify DSN is correctly set in `.env.local`
- Check browser console for warnings
- Ensure you're on production build or development with DSN

**Q: Too many errors from development?**
- Only set DSN when needed
- Or use different Sentry projects for dev/prod

**Q: Want to disable Sentry temporarily?**
- Remove/comment out DSN in `.env.local`
- Or set `tracesSampleRate: 0` in config

## Resources

- [Sentry Documentation](https://docs.sentry.io)
- [Next.js + Sentry Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Release Tracking](https://docs.sentry.io/product/releases/)
