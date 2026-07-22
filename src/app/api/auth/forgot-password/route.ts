import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User.model';
import { sendPasswordResetEmail } from '@/lib/email/mailer';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { validationError, serverError } from '@/lib/auth/middleware';

// Always return this message regardless of whether the email exists.
// This prevents attackers from discovering which emails are registered.
const SUCCESS_MSG =
  'If an account with that email exists, a password reset link has been sent. Check your inbox.';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return validationError('Request body must be valid JSON');
    }

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid email';
      return validationError(message);
    }

    const { email } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    // No user or unverified — return generic success without doing anything
    if (!user || !user.isEmailVerified) {
      return Response.json({ message: SUCCESS_MSG });
    }

    // Generate a one-time reset token, valid for 1 hour
    const resetToken = uuidv4();
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Awaited on purpose — see the comment in auth/register/route.ts. A detached
    // "fire-and-forget" send can be killed by the serverless runtime before it
    // actually leaves the server once the response below has been returned.
    try {
      await sendPasswordResetEmail(email, resetToken);
      
      // DX Improvement: Log the reset link in development mode
      if (process.env.NODE_ENV === 'development') {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        console.log('\n======================================================');
        console.log('🔑 [DEV] Password Reset Link:');
        console.log(`${appUrl}/reset-password?token=${resetToken}`);
        console.log('======================================================\n');
      }
    } catch (err: unknown) {
      console.error('[forgot-password] Failed to send reset email:', err);
      // Still return the generic success message — we never reveal to the
      // caller whether the email exists or whether sending succeeded.
    }

    return Response.json({ message: SUCCESS_MSG });
  } catch (err) {
    return serverError(err, 'auth/forgot-password');
  }
}
