"use client";

import { useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import { applyFilters } from "../lib/graphFilter";
import { getFilter, subscribeFilter } from "../lib/filterStore";

/** 필터 상태가 바뀌거나 노드가 새로 들어오면(점진 로딩, 재동기화) 다시 거른다 */
export default function GraphFilters() {
  const sigma = useSigma();
  useEffect(() => {
    const graph = sigma.getGraph();
    let timer: ReturnType<typeof setTimeout> | null = null;
    // 배치 하나에 노드가 100개씩 들어오므로 한 번에 묶어 계산한다
    const schedule = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        applyFilters(graph, getFilter());
        sigma.refresh();
      }, 0);
    };
    const unsub = subscribeFilter(schedule);
    graph.on("nodeAdded", schedule);
    graph.on("edgeAdded", schedule);
    schedule();
    return () => {
      unsub();
      graph.off("nodeAdded", schedule);
      graph.off("edgeAdded", schedule);
      if (timer) clearTimeout(timer);
    };
  }, [sigma]);
  return null;
}
