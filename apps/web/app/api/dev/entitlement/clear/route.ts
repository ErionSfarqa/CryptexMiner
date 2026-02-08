import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isDevQaModeEnabled } from "@/lib/dev-qa";
import { ENTITLEMENT_COOKIE_NAME, ENTITLEMENT_MAX_AGE } from "@/lib/entitlement";

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

export async function POST() {
  if (!isDevQaModeEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const cookieStore = await cookies();
  cookieStore.set({ ...entitlementCookieConfig(), value: "", maxAge: 0 });
  return NextResponse.json({ paid: false, qa: true }, { headers: { "Cache-Control": "no-store" } });
}

