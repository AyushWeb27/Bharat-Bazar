import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
export const ADMIN_PROFILE_BUCKET_NAME =
  process.env.AWS_ADMIN_PROFILE_BUCKET_NAME || "admin-profile-images";
export const CATEGORY_IMAGE_BUCKET_NAME =
  process.env.AWS_CATEGORY_IMAGES_BUCKET_NAME || "category-images";
export const SUBCATEGORY_IMAGE_BUCKET_NAME =
  process.env.AWS_SUBCATEGORIES_IMAGES_BUCKET_NAME || "subcategories-images";
export const BRAND_IMAGE_BUCKET_NAME =
  process.env.AWS_BRANDS_IMAGES_BUCKET_NAME || "brands-images";
export const PRODUCT_MEDIA_BUCKET_NAME =
  process.env.AWS_PRODUCTS_MEDIA_BUCKET_NAME || "product-main-image-video";
export const BANNERS_BUCKET_NAME = process.env.AWS_BANNERS_BUCKET_NAME || "banners";
export const MAX_PRODUCT_GALLERY_INDEX = 10000;

export async function saveBannerImage(bannerId: number, body: Uint8Array, contentType: string) {
  const { bucket, client } = getProfileStorageConfig(BANNERS_BUCKET_NAME);
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: `banners/${bannerId}/image`,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=300",
  }));
}

export async function saveBannerProductImage(bannerId: number, body: Uint8Array, contentType: string) {
  const { bucket, client } = getProfileStorageConfig(BANNERS_BUCKET_NAME);
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: `banners/${bannerId}/product-image`,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=300",
  }));
}

export async function loadBannerImage(bannerId: number) {
  const { bucket, client } = getProfileStorageConfig(BANNERS_BUCKET_NAME);
  return client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: `banners/${bannerId}/image`,
  }));
}

export async function loadBannerProductImage(bannerId: number) {
  const { bucket, client } = getProfileStorageConfig(BANNERS_BUCKET_NAME);
  return client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: `banners/${bannerId}/product-image`,
  }));
}

export async function deleteBannerImage(bannerId: number) {
  const { bucket, client } = getProfileStorageConfig(BANNERS_BUCKET_NAME);
  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: `banners/${bannerId}/image`,
  }));
}

export async function deleteBannerProductImage(bannerId: number) {
  const { bucket, client } = getProfileStorageConfig(BANNERS_BUCKET_NAME);
  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: `banners/${bannerId}/product-image`,
  }));
}

export type ProductMediaKind = "main-image" | "gallery-image" | "video";

function getProductMediaKey(productId: number, kind: ProductMediaKind, index?: number) {
  if (kind === "gallery-image") {
    if (!Number.isSafeInteger(index) || (index ?? -1) < 0 || (index ?? MAX_PRODUCT_GALLERY_INDEX + 1) > MAX_PRODUCT_GALLERY_INDEX) {
      throw new Error("A valid gallery image index is required.");
    }
    return `products/${productId}/gallery-${index}`;
  }
  if (kind === "video") return `products/${productId}/video`;
  return `products/${productId}/main-image`;
}

export async function saveProductMedia(
  productId: number,
  kind: ProductMediaKind,
  body: Uint8Array,
  contentType: string,
  index?: number
) {
  const { bucket, client } = getProfileStorageConfig(PRODUCT_MEDIA_BUCKET_NAME);
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: getProductMediaKey(productId, kind, index),
    Body: body,
    ContentType: contentType,
    CacheControl: "private, max-age=300",
  }));
}

export async function loadProductMedia(
  productId: number,
  kind: ProductMediaKind,
  index?: number
) {
  const { bucket, client } = getProfileStorageConfig(PRODUCT_MEDIA_BUCKET_NAME);
  return client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: getProductMediaKey(productId, kind, index),
  }));
}

export async function deleteProductMedia(
  productId: number,
  kind: ProductMediaKind,
  index?: number
) {
  const { bucket, client } = getProfileStorageConfig(PRODUCT_MEDIA_BUCKET_NAME);
  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: getProductMediaKey(productId, kind, index),
  }));
}

export function getProfileStorageConfig(bucketName = process.env.AWS_BUCKET_NAME) {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  if (!endpoint || !accessKeyId || !secretAccessKey || !region || !bucketName) {
    const missing = [
      !endpoint && "AWS_ENDPOINT_URL_S3",
      !accessKeyId && "AWS_ACCESS_KEY_ID",
      !secretAccessKey && "AWS_SECRET_ACCESS_KEY",
      !region && "AWS_REGION",
      !bucketName && "AWS_BUCKET_NAME",
    ].filter((name): name is string => Boolean(name));
    throw new Error(`Missing profile storage configuration: ${missing.join(", ")}`);
  }

  const parsedEndpoint = new URL(endpoint);
  if (parsedEndpoint.protocol !== "https:") {
    throw new Error("Profile storage endpoint must use HTTPS.");
  }

  return {
    bucket: bucketName,
    client: new S3Client({
      endpoint: parsedEndpoint.toString(),
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    }),
  };
}

export function getProfileImageKey(userId: number) {
  return `users/${userId}/profile-image`;
}

export function detectProfileImageType(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 &&
    bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a &&
    bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" &&
    String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export const SUPPORTED_BANNER_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/avif",
]);

export function detectBannerImageType(bytes: Uint8Array): string | null {
  const commonType = detectProfileImageType(bytes);
  if (commonType) return commonType;
  if (
    bytes.length >= 6 &&
    (String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5]) === "GIF87a" ||
      String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5]) === "GIF89a")
  ) return "image/gif";
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) return "image/bmp";
  if (
    bytes.length >= 8 &&
    ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
      (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a))
  ) return "image/tiff";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === "ftyp" &&
    ["avif", "avis"].includes(String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]))
  ) return "image/avif";
  return null;
}

export async function saveProfileImage(userId: number, body: Uint8Array, contentType: string) {
  const { bucket, client } = getProfileStorageConfig();
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: getProfileImageKey(userId),
    Body: body,
    ContentType: contentType,
    CacheControl: "private, max-age=300",
  }));
}

export async function loadProfileImage(userId: number) {
  const { bucket, client } = getProfileStorageConfig();
  return client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: getProfileImageKey(userId),
  }));
}

export async function saveAdminProfileImage(adminId: number, body: Uint8Array, contentType: string) {
  const { bucket, client } = getProfileStorageConfig(ADMIN_PROFILE_BUCKET_NAME);
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: `admins/${adminId}/profile-image`,
    Body: body,
    ContentType: contentType,
    CacheControl: "private, max-age=300",
  }));
}

export async function loadAdminProfileImage(adminId: number) {
  const { bucket, client } = getProfileStorageConfig(ADMIN_PROFILE_BUCKET_NAME);
  return client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: `admins/${adminId}/profile-image`,
  }));
}

export async function saveCategoryImage(categoryId: number, body: Uint8Array, contentType: string) {
  const { bucket, client } = getProfileStorageConfig(CATEGORY_IMAGE_BUCKET_NAME);
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: `categories/${categoryId}/image`,
    Body: body,
    ContentType: contentType,
    CacheControl: "private, max-age=300",
  }));
}

export async function loadCategoryImage(categoryId: number) {
  const { bucket, client } = getProfileStorageConfig(CATEGORY_IMAGE_BUCKET_NAME);
  return client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: `categories/${categoryId}/image`,
  }));
}

export async function deleteCategoryImage(categoryId: number) {
  const { bucket, client } = getProfileStorageConfig(CATEGORY_IMAGE_BUCKET_NAME);
  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: `categories/${categoryId}/image`,
  }));
}

export async function saveSubcategoryImage(subcategoryId: number, body: Uint8Array, contentType: string) {
  const { bucket, client } = getProfileStorageConfig(SUBCATEGORY_IMAGE_BUCKET_NAME);
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: `subcategories/${subcategoryId}/image`,
    Body: body,
    ContentType: contentType,
    CacheControl: "private, max-age=300",
  }));
}

export async function loadSubcategoryImage(subcategoryId: number) {
  const { bucket, client } = getProfileStorageConfig(SUBCATEGORY_IMAGE_BUCKET_NAME);
  return client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: `subcategories/${subcategoryId}/image`,
  }));
}

export async function deleteSubcategoryImage(subcategoryId: number) {
  const { bucket, client } = getProfileStorageConfig(SUBCATEGORY_IMAGE_BUCKET_NAME);
  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: `subcategories/${subcategoryId}/image`,
  }));
}

export async function saveBrandImage(brandId: number, body: Uint8Array, contentType: string) {
  const { bucket, client } = getProfileStorageConfig(BRAND_IMAGE_BUCKET_NAME);
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: `brands/${brandId}/logo`,
    Body: body,
    ContentType: contentType,
    CacheControl: "private, max-age=300",
  }));
}

export async function loadBrandImage(brandId: number) {
  const { bucket, client } = getProfileStorageConfig(BRAND_IMAGE_BUCKET_NAME);
  return client.send(new GetObjectCommand({
    Bucket: bucket,
    Key: `brands/${brandId}/logo`,
  }));
}

export async function deleteBrandImage(brandId: number) {
  const { bucket, client } = getProfileStorageConfig(BRAND_IMAGE_BUCKET_NAME);
  await client.send(new DeleteObjectCommand({
    Bucket: bucket,
    Key: `brands/${brandId}/logo`,
  }));
}