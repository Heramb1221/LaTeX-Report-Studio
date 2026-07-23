import nodemailer from 'nodemailer';
import { getAppUrl } from '@/lib/config/url';

// ─── Transport singleton ─────────────────────────────────────────────────────
// Create once and reuse across requests. Nodemailer handles connection pooling.

function createTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      'GMAIL_USER and GMAIL_APP_PASSWORD must be set. ' +
      'Generate an App Password at: myaccount.google.com → Security → App Passwords'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

// Lazy singleton — only created when first email is sent
let _transport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport() {
  if (!_transport) {
    _transport = createTransport();
  }
  return _transport;
}

// ─── Shared email HTML wrapper ───────────────────────────────────────────────

function emailWrapper(body: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
    </head>
    <body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:32px;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;
                  padding:32px;border:1px solid #e2e8f0;">
        <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px;">
          LaTeX Report Studio
        </h1>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
        ${body}
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 16px;" />
        <p style="font-size:12px;color:#94a3b8;margin:0;">
          If you did not request this email, you can safely ignore it.
        </p>
      </div>
    </body>
    </html>
  `;
}

function primaryButton(url: string, label: string): string {
  return `
    <a href="${url}"
       style="display:inline-block;background:#1d4ed8;color:#fff;font-weight:600;
              font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;
              margin:16px 0;">
      ${label}
    </a>
    <p style="font-size:12px;color:#64748b;margin:8px 0 0;">
      Or copy this link:<br />
      <a href="${url}" style="color:#1d4ed8;word-break:break-all;">${url}</a>
    </p>
  `;
}

// ─── Email senders ───────────────────────────────────────────────────────────

/**
 * Sends an email verification link.
 * Called after a user registers.
 * Token expires in 24 hours (enforced in the DB, not here).
 */
export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const appUrl = getAppUrl();
  const url = `${appUrl}/verify-email?token=${token}`;

  const html = emailWrapper(`
    <h2 style="font-size:18px;color:#0f172a;margin:0 0 8px;">Verify your email</h2>
    <p style="color:#475569;margin:0 0 4px;">
      Thanks for signing up. Click below to verify your email address.
      This link expires in <strong>24 hours</strong>.
    </p>
    ${primaryButton(url, 'Verify Email')}
  `);

  await getTransport().sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your LaTeX Report Studio account',
    html,
  });
}

/**
 * Sends a password reset link.
 * Token expires in 1 hour (enforced in the DB, not here).
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const appUrl = getAppUrl();
  const url = `${appUrl}/reset-password?token=${token}`;

  const html = emailWrapper(`
    <h2 style="font-size:18px;color:#0f172a;margin:0 0 8px;">Reset your password</h2>
    <p style="color:#475569;margin:0 0 4px;">
      We received a request to reset your password.
      Click below to choose a new one. This link expires in <strong>1 hour</strong>.
    </p>
    ${primaryButton(url, 'Reset Password')}
  `);

  await getTransport().sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your LaTeX Report Studio password',
    html,
  });
}
