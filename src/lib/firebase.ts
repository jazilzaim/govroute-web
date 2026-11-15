/**
 * Client-side API bridge.
 *
 * Security note:
 * All Firebase credentials (FIREBASE_API_KEY, FIREBASE_PROJECT_ID, etc.) live
 * exclusively in server-side environment variables (.env -> api/waitlist.ts & vite.config.ts)
 * without the VITE_ prefix, so Vite never bundles them into client-side JavaScript.
 */

export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  try {
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, params, ts: Date.now() }),
      keepalive: true,
    }).catch(() => {
      // Ignore network telemetry errors
    });
  } catch {
    // Ignore telemetry errors
  }
};

export const submitWaitlistEntry = async (email: string, organization: string) => {
  trackEvent('waitlist_signup', { organization });
  try {
    await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        organization,
      }),
    });
  } catch {
    // Fail gracefully if offline
  }
};
