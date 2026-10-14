const AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";
const USERINFO = "https://openidconnect.googleapis.com/v1/userinfo";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export const googleConfigured = (): boolean =>
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

/** 계정 식별만 필요하므로 범위는 이메일과 프로필로 최소화한다 */
export function getGoogleAuthorizeUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: env("GOOGLE_CLIENT_ID"),
    redirect_uri: env("GOOGLE_REDIRECT_URI"),
    response_type: "code",
    scope: "openid email",
    state,
    // 기기를 옮겨도 같은 계정으로 들어오게 — 계정이 여럿이면 고르게 한다
    prompt: "select_account",
  });
  return `${AUTH}?${p}`;
}

export interface GoogleUser {
  sub: string;
  email: string;
}

export async function exchangeGoogleCode(code: string): Promise<GoogleUser> {
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env("GOOGLE_CLIENT_ID"),
      client_secret: env("GOOGLE_CLIENT_SECRET"),
      redirect_uri: env("GOOGLE_REDIRECT_URI"),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`google token exchange failed: ${res.status} ${await res.text()}`);
  const { access_token } = (await res.json()) as { access_token: string };

  const me = await fetch(USERINFO, { headers: { Authorization: `Bearer ${access_token}` } });
  if (!me.ok) throw new Error(`google userinfo failed: ${me.status} ${await me.text()}`);
  const u = (await me.json()) as { sub?: string; email?: string };
  if (!u.sub || !u.email) throw new Error("google userinfo missing sub or email");
  // 구글 액세스 토큰은 여기서 버린다 — 우리가 쓰는 건 "누구인지" 뿐이다
  return { sub: u.sub, email: u.email };
}
