import { supabaseAdmin } from "./supabase";
import { planFromStatus } from "./billing";
import { PRICE_IDS } from "./paddle";
import { PRO_PRICE } from "./pricing";

/**
 * 이용 지표 기록과 집계 — 관리자 대시보드(/admin) 전용.
 *
 * 기록 두 곳
 * - 노션 로그인(OAuth 콜백): workspaces 에 첫 접속(= 가입)과 마지막 접속
 * - 그래프 첫 배치(/api/graph, cursor 없음): workspace_visits 에 (워크스페이스, 날짜) 한 줄 → 일별 활성 이용자
 *
 * 날짜는 모두 UTC 기준. 기록 실패는 호출 쪽에서 삼킨다 — 지표가 로그인이나 그래프를 막으면 안 된다.
 */

const todayUtc = () => new Date().toISOString().slice(0, 10);

export async function touchWorkspace(workspaceId: string, workspaceName: string | undefined) {
  const now = new Date().toISOString();
  // 이미 있으면 first_seen_at 은 그대로(ignoreDuplicates 가 아니라 컬럼을 안 넘김), 이름과 마지막 접속만 갱신
  const { error } = await supabaseAdmin()
    .from("workspaces")
    .upsert({ workspace_id: workspaceId, workspace_name: workspaceName ?? null, last_seen_at: now }, { onConflict: "workspace_id" });
  if (error) throw new Error(`workspaces upsert failed: ${error.message}`);
}

export async function recordVisit(workspaceId: string) {
  const day = todayUtc();
  const sb = supabaseAdmin();
  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    sb.from("workspace_visits").upsert({ workspace_id: workspaceId, day }, { onConflict: "workspace_id,day", ignoreDuplicates: true }),
    sb.from("workspaces").update({ last_seen_at: new Date().toISOString() }).eq("workspace_id", workspaceId),
  ]);
  if (e1 || e2) throw new Error(`visit record failed: ${(e1 ?? e2)!.message}`);
}

// ---------- 집계 ----------

export interface DayPoint {
  day: string; // YYYY-MM-DD (UTC)
  value: number;
}

export interface AdminStats {
  days: number;
  since: string;
  totals: {
    workspaces: number;
    newInRange: number;
    activeInRange: number;
    pro: number;
    monthly: number;
    yearly: number;
    /** 월 환산 매출(USD). 월간은 월 요금, 연간은 연 요금 ÷ 12 */
    mrr: number;
  };
  signups: DayPoint[];
  /** 날짜별 누적 가입자 — 범위 이전 가입자를 바닥으로 깔고 일별 가입을 더해 감 */
  cumulativeWorkspaces: DayPoint[];
  activeUsers: DayPoint[];
  subscriptionStatus: { status: string; count: number }[];
  cancellationReasons: { reason: string; count: number }[];
  recentWorkspaces: { name: string; firstSeen: string; lastSeen: string; plan: "free" | "pro" }[];
}

/** 범위 안의 모든 날짜를 0 으로 채운 뒤 집계를 얹는다 — 빈 날이 그래프에서 사라지지 않게 */
function fillDays(since: string, days: number, counts: Map<string, number>): DayPoint[] {
  const out: DayPoint[] = [];
  const d = new Date(`${since}T00:00:00Z`);
  for (let i = 0; i < days; i++) {
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, value: counts.get(key) ?? 0 });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function countBy<T>(rows: T[], key: (row: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

export async function getAdminStats(days: number): Promise<AdminStats> {
  const sb = supabaseAdmin();
  const sinceDate = new Date();
  sinceDate.setUTCDate(sinceDate.getUTCDate() - (days - 1));
  const since = sinceDate.toISOString().slice(0, 10);

  const [ws, newWs, visits, subs, conns, feedback] = await Promise.all([
    sb.from("workspaces").select("workspace_id, workspace_name, first_seen_at, last_seen_at").order("first_seen_at", { ascending: false }),
    sb.from("workspaces").select("first_seen_at").gte("first_seen_at", `${since}T00:00:00Z`),
    sb.from("workspace_visits").select("workspace_id, day").gte("day", since),
    sb.from("subscriptions").select("user_id, status, price_id"),
    sb.from("notion_connections").select("user_id, workspace_id"),
    sb.from("cancellation_feedback").select("reason"),
  ]);
  for (const r of [ws, newWs, visits, subs, conns, feedback]) {
    if (r.error) throw new Error(`admin stats read failed: ${r.error.message}`);
  }

  type Ws = { workspace_id: string; workspace_name: string | null; first_seen_at: string; last_seen_at: string };
  type Visit = { workspace_id: string; day: string };
  type Sub = { user_id: string; status: string; price_id: string | null };
  type Conn = { user_id: string; workspace_id: string };
  const wsRows = (ws.data ?? []) as Ws[];
  const visitRows = (visits.data ?? []) as Visit[];
  const subRows = (subs.data ?? []) as Sub[];

  const proSubs = subRows.filter((s) => planFromStatus(s.status) === "pro");
  const monthly = proSubs.filter((s) => s.price_id === PRICE_IDS.monthly).length;
  const yearly = proSubs.filter((s) => s.price_id === PRICE_IDS.yearly).length;
  // 구독은 계정에 걸려 있다 — 화면은 워크스페이스 단위라 연결 테이블로 이어 준다
  const wsByUser = new Map(((conns.data ?? []) as Conn[]).map((c) => [c.user_id, c.workspace_id]));
  const proIds = new Set(proSubs.map((s) => wsByUser.get(s.user_id)).filter(Boolean) as string[]);

  const signups = fillDays(since, days, countBy((newWs.data ?? []) as { first_seen_at: string }[], (r) => r.first_seen_at.slice(0, 10)));
  let running = wsRows.filter((w) => w.first_seen_at.slice(0, 10) < since).length;
  const cumulativeWorkspaces = signups.map((p) => ({ day: p.day, value: (running += p.value) }));

  return {
    days,
    since,
    totals: {
      workspaces: wsRows.length,
      newInRange: (newWs.data ?? []).length,
      activeInRange: new Set(visitRows.map((v) => v.workspace_id)).size,
      pro: proSubs.length,
      monthly,
      yearly,
      mrr: Math.round((monthly * PRO_PRICE.monthly + (yearly * PRO_PRICE.yearly) / 12) * 100) / 100,
    },
    signups,
    cumulativeWorkspaces,
    activeUsers: fillDays(since, days, countBy(visitRows, (v) => v.day)),
    subscriptionStatus: [...countBy(subRows, (s) => s.status)].map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count),
    cancellationReasons: [...countBy((feedback.data ?? []) as { reason: string | null }[], (r) => r.reason ?? "(no reason)")]
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
    recentWorkspaces: wsRows.slice(0, 20).map((w) => ({
      name: w.workspace_name ?? w.workspace_id.slice(0, 8),
      firstSeen: w.first_seen_at,
      lastSeen: w.last_seen_at,
      plan: proIds.has(w.workspace_id) ? "pro" : "free",
    })),
  };
}
