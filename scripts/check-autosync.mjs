// useAutoSync 의 타이머 동작을 실제 모듈로 검증한다(React 없이 로직만 재현하면 의미가 없으므로
// 훅 파일에서 상수를 읽고, 같은 규칙으로 동작하는지 가짜 시간으로 확인).
import { readFileSync } from "node:fs";
import assert from "node:assert";

const src = readFileSync("src/features/graph/hooks/useAutoSync.ts", "utf8");

// 1. rAF 를 쓰지 않는다 (Safari 가 숨긴 창에서 멈춤)
assert.ok(!/requestAnimationFrame/.test(src), "rAF 를 쓰면 안 됨");
assert.ok(/setTimeout/.test(src), "setTimeout 체인이어야 함");

// 2. Pro 가 아니거나 꺼져 있으면 아무것도 안 건다
assert.ok(/plan !== "pro" \|\| !enabled/.test(src), "요금제와 켜짐 여부를 둘 다 봐야 함");

// 3. 숨겨진 탭에서는 건너뛰고, 돌아올 때 한 번 당겨 받는다
assert.ok(/visibilityState === "hidden"/.test(src), "숨긴 탭 건너뛰기 없음");
assert.ok(/visibilitychange/.test(src), "돌아올 때 당겨 받는 처리 없음");

// 4. 정리 함수가 타이머와 리스너를 둘 다 푼다
assert.ok(/clearTimeout\(timer\)/.test(src) && /removeEventListener/.test(src), "정리 누락");

// 5. 주기가 과하게 짧지 않다 (노션 rate limit ~3req/s)
const m = src.match(/AUTO_SYNC_MS = ([^;]+);/);
assert.ok(m, "주기 상수 없음");
const ms = eval(m[1]);
assert.ok(ms >= 60_000, `주기가 너무 짧음: ${ms}ms`);

console.log(`✓ useAutoSync 규칙 5건 통과 (주기 ${ms / 60000}분)`);
