import { supabaseAdmin } from "./supabase";

/**
 * 이벤트 Pro 체험 쿠폰 (`promo_coupons`, `promo_redemptions` — 스키마는 `scripts/promo-codes.sql`).
 *
 * 코드는 **공용 한 개**고 참여자마다 DM 으로 같은 값을 보낸다. 사람마다 다른 코드를 뽑던 구조를
 * 버린 이유는 운영이 번거로워서다 — 대신 1회 제한을 코드가 아니라 **계정과 워크스페이스**에 걸었다.
 *
 * 결제 없이 Pro 를 주는 길이므로 Paddle 과 아무 관계가 없다 — 구독 기록(`subscriptions`)에 넣지 않는다.
 * 넣으면 매출 집계가 오염되고, 결제 구독이 끝날 때 오는 웹훅이 체험 행을 덮어쓴다.
 * 만료는 `expires_at` 이 지나면 요금제 판정에서 자동으로 빠지는 방식 — 되돌리는 작업(cron)이 없다.
 */

/** 입력값 정리 — 대소문자, 공백, 하이픈을 흘려 넣어도 같은 값으로 본다 */
export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** 마감일이 지났는지 — 공용 코드가 이벤트 뒤에도 먹지 않게 막는 유일한 지점이라 따로 꺼내 검사한다 */
export function isClosed(closesOn: string, now: Date): boolean {
  return now.toISOString().slice(0, 10) > closesOn;
}

export type RedeemResult =
  | { ok: true; until: string }
  | { ok: false; reason: "invalid" | "closed" | "already_joined" };

/**
 * 코드 사용. ⚠️ 워크스페이스 id 는 **서버가 노션 연결에서 읽은 값**이어야 한다 —
 * `nm_ws` 쿠키는 평문이라 호출자가 남의 워크스페이스를 적어 넣고 1회 제한을 비껴갈 수 있다.
 */
export async function redeemCode(code: string, userId: string, workspaceId: string): Promise<RedeemResult> {
  const sb = supabaseAdmin();
  const { data: row, error: readErr } = await sb
    .from("promo_coupons")
    .select("days, closes_on")
    .eq("code", code)
    .maybeSingle();
  if (readErr) throw new Error(`promo_coupons read failed: ${readErr.message}`);
  if (!row) return { ok: false, reason: "invalid" };
  const coupon = row as { days: number; closes_on: string };

  // 공용 코드는 받은 사람이 남에게 넘길 수 있다 — 이벤트가 끝나면 더 안 먹게 한다
  const now = new Date();
  if (isClosed(coupon.closes_on, now)) return { ok: false, reason: "closed" };

  const expiresAt = new Date(now.getTime() + coupon.days * 86_400_000).toISOString();
  const { error } = await sb.from("promo_redemptions").insert({
    user_id: userId,
    workspace_id: workspaceId,
    code,
    redeemed_at: now.toISOString(),
    expires_at: expiresAt,
  });
  if (error) {
    // 23505 = 유니크 위반 → 이 계정이나 이 워크스페이스가 이미 썼다. DB 가 막으므로 동시 요청에도 뚫리지 않는다
    if ((error as { code?: string }).code === "23505") return { ok: false, reason: "already_joined" };
    throw new Error(`promo_redemptions insert failed: ${error.message}`);
  }
  return { ok: true, until: expiresAt };
}

/** 지금 유효한 체험 기간의 만료 시각(ISO). 없으면 null */
export async function promoUntil(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin()
    .from("promo_redemptions")
    .select("expires_at")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error(`promo_redemptions read failed: ${error.message}`);
  return (data as { expires_at: string } | null)?.expires_at ?? null;
}

export interface PromoStats {
  redeemed: number;
  /** 지금 Pro 가 살아 있는 사람 수 */
  active: number;
}

export async function getPromoStats(): Promise<PromoStats> {
  const { data, error } = await supabaseAdmin().from("promo_redemptions").select("expires_at");
  if (error) throw new Error(`promo_redemptions stats failed: ${error.message}`);
  const rows = (data ?? []) as { expires_at: string }[];
  const now = new Date().toISOString();
  return { redeemed: rows.length, active: rows.filter((r) => r.expires_at > now).length };
}
