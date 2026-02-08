import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createEntitlementToken,
  ENTITLEMENT_COOKIE_NAME,
  ENTITLEMENT_MAX_AGE,
  verifyEntitlementToken,
} from "@/lib/entitlement";

interface ClaimBody {
  orderId?: string;
  gatewayToken?: string;
}

function entitlementCookieConfig() {
  return {
    name: ENTITLEMENT_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ENTITLEMENT_MAX_AGE,
  };
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiBase = process.env.PAYPAL_API_BASE ?? "https://api-m.paypal.com";

  if (!clientId || !clientSecret) {
    return null;
  }

  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { access_token?: string };
  return payload.access_token ?? null;
}

async function verifyPayPalOrder(orderId: string) {
  const apiBase = process.env.PAYPAL_API_BASE ?? "https://api-m.paypal.com";
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) {
    return false;
  }

  const response = await fetch(`${apiBase}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { status?: string };
  return payload.status === "COMPLETED";
}

async function verifyGatewayToken(gatewayToken: string) {
  const gatewayBase = process.env.NEXT_PUBLIC_PAYPAL_GATEWAY_BASE?.replace(/\/$/, "");
  if (!gatewayBase) {
    return false;
  }

  const response = await fetch(`${gatewayBase}/api/paypal/verify?token=${encodeURIComponent(gatewayToken)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { valid?: boolean; session?: { orderId?: string } };
  if (!payload.valid || !payload.session?.orderId) {
    return false;
  }

  let token: string;
  try {
    token = createEntitlementToken({
      orderId: payload.session.orderId,
      source: "gateway-token",
    });
  } catch {
    return false;
  }
  const cookieStore = await cookies();
  cookieStore.set({ ...entitlementCookieConfig(), value: token });
  return true;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ENTITLEMENT_COOKIE_NAME)?.value;
  const entitlement = verifyEntitlementToken(token);

  return NextResponse.json(
    {
      paid: Boolean(entitlement),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ClaimBody;
  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  const gatewayToken = typeof body.gatewayToken === "string" ? body.gatewayToken.trim() : "";

  if (!orderId && !gatewayToken) {
    return NextResponse.json(
      {
        paid: false,
        error:
          "Payment proof is required. Provide a PayPal order ID from return URL/receipt or a verified gateway token.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (gatewayToken) {
    const verifiedByGateway = await verifyGatewayToken(gatewayToken);
    if (verifiedByGateway) {
      return NextResponse.json({ paid: true }, { headers: { "Cache-Control": "no-store" } });
    }
  }

  if (!orderId) {
    return NextResponse.json(
      { paid: false, error: "Gateway token invalid and order ID missing." },
      { status: 402, headers: { "Cache-Control": "no-store" } },
    );
  }

  const verified = await verifyPayPalOrder(orderId);
  if (!verified) {
    return NextResponse.json(
      {
        paid: false,
        error: "Unable to verify payment status for this order. Ensure the payment is completed.",
      },
      { status: 402, headers: { "Cache-Control": "no-store" } },
    );
  }

  let token: string;
  try {
    token = createEntitlementToken({
      orderId,
      source: "paypal-order",
    });
  } catch {
    return NextResponse.json(
      {
        paid: false,
        error: "Server entitlement secret is not configured.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
  const cookieStore = await cookies();
  cookieStore.set({ ...entitlementCookieConfig(), value: token });

  return NextResponse.json({ paid: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set({ ...entitlementCookieConfig(), value: "", maxAge: 0 });
  return NextResponse.json({ paid: false }, { headers: { "Cache-Control": "no-store" } });
}
