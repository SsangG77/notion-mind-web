"use client";

import { useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import { applyTheme, T } from "../tokens";

/** 테마 전환 시 캔버스 팔레트 교체 + 기존 노드·엣지 색 갱신 */
export default function ThemeSync({ dark }: { dark: boolean }) {
  const sigma = useSigma();
  useEffect(() => {
    applyTheme(dark);
    const graph = sigma.getGraph();
    graph.updateEachNodeAttributes((_n, a) => ({
      ...a,
      color: (a.nodeType === "database" ? T.dbFace : T.pageFace) + "00",
    }));
    graph.updateEachEdgeAttributes((_e, a) => ({
      ...a,
      color: a.kind === "dbChild" ? T.edgeDb : T.edgeHierarchy,
    }));
    sigma.refresh();
  }, [sigma, dark]);
  return null;
}
