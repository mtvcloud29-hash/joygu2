import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "anonymous";
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/") && request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
    if (origin && origin !== request.nextUrl.origin && origin !== configuredOrigin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    const limit = pathname.startsWith("/api/auth/") ? 12 : pathname.startsWith("/api/orders") || pathname.startsWith("/api/razorpay") ? 8 : 30;
    const result = checkRateLimit(`${clientKey(request)}:${pathname}`, limit, 60_000);
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
    if (!result.allowed) return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429, headers: { "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)) } });
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self https://checkout.razorpay.com)");
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
