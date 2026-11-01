// 체험 코드 입력값 정리 검사. DM 으로 받아 손으로 옮겨 적는 값이라, 흘려 넣어도 같은 코드로 보여야 한다.
import assert from "node:assert/strict";
import { isClosed, normalizeCode } from "../src/lib/promo";

// 같은 코드로 봐야 하는 입력
for (const input of ["NM1030", "nm1030", " NM1030 ", "nm-1030", "NM 1030", "Nm1030"]) {
  assert.equal(normalizeCode(input), "NM1030", `같은 코드로 봐야 함: ${input}`);
}

// 달라야 하는 입력 — 비슷해 보여도 다른 코드는 다른 코드다
for (const input of ["NM1031", "NM103", "MN1030", ""]) {
  assert.notEqual(normalizeCode(input), "NM1030", `달라야 함: ${input}`);
}

// 마감일 — 당일은 되고 다음 날부터 안 된다(공용 코드가 이벤트 뒤에도 먹으면 안 된다)
const CLOSES = "2026-11-30";
assert.equal(isClosed(CLOSES, new Date("2026-11-29T23:59:00Z")), false, "마감 전날은 되어야 함");
assert.equal(isClosed(CLOSES, new Date("2026-11-30T00:00:00Z")), false, "마감 당일 시작은 되어야 함");
assert.equal(isClosed(CLOSES, new Date("2026-11-30T23:59:59Z")), false, "마감 당일 끝까지 되어야 함");
assert.equal(isClosed(CLOSES, new Date("2026-12-01T00:00:00Z")), true, "마감 다음 날은 막혀야 함");
assert.equal(isClosed(CLOSES, new Date("2027-05-01T00:00:00Z")), true, "한참 뒤는 막혀야 함");

console.log("✓ 체험 코드 입력과 마감 검사 통과");
