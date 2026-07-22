import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User.model';
import { validationError, serverError } from '@/lib/auth/middleware';

// Minimal schema — the UI already validates with the full resetPasswordSchema.
// We only need token + password here; confirmPassword is a UI concern.
const resetSchema = z.object({
  token: z.string().uuid('Invalid reset token format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(req: NextRequest): Promise<Response> {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return validationError('Request body must be valid JSON');
    }

    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid request';
      return validationError(message);
    }

    const { token, password } = parsed.data;

    await connectDB();

    // Find the user whose reset token matches and hasn't expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return Response.json(
        {
          error:
            'This reset link is invalid or has expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Hash the new password and clear the reset token
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return Response.json({
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    return serverError(err, 'auth/reset-password');
  }
}
