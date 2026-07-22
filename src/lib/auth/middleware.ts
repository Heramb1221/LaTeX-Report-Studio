import { NextRequest } from 'next/server';
import { verifyToken, AUTH_COOKIE_NAME } from './jwt';
import type { AuthContext } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthenticatedHandler = (
  req: NextRequest,
  ctx: AuthContext,
  // Pass through any Next.js route segment params (e.g. { projectId })
  params?: Record<string, string>
) => Promise<Response>;

// ─── withAuth HOF ────────────────────────────────────────────────────────────

/**
 * Wraps an API route handler with JWT authentication.
 *
 * Usage in a route file:
 *
 *   export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
 *     return withAuth(req, async (req, { userId }) => {
 *       // userId is guaranteed to be a valid, verified user id here
 *       const project = await Project.findOne({ _id: params.projectId, userId });
 *       ...
 *     }, params);
 *   }
 */
export async function withAuth(
  req: NextRequest,
  handler: AuthenticatedHandler,
  params?: Record<string, string>
): Promise<Response> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return Response.json(
      { error: 'Authentication required. Please log in.' },
      { status: 401 }
    );
  }

  try {
    const payload = await verifyToken(token);
    const ctx: AuthContext = {
      userId: payload.userId,
      email: payload.email,
    };
    return handler(req, ctx, params);
  } catch (err) {
    // Token is invalid or expired
    console.error('[withAuth] Token verification failed:', err);
    return Response.json(
      { error: 'Your session has expired. Please log in again.' },
      { status: 401 }
    );
  }
}

// ─── Validation helper ───────────────────────────────────────────────────────

/**
 * Returns a 400 response with a validation error message.
 * Keeps API route handlers clean.
 */
export function validationError(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}

/**
 * Returns a 404 response.
 */
export function notFound(resource = 'Resource'): Response {
  return Response.json({ error: `${resource} not found` }, { status: 404 });
}

/**
 * Returns a 500 response and logs the actual error server-side.
 */
export function serverError(err: unknown, context?: string): Response {
  const tag = context ? `[${context}]` : '[API]';
  console.error(`${tag} Unhandled error:`, err);
  return Response.json(
    { error: 'An unexpected error occurred. Please try again.' },
    { status: 500 }
  );
}
