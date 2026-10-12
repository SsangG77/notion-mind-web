// 고아 노드 필터를 실제 graphology 그래프로 돌려 본다.
// 그래프 화면은 노션 로그인이 필요해 눈으로 확인할 수 없으므로, 로직만이라도 돌려서 고정한다.
import assert from "node:assert";
import Graph from "graphology";
import {
  applyOrphanFilter,
  clearOrphanFilter,
  isOrphan,
  orphanCount,
} from "../src/features/graph/lib/orphanFilter";

const g = new Graph();
// DB 하나와 그 안의 페이지 셋. 소속선(dbChild)만 있고 관계형은 a 만 가진다
for (const id of ["db", "a", "b", "c", "loose"]) g.addNode(id, {});
g.addEdge("db", "a", { kind: "dbChild" });
g.addEdge("db", "b", { kind: "dbChild" });
g.addEdge("db", "c", { kind: "dbChild" });
g.addEdge("a", "c", { kind: "relation" });

// 1. 소속선만 있는 노드는 고아다 — 차수로 세면 안 된다는 것의 확인
assert.equal(isOrphan(g, "b"), true, "소속선만 있는 b 는 고아여야 함");
assert.equal(isOrphan(g, "a"), false, "관계형이 있는 a 는 고아가 아님");
assert.equal(isOrphan(g, "c"), false, "관계형이 있는 c 는 고아가 아님");
assert.equal(isOrphan(g, "loose"), true, "아무 연결 없는 loose 는 고아");
assert.equal(orphanCount(g), 3, `고아는 db, b, loose 셋이어야 함(${orphanCount(g)})`);

// 2. 사용자가 직접 숨긴 노드는 필터가 건드리지 않는다
g.setNodeAttribute("a", "hidden", true);
applyOrphanFilter(g);
assert.equal(g.getNodeAttribute("a", "hidden"), true, "a 는 사용자가 숨긴 상태 유지");
assert.equal(g.getNodeAttribute("a", "filteredOut"), undefined, "사용자가 숨긴 건 표시하지 않음");
assert.equal(g.getNodeAttribute("c", "hidden"), true, "고아가 아닌 c 는 필터가 숨김");
assert.equal(g.getNodeAttribute("c", "filteredOut"), true, "필터가 숨긴 것은 표시됨");
assert.equal(g.getNodeAttribute("b", "hidden"), undefined, "고아 b 는 보여야 함");

// 3. 끄면 필터가 숨긴 것만 되돌아오고, 사용자가 숨긴 건 그대로다
clearOrphanFilter(g);
assert.equal(g.getNodeAttribute("c", "hidden"), undefined, "c 는 다시 보여야 함");
assert.equal(g.getNodeAttribute("c", "filteredOut"), undefined, "표시도 지워져야 함");
assert.equal(g.getNodeAttribute("a", "hidden"), true, "사용자가 숨긴 a 는 그대로여야 함");

console.log("✓ 고아 노드 필터 10건 통과");
