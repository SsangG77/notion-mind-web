"use client";

import { useEffect, useRef, useState } from "react";
import { useSigma } from "@react-sigma/core";
import type { NodeType } from "@/types/graph";
import { useNodeDetail } from "../hooks/useNodeDetail";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";

export interface Selection {
  id: string;
  type: NodeType;
}

interface Chip {
  id: string;
  label: string;
  type: NodeType;
}

function ChipList({ items, onJump }: { items: Chip[]; onJump: (c: Chip) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((c) => (
        <button
          key={c.id}
          onClick={() => onJump(c)}
          className="max-w-full truncate rounded-md border border-[#E9E9E7] bg-[#FDFDFC] px-2 py-1 text-xs hover:border-[#2383E2] hover:text-[#2383E2] dark:border-[#2F2F2F] dark:bg-[#2B2A27] dark:hover:border-[#2383E2]"
        >
          {c.type === "database" ? "🗄 " : ""}
          {c.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E9E9E7] px-4 py-3 dark:border-[#2F2F2F]">
      <p className="mb-2 text-xs font-semibold text-[#91908C]">{title}</p>
      {children}
    </div>
  );
}

/**
 * 노드 상세 사이드패널 — 오른쪽에서 슬라이드 인, 노드 박스 디자인.
 * 그래프는 가려지지 않고 유지되며, 칩을 누르면 그 노드로 선택이 옮겨간다.
 */
export default function NodeDetailPanel({
  selection,
  onSelect,
  onClose,
  closeRequest,
}: {
  selection: Selection;
  onSelect: (next: Selection) => void;
  onClose: () => void;
  /** 바깥(빈 영역 클릭 등)에서의 닫기 요청 — 값이 바뀌면 닫기 애니메이션 시작 */
  closeRequest: number;
}) {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const { detail, error, loading } = useNodeDetail(selection.id, selection.type);
  const [closing, setClosing] = useState(false);

  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 200);
  };

  // ESC로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // 빈 영역 클릭 등 바깥 닫기 요청 — 같은 닫기 절차를 타서 애니메이션 유지
  const firstRequest = useRef(closeRequest);
  useEffect(() => {
    if (closeRequest !== firstRequest.current) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeRequest]);

  // 그래프 구조에서 바로 얻는 정보 (API 응답 전에도 표시)
  const attrs = graph.hasNode(selection.id) ? graph.getNodeAttributes(selection.id) : null;
  const fallbackTitle = (attrs?.label as string) ?? "";

  const parents: Chip[] = [];
  const relations: Chip[] = [];
  const children: Chip[] = [];
  if (graph.hasNode(selection.id)) {
    graph.forEachEdge(selection.id, (_e, ea, s, t) => {
      const otherId = s === selection.id ? t : s;
      if (!graph.hasNode(otherId)) return;
      const chip: Chip = {
        id: otherId,
        label: (graph.getNodeAttribute(otherId, "label") as string) ?? "무제",
        type: graph.getNodeAttribute(otherId, "nodeType") as NodeType,
      };
      if (ea.kind === "relation") relations.push(chip);
      else if (t === selection.id) parents.push(chip); // 나를 가리키는 계층 = 부모
      else children.push(chip);
    });
  }

  const jump = (chip: Chip) => {
    const d = sigma.getNodeDisplayData(chip.id);
    if (d) sigma.getCamera().animate({ x: d.x, y: d.y }, { duration: 450 });
    onSelect({ id: chip.id, type: chip.type });
  };

  return (
    <div
      data-testid="node_detail_panel"
      className={`${BLOCK} ${
        closing ? "nm-slide-out-right" : "nm-slide-in-right"
      } pointer-events-auto fixed bottom-[72px] right-3 top-[60px] z-20 flex w-[380px] flex-col overflow-hidden`}
    >
      {/* 헤더 — 타입 + 제목 */}
      <div className="shrink-0 border-b border-[#E9E9E7] px-4 py-3 dark:border-[#2F2F2F]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#91908C]">
              {selection.type === "database" ? "데이터베이스" : "페이지"}
            </span>
            <h2 className="mt-0.5 break-words text-base font-bold leading-snug">
              {detail?.title ?? fallbackTitle}
            </h2>
          </div>
          <button
            data-testid="detail_close_button"
            onClick={close}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-[#F4F3EF] dark:hover:bg-[#35342F]"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {parents.length > 0 && (
          <Section title="소속">
            <ChipList items={parents} onJump={jump} />
          </Section>
        )}

        {loading && (
          <p className="px-4 py-3 text-xs text-[#91908C]">상세를 불러오는 중…</p>
        )}
        {error && (
          <p className="px-4 py-3 text-xs text-[#D44C47]">불러오지 못했습니다: {error}</p>
        )}

        {detail && detail.properties.length > 0 && (
          <Section title="속성">
            <dl className="space-y-1.5 text-sm">
              {detail.properties.map((p) => (
                <div key={p.name} className="flex gap-2">
                  <dt className="w-24 shrink-0 truncate text-xs text-[#91908C]">{p.name}</dt>
                  <dd className="min-w-0 flex-1 break-words">{p.value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {detail?.lastEdited && (
          <Section title="마지막 수정">
            <p className="text-sm">
              {new Date(detail.lastEdited).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </Section>
        )}

        {relations.length > 0 && (
          <Section title={`관계형 연결 ${relations.length}`}>
            <ChipList items={relations} onJump={jump} />
          </Section>
        )}

        {children.length > 0 && (
          <Section title={`하위 ${children.length}`}>
            <ChipList items={children} onJump={jump} />
          </Section>
        )}

        {detail && detail.excerpt.length > 0 && (
          <Section title="본문">
            <div className="space-y-1 text-sm leading-6">
              {detail.excerpt.map((line, i) => (
                <p key={i} className="break-words">
                  {line}
                </p>
              ))}
              {detail.excerptTruncated && (
                <p className="pt-1 text-xs text-[#91908C]">…이어지는 내용은 노션에서</p>
              )}
            </div>
          </Section>
        )}
      </div>

      {/* 하단 고정 — 노션에서 열기 + Free 광고 */}
      <div className="shrink-0 border-t border-[#E9E9E7] p-3 dark:border-[#2F2F2F]">
        <a
          data-testid="open_in_notion_button"
          href={detail?.url ?? (attrs?.url as string) ?? "#"}
          target="_blank"
          rel="noreferrer"
          className={`${BLOCK_PRESS} block w-full rounded-[8px] border-[1.5px] border-[#2E2C27] bg-[#F4F3EF] py-2 text-center text-sm font-semibold shadow-[3px_3px_0_#2E2C27] hover:bg-[#EDECE7] dark:border-black dark:bg-[#35342F] dark:shadow-[3px_3px_0_#000] dark:hover:bg-[#3D3C36]`}
        >
          노션에서 열기 ↗
        </a>
      </div>
      {/* Free 전용 패널 하단 배너 — 네트워크 미정, 플레이스홀더 */}
      <div
        data-testid="ad_banner_detail"
        className="flex h-[52px] shrink-0 items-center justify-center border-t border-[#E9E9E7] bg-[#F7F6F3] dark:border-[#2F2F2F] dark:bg-[#202020]"
      >
        <span className="text-xs tracking-wide text-[#91908C]">AD — 광고 영역 (Free)</span>
      </div>
    </div>
  );
}
