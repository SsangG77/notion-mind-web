"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Graph from "graphology";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { useGraphData } from "../hooks/useGraphData";
import { useTheme } from "../hooks/useTheme";
import { drawNodeHover, drawNodeLabel, setSelected } from "../drawNode";
import ContainerResize from "./ContainerResize";
import LayoutManager from "./LayoutManager";
import RelationEdgesLayer from "./RelationEdgesLayer";
import NodeInteractions from "./NodeInteractions";
import NodeDetailPanel, { type Selection } from "./NodeDetailPanel";
import TopBar from "./TopBar";
import ZoomControls from "./ZoomControls";
import ThemeSync from "./ThemeSync";
import ViewportMemory from "./ViewportMemory";

const SIGMA_SETTINGS = {
  defaultDrawNodeLabel: drawNodeLabel,
  defaultDrawNodeHover: drawNodeHover,
  labelRenderedSizeThreshold: 0,
  labelGridCellSize: 1, // 모든 노드 블록을 항상 렌더 — 블록이 곧 노드 본체
  labelDensity: Infinity,
  renderEdgeLabels: false,
  // 자동 화면 맞춤 해제 — 좌표 1단위 = 1px(기본 배율)인 큰 캔버스. 전체가 화면에 들어갈 필요 없음
  autoRescale: false,
  // 컨테이너가 잠깐 0px이 돼도(탭 숨김·라우트 전환) 예외 대신 버팀 — 복귀는 ContainerResize가 처리
  allowInvalidContainer: true,
  minCameraRatio: 0.05,
  maxCameraRatio: 100,
  stagePadding: 60,
};

export default function GraphView() {
  const { data, error, loading, gen, lastSync, reload } = useGraphData();
  const { dark, toggle } = useTheme();
  // 그래프 인스턴스는 한 번만 생성 — 배치·재동기화는 LayoutManager가 내용만 갱신
  const graph = useMemo(() => new Graph(), []);
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __nmGraph: Graph }).__nmGraph = graph; // 디버그 콘솔용
    }
  }, [graph]);

  const empty = !loading && !error && data != null && data.nodes.length === 0;

  // 상세 패널 선택 — 캔버스 드로잉과 상태 공유
  const [selection, setSelection] = useState<Selection | null>(null);
  // 닫기 요청 — 패널이 슬라이드 아웃을 끝낸 뒤 실제 해제 (빈 영역 클릭 포함 모든 경로 동일)
  const [closeRequest, setCloseRequest] = useState(0);
  useEffect(() => {
    setSelected(selection?.id ?? null);
  }, [selection]);

  const handleSelect = (next: Selection | null) => {
    if (next) setSelection(next);
    else if (selection) setCloseRequest((n) => n + 1); // 즉시 제거 대신 닫기 애니메이션
  };

  return (
    <div className="relative h-full w-full" data-testid="graph_canvas">
      <SigmaContainer
        graph={graph}
        settings={SIGMA_SETTINGS}
        className="!h-full !w-full !bg-transparent"
      >
        <ThemeSync dark={dark} />
        <ContainerResize />
        <LayoutManager data={data} gen={gen} loading={loading} />
        <RelationEdgesLayer />
        <NodeInteractions onSelect={handleSelect} />
        {selection && (
          <NodeDetailPanel
            selection={selection}
            onSelect={setSelection}
            onClose={() => setSelection(null)}
            closeRequest={closeRequest}
          />
        )}
        <TopBar
          loading={loading}
          lastSync={lastSync}
          onReload={reload}
          dark={dark}
          onToggleTheme={toggle}
          nodeCount={data?.nodes.length ?? 0}
          truncated={data?.truncated ?? false}
        />
        <ZoomControls />
        <ViewportMemory ready={!loading && data != null} />
      </SigmaContainer>

      {/* 첫 배치 전 로딩 */}
      {loading && !data && (
        <Overlay>
          <p className="text-sm text-[#37352F] dark:text-[#EDEDEC]">워크스페이스를 읽는 중…</p>
          <p className="text-xs text-[#91908C]">페이지가 많으면 시간이 걸립니다</p>
        </Overlay>
      )}

      {/* 점진 로딩 진행 표시 — 그래프는 뒤에서 자라는 중 */}
      {loading && data && (
        <div
          data-testid="sync_progress"
          className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#E9E9E7] bg-white/90 px-4 py-1.5 text-xs text-[#37352F] shadow-sm backdrop-blur dark:border-[#2F2F2F] dark:bg-[#202020]/90 dark:text-[#EDEDEC]"
        >
          <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-[#2383E2] border-t-transparent" />
          페이지 {data.total.toLocaleString()}개 읽는 중…
        </div>
      )}

      {error && (
        <Overlay>
          <p className="rounded-lg border border-[#E9E9E7] bg-[#F7F6F3] px-4 py-2 text-sm text-[#37352F] dark:border-[#2F2F2F] dark:bg-[#202020] dark:text-[#EDEDEC]">
            그래프를 불러오지 못했습니다: {error}
          </p>
          <Link href="/" className="text-sm text-[#2383E2]">
            다시 로그인
          </Link>
        </Overlay>
      )}

      {empty && (
        <Overlay>
          <p className="text-sm text-[#37352F] dark:text-[#EDEDEC]">표시할 페이지가 없습니다</p>
          <p className="text-xs text-[#91908C]">
            노션 연결 설정에서 공유한 페이지가 있는지 확인하세요
          </p>
        </Overlay>
      )}

      {!loading && data?.truncated && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-[#E9E9E7] bg-[#F7F6F3] px-4 py-1.5 text-xs text-[#37352F] dark:border-[#2F2F2F] dark:bg-[#202020] dark:text-[#EDEDEC]">
          {data.nodes.length.toLocaleString()} / {data.total.toLocaleString()} 표시 중 —{" "}
          <span className="font-semibold text-[#2383E2]">전체는 Pro</span>
        </div>
      )}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 [&_a]:pointer-events-auto">
      {children}
    </div>
  );
}
