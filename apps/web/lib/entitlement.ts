import { createHmac, timingSafeEqual } from "node:crypto";

const DEV_FALLBACK_SECRET = "cryptex-dev-entitlement-secret";
const ENTITLEMENT_SECRET =
  process.env.ENTITLEMENT_SECRET ?? (process.env.NODE_ENV === "development" ? DEV_FALLBACK_SECRET : null);

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

interface EntitlementPayload {
  orderId: string;
  source: "paypal-order" | "gateway-token";
  iat: number;
  exp: number;
}

function sign(payloadSegment: string) {
  if (!ENTITLEMENT_SECRET) {
    return null;
  }

  return createHmac("sha256", ENTITLEMENT_SECRET).update(payloadSegment).digest("base64url");
}

export function createEntitlementToken(params: { orderId: string; source: EntitlementPayload["source"] }) {
  const now = Math.floor(Date.now() / 1000);
  const payload: EntitlementPayload = {
    orderId: params.orderId,
    source: params.source,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const payloadSegment = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  const signature = sign(payloadSegment);
  if (!signature) {
    throw new Error("ENTITLEMENT_SECRET is not configured.");
  }

  return `${payloadSegment}.${signature}`;
}

export function verifyEntitlementToken(token: string | undefined | null): EntitlementPayload | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const payloadSegment = parts[0];
  const providedSignature = parts[1];
  const expectedSignature = sign(payloadSegment);
  if (!expectedSignature) {
    return null;
  }

  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
  const providedBuffer = Buffer.from(providedSignature, "utf-8");
  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf-8")) as EntitlementPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload?.orderId || !payload.exp || payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export const ENTITLEMENT_COOKIE_NAME = "cryptex_entitlement";
export const ENTITLEMENT_MAX_AGE = TOKEN_TTL_SECONDS;
