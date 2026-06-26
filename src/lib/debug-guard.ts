import { NextResponse } from 'next/server';

// Debug/test API routes expose which providers/keys are configured and can
// trigger paid AI calls. They are available in development by default, and in
// production ONLY when ENABLE_DEBUG_ROUTES=true is explicitly set.
export function debugRoutesEnabled(): boolean {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_DEBUG_ROUTES === 'true'
  );
}

// Returns a 404 response when debug routes are disabled, otherwise null.
// Usage at the top of a handler:
//   const blocked = debugRouteGuard();
//   if (blocked) return blocked;
export function debugRouteGuard(): NextResponse | null {
  if (debugRoutesEnabled()) return null;
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
