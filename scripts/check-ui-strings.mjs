#!/usr/bin/env node
// 화면에 나갈 문구가 코드에 하드코딩됐는지 검사한다.
// 번역 작업의 완료 판정은 사람의 목록이 아니라 이 명령의 0건으로 한다.
//
// 검사에서 빼는 방법은 하나뿐 — 그 줄에 `i18n-allow: <이유>` 주석을 단다.
// 파일 단위 예외는 아래 EXEMPT_FILES 에만 두고, 사유를 함께 적는다.
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const KOREAN = /[가-힯]/;

// 사전과 문서 원문 자체는 당연히 한국어를 담는다
const EXEMPT_FILES = new Set([
  "src/lib/i18n.ts", // 사전
  "src/features/landing/content.ts", // 홈 소개 문구 사전
]);
const EXEMPT_DIRS = ["src/content/"]; // 문서 원문(.mdx) — 언어별 파일로 갈라져 있음

const files = globSync("src/**/*.{ts,tsx}", { cwd: process.cwd() }).sort();
const findings = [];

for (const file of files) {
  if (EXEMPT_FILES.has(file) || EXEMPT_DIRS.some((d) => file.startsWith(d))) continue;
  const raw = readFileSync(file, "utf8");
  // 주석 안의 한국어는 그대로 둔다(프로젝트 규칙) — 블록·JSX 주석을 먼저 지운다
  const body = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  body.split("\n").forEach((line, i) => {
    if (line.includes("i18n-allow")) return;
    const code = line.replace(/\/\/.*$/, ""); // 한 줄 주석 제거
    if (KOREAN.test(code)) findings.push({ file, line: i + 1, text: code.trim().slice(0, 100) });
  });
}

if (findings.length === 0) {
  console.log("✓ 하드코딩된 화면 문구 없음");
  process.exit(0);
}

console.error(`✗ 하드코딩된 화면 문구 ${findings.length}곳\n`);
let current = "";
for (const f of findings) {
  if (f.file !== current) {
    current = f.file;
    console.error(current);
  }
  console.error(`  ${f.line}: ${f.text}`);
}
console.error("\n사전(src/lib/i18n.ts)으로 옮기거나, 의도된 경우 그 줄에 `i18n-allow: 사유` 주석을 단다.");
process.exit(1);
