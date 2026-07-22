import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User.model';
import { validationError, serverError } from '@/lib/auth/middleware';

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token || token.trim() === '') {
      return validationError('Verification token is missing from the URL');
    }

    await connectDB();

    // Find user whose token matches AND hasn't expired
    const user = await User.findOne({
      verificationToken: token,
      verificationExpiry: { $gt: new Date() },
    });

    if (!user) {
      return Response.json(
        {
          error:
            'This verification link is invalid or has expired. ' +
            'Please register again to receive a new link.',
        },
        { status: 400 }
      );
    }

    if (user.isEmailVerified) {
      // Already verified — treat as success so clicking the link twice
      // doesn't show an error.
      return Response.json({
        message: 'Your email is already verified. You can log in.',
      });
    }

    // Mark verified and clear the one-time token
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiry = undefined;
    await user.save();

    return Response.json({
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (err) {
    return serverError(err, 'auth/verify');
  }
}
