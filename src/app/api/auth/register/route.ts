import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User.model';
import { sendVerificationEmail } from '@/lib/email/mailer';
import { registerSchema } from '@/lib/validations/auth';
import { validationError, serverError } from '@/lib/auth/middleware';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // ── 1. Parse and validate body ──────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return validationError('Request body must be valid JSON');
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input';
      return validationError(message);
    }

    const { email, password } = parsed.data;

    // ── 2. Check for existing account ───────────────────────────────────────
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      // Don't reveal whether the email is verified or not
      return validationError('An account with this email already exists');
    }

    // ── 3. Hash password (cost factor 12 — ~250ms on modern hardware) ───────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── 4. Generate verification token (UUID v4, expires in 24h) ────────────
    const verificationToken = uuidv4();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // ── 5. Persist user ─────────────────────────────────────────────────────
    const user = await User.create({
      email,
      passwordHash,
      verificationToken,
      verificationExpiry,
      isEmailVerified: false,
    });

    // ── 6. Send verification email ────────────────────────────────────────────
    // This is awaited on purpose: on serverless platforms (Vercel) the function's
    // execution can be frozen the instant a response is returned, so a detached
    // "fire-and-forget" send here would often never actually leave the server.
    // We still don't want a slow/broken email provider to block account creation
    // outright, so a failure here is logged and surfaced in the response instead
    // of throwing — the account exists either way and can request a resend later.
    let emailSent = true;
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (err: unknown) {
      emailSent = false;
      console.error('[register] Failed to send verification email:', err);
    }

    return Response.json(
      {
        message: emailSent
          ? 'Account created. Check your email to verify your account before logging in.'
          : 'Account created, but the verification email could not be sent right now. ' +
            'Please try logging in later to request a new link.',
        userId: (user._id as { toString(): string }).toString(),
        emailSent,
      },
      { status: 201 }
    );
  } catch (err) {
    return serverError(err, 'auth/register');
  }
}
