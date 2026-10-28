#!/usr/bin/env node
// 보안 감사 run-1 에서 확정된 결함 세 개가 되돌아오지 않게 소스에 고정한다.
// 예외가 필요하면 그 줄에 `tenancy-allow: <이유>` 주석을 단다.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const checks = [
  {
    file: "src/app/api/settings/route.ts",
    name: "설정 API 는 nm_ws 쿠키를 테넌트 키로 쓰지 않는다",
    // 평문 쿠키로 워크스페이스를 고르면 남의 설정을 읽고 덮어쓸 수 있다(확정 결함, medium).
    forbid: /cookies\.get\(\s*["']nm_ws["']\s*\)/,
    require: /getConnection\(/,
  },
  {
    file: "src/app/api/graph/route.ts",
    name: "그래프 API 는 배치 번호를 쿼리에서 받지 않는다",
    // 클라이언트 값을 믿으면 Free 상한 검사가 통째로 건너뛰어진다(확정 결함, low).
    forbid: /searchParams\.get\(\s*["']i["']\s*\)/,
    require: /openCursor\(/,
  },
  {
    file: "src/lib/gate.ts",
    name: "게이트 봉인은 용도(쿠키 이름)를 담고 대조한다",
    // 만료만 담으면 dev 쿠키가 admin 쿠키로 통과한다(확정 결함, low).
    require: /p:\s*opts\.cookie[\s\S]*p !== opts\.cookie/,
  },
  {
    file: "src/lib/crypto.ts",
    name: "봉인은 용도를 AAD 로 묶는다",
    // 키가 하나뿐이라 용도를 안 묶으면 한 자리의 봉인이 다른 자리에서도 풀린다(확정 결함, low).
    require: /setAAD\(Buffer\.from\(seal[\s\S]*setAAD\(Buffer\.from\(seal/,
  },
  {
    file: "src/app/api/graph/route.ts",
    name: "방문 지표는 인증 뒤에, 연결에서 온 워크스페이스로 기록한다",
    // 인증 전에 쿠키 값으로 기록하면 세션 없는 요청 하나로 아무 id 나 영구 행이 들어간다(확정 결함, low).
    forbid: /recordVisit\(\s*workspaceId\s*\)/,
    require: /recordVisit\(r\.workspaceId\)/,
  },
  {
    file: "src/lib/billing.ts",
    name: "활성 구독을 다른 Paddle 고객이 덮어쓰지 못한다",
    // 키가 체크아웃이 보낸 값이라, 가드가 없으면 남의 계정 구독 행을 대체할 수 있다(확정 결함, medium).
    require: /subscriptions guard: refusing to replace an active subscription/,
  },
  {
    file: "src/features/graph/components/LayoutManager.tsx",
    name: "저장된 핀 좌표를 유한수인지 보고 쓴다",
    // 숫자가 아니면 시뮬레이션이 NaN 으로 번져 그래프가 통째로 안 그려진다.
    require: /Number\.isFinite\(stored\.x\)\s*&&\s*Number\.isFinite\(stored\.y\)/,
  },
];

// 호출부 전수 검사 — 두 번째 인자(용도) 없이 부르면 타입 에러지만, 소스에서도 못 박는다
const callSiteScan = {
  name: "encrypt·decrypt 는 용도 인자 없이 부르지 않는다",
  dirs: ["src"],
  forbid: /\b(encrypt|decrypt)\([^,)]*\)/,
  skip: ["src/lib/crypto.ts"],
};

// 예외 메시지 유출 — 노션 응답 본문이 그대로 클라이언트로 나가던 자리
const leakScan = {
  name: "API 라우트는 예외 메시지를 응답에 담지 않는다",
  dirs: ["src/app/api"],
  forbid: /e instanceof Error \? e\.message/,
  skip: [],
};

const findings = [];
for (const c of checks) {
  const raw = readFileSync(c.file, "utf8");
  const body = raw
    .split("\n")
    .filter((l) => !l.includes("tenancy-allow"))
    .join("\n");
  if (c.forbid && c.forbid.test(body)) findings.push(`${c.file}: ${c.name} — 금지 패턴 발견`);
  if (c.require && !c.require.test(body)) findings.push(`${c.file}: ${c.name} — 필수 패턴 없음`);
}

// 디렉토리 전수 스캔 — 새 파일이 같은 결함을 다시 들이지 못하게
function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

let scanned = 0;
for (const scan of [callSiteScan, leakScan]) {
  for (const dir of scan.dirs) {
    for (const file of walk(dir)) {
      if (scan.skip.includes(file)) continue;
      scanned++;
      const body = readFileSync(file, "utf8")
        .split("\n")
        .filter((l) => !l.includes("tenancy-allow"))
        .join("\n");
      if (scan.forbid.test(body)) findings.push(`${file}: ${scan.name} — 금지 패턴 발견`);
    }
  }
}

if (findings.length === 0) {
  console.log(`✓ 테넌시, 상한, 게이트, 봉인 전제 ${checks.length}건 + 전수 스캔 ${scanned}개 파일 통과`);
  process.exit(0);
}
for (const f of findings) console.error(`✗ ${f}`);
process.exit(1);
