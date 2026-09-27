import { NextRequest, NextResponse } from "next/server";
import { paddle } from "@/lib/paddle";
import { getSubscription } from "@/lib/billing";

// Paddle 고객 포털(해지, 결제 수단 변경, 영수증)로 보냄. 세션 URL 은 1회성, 내 워크스페이스의 customer_id 로만 발급
export async function GET(req: NextRequest) {
  const workspaceId = req.cookies.get("nm_ws")?.value;
  if (!workspaceId) return NextResponse.redirect(new URL("/", req.url));
  const sub = await getSubscription(workspaceId).catch(() => null);
  if (!sub) return NextResponse.redirect(new URL("/pricing", req.url));
  try {
    const session = await paddle().customerPortalSessions.create(sub.customer_id, [sub.subscription_id]);
    return NextResponse.redirect(session.urls.general.overview);
  } catch (e) {
    console.error("portal session failed:", e);
    return NextResponse.redirect(new URL("/pricing?portal=error", req.url));
  }
}
