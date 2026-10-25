import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM. TOKEN_ENCRYPTION_KEY = 64자 hex (openssl rand -hex 32)
function key(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("TOKEN_ENCRYPTION_KEY missing or not 64 hex chars");
  }
  return Buffer.from(hex, "hex");
}

/**
 * 봉인 용도 — GCM 의 추가 인증 데이터(AAD)로 묶는다. 키가 하나뿐이라 용도를 안 묶으면
 * 한 자리의 봉인이 다른 자리에서도 그대로 풀린다(`nm_dev` 쿠키 값을 `nm_uid` 자리에 넣는 식).
 * 게이트는 쿠키 이름까지 용도에 넣어 게이트끼리도 교환되지 않게 한다.
 */
export type Seal =
  | "session" // nm_uid
  | "notion-token" // notion_connections.access_token / refresh_token
  | "graph-cursor" // /api/graph 의 nextCursor
  | `gate:${string}`; // nm_dev, nm_admin

const V2 = "v2";

export function encrypt(plain: string, seal: Seal): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(seal, "utf8"));
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [V2, ...[iv, tag, enc].map((b) => b.toString("base64url"))].join(".");
}

/**
 * `legacy: true` 는 용도 표시가 없던 옛 봉인(점 세 토막)도 받는다. 노션 토큰과 로그인 쿠키처럼
 * **이미 발급돼 돌아다니는 값**에만 쓴다 — 거부하면 전 사용자가 다시 연결해야 한다.
 * 게이트와 커서는 다시 받으면 그만이라 옛 형식을 받지 않는다.
 */
export function decrypt(token: string, seal: Seal, opts?: { legacy?: boolean }): string {
  const parts = token.split(".");
  const versioned = parts[0] === V2;
  if (!versioned && !opts?.legacy) throw new Error("seal: unversioned token rejected");
  const body = versioned ? parts.slice(1) : parts;
  if (body.length !== 3) throw new Error("seal: malformed token");
  const [iv, tag, enc] = body.map((s) => Buffer.from(s, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  if (versioned) decipher.setAAD(Buffer.from(seal, "utf8"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
