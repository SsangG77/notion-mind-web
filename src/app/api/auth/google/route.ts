import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getGoogleAuthorizeUrl, googleConfigured } from "@/lib/google";

export function GET() {
  if (!googleConfigured()) {
    return NextResponse.json({ error: "google_not_configured" }, { status: 503 });
  }
  const state = randomBytes(16).toString("base64url");
  const res = NextResponse.redirect(getGoogleAuthorizeUrl(state));
  res.cookies.set("nm_google_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return res;
}
