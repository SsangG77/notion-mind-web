import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 서버 전용 Supabase 클라이언트(service_role). subscriptions 테이블은 RLS 정책 없음 → 이 키로만 접근 가능.
// 브라우저 번들에 절대 들어가면 안 됨 — lib/ 에서만 import.
// 테이블 타입 생성 안 함(테이블 1개) — 행 타입은 lib/billing.ts 에서 명시
let client: SupabaseClient | null = null;

export function supabaseAdmin() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
