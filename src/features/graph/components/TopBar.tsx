"use client";

import { useState } from "react";
import SearchPanel from "./SearchPanel";
import { BLOCK, BLOCK_PRESS } from "./blockStyle";

const SECTIONS = ["Filters", "Groups", "Display", "Forces"];

/** 상단 바 — 좌: 필터 버튼·검색창 / 우: 다크 스위치·동기화. 전부 노드 박스 스타일 */
export default function TopBar({
  loading,
  lastSync,
  onReload,
  dark,
  onToggleTheme,
}: {
  loading: boolean;
  lastSync: number | null;
  onReload: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const syncTitle = lastSync
    ? `마지막 동기화 ${new Date(lastSync).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "동기화";

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
      {/* 좌측: 필터 + 검색 */}
      <div className="pointer-events-auto flex items-start gap-2">
        <div className="relative">
          <button
            data-testid="filter_button"
            title="필터"
            onClick={() => setFilterOpen((v) => !v)}
            className={`${BLOCK} ${BLOCK_PRESS} flex h-9 w-9 items-center justify-center`}
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
          {filterOpen && (
            <div
              data-testid="filter_panel"
              className={`${BLOCK} absolute left-0 top-11 w-52 px-3 py-2 text-sm`}
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
        <SearchPanel />
      </div>

      {/* 우측: 다크 스위치 + 동기화 */}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          data-testid="theme_toggle_button"
          title={dark ? "라이트 모드" : "다크 모드"}
          onClick={onToggleTheme}
          className={`${BLOCK} ${BLOCK_PRESS} flex h-9 items-center px-2.5`}
        >
          <span className="relative h-[18px] w-[34px] rounded-full bg-[#E9E9E7] dark:bg-black">
            <span
              className={`absolute top-[2px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-white text-[9px] leading-none shadow transition-[left] duration-150 ${
                dark ? "left-[18px]" : "left-[2px]"
              }`}
            >
              {dark ? "🌙" : "☀️"}
            </span>
          </span>
        </button>
        <button
          data-testid="sync_button"
          title={syncTitle}
          disabled={loading}
          onClick={onReload}
          className={`${BLOCK} ${BLOCK_PRESS} flex h-9 w-9 items-center justify-center disabled:opacity-60`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
            className={loading ? "animate-spin" : ""}
          >
            <path
              d="M12.5 7a5.5 5.5 0 1 1-1.6-3.9M12.5 1v3h-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
