import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models/User.model';
import { withAuth, serverError, notFound } from '@/lib/auth/middleware';

export async function GET(req: NextRequest): Promise<Response> {
  return withAuth(req, async (_req, { userId }) => {
    try {
      await connectDB();

      // Select only the fields we need — never return passwordHash or tokens
      const user = await User.findById(userId).select(
        '_id email isEmailVerified geminiApiKeyEncrypted createdAt'
      );

      if (!user) {
        return notFound('User');
      }

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
      return serverError(err, 'auth/me');
    }
  });
}
