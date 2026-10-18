import bcrypt from "bcryptjs";
import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  "bharat-bazar-super-secret-key-2026";

export const ADMIN_COOKIE_NAME = "bharat_admin_session";
export const USER_COOKIE_NAME = "bharat_user_session";

export interface AdminSessionPayload {
  id: number;
  name: string;
  email: string;
  role: string;
  exp: number;
}

export interface UserSessionPayload {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  auth_provider?: string;
  email_verified?: boolean;
  exp: number;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

// ── ADMIN SESSIONS ──
export function createSessionToken(
  admin: { id: number; name: string; email: string; role: string },
  expiresInSeconds: number = 60 * 60 * 24 * 7 // 7 days
): string {
  const payload: AdminSessionPayload = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): AdminSessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload: AdminSessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ── CUSTOMER USER SESSIONS ──
export function createUserSessionToken(
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    auth_provider?: string;
    email_verified?: boolean;
  },
  expiresInSeconds: number = 60 * 60 * 24 * 30 // 30 days
): string {
  const payload: UserSessionPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url || "",
    auth_provider: user.auth_provider || "local",
    email_verified: Boolean(user.email_verified),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

export function verifyUserSessionToken(token: string): UserSessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload: UserSessionPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ── GOOGLE ID TOKEN VERIFICATION ──
export interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenPayload | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) {
      console.error("Google tokeninfo error status:", res.status);
      return null;
    }

    const data = await res.json();
    const expectedClientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "470811948482-mca375qbpj3pkjjmso3ranuahjqssfpt.apps.googleusercontent.com";

    // Verify audience matches client ID
    if (data.aud !== expectedClientId) {
      console.error("Google token audience mismatch:", data.aud, "vs", expectedClientId);
      return null;
    }

    return {
      sub: data.sub,
      email: data.email,
      email_verified: data.email_verified === "true" || data.email_verified === true,
      name: data.name || data.email.split("@")[0],
      picture: data.picture || "",
      given_name: data.given_name,
      family_name: data.family_name,
    };
  } catch (err) {
    console.error("Google ID token verification failed:", err);
    return null;
  }
}
