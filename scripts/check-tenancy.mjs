#!/usr/bin/env node
// 보안 감사 run-1 에서 확정된 결함 세 개가 되돌아오지 않게 소스에 고정한다.
// 예외가 필요하면 그 줄에 `tenancy-allow: <이유>` 주석을 단다.
import { readFileSync } from "node:fs";

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
];

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

if (findings.length === 0) {
  console.log(`✓ 테넌시, 상한, 게이트 전제 ${checks.length}건 통과`);
  process.exit(0);
}
for (const f of findings) console.error(`✗ ${f}`);
process.exit(1);
