import { createHmac, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";
import { URL } from "node:url";

const port = Number(process.env.PAYPAL_GATEWAY_PORT ?? 8787);
const allowedOrigin = process.env.PAYPAL_GATEWAY_CORS_ORIGIN ?? "*";

const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
const paypalApiBase = process.env.PAYPAL_API_BASE ?? "https://api-m.sandbox.paypal.com";
const tokenSecret = process.env.PAYPAL_GATEWAY_TOKEN_SECRET ?? "";

const defaultAmount = process.env.PAYPAL_PRICE_AMOUNT ?? "25.00";
const defaultCurrency = process.env.PAYPAL_PRICE_CURRENCY ?? "EUR";

const installers = {
  windows: {
    path: resolve(process.cwd(), process.env.PAYPAL_WINDOWS_INSTALLER_PATH ?? "apps/web/private-downloads/Cryptex-Installer-Windows.exe"),
    filename: "Cryptex-Installer-Windows.exe",
  },
  windowsMsi: {
    path: resolve(process.cwd(), process.env.PAYPAL_WINDOWS_MSI_PATH ?? "apps/web/private-downloads/Cryptex-Installer-Windows.msi"),
    filename: "Cryptex-Installer-Windows.msi",
  },
  macos: {
    path: resolve(process.cwd(), process.env.PAYPAL_MACOS_INSTALLER_PATH ?? "apps/web/private-downloads/Cryptex-Installer-macOS.dmg"),
    filename: "Cryptex-Installer-macOS.dmg",
  },
};

if (!paypalClientId || !paypalClientSecret) {
  console.error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required.");
}

if (!tokenSecret) {
  console.error("PAYPAL_GATEWAY_TOKEN_SECRET is required.");
}

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  response.end(JSON.stringify(payload));
}

function splitToken(token) {
  const segments = token.split(".");
  if (segments.length !== 2) {
    return null;
  }
  return {
    payload: segments[0],
    signature: segments[1],
  };
}

function signPayload(payloadSegment) {
  return createHmac("sha256", tokenSecret).update(payloadSegment).digest("base64url");
}

function issueSessionToken(session) {
  const payload = {
    ...session,
    exp: Date.now() + 1000 * 60 * 90,
  };
  const payloadSegment = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
  const signature = signPayload(payloadSegment);
  return `${payloadSegment}.${signature}`;
}

function verifySessionToken(token) {
  const parts = splitToken(token);
  if (!parts) {
    return null;
  }

  const expected = Buffer.from(signPayload(parts.payload), "utf-8");
  const provided = Buffer.from(parts.signature, "utf-8");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(parts.payload, "base64url").toString("utf-8"));
    if (!decoded?.exp || Date.now() > decoded.exp) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

async function readBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("error", rejectBody);
    request.on("end", () => {
      if (chunks.length === 0) {
        resolveBody({});
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString("utf-8");
        resolveBody(JSON.parse(raw));
      } catch {
        rejectBody(new Error("Invalid JSON body."));
      }
    });
  });
}

async function getPayPalAccessToken() {
  const response = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed (${response.status})`);
  }

  const data = await response.json();
  return data.access_token;
}

async function createPayPalOrder({ amount, currency }) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${paypalApiBase}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`PayPal order creation failed (${response.status})`);
  }

  const data = await response.json();
  return data.id;
}

async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${paypalApiBase}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`PayPal capture failed (${response.status})`);
  }

  return response.json();
}

function contentTypeForFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === ".exe") return "application/vnd.microsoft.portable-executable";
  if (ext === ".msi") return "application/x-msi";
  if (ext === ".dmg") return "application/x-apple-diskimage";
  if (ext === ".zip") return "application/zip";
  return "application/octet-stream";
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const path = requestUrl.pathname;

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    });
    response.end();
    return;
  }

  if (path === "/health") {
    writeJson(response, 200, { ok: true, service: "paypal-gateway" });
    return;
  }

  try {
    if (path === "/api/paypal/create-order" && request.method === "POST") {
      const body = await readBody(request);
      const amount = typeof body.amount === "string" ? body.amount : defaultAmount;
      const currency = typeof body.currency === "string" ? body.currency : defaultCurrency;
      const orderId = await createPayPalOrder({ amount, currency });
      writeJson(response, 200, { orderId });
      return;
    }

    if (path === "/api/paypal/capture-order" && request.method === "POST") {
      const body = await readBody(request);
      const orderId = typeof body.orderId === "string" ? body.orderId : "";
      if (!orderId) {
        writeJson(response, 400, { error: "orderId is required." });
        return;
      }

      const capture = await capturePayPalOrder(orderId);
      if (capture.status !== "COMPLETED") {
        writeJson(response, 402, { error: "Payment not completed.", status: capture.status });
        return;
      }

      const amount = capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? defaultAmount;
      const currency = capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code ?? defaultCurrency;
      const paidAt = Date.now();
      const sessionToken = issueSessionToken({
        orderId,
        amount,
        currency,
        paidAt,
      });

      writeJson(response, 200, {
        token: sessionToken,
        orderId,
        amount,
        currency,
        paidAt,
      });
      return;
    }

    if (path === "/api/paypal/verify" && request.method === "GET") {
      const token = requestUrl.searchParams.get("token") ?? "";
      const decoded = verifySessionToken(token);
      if (!decoded) {
        writeJson(response, 401, { valid: false });
        return;
      }

      writeJson(response, 200, { valid: true, session: decoded });
      return;
    }

    if (path.startsWith("/api/paypal/download/") && request.method === "GET") {
      const token = requestUrl.searchParams.get("token") ?? "";
      const decoded = verifySessionToken(token);
      if (!decoded) {
        writeJson(response, 401, { error: "Payment token required." });
        return;
      }

      const target = path.endsWith("/windows")
        ? installers.windows
        : path.endsWith("/windows-msi")
          ? installers.windowsMsi
          : path.endsWith("/macos")
            ? installers.macos
            : null;
      if (!target) {
        writeJson(response, 404, { error: "Download target not found." });
        return;
      }

      if (!existsSync(target.path)) {
        writeJson(response, 404, { error: "Installer unavailable." });
        return;
      }

      const fileSize = statSync(target.path).size;
      response.writeHead(200, {
        "Content-Type": contentTypeForFile(target.path),
        "Content-Length": String(fileSize),
        "Content-Disposition": `attachment; filename="${target.filename}"`,
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": allowedOrigin,
      });

      createReadStream(target.path).pipe(response);
      return;
    }

    writeJson(response, 404, { error: "Not found." });
  } catch (error) {
    writeJson(response, 500, {
      error: error instanceof Error ? error.message : "Unexpected gateway error.",
    });
  }
});

server.listen(port, () => {
  console.log(`[paypal-gateway] Listening on port ${port}`);
});
