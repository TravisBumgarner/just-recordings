export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  // Analytics tracking stub
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, properties);
  }
}
