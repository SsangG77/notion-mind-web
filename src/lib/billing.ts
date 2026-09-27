import { supabaseAdmin } from "./supabase";

// 요금제 판정 — subscriptions 테이블 한 행이 곧 진실. 웹훅이 갱신, 여기서는 읽기만.
export type Plan = "free" | "pro";

export interface SubscriptionRow {
  workspace_id: string;
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

export async function getSubscription(workspaceId: string): Promise<SubscriptionRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("subscriptions")
    .select("workspace_id, customer_id, subscription_id, status, price_id, current_period_end")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw new Error(`subscriptions read failed: ${error.message}`);
  return (data as SubscriptionRow | null) ?? null;
}

/** 워크스페이스 요금제. Supabase 미설정(로컬 등)이면 free 로 폴백 — 결제 장애가 그래프를 막으면 안 됨 */
export async function getPlan(workspaceId: string | undefined): Promise<Plan> {
  if (!workspaceId) return "free";
  try {
    return planFromStatus((await getSubscription(workspaceId))?.status);
  } catch (e) {
    console.error("getPlan fallback to free:", e);
    return "free";
  }
}

export async function upsertSubscription(row: SubscriptionRow) {
  const { error } = await supabaseAdmin()
    .from("subscriptions")
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "workspace_id" });
  if (error) throw new Error(`subscriptions upsert failed: ${error.message}`);
}

// ---------- Pro 영구 설정 (숨김·핀) ----------

export interface WorkspaceSettings {
  hidden: string[];
  pinned: Record<string, { x: number; y: number }>;
}

export const EMPTY_SETTINGS: WorkspaceSettings = { hidden: [], pinned: {} };

export async function getWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings> {
  const { data, error } = await supabaseAdmin()
    .from("workspace_settings")
    .select("hidden, pinned")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw new Error(`workspace_settings read failed: ${error.message}`);
  return (data as WorkspaceSettings | null) ?? EMPTY_SETTINGS;
}

export async function putWorkspaceSettings(workspaceId: string, s: WorkspaceSettings) {
  const { error } = await supabaseAdmin()
    .from("workspace_settings")
    .upsert({ workspace_id: workspaceId, ...s, updated_at: new Date().toISOString() }, { onConflict: "workspace_id" });
  if (error) throw new Error(`workspace_settings upsert failed: ${error.message}`);
}
