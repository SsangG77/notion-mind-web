"use client";

import { useState } from "react";
import Link from "next/link";
import SearchPanel from "./SearchPanel";
import SettingsPanel from "./SettingsPanel";
import { BLOCK, BLOCK_PRESS } from "@/components/blockStyle";

const FREE_LIMIT = 1000;

/** 상단 바 — 좌: 설정·검색(+필터) / 우: 다크 스위치. 전부 노드 박스 스타일 */
export default function TopBar({
  loading,
  lastSync,
  onReload,
  dark,
  onToggleTheme,
  nodeCount,
  truncated,
}: {
  loading: boolean;
  lastSync: number | null;
  onReload: () => void;
  dark: boolean;
  onToggleTheme: () => void;
  nodeCount: number;
  truncated: boolean;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
      {/* 좌측: 설정 + 검색 + 필터 */}
      <div className="pointer-events-auto flex items-start gap-2">
        <button
          data-testid="settings_button"
          title="설정"
          onClick={() => setSettingsOpen((v) => !v)}
          className={`${BLOCK} ${BLOCK_PRESS} flex h-9 w-9 items-center justify-center`}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
            <circle cx="7.5" cy="7.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M7.5 1.2v1.9M7.5 11.9v1.9M1.2 7.5h1.9M11.9 7.5h1.9M3 3l1.35 1.35M10.65 10.65 12 12M12 3l-1.35 1.35M4.35 10.65 3 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <SearchPanel />
        {/* 연결된 페이지 수 — Free 한도 체감시켜 Pro 전환 유도, 클릭 시 요금제 */}
        {nodeCount > 0 && (
          <Link
            data-testid="page_count_chip"
            href="/pricing"
            className={`${BLOCK} ${BLOCK_PRESS} flex h-9 items-center gap-2.5 px-3`}
            title="요금제 보기"
          >
            <span className="flex flex-col justify-center gap-[5px] leading-none">
              <span className="text-[11px]">
                <b>{nodeCount.toLocaleString()}</b>
                <span className="text-[#91908C]"> / {FREE_LIMIT.toLocaleString()} 페이지</span>
              </span>
              <span className="block h-1 w-28 overflow-hidden rounded-full bg-[#E9E9E7] dark:bg-black">
                <span
                  className={`block h-full rounded-full ${
                    truncated || nodeCount >= FREE_LIMIT * 0.8 ? "bg-[#D44C47]" : "bg-[#2383E2]"
                  }`}
                  style={{ width: `${Math.min(100, (nodeCount / FREE_LIMIT) * 100)}%` }}
                />
              </span>
            </span>
            {truncated && (
              <span className="text-[10px] font-bold text-[#2383E2]">Pro로 전체 보기</span>
            )}
          </Link>
        )}
        {settingsOpen && (
          <SettingsPanel
            onClose={() => setSettingsOpen(false)}
            loading={loading}
            lastSync={lastSync}
            onReload={onReload}
          />
        )}
      </div>

      {/* 우측: 다크 스위치 */}
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
      </div>
    </div>
  );
}
