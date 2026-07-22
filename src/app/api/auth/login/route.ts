import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User.model';
import { signToken, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/validations/auth';
import { validationError, serverError } from '@/lib/auth/middleware';

// Single message for both "user not found" and "wrong password"
// so we don't reveal which emails are registered.
const INVALID_CREDENTIALS = 'Invalid email or password';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // ── 1. Validate ─────────────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return validationError('Request body must be valid JSON');
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input';
      return validationError(message);
    }

    const { email, password } = parsed.data;

    // ── 2. Look up user ──────────────────────────────────────────────────────
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return Response.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    // ── 3. Verify password ───────────────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return Response.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    // ── 4. Require email verification ────────────────────────────────────────
    if (!user.isEmailVerified) {
      return Response.json(
        {
          error:
            'Please verify your email address before logging in. Check your inbox for the verification link.',
        },
        { status: 403 }
      );
    }

    // ── 5. Sign JWT and set httpOnly cookie ──────────────────────────────────
    const token = await signToken({
      userId: (user._id as { toString(): string }).toString(),
      email: user.email,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    // ── 6. Return safe user object ───────────────────────────────────────────
    return Response.json({
      data: {
        _id: (user._id as { toString(): string }).toString(),
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        hasGeminiKey: Boolean(user.geminiApiKeyEncrypted),
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    return serverError(err, 'auth/login');
  }
}
