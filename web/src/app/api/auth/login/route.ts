import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAuthorizeUrl } from "@/lib/notion";

export function GET() {
  const state = randomBytes(16).toString("base64url");
  const res = NextResponse.redirect(getAuthorizeUrl(state));
  res.cookies.set("nm_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return res;
}
