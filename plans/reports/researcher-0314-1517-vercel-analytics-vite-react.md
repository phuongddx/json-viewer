# Vercel Analytics Integration for Vite + React + TypeScript

**Project:** json-viewer
**Stack:** React 18 + TypeScript + Vite 5 + MUI v7
**Target:** Vercel deployment

---

## 1. Required Package

```bash
npm install @vercel/analytics
# or
yarn add @vercel/analytics
# or
pnpm add @vercel/analytics
```

Single package `@vercel/analytics` (v1.1.0+ for custom events).

---

## 2. Setup for Vite + React (NOT Next.js)

**Option A: React Component (Recommended)**

```tsx
// src/App.tsx or src/main.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Your app content */}
      <Analytics />
    </>
  );
}
```

**Option B: Programmatic Injection**

```tsx
// src/main.tsx
import { inject } from '@vercel/analytics';

inject(); // Auto-detects mode based on environment
```

**Key Difference from Next.js:**
- Use `@vercel/analytics/react` import path (NOT `@vercel/analytics/next`)
- Place `<Analytics />` component at root level of your app

---

## 3. Page View Tracking

**Automatic** - Page views are tracked automatically when:
- `<Analytics />` component mounts
- URL changes (SPA navigation)

For React Router apps, navigation events are captured automatically. No extra configuration needed.

**Manual Page View (if needed):**

```tsx
import { track } from '@vercel/analytics';

// Manually track a page view
track('pageview', { path: '/custom-path' });
```

---

## 4. Custom Event Tracking

**Client-side events:**

```tsx
import { track } from '@vercel/analytics';

// Simple event
track('Button Clicked');

// Event with custom data
track('File Uploaded', {
  fileType: 'json',
  fileSize: 1024,
  source: 'drag-drop'
});

// Example: Track JSON file loads
const handleFileLoad = (fileName: string, size: number) => {
  track('JSON Loaded', {
    fileName,
    fileSize: size,
    timestamp: Date.now()
  });
};
```

**Server-side events (requires v1.1.0+):**

```ts
import { track } from '@vercel/analytics/server';

export async function apiHandler() {
  await track('API Called', { endpoint: '/api/process' });
}
```

**Custom Event Limitations:**
- Max 255 chars per event name/key/value
- No nested objects (flat structure only)
- Values: `string | number | boolean | null`
- Pro/Enterprise required for custom events

---

## 5. Environment Variables

**None required** - Vercel Analytics works out of the box when deployed to Vercel.

**Optional Configuration:**

```env
# Not typically needed - auto-detected
# VERCEL_ENV=production  # Set by Vercel automatically
```

---

## 6. Vercel Dashboard Configuration

**Steps:**

1. Go to Vercel Dashboard → Select Project
2. Navigate to **Analytics** tab
3. Click **Enable Web Analytics**
4. Deploy your app (enables `/_vercel/insights/*` routes)

**Dashboard Features:**
- Page views by URL/route
- Referrers, countries, browsers, devices, OS
- Custom events panel (Pro/Enterprise)
- UTM parameters (Plus tier)
- Export data as CSV (max 250 entries)

---

## 7. Best Practices for SPA Analytics

### A. Route Tracking with React Router

```tsx
// For React Router v6 - track route changes
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    // Analytics component handles this automatically
    // Only use if you need custom tracking
  }, [location]);

  return null;
}
```

### B. beforeSend Hook (Privacy/Filtering)

```tsx
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';

function App() {
  const beforeSend = (event: BeforeSendEvent) => {
    // Filter out private routes
    if (event.url.includes('/admin')) {
      return null; // Block tracking
    }
    // Redact sensitive data
    if (event.url.includes('/user/')) {
      return {
        ...event,
        url: event.url.replace(/\/user\/[^/]+/, '/user/[id]')
      };
    }
    return event;
  };

  return (
    <>
      <Analytics beforeSend={beforeSend} />
    </>
  );
}
```

### C. Development Mode

```tsx
<Analytics
  mode={import.meta.env.DEV ? 'development' : 'production'}
  debug={import.meta.env.DEV}  // Console logs in dev
/>
```

### D. Component Props

```tsx
<Analytics
  mode="production"           // 'development' | 'production'
  debug={false}               // Enable console logs
  beforeSend={(e) => e}       // Filter/modify events
  endpoint="/custom/insights" // Custom endpoint (rare)
  scriptSrc="/custom/script.js" // Custom script URL (rare)
/>
```

---

## 8. Implementation Checklist

1. [ ] Install `@vercel/analytics` package
2. [ ] Import `Analytics` from `@vercel/analytics/react`
3. [ ] Add `<Analytics />` to root component (App.tsx)
4. [ ] (Optional) Configure `beforeSend` for privacy
5. [ ] (Optional) Add `track()` calls for custom events
6. [ ] Enable Analytics in Vercel Dashboard
7. [ ] Deploy to Vercel
8. [ ] Verify: Check Network tab for `/_vercel/insights/view` requests

---

## 9. Pricing

- **Hobby:** Free - Basic page views, referrers, countries, devices
- **Pro:** $20/mo - Custom events, UTM parameters, more data retention
- **Enterprise:** Custom - Full features, longer retention

---

## 10. TypeScript Types

```tsx
// From @vercel/analytics
import type { BeforeSendEvent } from '@vercel/analytics/react';

interface BeforeSendEvent {
  type: 'pageview' | 'event';
  url: string;
  // Additional properties based on event type
}

// track function signature
declare function track(
  eventName: string,
  data?: Record<string, string | number | boolean | null>
): void;
```

---

## Unresolved Questions

1. Does json-viewer need custom events? (Pro plan required)
2. Should we track JSON file upload events with metadata?
3. Any private routes that should be excluded from tracking?
4. Should we implement route-based analytics for different viewer modes?

---

**Sources:**
- [Vercel Analytics Package Docs](https://vercel.com/docs/analytics/package)
- [Vercel Analytics Quickstart](https://vercel.com/docs/analytics/quickstart)
- [Custom Events Docs](https://vercel.com/docs/analytics/custom-events)
- [Using Web Analytics](https://vercel.com/docs/analytics/using-web-analytics)
