import crypto from 'crypto';

// ─── Constants ───────────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;   // bytes
const TAG_LENGTH = 16;  // bytes — GCM auth tag

/**
 * The ENCRYPTION_KEY env var must be a 64-character hex string
 * representing 32 bytes (256 bits).
 *
 * Generate one with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(hex, 'hex');
}

// ─── Encrypt ─────────────────────────────────────────────────────────────────

/**
 * Encrypts a plaintext string using AES-256-GCM.
 *
 * Output format (all hex, colon-separated):
 *   iv:authTag:ciphertext
 *
 * Each encryption uses a unique random IV, so the same input
 * produces a different output every time.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    tag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

// ─── Decrypt ─────────────────────────────────────────────────────────────────

/**
 * Decrypts a value produced by `encrypt()`.
 * Throws if the ciphertext has been tampered with (GCM integrity check).
 */
export function decrypt(encryptedValue: string): string {
  const key = getKey();
  const parts = encryptedValue.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format');
  }

  const [ivHex, tagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  if (tag.length !== TAG_LENGTH) {
    throw new Error('Invalid auth tag length');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}
