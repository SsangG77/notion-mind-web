"use client";

import { useMemo, useState } from "react";
import { useSigma } from "@react-sigma/core";
import { BLOCK } from "./blockStyle";

/** 제목 검색 → 선택 시 해당 노드로 카메라 이동 + 잠깐 강조. 노드 박스 스타일 */
export default function SearchPanel() {
  const sigma = useSigma();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const graph = sigma.getGraph();
    const out: Array<{ id: string; label: string; isDb: boolean }> = [];
    graph.forEachNode((id, a) => {
      if (out.length >= 8 || a.hidden) return;
      const label = (a.label as string) ?? "";
      if (label.toLowerCase().includes(query)) {
        out.push({ id, label, isDb: a.nodeType === "database" });
      }
    });
    return out;
  }, [q, sigma]);

  const jump = (id: string) => {
    const graph = sigma.getGraph();
    const d = sigma.getNodeDisplayData(id);
    if (d) sigma.getCamera().animate({ x: d.x, y: d.y, ratio: 1 }, { duration: 500 });
    graph.setNodeAttribute(id, "highlighted", true);
    setTimeout(() => {
      if (graph.hasNode(id)) graph.removeNodeAttribute(id, "highlighted");
      sigma.refresh({ skipIndexation: true });
    }, 1600);
    setQ("");
  };

  return (
    <div className="relative w-60">
      <div className={`${BLOCK} flex h-9 items-center px-3`}>
        <input
          data-testid="graph_search_input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="페이지 검색"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#91908C]"
        />
      </div>
      {results.length > 0 && (
        <ul className={`${BLOCK} absolute left-0 top-11 w-full overflow-hidden py-1 text-sm`}>
          {results.map((r) => (
            <li key={r.id}>
              <button
                className="block w-full truncate px-3 py-1.5 text-left hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]"
                onClick={() => jump(r.id)}
              >
                {r.isDb ? "🗄 " : ""}
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
