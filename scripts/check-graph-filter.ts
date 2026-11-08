// 그래프 거르기(필터 토글, DB 접기, 엮인 것만 보기)를 실제 graphology 그래프로 돌려 본다.
// 그래프 화면은 노션 로그인이 필요해 눈으로 확인할 수 없으므로, 로직만이라도 돌려서 고정한다.
import assert from "node:assert";
import Graph from "graphology";
import {
  applyFilters,
  DEFAULT_FILTER,
  dbChildCount,
  isOrphan,
  orphanCount,
  parentDb,
  type FilterState,
} from "../src/features/graph/lib/graphFilter";

const make = () => {
  const g = new Graph();
  // DB 하나와 그 안의 페이지 셋. 소속선(dbChild)만 있고 관계형은 a-c 하나
  g.addNode("db", { nodeType: "database" });
  for (const id of ["a", "b", "c", "loose"]) g.addNode(id, { nodeType: "page" });
  g.addEdge("db", "a", { kind: "dbChild" });
  g.addEdge("db", "b", { kind: "dbChild" });
  g.addEdge("db", "c", { kind: "dbChild" });
  g.addEdge("a", "c", { kind: "relation", hidden: true });
  return g;
};
const run = (g: Graph, patch: Partial<FilterState>) => applyFilters(g, { ...DEFAULT_FILTER, ...patch });
const shown = (g: Graph) => g.filterNodes((_id, a) => !a.hidden).sort().join(",");

// 1. 소속선만 있는 노드는 고아다 — 차수로 세면 안 된다는 것의 확인
let g = make();
assert.equal(isOrphan(g, "b"), true, "소속선만 있는 b 는 고아여야 함");
assert.equal(isOrphan(g, "a"), false, "관계형이 있는 a 는 고아가 아님");
assert.equal(orphanCount(g), 3, `고아는 db, b, loose 셋이어야 함(${orphanCount(g)})`);
assert.equal(parentDb(g, "b"), "db", "b 는 db 안에 있음");
assert.equal(dbChildCount(g, "db"), 3, "db 안 페이지는 셋");

// 2. 기본값은 아무것도 안 숨긴다
run(g, {});
assert.equal(shown(g), "a,b,c,db,loose", "기본값은 전부 보여야 함");

// 3. 고아만 — 사용자가 직접 숨긴 노드는 필터가 건드리지 않는다
g.setNodeAttribute("a", "hidden", true);
run(g, { orphansOnly: true });
assert.equal(shown(g), "b,db,loose", `고아만 남아야 함(${shown(g)})`);
assert.equal(g.getNodeAttribute("a", "filteredOut"), undefined, "사용자가 숨긴 a 는 표시하지 않음");
assert.equal(g.getNodeAttribute("c", "filteredOut"), true, "필터가 숨긴 c 는 표시됨");

// 4. 끄면 필터가 숨긴 것만 되돌아오고, 사용자가 숨긴 건 그대로다
run(g, {});
assert.equal(shown(g), "b,c,db,loose", "c 는 돌아오고 a 는 숨긴 채");
assert.equal(g.getNodeAttribute("c", "filteredOut"), undefined, "표시도 지워져야 함");

// 5. 종류 토글 — 켜진 종류만 보인다
g = make();
run(g, { showPage: false });
assert.equal(shown(g), "db", "페이지를 끄면 DB 만");
run(g, { showDb: false });
assert.equal(shown(g), "a,b,c,loose", "DB 를 끄면 페이지만");

// 6. DB 접기 — DB 는 남고 안의 페이지만 숨는다
run(g, { collapsed: new Set(["db"]) });
assert.equal(shown(g), "db,loose", `접으면 db 와 밖의 loose 만(${shown(g)})`);

// 7. 엮인 것만 — 기준 노드와 바로 이웃만
run(g, { focus: "a" });
assert.equal(shown(g), "a,c,db", `a 와 엮인 건 c(관계형), db(소속)(${shown(g)})`);
run(g, { focus: "a", showDb: false });
assert.equal(shown(g), "a,c", "다른 토글과 함께 걸린다");
run(g, { focus: "gone" });
assert.equal(shown(g), "a,b,c,db,loose", "없어진 기준 노드는 무시");

// 8. 소속선 끄기 — 관계형은 원래대로 숨긴 채(점선 레이어가 그림), 소속선만 꺼진다
run(g, { showHierarchy: false });
assert.equal(g.getEdgeAttribute("db", "a", "hidden"), true, "소속선이 꺼져야 함");
assert.equal(g.getEdgeAttribute("a", "c", "hidden"), true, "관계형은 계속 WebGL 에서 숨김");
run(g, {});
assert.equal(g.getEdgeAttribute("db", "a", "hidden"), false, "다시 켜면 소속선이 보여야 함");
assert.equal(g.getEdgeAttribute("a", "c", "hidden"), true, "관계형은 그대로");

console.log("✓ 그래프 거르기 21건 통과");
