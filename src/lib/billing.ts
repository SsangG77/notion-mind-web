import { supabaseAdmin } from "./supabase";

// 요금제 판정 — subscriptions 테이블 한 행이 곧 진실. 웹훅이 갱신, 여기서는 읽기만.
export type Plan = "free" | "pro";

export interface SubscriptionRow {
  /** 자체 계정 id — 요금제의 기준. 워크스페이스를 바꿔도 구독이 따라온다 */
  user_id: string;
  /** 어느 워크스페이스에서 결제했는지 (참고용) */
  workspace_id: string | null;
  customer_id: string;
  subscription_id: string;
  status: string;
  price_id: string | null;
  current_period_end: string | null;
}

// past_due = Paddle 이 재시도 중. 접근은 유지하고 배너만 띄우는 게 Paddle 권장.
const PRO_STATUSES = new Set(["active", "trialing", "past_due"]);

export function planFromStatus(status: string | null | undefined): Plan {
  return status && PRO_STATUSES.has(status) ? "pro" : "free";
}

export async function getSubscription(userId: string): Promise<SubscriptionRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("subscriptions")
    .select("user_id, workspace_id, customer_id, subscription_id, status, price_id, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`subscriptions read failed: ${error.message}`);
  return (data as SubscriptionRow | null) ?? null;
}

/** 계정 요금제. Supabase 미설정(로컬 등)이면 free 로 폴백 — 결제 장애가 그래프를 막으면 안 됨 */
export async function getPlan(userId: string | undefined): Promise<Plan> {
  if (!userId) return "free";
  try {
    return planFromStatus((await getSubscription(userId))?.status);
  } catch (e) {
    console.error("getPlan fallback to free:", e);
    return "free";
  }
}

export async function upsertSubscription(row: SubscriptionRow) {
  const { error } = await supabaseAdmin()
    .from("subscriptions")
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw new Error(`subscriptions upsert failed: ${error.message}`);
}

// ---------- Pro 영구 설정 (숨김·핀) ----------

export interface WorkspaceSettings {
  hidden: string[];
  pinned: Record<string, { x: number; y: number }>;
  /** 자동 동기화 켜짐 여부 — Pro 전용 */
  autoSync: boolean;
}

export const EMPTY_SETTINGS: WorkspaceSettings = { hidden: [], pinned: {}, autoSync: false };

export async function getWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings> {
  const { data, error } = await supabaseAdmin()
    .from("workspace_settings")
    .select("hidden, pinned, auto_sync")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw new Error(`workspace_settings read failed: ${error.message}`);
  if (!data) return EMPTY_SETTINGS;
  const row = data as { hidden: string[]; pinned: WorkspaceSettings["pinned"]; auto_sync: boolean };
  return { hidden: row.hidden, pinned: row.pinned, autoSync: row.auto_sync };
}

export async function putWorkspaceSettings(workspaceId: string, s: WorkspaceSettings) {
  const { error } = await supabaseAdmin()
    .from("workspace_settings")
    .upsert(
      {
        workspace_id: workspaceId,
        hidden: s.hidden,
        pinned: s.pinned,
        auto_sync: s.autoSync,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id" },
    );
  if (error) throw new Error(`workspace_settings upsert failed: ${error.message}`);
}

// ---------- 해지 사유 ----------

/** 해지 만류 화면에서 받은 응답. 선택 사항이며 해지를 막지 않는다 */
export async function saveCancellationFeedback(userId: string, reason: string | null, detail: string | null) {
  const { error } = await supabaseAdmin()
    .from("cancellation_feedback")
    .insert({ user_id: userId, reason, detail });
  if (error) throw new Error(`cancellation_feedback insert failed: ${error.message}`);
}
