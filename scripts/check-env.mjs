// .env 의 키 값이 "모양"에 맞는지 검사한다.
// vercel env pull 은 Secret 타입 변수를 [SENSITIVE] 라는 자리표시자로 내려준다(공식 문서: Secret 은 저장 후
// write-only). 그걸 모르고 .env 에 복사하면 가짜 값이 들어가 로그인이 invalid_client 로 죽는다.
import { readFileSync, existsSync } from "node:fs";

if (!existsSync(".env")) {
  console.log("✓ .env 없음 — 검사 건너뜀");
  process.exit(0);
}
const env = readFileSync(".env", "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m")) ?? [])[1]?.trim().replace(/^["']|["']$/g, "");

const RULES = [
  ["GOOGLE_CLIENT_ID", (v) => v.endsWith(".apps.googleusercontent.com"), "구글 클라이언트 ID 는 .apps.googleusercontent.com 으로 끝난다"],
  ["GOOGLE_CLIENT_SECRET", (v) => v.startsWith("GOCSPX-"), "구글 클라이언트 보안 비밀은 GOCSPX- 로 시작한다"],
  ["GOOGLE_REDIRECT_URI", (v) => /^https?:\/\/.+\/api\/auth\/google\/callback$/.test(v), "리디렉션 주소는 /api/auth/google/callback 으로 끝난다"],
  ["TOKEN_ENCRYPTION_KEY", (v) => /^[0-9a-f]{64}$/i.test(v), "암호화 키는 64자리 16진수다"],
];

const problems = [];
for (const [key, ok, why] of RULES) {
  const v = get(key);
  if (v === undefined || v === "") continue; // 아직 안 채운 것은 통과 — 채운 값이 틀린 것만 잡는다
  if (/^\[.*\]$/.test(v)) problems.push(`${key} 가 자리표시자다(${v}). vercel env pull 결과를 그대로 넣지 말 것`);
  else if (!ok(v)) problems.push(`${key} 형식이 맞지 않는다 — ${why}`);
}

if (problems.length) {
  console.error(`✗ .env 값 ${problems.length}건 이상\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("✓ .env 키 형식 정상");
