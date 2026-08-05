import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin}/api/auth/google/callback`;
  if (!clientId) return NextResponse.redirect(new URL("/account/login?error=google_not_configured", request.url));
  const state = crypto.randomBytes(24).toString("base64url");
  (await cookies()).set("google_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/auth/google", maxAge: 600 });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId); url.searchParams.set("redirect_uri", redirectUri); url.searchParams.set("response_type", "code"); url.searchParams.set("scope", "openid email profile"); url.searchParams.set("state", state); url.searchParams.set("access_type", "online");
  return NextResponse.redirect(url);
}
