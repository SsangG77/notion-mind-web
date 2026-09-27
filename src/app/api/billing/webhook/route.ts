import { NextRequest, NextResponse } from "next/server";
import { EventName, type EventEntity } from "@paddle/paddle-node-sdk";
import { paddle } from "@/lib/paddle";
import { upsertSubscription } from "@/lib/billing";

// Paddle 웹훅. 2xx 만 "전달됨" — 검증 실패든 DB 실패든 전부 500 으로 재시도 유도.
// 이벤트는 subscription.created / subscription.updated 만 구독(갱신·취소·상태 변화 전부 updated 로 옴).
export async function POST(req: NextRequest) {
  const signature = req.headers.get("paddle-signature") ?? "";
  const rawBody = await req.text(); // JSON 파싱 전 원문 — 서명은 바이트 그대로 계산됨
  const secret = process.env.PADDLE_WEBHOOK_SECRET ?? "";
  if (!signature || !rawBody) {
    return NextResponse.json({ error: "missing signature or body" }, { status: 400 });
  }

  try {
    const event = await paddle().webhooks.unmarshal(rawBody, secret, signature);
    if (event) await handle(event);
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("paddle webhook error:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

async function handle(event: EventEntity) {
  if (
    event.eventType !== EventName.SubscriptionCreated &&
    event.eventType !== EventName.SubscriptionUpdated &&
    event.eventType !== EventName.SubscriptionCanceled
  ) {
    return;
  }
  const sub = event.data;
  // 체크아웃에서 customData.workspace_id 로 넘긴 값 — 이게 우리 유저 키
  const workspaceId = (sub.customData as { workspace_id?: string } | null)?.workspace_id;
  if (!workspaceId) {
    console.error("subscription without workspace_id custom_data:", sub.id);
    return; // 우리 유저와 못 잇는 이벤트 — 재시도해도 같으니 200 으로 끝냄
  }
  // UPSERT = 같은 이벤트가 여러 번 와도 결과 동일(멱등). 순서 뒤집혀도 마지막 상태로 수렴
  await upsertSubscription({
    workspace_id: workspaceId,
    customer_id: sub.customerId,
    subscription_id: sub.id,
    status: sub.status,
    price_id: sub.items[0]?.price?.id ?? null,
    current_period_end: sub.currentBillingPeriod?.endsAt ?? null,
  });
}
