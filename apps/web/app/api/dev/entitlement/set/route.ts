import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isDevQaModeEnabled } from "@/lib/dev-qa";
import { createEntitlementToken, ENTITLEMENT_COOKIE_NAME, ENTITLEMENT_MAX_AGE } from "@/lib/entitlement";

interface SetBody {
  paid?: boolean;
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

export async function POST(request: Request) {
  if (!isDevQaModeEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const body = (await request.json().catch(() => ({}))) as SetBody;
  if (!body.paid) {
    return NextResponse.json(
      { paid: false, error: "Send { paid: true } to simulate entitlement." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  let token: string;
  try {
    token = createEntitlementToken({
      orderId: `qa-${Date.now()}`,
      source: "gateway-token",
    });
  } catch {
    return NextResponse.json(
      { paid: false, error: "ENTITLEMENT_SECRET is not configured for QA mode." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set({ ...entitlementCookieConfig(), value: token });
  return NextResponse.json({ paid: true, qa: true }, { headers: { "Cache-Control": "no-store" } });
}

