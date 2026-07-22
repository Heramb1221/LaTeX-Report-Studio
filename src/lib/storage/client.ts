import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

// ─── Client singleton ──────────────────────────────────────────────────────
// Created lazily and reused across requests/warm invocations, same pattern
// as the Mongo connection cache in lib/db/mongoose.ts.

function createClient(): S3Client {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY must all be ' +
      'set to use S3 storage. See .env.example.'
    );
  }

  return new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
}

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) _client = createClient();
  return _client;
}

function getBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET_NAME must be set. See .env.example.');
  }
  return bucket;
}

/**
 * Builds the public URL for a given object key.
 * Uses AWS_S3_PUBLIC_URL_BASE if set (e.g. a CloudFront domain fronting the
 * bucket) — otherwise falls back to the bucket's regional S3 endpoint, which
 * only serves the file if the bucket policy allows public reads.
 */
function publicUrlFor(key: string): string {
  const customBase = process.env.AWS_S3_PUBLIC_URL_BASE;
  if (customBase) {
    return `${customBase.replace(/\/$/, '')}/${key}`;
  }
  const region = process.env.AWS_REGION;
  return `https://${getBucket()}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Recovers the S3 object key from a URL previously returned by uploadFile().
 * Handles both the plain regional-endpoint form and a custom public base
 * (e.g. CloudFront), since either could be stored in the DB depending on
 * how AWS_S3_PUBLIC_URL_BASE was configured at upload time.
 */
function keyFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    const key = decodeURIComponent(pathname.replace(/^\//, ''));
    return key || null;
  } catch {
    return null;
  }
}

/**
 * Upload a file to S3.
 * @param key     Storage key (e.g. "images/projectId/uuid-photo.png")
 * @param body    File content as Buffer or Uint8Array
 * @param mime    MIME type, e.g. "image/png"
 * @returns       Public URL for the uploaded file
 *
 * NOTE: this relies on the bucket's *bucket policy* to grant public
 * s3:GetObject access — it does not set a per-object ACL, since most buckets
 * created after April 2023 have ACLs disabled by default (AWS's current
 * default: "Bucket owner enforced"). See the README for the bucket policy
 * to attach.
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  mime: string
): Promise<string> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: Buffer.from(body),
      ContentType: mime,
    })
  );
  return publicUrlFor(key);
}

/**
 * Delete a file from S3.
 * @param url  Public URL of the file to delete (as returned by uploadFile)
 */
export async function deleteFile(url: string): Promise<void> {
  if (!url) return;
  const key = keyFromUrl(url);
  if (!key) return;

  await getClient().send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: key })
  );
}

/**
 * Download a file from S3 as a Buffer.
 * Used during project export to bundle images into the zip.
 * @param url  Public URL to retrieve
 */
export async function getFileBuffer(url: string): Promise<Buffer> {
  if (!url) {
    throw new Error('Cannot fetch file buffer: URL is missing');
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file from S3: ${url} (status: ${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
