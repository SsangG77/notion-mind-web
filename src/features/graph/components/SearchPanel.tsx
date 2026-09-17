"use client";

import { useMemo, useState } from "react";
import { useSigma } from "@react-sigma/core";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";

const SECTIONS = ["Filters", "Groups", "Display", "Forces"];

/** 검색 + 필터 통합 바 — 하나의 노드 블록 안에서 구분선으로 분리 */
export default function SearchPanel() {
  const sigma = useSigma();
  const [q, setQ] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

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
    <div className="relative w-72">
      <div className={`${BLOCK} flex h-9 items-center overflow-hidden`}>
        <input
          data-testid="graph_search_input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="페이지 검색"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#91908C]"
        />
        <span className="h-5 w-px shrink-0 bg-[#E9E9E7] dark:bg-[#2F2F2F]" />
        <button
          data-testid="filter_button"
          title="필터"
          onClick={() => setFilterOpen((v) => !v)}
          className={`${BLOCK_PRESS} flex h-9 w-9 shrink-0 items-center justify-center hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M1 2h12L8.5 7.5V12l-3-1.5V7.5L1 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
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

      {filterOpen && (
        <div
          data-testid="filter_panel"
          className={`${BLOCK} absolute right-0 top-11 w-52 px-3 py-2 text-sm`}
        >
          {SECTIONS.map((s) => (
            <div
              key={s}
              className="flex items-center justify-between border-b border-[#E9E9E7] py-1.5 last:border-0 dark:border-[#2F2F2F]"
            >
              <span>{s}</span>
              <span className="text-[11px] text-[#91908C]">준비 중</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
