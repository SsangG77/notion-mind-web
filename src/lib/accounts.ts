import { supabaseAdmin } from "./supabase";
import { decrypt, encrypt } from "./crypto";
import type { TokenResponse } from "./notion";

/**
 * 자체 계정(구글 로그인)과 거기 매달린 노션 연결.
 *
 * 노션 토큰을 서버에 둬야 기기를 옮겨도 노션 화면을 다시 안 거친다.
 * 평문으로 두면 DB 가 뚫렸을 때 남의 워크스페이스가 통째로 열리므로 AES-GCM 으로 봉인해서 넣는다
 * (키는 TOKEN_ENCRYPTION_KEY, 쿠키 봉인과 같은 키).
 */
export interface NotionConnection {
  workspaceId: string;
  workspaceName: string | null;
  accessToken: string;
  refreshToken: string | null;
}

export async function upsertUser(id: string, email: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("app_users")
    .upsert({ id, email, last_seen_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw new Error(`app_users upsert failed: ${error.message}`);
}

/**
 * 연결 저장. `mode: "refresh"` 는 **이미 있는 행만 갱신**한다.
 *
 * ⚠️ 갱신 경로를 upsert 로 두면 안 된다 — 토큰 갱신이 도는 동안 사용자가 연결을 해제하면, 뒤늦게
 * 끝난 갱신이 삭제된 행을 다시 **삽입**해 해제가 취소된다. 처리방침은 해제 시 토큰을 즉시 지운다고
 * 약속하므로 되살아나면 안 된다(보안 감사 run-1: 노션이 만료되는 액세스 토큰을 발급하지 않아 지금은
 * 그 경로에 닿지 않지만, 공급자 정책이 바뀌면 열린다).
 */
export async function saveConnection(
  userId: string,
  token: TokenResponse,
  mode: "connect" | "refresh" = "connect",
): Promise<void> {
  const row = {
    workspace_id: token.workspace_id,
    workspace_name: token.workspace_name ?? null,
    access_token: encrypt(token.access_token, "notion-token"),
    refresh_token: token.refresh_token ? encrypt(token.refresh_token, "notion-token") : null,
    updated_at: new Date().toISOString(),
  };
  const q = supabaseAdmin().from("notion_connections");
  const { error } =
    mode === "refresh"
      ? await q.update(row).eq("user_id", userId) // 행이 없으면 아무것도 안 바뀐다
      : await q.upsert({ user_id: userId, ...row }, { onConflict: "user_id" });
  if (error) throw new Error(`notion_connections ${mode} failed: ${error.message}`);
}

export async function getConnection(userId: string): Promise<NotionConnection | null> {
  const { data, error } = await supabaseAdmin()
    .from("notion_connections")
    .select("workspace_id, workspace_name, access_token, refresh_token")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`notion_connections read failed: ${error.message}`);
  if (!data) return null;
  const row = data as {
    workspace_id: string;
    workspace_name: string | null;
    access_token: string;
    refresh_token: string | null;
  };
  return {
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    // legacy: 옛 형식으로 저장된 토큰도 읽는다 — 다음 저장 때 새 형식으로 바뀐다
    accessToken: decrypt(row.access_token, "notion-token", { legacy: true }),
    refreshToken: row.refresh_token
      ? decrypt(row.refresh_token, "notion-token", { legacy: true })
      : null,
  };
}

/** 노션 연결만 끊는다 — 계정은 남는다(다시 연결하면 그대로 쓴다) */
export async function deleteConnection(userId: string): Promise<void> {
  const { error } = await supabaseAdmin().from("notion_connections").delete().eq("user_id", userId);
  if (error) throw new Error(`notion_connections delete failed: ${error.message}`);
}
