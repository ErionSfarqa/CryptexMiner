import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ENTITLEMENT_COOKIE_NAME, verifyEntitlementToken } from "@/lib/entitlement";

const installerMap = {
  windows: {
    path: resolve(process.cwd(), "apps/web/private-downloads/Cryptex-Installer-Windows.exe"),
    filename: "Cryptex-Installer-Windows.exe",
    contentType: "application/vnd.microsoft.portable-executable",
  },
  macos: {
    path: resolve(process.cwd(), "apps/web/private-downloads/Cryptex-Installer-macOS.dmg"),
    filename: "Cryptex-Installer-macOS.dmg",
    contentType: "application/x-apple-diskimage",
  },
} as const;

export async function GET(
  _request: Request,
  context: { params: Promise<{ target: keyof typeof installerMap | string }> },
) {
  const cookieStore = await cookies();
  const entitlementToken = cookieStore.get(ENTITLEMENT_COOKIE_NAME)?.value;
  const entitlement = verifyEntitlementToken(entitlementToken);

  if (!entitlement) {
    return NextResponse.json({ error: "Payment entitlement required." }, { status: 401 });
  }

  const { target } = await context.params;
  if (!target || !(target in installerMap)) {
    return NextResponse.json({ error: "Installer target not found." }, { status: 404 });
  }

  const installer = installerMap[target as keyof typeof installerMap];

  try {
    const file = await readFile(installer.path);
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": installer.contentType,
        "Content-Disposition": `attachment; filename="${installer.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Installer unavailable." }, { status: 404 });
  }
}

