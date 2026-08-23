import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/notion";
import { encrypt } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = req.cookies.get("nm_oauth_state")?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/?error=${encodeURIComponent(reason)}`, url.origin));

  if (url.searchParams.get("error")) return fail("access_denied");
  if (!code || !state || !savedState || state !== savedState) return fail("invalid_state");

  try {
    const token = await exchangeCode(code);
    const res = NextResponse.redirect(new URL("/", url.origin));
    res.cookies.delete("nm_oauth_state");
    res.cookies.set("nm_token", encrypt(token.access_token), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    if (token.workspace_name) {
      res.cookies.set("nm_workspace", token.workspace_name, {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }
    return res;
  } catch {
    return fail("token_exchange_failed");
  }
}
