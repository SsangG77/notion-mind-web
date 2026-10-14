"use client";

import { useEffect, useRef, useState } from "react";
import type { DayPoint } from "@/lib/analytics";

/**
 * 단일 계열 일별 추이 — 선 + 옅은 면, 호버 시 세로선과 툴팁.
 * 계열이 하나라 범례 없음(제목이 이름). 글자는 텍스트 색, 마크만 액센트색.
 * 마지막 점만 직접 라벨 — 모든 점에 숫자를 붙이지 않는다.
 */
export default function TimeSeriesChart({
  points,
  title,
  summary = "total",
}: {
  points: DayPoint[];
  title: string;
  /** 제목 오른쪽 요약 — 일별 수치는 합계, 누적 수치는 마지막 값 */
  summary?: "total" | "last";
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(240, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 200;
  const pad = { top: 16, right: 16, bottom: 28, left: 32 };
  const innerW = width - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(1, ...points.map((p) => p.value));
  const n = points.length;
  const x = (i: number) => pad.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = n > 0 ? `${line} L${x(n - 1).toFixed(1)},${(pad.top + innerH).toFixed(1)} L${x(0).toFixed(1)},${(pad.top + innerH).toFixed(1)} Z` : "";
  const ticks = [0, max];
  // 날짜 라벨은 겹치지 않게 최대 6개
  const labelEvery = Math.max(1, Math.ceil(n / 6));
  const last = points[n - 1];
  const total = points.reduce((s, p) => s + p.value, 0);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left - pad.left;
    const i = Math.round((px / innerW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div ref={wrap} className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-[#8A8883]">
          {summary === "last" ? `현재 ${(last?.value ?? 0).toLocaleString()}` : `합계 ${total.toLocaleString()}`}
        </span>
      </div>
      <svg
        width={width}
        height={H}
        role="img"
        aria-label={`${title}, 최근 ${n}일`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="block select-none"
      >
        {/* 격자는 뒤로 물러남 — 최소/최대 두 줄만 */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={0.12} />
            <text x={pad.left - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#8A8883">
              {t}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text key={p.day} x={x(i)} y={H - 8} textAnchor={i === n - 1 ? "end" : i === 0 ? "start" : "middle"} fontSize={11} fill="#8A8883">
              {p.day.slice(5)}
            </text>
          ) : null,
        )}
        {n > 0 && (
          <>
            <path d={area} fill="#2383E2" fillOpacity={0.1} />
            <path d={line} fill="none" stroke="#2383E2" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {/* 마지막 값만 직접 라벨 */}
            <circle cx={x(n - 1)} cy={y(last.value)} r={4} fill="#2383E2" />
            {hover === null && (
              <text x={x(n - 1) - 8} y={y(last.value) - 8} textAnchor="end" fontSize={11} fontWeight={600} fill="currentColor">
                {last.value}
              </text>
            )}
          </>
        )}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} stroke="currentColor" strokeOpacity={0.35} strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(points[hover].value)} r={5} fill="#2383E2" stroke="#F7F6F3" strokeWidth={2} />
            <Tooltip x={x(hover)} y={pad.top} width={width} day={points[hover].day} value={points[hover].value} />
          </g>
        )}
      </svg>
    </div>
  );
}

function Tooltip({ x, y, width, day, value }: { x: number; y: number; width: number; day: string; value: number }) {
  const w = 112;
  const left = x + w + 12 > width ? x - w - 10 : x + 10;
  return (
    <g transform={`translate(${left}, ${y})`}>
      <rect width={w} height={40} rx={6} fill="#2E2C27" />
      <text x={10} y={16} fontSize={11} fill="#B4B2AD">
        {day}
      </text>
      <text x={10} y={32} fontSize={13} fontWeight={600} fill="#FFFFFF">
        {value.toLocaleString()}
      </text>
    </g>
  );
}
