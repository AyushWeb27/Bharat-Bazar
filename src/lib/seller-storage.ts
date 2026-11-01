import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getProfileStorageConfig } from "./profile-storage";

export const SELLER_BUCKET_NAME = "seller-file";
export const MAX_SELLER_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_SELLER_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export function getSellerStorageConfig() {
  return getProfileStorageConfig(SELLER_BUCKET_NAME);
}

/**
 * Ensure the "seller-file" bucket exists.
 */
export async function ensureSellerBucket() {
  const { bucket, client } = getSellerStorageConfig();
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err: any) {
    if (err?.name === "NotFound" || err?.$metadata?.httpStatusCode === 404) {
      try {
        await client.send(new CreateBucketCommand({ Bucket: bucket }));
        console.log(`✅ Bucket "${bucket}" created successfully.`);
      } catch (createErr: any) {
        console.warn(`Could not create bucket "${bucket}":`, createErr?.message);
      }
    }
  }
}

/**
 * Save arbitrary file bytes to the "seller-file" bucket
 */
export async function saveSellerFile(
  key: string,
  body: Uint8Array,
  contentType: string,
  isPublic = true
) {
  const { bucket, client } = getSellerStorageConfig();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: isPublic ? "public, max-age=86400" : "private, max-age=3600",
    })
  );
  return `/api/seller/files?key=${encodeURIComponent(key)}`;
}

/**
 * Load file object stream from the "seller-file" bucket
 */
export async function loadSellerFile(key: string) {
  const { bucket, client } = getSellerStorageConfig();
  return client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

/**
 * Delete a file from the "seller-file" bucket
 */
export async function deleteSellerFile(key: string) {
  const { bucket, client } = getSellerStorageConfig();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

/**
 * Detect MIME types for images & PDFs
 */
export function detectSellerFileType(bytes: Uint8Array): string | null {
  // PDF
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46    // F
  ) {
    return "application/pdf";
  }
  // PNG
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 &&
    bytes[2] === 0x4e && bytes[3] === 0x47
  ) {
    return "image/png";
  }
  // JPEG
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // WebP
  if (
    bytes.length >= 12 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" &&
    String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

